export const DEEDSAFE_CONSTANTS = {
  pricing: { notaryMonthlyPrice: 49.0, titleEnterprisePrice: 249.0 },
  blockchain: {
    // Use "devnet" while developing; switch to "mainnet-beta" for production.
    network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet",
    // SPL Memo Program v2
    memoProgramId: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
  },
  sales: { firstMonthCommissionSplit: 1.0, monthlyResidualSplit: 0.1 },
};
