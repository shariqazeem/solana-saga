"use client";

import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
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

export interface SwapState {
  quote: QuoteResponse | null;
  quoteLoading: boolean;
  swapping: boolean;
  error: string | null;
}

export function useJupiterSwap() {
  const { connection } = useConnection();
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
   * Execute a swap given a quote. Follows EXACT same signing pattern as
   * useJupiterPrediction.ts placeBet().
   */
  const executeSwap = useCallback(
    async (quoteResponse: QuoteResponse): Promise<string> => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected");
      }

      setSwapping(true);
      setError(null);

      try {
        // 1. Get swap transaction from Jupiter
        const swapResult = await getSwapTransaction(
          quoteResponse,
          wallet.publicKey.toBase58()
        );

        if (!swapResult.swapTransaction) {
          throw new Error("No transaction returned from Jupiter Swap API");
        }

        // 2. Deserialize the base64 transaction
        const txBuffer = Buffer.from(swapResult.swapTransaction, "base64");
        const transaction = VersionedTransaction.deserialize(txBuffer);

        // 3. Sign with wallet
        const signedTx = await wallet.signTransaction(transaction);

        // 4. Send to Solana
        const signature = await connection.sendRawTransaction(
          signedTx.serialize(),
          {
            skipPreflight: false,
            preflightCommitment: "confirmed",
            maxRetries: 3,
          }
        );

        console.log("[Jupiter Swap] Transaction sent:", signature);

        // 5. Confirm transaction
        const latestBlockhash = await connection.getLatestBlockhash("confirmed");
        await connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: swapResult.lastValidBlockHeight || latestBlockhash.lastValidBlockHeight,
          },
          "confirmed"
        );

        console.log("[Jupiter Swap] Confirmed:", signature);
        return signature;
      } catch (err: any) {
        console.error("[Jupiter Swap] Error:", err);

        if (err.message?.includes("User rejected")) {
          throw new Error("Transaction cancelled");
        }
        if (err.message?.includes("insufficient")) {
          throw new Error("Insufficient balance");
        }

        throw new Error(err.message || "Swap failed");
      } finally {
        setSwapping(false);
      }
    },
    [wallet, connection]
  );

  /**
   * Convenience: swap SOL to USDC in one call.
   * @param solAmount - amount of SOL to swap
   * @returns transaction signature
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
  const quoteDisplay = quote
    ? {
        inputAmount: lamportsToSol(parseInt(quote.inAmount)),
        outputAmount: rawToUsdc(parseInt(quote.outAmount)),
        minimumReceived: rawToUsdc(parseInt(quote.otherAmountThreshold)),
        priceImpact: parseFloat(quote.priceImpactPct),
        exchangeRate:
          rawToUsdc(parseInt(quote.outAmount)) /
          lamportsToSol(parseInt(quote.inAmount)),
        routeSteps: quote.routePlan.length,
      }
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
