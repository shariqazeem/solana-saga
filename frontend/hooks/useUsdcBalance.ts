"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { useState, useEffect, useCallback } from "react";

// USDC Devnet mint address
export const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const USDC_DECIMALS = 6;

export function useUsdcBalance() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connected) {
      setBalance(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the associated token address for the user's USDC account
      const userTokenAddress = await getAssociatedTokenAddress(
        USDC_MINT,
        publicKey
      );

      // Try to get the account info
      try {
        const tokenAccount = await getAccount(connection, userTokenAddress);
        const rawBalance = Number(tokenAccount.amount);
        const usdcBalance = rawBalance / Math.pow(10, USDC_DECIMALS);
        setBalance(usdcBalance);
      } catch (e: any) {
        // Account doesn't exist - user has no USDC
        if (e.name === "TokenAccountNotFoundError") {
          setBalance(0);
        } else {
          throw e;
        }
      }
    } catch (error: any) {
      console.error("Error fetching USDC balance:", error);
      setError(error.message || "Failed to fetch balance");
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, connected]);

  // Fetch balance on mount and when wallet changes
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Subscribe to account changes for real-time updates
  useEffect(() => {
    if (!publicKey || !connected) return;

    let subscriptionId: number | null = null;

    const subscribeToBalance = async () => {
      try {
        const userTokenAddress = await getAssociatedTokenAddress(
          USDC_MINT,
          publicKey
        );

        subscriptionId = connection.onAccountChange(
          userTokenAddress,
          (accountInfo) => {
            // Parse the token account data
            // Token account data layout: mint (32) + owner (32) + amount (8) + ...
            const data = accountInfo.data;
            if (data.length >= 72) {
              const amountBuffer = data.slice(64, 72);
              const rawBalance = Number(amountBuffer.readBigUInt64LE(0));
              const usdcBalance = rawBalance / Math.pow(10, USDC_DECIMALS);
              setBalance(usdcBalance);
            }
          },
          "confirmed"
        );
      } catch (e) {
        console.log("Could not subscribe to balance updates");
      }
    };

    subscribeToBalance();

    return () => {
      if (subscriptionId !== null) {
        connection.removeAccountChangeListener(subscriptionId);
      }
    };
  }, [connection, publicKey, connected]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
}

// Hook for SOL balance (for gas fees)
export function useSolBalance() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connected) {
      setBalance(0);
      return;
    }

    setLoading(true);
    try {
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / 1e9); // Convert lamports to SOL
    } catch (error) {
      console.error("Error fetching SOL balance:", error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, connected]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, refetch: fetchBalance };
}
