"use client";

/**
 * useUnifiedMarkets Hook
 *
 * Unified hook that provides access to prediction markets from either:
 * - DFlow/Kalshi (mainnet, real markets) - for production/hackathon
 * - Legacy contracts (devnet) - for development/testing
 *
 * The source is determined by NEXT_PUBLIC_MARKET_SOURCE environment variable.
 */

import { useMemo } from "react";
import { FEATURES } from "@/lib/solana/config";
import { usePredictionMarkets, Market, Bet, UserStats } from "@/lib/solana/hooks/usePredictionMarkets";
import { useDFlowMarkets, Position } from "@/lib/dflow";

export interface UnifiedMarketsHook {
  // Data
  markets: Market[];
  userBets: Bet[];
  userPositions?: Position[];
  loading: boolean;
  error: string | null;

  // Actions
  placeBet: (marketAddress: string, amount: number, prediction: boolean) => Promise<string>;
  claimWinnings: (identifier: string) => Promise<string>;
  getMarket: (marketAddress: string) => Promise<Market | null>;
  fetchAllUserStats: () => Promise<UserStats[]>;
  refetch: () => Promise<unknown>;

  // Metadata
  source: "dflow" | "legacy";
  isMainnet: boolean;
}

export function useUnifiedMarkets(): UnifiedMarketsHook {
  const useDFlow = FEATURES.USE_DFLOW_MARKETS;

  // Initialize both hooks (one will be active based on config)
  const legacyHook = usePredictionMarkets();
  const dflowHook = useDFlowMarkets();

  // Select active hook based on configuration
  const activeHook = useDFlow ? dflowHook : legacyHook;

  // Unified interface
  const result = useMemo((): UnifiedMarketsHook => {
    if (useDFlow) {
      return {
        markets: dflowHook.markets,
        userBets: dflowHook.userBets,
        userPositions: dflowHook.userPositions,
        loading: dflowHook.loading,
        error: dflowHook.error,
        placeBet: async (marketAddress, amount, prediction) => {
          return dflowHook.placeBet(marketAddress, amount, prediction);
        },
        claimWinnings: dflowHook.claimWinnings,
        getMarket: dflowHook.getMarket,
        fetchAllUserStats: dflowHook.fetchAllUserStats,
        refetch: dflowHook.refetch,
        source: "dflow",
        isMainnet: true,
      };
    } else {
      return {
        markets: legacyHook.markets,
        userBets: legacyHook.userBets,
        userPositions: undefined,
        loading: legacyHook.loading,
        error: legacyHook.error,
        placeBet: legacyHook.placeBet,
        claimWinnings: legacyHook.claimWinnings,
        getMarket: legacyHook.getMarket,
        fetchAllUserStats: legacyHook.fetchAllUserStats,
        refetch: legacyHook.refetch,
        source: "legacy",
        isMainnet: false,
      };
    }
  }, [useDFlow, dflowHook, legacyHook]);

  return result;
}

// Re-export types for convenience
export type { Market, Bet, UserStats } from "@/lib/solana/hooks/usePredictionMarkets";
export type { Position } from "@/lib/dflow";
