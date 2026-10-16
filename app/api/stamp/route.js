import { NextResponse } from 'next/server';
import { PublicKey, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js';
import { journalCommitment, newEntryKeys, validateEntry } from '../../lib/journal';
import { invalidateRecent } from '../../lib/ledger';
import { isRateLimited } from '../../lib/rateLimit';
import { buildMemo, explorerUrl, getSolana, memoProgramId, network } from '../../lib/solana';
import { createAdminClient } from '../../lib/supabase/admin';
import { getUser } from '../../lib/supabase/server';

export const runtime = 'nodejs';

const MEMO_PROGRAM_ID = new PublicKey(memoProgramId);
const MIN_FEE_LAMPORTS = 5_000;

// Signed-in notaries can record on devnet. Mainnet also requires an active subscription.
function authorize(profile) {
  if (network === 'devnet') return null;
  if (profile?.billing_status !== 'active_subscriber') {
    return 'An active subscription is required to record entries.';
  }
  return null;
}

export async function POST(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to record journal entries.' }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('billing_status').eq('id', user.id).single();
  const authError = authorize(profile);
  if (authError) return NextResponse.json({ error: authError }, { status: 403 });

  if (isRateLimited(request, { name: `stamp:${user.id}`, max: 10 })) {
    return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { entry, errors } = validateEntry(body);
  if (errors) return NextResponse.json({ error: 'Check the highlighted fields.', fields: errors }, { status: 400 });

  const { wallet, connection } = getSolana();
  try {
    if ((await connection.getBalance(wallet.publicKey)) < MIN_FEE_LAMPORTS) {
      console.error(`Stamping wallet ${wallet.publicKey.toBase58()} is out of SOL`);
      return NextResponse.json({ error: 'Recording is temporarily unavailable.' }, { status: 503 });
    }
  } catch (error) {
    console.error('Balance check failed:', error);
    return NextResponse.json({ error: "Couldn't reach the ledger. Please try again." }, { status: 502 });
  }

  // 1. Save the full entry privately, marked pending, before anything goes on-chain.
  const row = { ...entry, ...newEntryKeys(), notary_id: user.id, network };
  row.journal_sha256 = journalCommitment(row);
  const { error: insertError } = await admin.from('journal_entries').insert(row);
  if (insertError) {
    console.error('Journal insert failed:', insertError);
    return NextResponse.json({ error: "Couldn't save the journal entry. Nothing was recorded." }, { status: 500 });
  }

  // 2. Record only the two fingerprints. Never put names, addresses, or other personal
  // data in the memo: the ledger is public and entries can never be deleted.
  let signature;
  try {
    const instruction = new TransactionInstruction({
      keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(buildMemo(row.document_sha256, row.journal_sha256), 'utf-8'),
    });
    signature = await sendAndConfirmTransaction(connection, new Transaction().add(instruction), [wallet], {
      commitment: 'confirmed',
    });
  } catch (error) {
    console.error('Stamp failed:', error);
    await admin.from('journal_entries').update({ status: 'failed' }).eq('id', row.id);
    return NextResponse.json(
      { error: "Couldn't record on the ledger. Your entry was saved as not recorded; please try again." },
      { status: 502 }
    );
  }
  invalidateRecent();

  // 3. Attach the ledger result. If this fails, the entry stays pending and can be
  // reconciled later from the ledger, since the commitment is already on-chain.
  const tx = await connection
    .getTransaction(signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 })
    .catch(() => null);
  const recordedAt = tx?.blockTime ? new Date(tx.blockTime * 1000).toISOString() : new Date().toISOString();
  const { error: updateError } = await admin
    .from('journal_entries')
    .update({ status: 'recorded', transaction_signature: signature, slot: tx?.slot ?? null, recorded_at: recordedAt })
    .eq('id', row.id);
  if (updateError) console.error(`Journal ${row.id} recorded as ${signature} but update failed:`, updateError);

  return NextResponse.json({
    success: true,
    entryId: row.id,
    txId: signature,
    network,
    documentSha256: row.document_sha256,
    journalSha256: row.journal_sha256,
    blockTime: tx?.blockTime ?? null,
    slot: tx?.slot ?? null,
    explorerUrl: explorerUrl(signature),
  });
}
