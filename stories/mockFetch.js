// Stands in for the app's API routes so every state renders without Supabase or Solana.
// Each story passes a handler: (url, init) => ({ status, body }) or a Promise that never settles.
export function withFetch(handler) {
  return (Story) => {
    window.fetch = async (input, init) => {
      const url = new URL(typeof input === 'string' ? input : input.url, window.location.origin);
      const { status = 200, body } = await handler(url, init);
      return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
    };
    return <Story />;
  };
}

export const never = () => new Promise(() => {});

const now = Math.floor(Date.UTC(2026, 9, 20, 15, 30) / 1000);
const hex = (seed) => Array.from({ length: 64 }, (_, i) => ((seed * 7 + i * 13) % 16).toString(16)).join('');
const sig = (seed) => `${seed}xK9mPq2Vb7RtYw4Lz8Nc3Hf6Jd1Sg5Ae`.repeat(3).slice(0, 88);

export const sampleEntries = [1, 2, 3, 4, 5].map((n) => ({
  signature: sig(n),
  hash: hex(n),
  journalHash: n % 2 ? hex(n + 40) : null,
  blockTime: now - n * 5400,
  slot: 412_880_000 - n * 13_500,
  explorerUrl: `https://explorer.solana.com/tx/${sig(n)}?cluster=devnet`,
}));

export const ledgerResponse = {
  network: 'devnet',
  walletUrl: 'https://explorer.solana.com/address/DeedSafeDemoWa11et?cluster=devnet',
  entries: sampleEntries,
  scanned: 250,
};
