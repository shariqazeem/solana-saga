"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameCredits } from "@/hooks/useGameCredits";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Coins,
  Zap,
  Trophy,
  Flame,
  Gift,
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";

interface GameCreditsDisplayProps {
  compact?: boolean;
}

export function GameCreditsDisplay({ compact = false }: GameCreditsDisplayProps) {
  const { connected } = useWallet();
  const {
    credits,
    level,
    xpProgress,
    currentStreak,
    totalWins,
    winRate,
    canClaimDailyBonus,
    claimDailyBonus,
    addFreeCredits,
    isLoading,
  } = useGameCredits();

  const [expanded, setExpanded] = useState(false);
  const [showBonus, setShowBonus] = useState(false);

  const handleClaimBonus = () => {
    const result = claimDailyBonus();
    if (result.success) {
      setShowBonus(true);
      setTimeout(() => setShowBonus(false), 2000);
    }
  };

  if (!connected) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0a0a0f]/80 border border-[#00F3FF]/20">
        <div className="w-4 h-4 rounded-full border-2 border-[#00F3FF]/30 border-t-[#00F3FF] animate-spin" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* Credits */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30">
          <Coins className="w-4 h-4 text-[#FFD700]" />
          <span className="font-game text-sm text-[#FFD700]">
            {credits.toLocaleString()}
          </span>
        </div>

        {/* Level */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#AA00FF]/10 border border-[#AA00FF]/30">
          <Star className="w-4 h-4 text-[#AA00FF]" />
          <span className="font-game text-sm text-[#AA00FF]">LV.{level}</span>
        </div>

        {/* Daily Bonus */}
        {canClaimDailyBonus && (
          <button
            onClick={handleClaimBonus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 hover:bg-[#00FF88]/20 transition-colors animate-pulse"
          >
            <Gift className="w-4 h-4 text-[#00FF88]" />
            <span className="font-game text-xs text-[#00FF88]">CLAIM</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Bonus Animation */}
      <AnimatePresence>
        {showBonus && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="px-4 py-2 rounded-xl bg-[#00FF88] text-black font-game text-sm whitespace-nowrap">
              +DAILY BONUS!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        className="rounded-2xl bg-[#0a0a0f]/90 border border-[#00F3FF]/20 backdrop-blur-sm overflow-hidden"
      >
        {/* Main Stats Row */}
        <div
          className="flex items-center justify-between p-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-4">
            {/* Credits */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                <Coins className="w-4 h-4 text-[#FFD700]" />
              </div>
              <div>
                <div className="font-game text-lg text-white">
                  {credits.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-500 uppercase">Credits</div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-white/10" />

            {/* Level & XP */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#AA00FF]/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#AA00FF]" />
              </div>
              <div>
                <div className="font-game text-sm text-white">LEVEL {level}</div>
                <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#AA00FF] to-[#FF00FF]"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* Streak */}
            {currentStreak > 0 && (
              <>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#FF6B00]" />
                  <span className="font-game text-sm text-[#FF6B00]">
                    {currentStreak}x
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Expand Toggle */}
          <div className="flex items-center gap-2">
            {canClaimDailyBonus && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClaimBonus();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00FF88]/20 border border-[#00FF88]/30 hover:bg-[#00FF88]/30 transition-colors"
              >
                <Gift className="w-4 h-4 text-[#00FF88]" />
                <span className="font-game text-xs text-[#00FF88]">DAILY</span>
              </button>
            )}
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>

        {/* Expanded Stats */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-white/10"
            >
              <div className="p-3 grid grid-cols-3 gap-3">
                {/* Wins */}
                <div className="text-center">
                  <Trophy className="w-5 h-5 mx-auto mb-1 text-[#FFD700]" />
                  <div className="font-game text-lg text-white">{totalWins}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Wins</div>
                </div>

                {/* Win Rate */}
                <div className="text-center">
                  <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-[#00FF88]/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#00FF88]">%</span>
                  </div>
                  <div className="font-game text-lg text-white">{winRate}%</div>
                  <div className="text-[10px] text-gray-500 uppercase">Win Rate</div>
                </div>

                {/* Streak */}
                <div className="text-center">
                  <Flame className="w-5 h-5 mx-auto mb-1 text-[#FF6B00]" />
                  <div className="font-game text-lg text-white">{currentStreak}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Streak</div>
                </div>
              </div>

              {/* Add Credits Button */}
              <div className="px-3 pb-3">
                <button
                  onClick={() => addFreeCredits(500)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-[#00F3FF]/20 to-[#00FF88]/20 border border-[#00F3FF]/30 text-[#00F3FF] font-game text-sm hover:from-[#00F3FF]/30 hover:to-[#00FF88]/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  GET 500 FREE CREDITS
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
