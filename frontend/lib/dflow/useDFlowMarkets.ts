"use client";

/**
 * useDFlowMarkets Hook
 *
 * React hook for interacting with DFlow/Kalshi prediction markets.
 * Provides the same interface as usePredictionMarkets for seamless integration.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Market, Bet, UserStats } from "../solana/hooks/usePredictionMarkets";
import { dflowApi, DFlowMarket } from "./api";
import { transformDFlowMarket, fetchFeaturedMarkets, isDFlowMarket, getDFlowTicker } from "./transform";
import { placeDFlowBet, claimDFlowWinnings, dflowTrade, Position } from "./trading";

export interface DFlowMarketsHook {
  markets: Market[];
  userBets: Bet[];
  userPositions: Position[];
  loading: boolean;
  error: string | null;
  placeBet: (marketAddress: string, amount: number, prediction: boolean) => Promise<string>;
  claimWinnings: (marketTicker: string) => Promise<string>;
  getMarket: (marketAddress: string) => Promise<Market | null>;
  fetchAllUserStats: () => Promise<UserStats[]>;
  refetch: () => Promise<void>;
}

export function useDFlowMarkets(): DFlowMarketsHook {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [markets, setMarkets] = useState<Market[]>([]);
  const [userPositions, setUserPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track pending transactions
  const pendingTxRef = useRef<Set<string>>(new Set());

  // Fetch markets from DFlow
  const fetchMarkets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[DFlow] Fetching markets...");

      // Fetch featured/active markets
      const dflowMarkets = await fetchFeaturedMarkets(50);

      console.log(`[DFlow] Loaded ${dflowMarkets.length} markets`);
      setMarkets(dflowMarkets);
    } catch (err: any) {
      console.error("[DFlow] Error fetching markets:", err);
      setError(err.message || "Failed to fetch markets");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user positions
  const fetchUserPositions = useCallback(async () => {
    if (!wallet.publicKey) return;

    try {
      const positions = await dflowTrade.getPositions(wallet.publicKey.toString());
      setUserPositions(positions);
    } catch (err) {
      console.warn("[DFlow] Could not fetch positions:", err);
    }
  }, [wallet.publicKey]);

  // Initial fetch
  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  // Fetch positions when wallet connects
  useEffect(() => {
    if (wallet.publicKey) {
      fetchUserPositions();
    }
  }, [wallet.publicKey, fetchUserPositions]);

  // Place a bet on a DFlow market
  const placeBet = useCallback(
    async (marketAddress: string, amount: number, prediction: boolean): Promise<string> => {
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      // Get ticker from market address
      const ticker = getDFlowTicker({ publicKey: marketAddress } as Market);
      if (!ticker) {
        throw new Error("Invalid market address - not a DFlow market");
      }

      // Prevent duplicate transactions
      const txId = `bet-${ticker}-${Date.now()}`;
      if (pendingTxRef.current.has(txId)) {
        throw new Error("Transaction already pending");
      }
      pendingTxRef.current.add(txId);

      try {
        console.log(`[DFlow] Placing bet: ${prediction ? "YES" : "NO"} on ${ticker} for $${amount}`);

        const result = await placeDFlowBet(
          ticker,
          prediction,
          amount,
          {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction,
            sendTransaction: wallet.sendTransaction,
          },
          connection
        );

        // Refresh data
        await Promise.all([fetchMarkets(), fetchUserPositions()]);

        return result.signature;
      } finally {
        pendingTxRef.current.delete(txId);
      }
    },
    [wallet, connection, fetchMarkets, fetchUserPositions]
  );

  // Claim winnings from a settled market
  const claimWinnings = useCallback(
    async (marketTicker: string): Promise<string> => {
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      // Handle both full market address and ticker
      const ticker = marketTicker.startsWith("dflow:")
        ? marketTicker.replace("dflow:", "")
        : marketTicker;

      const result = await claimDFlowWinnings(
        ticker,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
          sendTransaction: wallet.sendTransaction,
        },
        connection
      );

      // Refresh positions
      await fetchUserPositions();

      return result.signature;
    },
    [wallet, connection, fetchUserPositions]
  );

  // Get a single market by address
  const getMarket = useCallback(
    async (marketAddress: string): Promise<Market | null> => {
      try {
        const ticker = getDFlowTicker({ publicKey: marketAddress } as Market);
        if (!ticker) return null;

        const dflowMarket = await dflowApi.getMarket(ticker);
        const event = await dflowApi.getEvent(dflowMarket.event_ticker, false);

        return transformDFlowMarket(dflowMarket, event);
      } catch (err) {
        console.error("[DFlow] Error fetching market:", err);
        return null;
      }
    },
    []
  );

  // Convert positions to bets format for compatibility
  const userBets: Bet[] = userPositions.map((pos) => ({
    publicKey: `dflow:${pos.market_ticker}:${pos.side}`,
    user: wallet.publicKey?.toString() || "",
    market: `dflow:${pos.market_ticker}`,
    amount: pos.quantity * pos.average_price / 100,
    prediction: pos.side === "yes",
    tokensReceived: pos.quantity,
    timestamp: Date.now() / 1000,
    claimed: false,
    payout: pos.current_value,
  }));

  // Fetch all user stats (DFlow doesn't have global leaderboard yet)
  const fetchAllUserStats = useCallback(async (): Promise<UserStats[]> => {
    // DFlow doesn't provide a global leaderboard API
    // Return empty array or implement custom tracking
    return [];
  }, []);

  // Refetch all data
  const refetch = useCallback(async () => {
    await Promise.all([fetchMarkets(), fetchUserPositions()]);
  }, [fetchMarkets, fetchUserPositions]);

  return {
    markets,
    userBets,
    userPositions,
    loading,
    error,
    placeBet,
    claimWinnings,
    getMarket,
    fetchAllUserStats,
    refetch,
  };
}
