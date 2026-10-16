import { NextResponse } from 'next/server';
import { journalCommitment } from '../../../../lib/journal';
import { findBySignature } from '../../../../lib/ledger';
import { createClient } from '../../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Recomputes an entry's fingerprint from what's stored and compares it with the ledger.
export async function GET(_request, { params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to check your journal.' }, { status: 401 });

  // Row-level security limits this to the signed-in notary's own entries.
  const { data: entry } = await supabase.from('journal_entries').select('*').eq('id', id).maybeSingle();
  if (!entry) return NextResponse.json({ error: 'Journal entry not found.' }, { status: 404 });

  const recomputed = journalCommitment(entry);
  const storedMatches = recomputed === entry.journal_sha256;

  if (!entry.transaction_signature) {
    return NextResponse.json({ storedMatches, onLedger: false, status: entry.status });
  }

  try {
    const [record] = await findBySignature(entry.transaction_signature);
    return NextResponse.json({
      storedMatches,
      onLedger: Boolean(record),
      documentMatches: record?.hash === entry.document_sha256,
      journalMatches: record?.journalHash === recomputed,
      blockTime: record?.blockTime ?? null,
      explorerUrl: record?.explorerUrl ?? null,
    });
  } catch (error) {
    console.error('Journal verify failed:', error);
    return NextResponse.json({ error: "Couldn't reach the ledger. Try again in a moment." }, { status: 502 });
  }
}
