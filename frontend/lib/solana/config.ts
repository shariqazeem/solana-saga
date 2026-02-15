// Solana network configuration
export const SOLANA_NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "mainnet-beta") as "devnet" | "mainnet-beta" | "testnet";

// Fallback RPC: PublicNode free tier (supports sendTransaction unlike public Solana RPC)
const FALLBACK_RPC = "https://solana-rpc.publicnode.com";

const _envRpc = (process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || "").trim();
export const RPC_ENDPOINT: string = _envRpc.startsWith("http") ? _envRpc : FALLBACK_RPC;

// Jupiter Prediction Market API
export const JUP_API_BASE_URL = "https://api.jup.ag/prediction/v1";
export const JUP_API_KEY = process.env.NEXT_PUBLIC_JUP_PREDICTION_API_KEY || "";
