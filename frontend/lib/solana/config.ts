// Solana network configuration
export const SOLANA_NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "mainnet-beta") as "devnet" | "mainnet-beta" | "testnet";

const DEFAULT_RPC_URLS: Record<string, string> = {
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
  "devnet": "https://api.devnet.solana.com",
  "testnet": "https://api.testnet.solana.com",
};

export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || DEFAULT_RPC_URLS[SOLANA_NETWORK] || "https://api.mainnet-beta.solana.com";

// Jupiter Prediction Market API
export const JUP_API_BASE_URL = "https://api.jup.ag/prediction/v1";
export const JUP_API_KEY = process.env.NEXT_PUBLIC_JUP_PREDICTION_API_KEY || "";
