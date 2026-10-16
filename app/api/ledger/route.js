import { NextResponse } from 'next/server';
import { findByHash, findBySignature, recentEntries } from '../../lib/ledger';
import { isRateLimited } from '../../lib/rateLimit';
import { addressUrl, getSolana, network } from '../../lib/solana';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HASH_PATTERN = /^[0-9a-f]{64}$/;
const SIGNATURE_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{80,90}$/;

export async function GET(request) {
  if (isRateLimited(request, { name: 'ledger', max: 30 })) {
    return NextResponse.json({ error: 'Too many searches. Try again in a minute.' }, { status: 429 });
  }

  const q = new URL(request.url).searchParams.get('q')?.trim() ?? '';

  try {
    const wallet = getSolana().wallet.publicKey.toBase58();
    const base = { network, wallet, walletUrl: addressUrl(wallet) };

    if (!q) return NextResponse.json({ ...base, mode: 'recent', entries: await recentEntries() });

    if (HASH_PATTERN.test(q.toLowerCase())) {
      const { entries, scanned } = await findByHash(q.toLowerCase());
      return NextResponse.json({ ...base, mode: 'hash', query: q.toLowerCase(), entries, scanned });
    }

    if (SIGNATURE_PATTERN.test(q)) {
      return NextResponse.json({ ...base, mode: 'signature', query: q, entries: await findBySignature(q) });
    }

    return NextResponse.json(
      { error: 'Enter a 64-character fingerprint or a transaction ID from a DeedSafe receipt.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Ledger lookup failed:', error);
    return NextResponse.json({ error: "Couldn't reach the ledger. Try again in a moment." }, { status: 502 });
  }
}
