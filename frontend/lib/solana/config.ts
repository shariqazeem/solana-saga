import { PublicKey, clusterApiUrl } from "@solana/web3.js";

// Program ID from your deployment (for legacy/devnet mode)
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || "11111111111111111111111111111111"
);

// Solana network configuration
// Default to devnet for development - set NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta for production
export const SOLANA_NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet") as "devnet" | "mainnet-beta" | "testnet";

// RPC endpoints - use custom RPC for mainnet to avoid rate limits
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || clusterApiUrl(SOLANA_NETWORK);

// Market source configuration
// Default to legacy (devnet contracts) - set NEXT_PUBLIC_MARKET_SOURCE=dflow for production
export type MarketSource = "dflow" | "legacy";
export const MARKET_SOURCE: MarketSource = (process.env.NEXT_PUBLIC_MARKET_SOURCE as MarketSource) || "legacy";

// DFlow Prediction Markets API configuration
export const DFLOW_API_BASE = process.env.NEXT_PUBLIC_DFLOW_API_BASE || "https://pond.dflow.net";

// USDC configuration (mainnet)
export const USDC_MINT_MAINNET = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
export const USDC_MINT_DEVNET = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
export const USDC_MINT = SOLANA_NETWORK === "mainnet-beta" ? USDC_MINT_MAINNET : USDC_MINT_DEVNET;
export const USDC_DECIMALS = 6;

// Feature flags
// Defaults optimized for development - override in .env.local for production
export const FEATURES = {
  // Jupiter wallet: set NEXT_PUBLIC_USE_JUPITER_WALLET=true for production
  USE_JUPITER_WALLET: process.env.NEXT_PUBLIC_USE_JUPITER_WALLET === "true",
  // DFlow markets: automatically true when MARKET_SOURCE=dflow
  USE_DFLOW_MARKETS: MARKET_SOURCE === "dflow",
  // PSG1 mode: set NEXT_PUBLIC_PSG1_MODE=true for PSG1 console
  PSG1_MODE: process.env.NEXT_PUBLIC_PSG1_MODE === "true",
};

// PSG1 Console specifications
export const PSG1_SPECS = {
  SCREEN_WIDTH: 1240,
  SCREEN_HEIGHT: 1080,
  SCREEN_SIZE_INCHES: 3.92,
  ASPECT_RATIO: 1240 / 1080, // ~1.148 (slightly taller than 16:9)
};

export const isConfigured = () => {
  return PROGRAM_ID.toString() !== "11111111111111111111111111111111" || FEATURES.USE_DFLOW_MARKETS;
};
