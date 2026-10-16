// Reads DeedSafe records straight from the public ledger (the stamping wallet's
// transaction history), so lookups never depend on our own database.
import { explorerUrl, getSolana, parseMemo } from './solana';

const PAGE_SIZE = 1000;
const MAX_PAGES = 5;
const RECENT_LIMIT = 25;
const RECENT_TTL_MS = 15_000;

let recentCache = { at: 0, entries: null };

export function invalidateRecent() {
  recentCache = { at: 0, entries: null };
}

function toEntry({ signature, slot, blockTime }, { hash, journalHash }) {
  return { signature, hash, journalHash, slot, blockTime: blockTime ?? null, explorerUrl: explorerUrl(signature) };
}

function stampsFrom(infos) {
  return infos.flatMap((info) => {
    const parsed = !info.err && parseMemo(info.memo);
    return parsed ? [toEntry(info, parsed)] : [];
  });
}

export async function recentEntries() {
  if (recentCache.entries && Date.now() - recentCache.at < RECENT_TTL_MS) return recentCache.entries;
  const { wallet, connection } = getSolana();
  const infos = await connection.getSignaturesForAddress(wallet.publicKey, { limit: RECENT_LIMIT * 2 });
  const entries = stampsFrom(infos).slice(0, RECENT_LIMIT);
  recentCache = { at: Date.now(), entries };
  return entries;
}

// Returns every record of this hash, earliest first, plus how many records were searched.
export async function findByHash(hash) {
  const { wallet, connection } = getSolana();
  const matches = [];
  let scanned = 0;
  let before;
  for (let page = 0; page < MAX_PAGES; page++) {
    const infos = await connection.getSignaturesForAddress(wallet.publicKey, { before, limit: PAGE_SIZE });
    const stamps = stampsFrom(infos);
    scanned += stamps.length;
    matches.push(...stamps.filter((s) => s.hash === hash));
    if (infos.length < PAGE_SIZE) break;
    before = infos[infos.length - 1].signature;
  }
  return { entries: matches.reverse(), scanned };
}

// Looks up one transaction and returns it only if DeedSafe's wallet signed a DeedSafe memo.
export async function findBySignature(signature) {
  const { wallet, connection } = getSolana();
  let tx;
  try {
    tx = await connection.getParsedTransaction(signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
  } catch (error) {
    // A malformed signature isn't a record. Anything else (rate limits, outages) is a real failure.
    if (/invalid|wrongsize/i.test(error.message)) return [];
    throw error;
  }
  if (!tx || tx.meta?.err) return [];
  const signer = tx.transaction.message.accountKeys.find((k) => k.signer)?.pubkey;
  if (!signer?.equals(wallet.publicKey)) return [];
  const memo = tx.transaction.message.instructions.find((ix) => typeof ix.parsed === 'string')?.parsed;
  const parsed = parseMemo(memo);
  return parsed ? [toEntry({ signature, slot: tx.slot, blockTime: tx.blockTime }, parsed)] : [];
}
