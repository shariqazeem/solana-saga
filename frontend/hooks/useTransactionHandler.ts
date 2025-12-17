"use client";

import { useCallback, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Transaction,
  TransactionSignature,
  Connection,
  PublicKey,
  Commitment,
  TransactionInstruction,
  VersionedTransaction,
  SendOptions,
} from "@solana/web3.js";

// Types for the transaction handler
export interface TransactionHandlerOptions {
  commitment?: Commitment;
  skipPreflight?: boolean;
  maxRetries?: number;
  onStatusChange?: (status: TransactionStatus) => void;
}

export type TransactionStatus =
  | "idle"
  | "preparing"
  | "signing"
  | "sending"
  | "confirming"
  | "confirmed"
  | "error";

export interface TransactionResult {
  signature: TransactionSignature;
  confirmed: boolean;
}

// Mobile detection utilities
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function isPhantomMobileBrowser(): boolean {
  if (typeof window === "undefined") return false;
  // Phantom in-app browser sets specific user agent
  const ua = navigator.userAgent;
  return (
    ua.includes("Phantom") ||
    (isMobileDevice() && typeof (window as any).phantom?.solana !== "undefined")
  );
}

export function isMobileWalletAdapter(): boolean {
  if (typeof window === "undefined") return false;
  // Check if running in a mobile wallet context (deep link scenario)
  return isMobileDevice() && !isPhantomMobileBrowser();
}

/**
 * Hook for handling Solana transactions with full mobile wallet adapter compatibility.
 *
 * Key features:
 * 1. Properly sets recentBlockhash and feePayer BEFORE signing (fixes MWA signature errors)
 * 2. Uses signAndSendTransaction for mobile wallets (atomic operation)
 * 3. Uses signTransaction + sendRawTransaction for desktop (more control)
 * 4. Maintains transaction state to prevent React unmount issues
 * 5. Implements retry logic with exponential backoff
 */
