"use client";

import { useState, useCallback, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, Transaction, VersionedTransaction } from "@solana/web3.js";
import { RPC_ENDPOINT } from "@/lib/solana/config";
import { isSMWABridgeAvailable } from "@/lib/solana/smwaBridge";
import {
  getSwapQuote,
  getSwapTransaction,
  SOL_MINT,
  USDC_MINT,
  solToLamports,
  lamportsToSol,
  rawToUsdc,
  type QuoteResponse,
  type SwapError,
} from "@/lib/jupiter/jupiterSwapApi";

// Known token decimals — used for display conversion
const KNOWN_DECIMALS: Record<string, number> = {
  [SOL_MINT]: 9,
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263": 5, // BONK
};

function getDecimalsForMint(mint: string): number {
  return KNOWN_DECIMALS[mint] ?? 6; // Most SPL tokens (USDC, JUP, etc.) use 6
}

export interface SwapState {
  quote: QuoteResponse | null;
  quoteLoading: boolean;
  swapping: boolean;
  error: string | null;
}

/**
 * Deserialize a base64-encoded transaction, auto-detecting legacy vs versioned.
 * Legacy transactions don't have a version prefix (first byte < 0x80).
 * Versioned (v0) transactions have first byte >= 0x80.
 */
function deserializeTransaction(base64: string): Transaction | VersionedTransaction {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  // Try versioned first (Jupiter returns versioned by default), fall back to legacy
  try {
    return VersionedTransaction.deserialize(bytes);
  } catch {
    return Transaction.from(bytes);
  }
}

