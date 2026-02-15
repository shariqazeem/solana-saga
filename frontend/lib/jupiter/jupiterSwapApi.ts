/**
 * Jupiter Swap API Client
 *
 * Integrates Jupiter Swap v1 API for in-app token swapping.
 * Primary use case: SOL -> USDC conversion so users can bet.
 */

import { JUP_API_KEY } from "@/lib/solana/config";

// Common mint addresses
export const SOL_MINT = "So11111111111111111111111111111111111111112";
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// Decimals
export const SOL_DECIMALS = 9;
export const USDC_DECIMALS = 6;

// --- Conversion helpers ---

export function solToLamports(sol: number): number {
  return Math.round(sol * 1e9);
}

export function lamportsToSol(lamports: number): number {
  return lamports / 1e9;
}

export function usdcToRaw(usdc: number): number {
  return Math.round(usdc * 1e6);
}

export function rawToUsdc(raw: number): number {
  return raw / 1e6;
}

// --- Types ---

export interface RoutePlanStep {
  swapInfo: {
    ammKey: string;
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
  };
  percent: number;
}

export interface QuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: RoutePlanStep[];
  contextSlot?: number;
  timeTaken?: number;
}

export interface SwapTransactionResponse {
  swapTransaction: string; // base64 encoded transaction
  lastValidBlockHeight: number;
  dynamicSlippageReport?: {
    slippageBps: number;
    otherAmount: string;
    simulatedIncurredSlippageBps: number;
  };
}

export interface SwapError {
  type: "NETWORK" | "API" | "NO_ROUTE" | "UNKNOWN";
  message: string;
}

// --- API Functions ---

const SWAP_API_BASE = "https://api.jup.ag/swap/v1";

export async function getSwapQuote(
  inputMint: string,
  outputMint: string,
  amountRaw: number,
  slippageBps: number = 50
): Promise<QuoteResponse> {
  const url = `${SWAP_API_BASE}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountRaw}&slippageBps=${slippageBps}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(JUP_API_KEY ? { "x-api-key": JUP_API_KEY } : {}),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 400 && text.includes("No route")) {
        throw { type: "NO_ROUTE", message: "No swap route found for this pair" } as SwapError;
      }
      throw { type: "API", message: `Quote API error: ${res.status} ${text}` } as SwapError;
    }

    const data: QuoteResponse = await res.json();
    return data;
  } catch (err: any) {
    if (err.type) throw err; // Already a SwapError
    throw { type: "NETWORK", message: err.message || "Failed to fetch quote" } as SwapError;
  }
}

export async function getSwapTransaction(
  quoteResponse: QuoteResponse,
  userPublicKey: string
): Promise<SwapTransactionResponse> {
  const url = `${SWAP_API_BASE}/swap`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(JUP_API_KEY ? { "x-api-key": JUP_API_KEY } : {}),
      },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey,
        dynamicComputeUnitLimit: true,
        dynamicSlippage: true,
        asLegacyTransaction: true,
        prioritizationFeeLamports: {
          priorityLevelWithMaxLamports: {
            maxLamports: 1000000,
            priorityLevel: "veryHigh",
          },
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw { type: "API", message: `Swap API error: ${res.status} ${text}` } as SwapError;
    }

    const data: SwapTransactionResponse = await res.json();
    return data;
  } catch (err: any) {
    if (err.type) throw err;
    throw { type: "NETWORK", message: err.message || "Failed to create swap transaction" } as SwapError;
  }
}

/**
 * Get a quick SOL -> USDC quote for a given SOL amount.
 */
export async function getQuickSolToUsdcQuote(solAmount: number): Promise<QuoteResponse> {
  return getSwapQuote(SOL_MINT, USDC_MINT, solToLamports(solAmount));
}
