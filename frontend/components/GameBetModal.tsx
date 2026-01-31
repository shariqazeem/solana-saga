"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameCredits } from "@/hooks/useGameCredits";
import {
  X,
  Coins,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertCircle,
} from "lucide-react";

interface GameBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: {
    id: string;
    question: string;
    yesOdds: number;
    noOdds: number;
    category?: string;
  };
  prediction: boolean; // true = YES, false = NO
  onBetPlaced?: () => void;
}

const QUICK_AMOUNTS = [50, 100, 250, 500];

export function GameBetModal({
  isOpen,
  onClose,
  market,
  prediction,
  onBetPlaced,
}: GameBetModalProps) {
  const { credits, placeBet, currentStreak } = useGameCredits();
  const [amount, setAmount] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const odds = prediction ? market.yesOdds : market.noOdds;
  const potentialPayout = Math.floor(amount * odds);
  const potentialProfit = potentialPayout - amount;

  useEffect(() => {
    if (isOpen) {
      setAmount(100);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handlePlaceBet = () => {
    setError(null);

    if (amount <= 0) {
      setError("Enter a valid amount");
      return;
    }

    if (amount > credits) {
      setError("Not enough credits");
      return;
    }

    const result = placeBet(
      market.id,
      market.question,
      prediction,
      amount,
      odds
    );

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        if (onBetPlaced) onBetPlaced();
        onClose();
      }, 1500);
    } else {
      setError(result.error || "Failed to place bet");
    }
  };

  const handleAmountChange = (value: string) => {
    const num = parseInt(value) || 0;
    setAmount(Math.max(0, Math.min(num, credits)));
    setError(null);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(Math.min(quickAmount, credits));
    setError(null);
  };

  const handleAllIn = () => {
    setAmount(credits);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          className={`relative w-full max-w-md rounded-2xl overflow-hidden ${
            prediction
              ? "bg-gradient-to-b from-[#00FF88]/10 to-[#0a0a0f]"
              : "bg-gradient-to-b from-[#FF0044]/10 to-[#0a0a0f]"
          } border ${
            prediction ? "border-[#00FF88]/30" : "border-[#FF0044]/30"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Overlay */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/80"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                  className="text-center"
                >
                  <div
                    className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                      prediction ? "bg-[#00FF88]/20" : "bg-[#FF0044]/20"
                    }`}
                  >
                    <Zap
                      className={`w-10 h-10 ${
                        prediction ? "text-[#00FF88]" : "text-[#FF0044]"
                      }`}
                    />
                  </div>
                  <div className="mt-4 font-game text-xl text-white">
                    BET PLACED!
                  </div>
                  <div className="mt-2 text-gray-400">
                    {amount} credits on {prediction ? "YES" : "NO"}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="relative p-4 border-b border-white/10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              {prediction ? (
                <TrendingUp className="w-5 h-5 text-[#00FF88]" />
              ) : (
                <TrendingDown className="w-5 h-5 text-[#FF0044]" />
              )}
              <span
                className={`font-game text-lg ${
                  prediction ? "text-[#00FF88]" : "text-[#FF0044]"
                }`}
              >
                PREDICT {prediction ? "YES" : "NO"}
              </span>
            </div>

            <p className="text-sm text-gray-300 line-clamp-2">
              {market.question}
            </p>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Balance */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Your Balance</span>
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#FFD700]" />
                <span className="font-game text-[#FFD700]">
                  {credits.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Bet Amount</label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFD700]" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-game text-lg focus:outline-none focus:border-[#00F3FF]/50"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Quick Amounts */}
            <div className="flex gap-2">
              {QUICK_AMOUNTS.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => handleQuickAmount(quickAmount)}
                  disabled={quickAmount > credits}
                  className={`flex-1 py-2 rounded-lg font-game text-sm transition-colors ${
                    amount === quickAmount
                      ? prediction
                        ? "bg-[#00FF88]/20 border-[#00FF88]/50 text-[#00FF88]"
                        : "bg-[#FF0044]/20 border-[#FF0044]/50 text-[#FF0044]"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  } border disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  {quickAmount}
                </button>
              ))}
              <button
                onClick={handleAllIn}
                className={`flex-1 py-2 rounded-lg font-game text-sm border transition-colors ${
                  amount === credits
                    ? "bg-[#FFD700]/20 border-[#FFD700]/50 text-[#FFD700]"
                    : "bg-[#FFD700]/10 border-[#FFD700]/30 text-[#FFD700]/70 hover:bg-[#FFD700]/20"
                }`}
              >
                ALL IN
              </button>
            </div>

            {/* Payout Preview */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Odds</span>
                <span className="text-white font-game">{odds.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Potential Payout</span>
                <span className="text-white font-game">
                  {potentialPayout.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Potential Profit</span>
                <span className="text-[#00FF88] font-game">
                  +{potentialProfit.toLocaleString()}
                </span>
              </div>
              {currentStreak > 0 && (
                <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                  <span className="text-gray-400">Win Streak Bonus</span>
                  <span className="text-[#FF6B00] font-game">
                    +{currentStreak * 10} XP
                  </span>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-[#FF0044]">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handlePlaceBet}
              disabled={amount <= 0 || amount > credits || success}
              className={`w-full py-4 rounded-xl font-game font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                prediction
                  ? "bg-gradient-to-r from-[#00FF88] to-[#00F3FF] text-black hover:scale-105"
                  : "bg-gradient-to-r from-[#FF0044] to-[#FF6B00] text-white hover:scale-105"
              }`}
            >
              PLACE BET - {amount.toLocaleString()} CREDITS
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