export function useTransactionHandler() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Use ref to track pending transactions across component re-renders
  const pendingTxRef = useRef<Map<string, Promise<TransactionResult>>>(new Map());

  /**
   * Prepares a transaction with recentBlockhash and feePayer.
   * CRITICAL: This MUST be done before signing for mobile wallets.
   */
  const prepareTransaction = useCallback(
    async (transaction: Transaction): Promise<Transaction> => {
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      // Get the latest blockhash with "confirmed" commitment for reliability
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

      // Set transaction properties BEFORE signing
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
      transaction.lastValidBlockHeight = lastValidBlockHeight;

      return transaction;
    },
    [connection, wallet.publicKey]
  );

  /**
   * Creates a new transaction from instructions with proper preparation.
   */
  const createTransaction = useCallback(
    async (instructions: TransactionInstruction[]): Promise<Transaction> => {
      const transaction = new Transaction();
      instructions.forEach((ix) => transaction.add(ix));
      return prepareTransaction(transaction);
    },
    [prepareTransaction]
  );

  /**
   * Sends and confirms a transaction using the appropriate method for the wallet type.
   *
   * For Mobile Wallet Adapter (deep link flow):
   * - Uses signAndSendTransaction (atomic operation)
   * - The wallet handles sending to prevent signature/blockhash mismatch
   *
   * For Desktop/In-App Browser:
   * - Uses signTransaction + sendRawTransaction
   * - Gives more control over retry logic and RPC endpoints
   */
  const sendTransaction = useCallback(
    async (
      transaction: Transaction,
      options: TransactionHandlerOptions = {}
    ): Promise<TransactionResult> => {
      const {
        commitment = "confirmed",
        skipPreflight = false,
        maxRetries = 3,
        onStatusChange,
      } = options;

      const updateStatus = (newStatus: TransactionStatus) => {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      };

      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected or does not support signing");
      }

      setError(null);
      updateStatus("preparing");

      try {
        // Ensure transaction is properly prepared
        const preparedTx = await prepareTransaction(transaction);

        const isMobile = isMobileDevice();
        const isInAppBrowser = isPhantomMobileBrowser();

        let signature: TransactionSignature;

        if (isMobile && !isInAppBrowser && wallet.sendTransaction) {
          // MOBILE WALLET ADAPTER FLOW (Deep Link)
          // Use the wallet's sendTransaction which internally handles signAndSendTransaction
          // This is the atomic operation mobile wallets expect
          updateStatus("signing");

          console.log("[TX Handler] Using mobile wallet adapter flow (signAndSendTransaction)");

          const sendOptions: SendOptions = {
            skipPreflight,
            preflightCommitment: commitment,
            maxRetries,
          };

          signature = await wallet.sendTransaction(preparedTx, connection, sendOptions);

          console.log("[TX Handler] Mobile transaction sent:", signature);
        } else {
          // DESKTOP / IN-APP BROWSER FLOW
          // Sign first, then send raw transaction
          // This gives us more control and works better in browser contexts
          updateStatus("signing");

          console.log("[TX Handler] Using desktop flow (signTransaction + sendRawTransaction)");

          const signedTx = await wallet.signTransaction(preparedTx);

          updateStatus("sending");

          const rawTransaction = signedTx.serialize();

          signature = await connection.sendRawTransaction(rawTransaction, {
            skipPreflight,
            preflightCommitment: commitment,
            maxRetries,
          });

          console.log("[TX Handler] Desktop transaction sent:", signature);
        }

        // Confirm the transaction
        updateStatus("confirming");

        const latestBlockhash = await connection.getLatestBlockhash(commitment);

        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          commitment
        );

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
        }

        updateStatus("confirmed");
        console.log("[TX Handler] Transaction confirmed:", signature);

        return { signature, confirmed: true };
      } catch (err: any) {
        updateStatus("error");
        const errorMessage = err.message || "Transaction failed";
        setError(errorMessage);
        console.error("[TX Handler] Transaction error:", err);
        throw new Error(errorMessage);
      }
    },
    [connection, wallet, prepareTransaction]
  );

  /**
   * Sends a transaction with automatic retry logic.
   * Useful for unreliable network conditions on mobile.
   */
  const sendTransactionWithRetry = useCallback(
    async (
      transaction: Transaction,
      options: TransactionHandlerOptions & { retryDelayMs?: number } = {}
    ): Promise<TransactionResult> => {
      const { maxRetries = 3, retryDelayMs = 1000, ...sendOptions } = options;

      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[TX Handler] Attempt ${attempt}/${maxRetries}`);

          // Re-prepare transaction on retry to get fresh blockhash
          const freshTx = await prepareTransaction(
            Transaction.from(transaction.serialize({ requireAllSignatures: false }))
          );

          return await sendTransaction(freshTx, { ...sendOptions, maxRetries: 1 });
        } catch (err: any) {
          lastError = err;
          console.warn(`[TX Handler] Attempt ${attempt} failed:`, err.message);

          // Don't retry on certain errors
          if (
            err.message?.includes("User rejected") ||
            err.message?.includes("insufficient funds") ||
            err.message?.includes("Wallet not connected")
          ) {
            throw err;
          }

          if (attempt < maxRetries) {
            // Exponential backoff
            const delay = retryDelayMs * Math.pow(2, attempt - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      throw lastError || new Error("Transaction failed after retries");
    },
    [prepareTransaction, sendTransaction]
  );

  /**
   * Sends multiple transactions in sequence.
   * Waits for each to confirm before sending the next.
   */
  const sendTransactionBatch = useCallback(
    async (
      transactions: Transaction[],
      options: TransactionHandlerOptions = {}
    ): Promise<TransactionResult[]> => {
      const results: TransactionResult[] = [];

      for (const tx of transactions) {
        const result = await sendTransaction(tx, options);
        results.push(result);
      }

      return results;
    },
    [sendTransaction]
  );

  /**
   * Tracks a transaction ID to prevent duplicate submissions.
   * Useful for mobile contexts where component may re-render during signing.
   */
  const trackTransaction = useCallback(
    (
      txId: string,
      transactionPromise: Promise<TransactionResult>
    ): Promise<TransactionResult> => {
      if (pendingTxRef.current.has(txId)) {
        console.log("[TX Handler] Returning existing pending transaction:", txId);
        return pendingTxRef.current.get(txId)!;
      }

      const trackedPromise = transactionPromise.finally(() => {
        pendingTxRef.current.delete(txId);
      });

      pendingTxRef.current.set(txId, trackedPromise);
      return trackedPromise;
    },
    []
  );

  /**
   * Checks if a transaction is already pending.
   */
  const isPending = useCallback((txId: string): boolean => {
    return pendingTxRef.current.has(txId);
  }, []);

  /**
   * Resets the transaction handler state.
   */
  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    // State
    status,
    error,
    isProcessing: status !== "idle" && status !== "confirmed" && status !== "error",

    // Core functions
    prepareTransaction,
    createTransaction,
    sendTransaction,
    sendTransactionWithRetry,
    sendTransactionBatch,

    // Tracking helpers
    trackTransaction,
    isPending,
    reset,

    // Utilities
    isMobile: isMobileDevice(),
    isInAppBrowser: isPhantomMobileBrowser(),
    isMobileWalletAdapter: isMobileWalletAdapter(),
  };
}
