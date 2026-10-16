// Server-only Solana helpers shared by the stamp and ledger routes.
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import { DEEDSAFE_CONSTANTS } from '../config/constants';

export const { network, memoProgramId } = DEEDSAFE_CONSTANTS.blockchain;
// v1 memos carry only the document hash; v2 memos add the journal entry's commitment.
const MEMO_V1 = /DeedSafe:sha256:([0-9a-f]{64})/;
const MEMO_V2 = /DeedSafe:v2:doc:([0-9a-f]{64}):journal:([0-9a-f]{64})/;

export function buildMemo(documentHash, journalHash) {
  return `DeedSafe:v2:doc:${documentHash}:journal:${journalHash}`;
}

let cached;
export function getSolana() {
  if (cached) return cached;
  const raw = process.env.SOLANA_PRIVATE_KEY;
  if (!raw) throw new Error('SOLANA_PRIVATE_KEY is not set');
  const wallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
  const connection = new Connection(process.env.SOLANA_RPC_URL || clusterApiUrl(network), 'confirmed');
  cached = { wallet, connection };
  return cached;
}

function clusterSuffix() {
  return network === 'mainnet-beta' ? '' : `?cluster=${network}`;
}

export function explorerUrl(signature) {
  return `https://explorer.solana.com/tx/${signature}${clusterSuffix()}`;
}

export function addressUrl(address) {
  return `https://explorer.solana.com/address/${address}${clusterSuffix()}`;
}

export function parseMemo(memo) {
  const v2 = memo?.match(MEMO_V2);
  if (v2) return { hash: v2[1], journalHash: v2[2] };
  const v1 = memo?.match(MEMO_V1);
  return v1 ? { hash: v1[1], journalHash: null } : null;
}
