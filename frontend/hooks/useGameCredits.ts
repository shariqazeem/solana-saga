"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  getGameData,
  saveGameData,
  placeBet,
  resolveBet,
  claimDailyBonus,
  addFreeCredits,
  getLeaderboard,
  getXpForNextLevel,
  GameData,
  GameBet,
  ACHIEVEMENTS,
} from "@/lib/gameCredits";

export interface UseGameCreditsReturn {
  // Data
  gameData: GameData | null;
  credits: number;
  level: number;
  xp: number;
  xpForNextLevel: number;
  xpProgress: number; // 0-100 percentage
  currentStreak: number;
  bestStreak: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  achievements: string[];
  activeBets: GameBet[];
  resolvedBets: GameBet[];

  // Actions
  placeBet: (
    marketId: string,
    marketQuestion: string,
    prediction: boolean,
    amount: number,
    odds: number
  ) => { success: boolean; bet?: GameBet; error?: string };
  resolveBet: (
    betId: string,
    won: boolean
  ) => { success: boolean; payout?: number; newStreak?: number };
  claimDailyBonus: () => { success: boolean; amount?: number; error?: string };
  addFreeCredits: (amount?: number) => void;
  canClaimDailyBonus: boolean;

  // Helpers
  refreshData: () => void;
  isLoading: boolean;
  getAchievementInfo: (id: string) => { name: string; description: string; icon: string } | null;
}

export function useGameCredits(): UseGameCreditsReturn {
  const { publicKey, connected } = useWallet();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const walletAddress = publicKey?.toBase58() || "";

  // Load game data when wallet connects
  const refreshData = useCallback(() => {
    if (!walletAddress) {
      setGameData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = getGameData(walletAddress);
      setGameData(data);
    } catch (error) {
      console.error("Error loading game data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Check if daily bonus can be claimed
  const canClaimDailyBonus = useCallback(() => {
    if (!gameData) return false;
    const today = new Date().toISOString().split("T")[0];
    return gameData.lastDailyBonus !== today;
  }, [gameData]);

  // Place a bet
  const handlePlaceBet = useCallback(
    (
      marketId: string,
      marketQuestion: string,
      prediction: boolean,
      amount: number,
      odds: number
    ) => {
      if (!walletAddress) {
        return { success: false, error: "Connect wallet first" };
      }

      const result = placeBet(
        walletAddress,
        marketId,
        marketQuestion,
        prediction,
        amount,
        odds
      );

      if (result.success) {
        refreshData();
      }

      return result;
    },
    [walletAddress, refreshData]
  );

  // Resolve a bet
  const handleResolveBet = useCallback(
    (betId: string, won: boolean) => {
      if (!walletAddress) {
        return { success: false };
      }

      const result = resolveBet(walletAddress, betId, won);

      if (result.success) {
        refreshData();
      }

      return result;
    },
    [walletAddress, refreshData]
  );

  // Claim daily bonus
  const handleClaimDailyBonus = useCallback(() => {
    if (!walletAddress) {
      return { success: false, error: "Connect wallet first" };
    }

    const result = claimDailyBonus(walletAddress);

    if (result.success) {
      refreshData();
    }

    return result;
  }, [walletAddress, refreshData]);

  // Add free credits
  const handleAddFreeCredits = useCallback(
    (amount: number = 500) => {
      if (!walletAddress) return;

      addFreeCredits(walletAddress, amount);
      refreshData();
    },
    [walletAddress, refreshData]
  );

  // Get achievement info
  const getAchievementInfo = useCallback((id: string) => {
    const achievement = ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS];
    return achievement || null;
  }, []);

  // Calculate derived values
  const credits = gameData?.credits || 0;
  const level = gameData?.level || 1;
  const xp = gameData?.xp || 0;
  const xpForNextLevel = getXpForNextLevel(level);
  const xpForCurrentLevel = getXpForNextLevel(level - 1);
  const xpProgress =
    level === 1
      ? (xp / xpForNextLevel) * 100
      : ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
  const currentStreak = gameData?.currentStreak || 0;
  const bestStreak = gameData?.bestStreak || 0;
  const totalWins = gameData?.totalWins || 0;
  const totalLosses = gameData?.totalLosses || 0;
  const winRate =
    totalWins + totalLosses > 0
      ? Math.round((totalWins / (totalWins + totalLosses)) * 100)
      : 0;
  const achievements = gameData?.achievements || [];
  const activeBets = gameData?.bets.filter((b) => !b.resolved) || [];
  const resolvedBets = gameData?.bets.filter((b) => b.resolved) || [];

  return {
    gameData,
    credits,
    level,
    xp,
    xpForNextLevel,
    xpProgress: Math.min(100, Math.max(0, xpProgress)),
    currentStreak,
    bestStreak,
    totalWins,
    totalLosses,
    winRate,
    achievements,
    activeBets,
    resolvedBets,
    placeBet: handlePlaceBet,
    resolveBet: handleResolveBet,
    claimDailyBonus: handleClaimDailyBonus,
    addFreeCredits: handleAddFreeCredits,
    canClaimDailyBonus: canClaimDailyBonus(),
    refreshData,
    isLoading,
    getAchievementInfo,
  };
}