export function useJupiterSwap() {
  const connection = useMemo(
    () => new Connection(RPC_ENDPOINT, { commitment: "confirmed" }),
    []
  );
  const wallet = useWallet();

  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch a swap quote for any token pair.
   */
  const fetchQuote = useCallback(
    async (
      inputMint: string,
      outputMint: string,
      amountRaw: number,
      slippageBps?: number
    ): Promise<QuoteResponse | null> => {
      setQuoteLoading(true);
      setError(null);

      try {
        const q = await getSwapQuote(inputMint, outputMint, amountRaw, slippageBps);
        setQuote(q);
        return q;
      } catch (err: any) {
        const msg = (err as SwapError).message || err.message || "Failed to get quote";
        setError(msg);
        setQuote(null);
        return null;
      } finally {
        setQuoteLoading(false);
      }
    },
    []
  );

  /**
   * Execute a swap given a quote.
   * Sends versioned transactions by default. Falls back to legacy conversion for wallets that can't handle versioned.
   */
  const executeSwap = useCallback(
    async (quoteResponse: QuoteResponse): Promise<string> => {
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }
      if (!wallet.sendTransaction) {
        throw new Error("Wallet does not support transaction sending. Try a different wallet.");
      }

      setSwapping(true);
      setError(null);

      try {
        // 0. Pre-check: verify wallet has enough SOL for the swap input
        const inputMint = quoteResponse.inputMint;
        if (inputMint === SOL_MINT) {
          const solBalance = await connection.getBalance(wallet.publicKey);
          const needed = parseInt(quoteResponse.inAmount) + 10_000_000; // + 0.01 SOL for fees
          if (solBalance < needed) {
            throw new Error(
              `Insufficient SOL. You have ${(solBalance / 1e9).toFixed(4)} SOL but need ~${(needed / 1e9).toFixed(4)} SOL.`
            );
          }
        }

        // 1. Get swap transaction from Jupiter (asLegacyTransaction for wallet compat)
        const swapResult = await getSwapTransaction(
          quoteResponse,
          wallet.publicKey.toBase58()
        );

        if (!swapResult.swapTransaction) {
          throw new Error("No transaction returned from Jupiter Swap API");
        }

        // 2. Deserialize - auto-detects legacy vs versioned
        const transaction = deserializeTransaction(swapResult.swapTransaction);
        const isLegacy = transaction instanceof Transaction;
        console.log("[Jupiter Swap] Transaction type:", isLegacy ? "legacy" : "versioned");

        // 3. Send via wallet adapter
        //    For versioned transactions that fail on some mobile wallets,
        //    fall back to manual signTransaction + sendRawTransaction
        let signature: string;
        try {
          signature = await wallet.sendTransaction(transaction, connection, {
            skipPreflight: false,
            preflightCommitment: "confirmed",
            maxRetries: 3,
          });
        } catch (sendErr: any) {
          console.warn("[Jupiter Swap] sendTransaction failed:", sendErr.message);
          // If user rejected, don't try fallback
          if (sendErr.message?.includes("reject")) throw sendErr;
          // For versioned tx, try manual sign+send as fallback
          if (!isLegacy && wallet.signTransaction) {
            console.warn("[Jupiter Swap] Trying signTransaction + sendRawTransaction fallback");
            const signedTx = await wallet.signTransaction(transaction as VersionedTransaction);
            signature = await connection.sendRawTransaction(signedTx.serialize(), {
              skipPreflight: false,
              preflightCommitment: "confirmed",
              maxRetries: 3,
            });
          } else {
            throw sendErr;
          }
        }

        console.log("[Jupiter Swap] Transaction sent:", signature);

        // 4. Confirm using polling (more reliable than WebSocket on free RPCs)
        // SMWA bridge already confirmed the tx — use short timeout
        const pollStart = Date.now();
        const pollTimeout = isSMWABridgeAvailable() ? 10_000 : 60_000;
        let confirmed = false;

        while (Date.now() - pollStart < pollTimeout) {
          try {
            const { value } = await connection.getSignatureStatuses([signature]);
            const status = value?.[0];
            if (status) {
              if (status.confirmationStatus === "confirmed" || status.confirmationStatus === "finalized") {
                if (status.err) {
                  throw new Error("Swap transaction failed on-chain. Please try again.");
                }
                confirmed = true;
                break;
              }
            }
          } catch (pollErr: any) {
            // "invalid param" means the signature format might be unusual from native bridge
            // Just keep polling — the tx was already sent
            console.warn("[Jupiter Swap] Poll error:", pollErr.message);
          }
          await new Promise((r) => setTimeout(r, 2500));
        }

        if (confirmed) {
          console.log("[Jupiter Swap] Confirmed:", signature);
        } else {
          // Transaction was sent but we couldn't confirm via our RPC.
          // This is NOT an error — the native wallet already submitted it.
          console.warn("[Jupiter Swap] Confirmation timed out, treating as sent:", signature);
        }
        return signature;
      } catch (err: any) {
        console.error("[Jupiter Swap] Error:", err);

        if (err.message?.includes("User rejected") || err.message?.includes("user rejected")) {
          throw new Error("Transaction cancelled");
        }
        if (err.message?.includes("Insufficient SOL") || err.message?.includes("Insufficient balance")) {
          throw err; // Already a clear message
        }
        if (err.message?.includes("insufficient") || err.message?.includes("Insufficient")) {
          throw new Error("Insufficient balance for this swap");
        }
        if (err.message?.includes("no record of a prior credit") || err.message?.includes("Attempt to debit")) {
          throw new Error("Insufficient SOL balance. Deposit SOL to your wallet first.");
        }
        if (err.message?.includes("Simulation failed") || err.message?.includes("simulation failed")) {
          throw new Error("Transaction simulation failed. Check your balance and try again.");
        }
        if (err.message?.includes("AccountNotFound") || err.message?.includes("Account not found") || err.message?.includes("could not find account")) {
          throw new Error("Token account not found. You may need SOL or the input token in your wallet first.");
        }
        if (err.message?.includes("blockhash")) {
          throw new Error("Transaction expired. Please try again.");
        }

        // Pass through the raw error for debugging
        throw new Error(err.message || "Swap failed");
      } finally {
        setSwapping(false);
      }
    },
    [wallet, connection]
  );

  /**
   * Convenience: swap SOL to USDC in one call.
   */
  const swapSolToUsdc = useCallback(
    async (solAmount: number): Promise<string> => {
      const lamports = solToLamports(solAmount);
      const q = await fetchQuote(SOL_MINT, USDC_MINT, lamports);
      if (!q) throw new Error("Failed to get quote");
      return executeSwap(q);
    },
    [fetchQuote, executeSwap]
  );

  /**
   * Get a quote for SOL -> USDC (for preview purposes).
   */
  const quoteSolToUsdc = useCallback(
    async (solAmount: number): Promise<QuoteResponse | null> => {
      const lamports = solToLamports(solAmount);
      return fetchQuote(SOL_MINT, USDC_MINT, lamports);
    },
    [fetchQuote]
  );

  // Derived display values from current quote
  // Use actual token decimals based on mint (not hardcoded SOL/USDC)
  const quoteDisplay = quote
    ? (() => {
        const inputDecimals = getDecimalsForMint(quote.inputMint);
        const outputDecimals = getDecimalsForMint(quote.outputMint);
        const inputAmount = parseInt(quote.inAmount) / Math.pow(10, inputDecimals);
        const outputAmount = parseInt(quote.outAmount) / Math.pow(10, outputDecimals);
        const minimumReceived = parseInt(quote.otherAmountThreshold) / Math.pow(10, outputDecimals);
        return {
          inputAmount,
          outputAmount,
          minimumReceived,
          priceImpact: parseFloat(quote.priceImpactPct),
          exchangeRate: inputAmount > 0 ? outputAmount / inputAmount : 0,
          routeSteps: quote.routePlan.length,
        };
      })()
    : null;

  return {
    // State
    quote,
    quoteLoading,
    swapping,
    error,
    quoteDisplay,

    // Actions
    fetchQuote,
    executeSwap,
    swapSolToUsdc,
    quoteSolToUsdc,
    clearError: () => setError(null),
  };
}
