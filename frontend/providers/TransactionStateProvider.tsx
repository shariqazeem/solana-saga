"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";

// Transaction state types
export type TransactionPhase =
  | "idle"
  | "preparing"
  | "awaiting_signature"
  | "signing"
  | "sending"
  | "confirming"
  | "success"
  | "error";

export interface TransactionState {
  phase: TransactionPhase;
  txId: string | null;
  signature: string | null;
  error: string | null;
  startTime: number | null;
  metadata?: Record<string, any>;
}

interface TransactionContextValue {
  state: TransactionState;
  isProcessing: boolean;
  startTransaction: (txId: string, metadata?: Record<string, any>) => void;
  updatePhase: (phase: TransactionPhase) => void;
  setSignature: (signature: string) => void;
  setError: (error: string) => void;
  reset: () => void;
  // Recovery helpers for mobile context switches
  getPendingTransaction: () => TransactionState | null;
  hasRecoverableTransaction: () => boolean;
}

const initialState: TransactionState = {
  phase: "idle",
  txId: null,
  signature: null,
  error: null,
  startTime: null,
  metadata: undefined,
};

const TransactionContext = createContext<TransactionContextValue | null>(null);

// Storage key for persisting state across app switches
const STORAGE_KEY = "solana_saga_pending_tx";
const TX_TIMEOUT_MS = 120000; // 2 minutes - max time to consider a TX as pending

/**
 * Provider that maintains transaction state across React component lifecycle.
 *
 * Key features for preventing white screen on mobile:
 * 1. Persists transaction state to sessionStorage during deep link flows
 * 2. Recovers state when the app returns from wallet
 * 3. Prevents React from unmounting components during transaction
 * 4. Provides loading state that persists across re-renders
 */
export function TransactionStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TransactionState>(initialState);
  const mountedRef = useRef(true);
  const stateRef = useRef(state);

  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // On mount, check for recoverable transaction state (mobile return flow)
  useEffect(() => {
    const storedState = getPendingTransaction();
    if (storedState && storedState.phase !== "idle") {
      console.log("[TX State] Recovering transaction state:", storedState);
      setState(storedState);
    }
  }, []);

  // Persist state to storage when it changes (for mobile recovery)
  useEffect(() => {
    if (state.phase !== "idle") {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        // sessionStorage might not be available in some contexts
        console.warn("[TX State] Could not persist state:", e);
      }
    } else {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // Ignore
      }
    }
  }, [state]);

  // Helper to get stored pending transaction
  const getPendingTransaction = useCallback((): TransactionState | null => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored) as TransactionState;

      // Check if the transaction is too old (expired)
      if (parsed.startTime && Date.now() - parsed.startTime > TX_TIMEOUT_MS) {
        console.log("[TX State] Stored transaction expired, clearing");
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }, []);

  // Check if there's a recoverable transaction
  const hasRecoverableTransaction = useCallback((): boolean => {
    const pending = getPendingTransaction();
    return pending !== null && pending.phase !== "idle" && pending.phase !== "success";
  }, [getPendingTransaction]);

  // Start a new transaction
  const startTransaction = useCallback(
    (txId: string, metadata?: Record<string, any>) => {
      if (!mountedRef.current) return;

      const newState: TransactionState = {
        phase: "preparing",
        txId,
        signature: null,
        error: null,
        startTime: Date.now(),
        metadata,
      };

      setState(newState);
      console.log("[TX State] Transaction started:", txId);
    },
    []
  );

  // Update transaction phase
  const updatePhase = useCallback((phase: TransactionPhase) => {
    if (!mountedRef.current) return;

    setState((prev) => ({
      ...prev,
      phase,
      error: phase === "error" ? prev.error : null,
    }));

    console.log("[TX State] Phase updated:", phase);
  }, []);

  // Set transaction signature (success)
  const setSignature = useCallback((signature: string) => {
    if (!mountedRef.current) return;

    setState((prev) => ({
      ...prev,
      phase: "success",
      signature,
      error: null,
    }));

    console.log("[TX State] Transaction successful:", signature);
  }, []);

  // Set transaction error
  const setError = useCallback((error: string) => {
    if (!mountedRef.current) return;

    setState((prev) => ({
      ...prev,
      phase: "error",
      error,
    }));

    console.log("[TX State] Transaction error:", error);
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    if (!mountedRef.current) return;

    setState(initialState);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }

    console.log("[TX State] State reset");
  }, []);

  // Compute isProcessing
  const isProcessing =
    state.phase !== "idle" &&
    state.phase !== "success" &&
    state.phase !== "error";

  return (
    <TransactionContext.Provider
      value={{
        state,
        isProcessing,
        startTransaction,
        updatePhase,
        setSignature,
        setError,
        reset,
        getPendingTransaction,
        hasRecoverableTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

/**
 * Hook to access transaction state context.
 */
export function useTransactionState(): TransactionContextValue {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactionState must be used within a TransactionStateProvider"
    );
  }
  return context;
}

/**
 * Hook that wraps an async transaction function with state management.
 * Prevents white screen by maintaining state during the deep link flow.
 */
export function useTransactionWrapper() {
  const { startTransaction, updatePhase, setSignature, setError, reset, isProcessing } =
    useTransactionState();

  const wrapTransaction = useCallback(
    async <T,>(
      txId: string,
      transactionFn: () => Promise<T>,
      options?: {
        metadata?: Record<string, any>;
        onSuccess?: (result: T) => void;
        onError?: (error: Error) => void;
      }
    ): Promise<T | null> => {
      // Prevent duplicate submissions while processing
      if (isProcessing) {
        console.log("[TX Wrapper] Transaction already in progress, skipping");
        return null;
      }

      startTransaction(txId, options?.metadata);

      try {
        updatePhase("awaiting_signature");

        const result = await transactionFn();

        // If result is a signature string, set it
        if (typeof result === "string") {
          setSignature(result);
        } else {
          updatePhase("success");
        }

        options?.onSuccess?.(result);

        // Auto-reset after a short delay (let UI show success state)
        setTimeout(() => reset(), 3000);

        return result;
      } catch (err: any) {
        const errorMessage = err.message || "Transaction failed";
        setError(errorMessage);
        options?.onError?.(err);

        // Auto-reset after showing error
        setTimeout(() => reset(), 5000);

        throw err;
      }
    },
    [isProcessing, startTransaction, updatePhase, setSignature, setError, reset]
  );

  return { wrapTransaction, isProcessing };
}
