import { PublicKey, clusterApiUrl } from "@solana/web3.js";

// Program ID from your deployment
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || "11111111111111111111111111111111"
);

// Solana network configuration
export const SOLANA_NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet") as "devnet" | "mainnet-beta" | "testnet";

export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || clusterApiUrl(SOLANA_NETWORK);

// Market addresses from demo script
export const DEMO_MARKETS = [
  process.env.NEXT_PUBLIC_MARKET_1,
  process.env.NEXT_PUBLIC_MARKET_2,
  process.env.NEXT_PUBLIC_MARKET_3,
  process.env.NEXT_PUBLIC_MARKET_4,
  process.env.NEXT_PUBLIC_MARKET_5,
].filter((addr): addr is string => addr !== undefined);

// Convert string addresses to PublicKey
export const getMarketPublicKeys = () => {
  return DEMO_MARKETS.map(addr => new PublicKey(addr));
};

export const isConfigured = () => {
  return PROGRAM_ID.toString() !== "11111111111111111111111111111111" && DEMO_MARKETS.length > 0;
};
