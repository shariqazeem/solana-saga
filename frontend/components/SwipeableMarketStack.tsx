"use client";

import { useState, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  PanInfo,
  AnimatePresence,
} from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Flame, Clock, Users, TrendingUp, Zap, ChevronUp, SkipForward } from "lucide-react";
import confetti from "canvas-confetti";
import { HypeHUD } from "./HypeHUD";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Market } from "@/lib/solana/hooks/usePredictionMarkets";

interface SwipeableMarketStackProps {
  markets: Market[];
  onBet: (marketId: string, prediction: boolean, amount: number) => Promise<void>;
  onSkip: () => void;
  betAmount: number;
  soundEnabled: boolean;
}

const SWIPE_THRESHOLD = 100;
const ROTATION_MULTIPLIER = 0.1;

export function SwipeableMarketStack({
  markets,
  onBet,
  onSkip,
  betAmount,
  soundEnabled,
}: SwipeableMarketStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBetConfirm, setShowBetConfirm] = useState<"yes" | "no" | null>(null);
  const [cardHistory, setCardHistory] = useState<string[]>([]);

  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { playHover, playSwipeYes, playSwipeNo, playSkip, playBet } = useSoundEffects(soundEnabled);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();

  // Transform values for rotation and opacity
  const rotate = useTransform(x, [-300, 0, 300], [-30, 0, 30]);
  const yesOpacity = useTransform(x, [0, 100], [0, 1]);
  const noOpacity = useTransform(x, [-100, 0], [1, 0]);
  const skipOpacity = useTransform(y, [-100, 0], [1, 0]);

  const currentMarket = markets[currentIndex];
  const nextMarket = markets[currentIndex + 1];
  const hasMore = currentIndex < markets.length;

  // Get category style
  const getCategoryStyle = (category: string) => {
    switch (category.toLowerCase()) {
      case "price":
      case "crypto":
        return { bg: "bg-[#00F3FF]/10", border: "border-[#00F3FF]/30", text: "text-[#00F3FF]" };
      case "sports":
        return { bg: "bg-[#00FF88]/10", border: "border-[#00FF88]/30", text: "text-[#00FF88]" };
      case "meme":
        return { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" };
      case "politics":
        return { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" };
      default:
        return { bg: "bg-white/10", border: "border-white/30", text: "text-white" };
    }
  };

  // Fire confetti
  const fireConfetti = useCallback((side: "yes" | "no") => {
    const colors = side === "yes" ? ["#00FF88", "#00F3FF", "#FFFFFF"] : ["#FF0044", "#FF00FF", "#FFFFFF"];

    // Screen shake
    document.body.classList.add("shake-screen");
    setTimeout(() => document.body.classList.remove("shake-screen"), 300);

    // Confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: side === "yes" ? 0.8 : 0.2, y: 0.5 },
      colors,
      disableForReducedMotion: true,
    });
  }, []);

  // Handle swipe end
  const handleDragEnd = async (_: any, info: PanInfo) => {
    const xOffset = info.offset.x;
    const yOffset = info.offset.y;

    // Swipe RIGHT = YES
    if (xOffset > SWIPE_THRESHOLD) {
      if (!connected) {
        setVisible(true);
        controls.start({ x: 0, y: 0 });
        return;
      }

      setIsAnimating(true);
      playSwipeYes();
      fireConfetti("yes");

      await controls.start({ x: 500, opacity: 0, rotate: 30, transition: { duration: 0.3 } });

      try {
        await onBet(currentMarket.publicKey, true, betAmount);
        setCardHistory([...cardHistory, currentMarket.publicKey]);
        setCurrentIndex((i) => i + 1);
      } catch (e) {
        console.error("Bet failed:", e);
      }

      controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
      setIsAnimating(false);
    }
    // Swipe LEFT = NO
    else if (xOffset < -SWIPE_THRESHOLD) {
      if (!connected) {
        setVisible(true);
        controls.start({ x: 0, y: 0 });
        return;
      }

      setIsAnimating(true);
      playSwipeNo();
      fireConfetti("no");

      await controls.start({ x: -500, opacity: 0, rotate: -30, transition: { duration: 0.3 } });

      try {
        await onBet(currentMarket.publicKey, false, betAmount);
        setCardHistory([...cardHistory, currentMarket.publicKey]);
        setCurrentIndex((i) => i + 1);
      } catch (e) {
        console.error("Bet failed:", e);
      }

      controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
      setIsAnimating(false);
    }
    // Swipe UP = SKIP
    else if (yOffset < -SWIPE_THRESHOLD) {
      setIsAnimating(true);
      playSkip();

      await controls.start({ y: -500, opacity: 0, transition: { duration: 0.3 } });

      setCardHistory([...cardHistory, currentMarket.publicKey]);
      setCurrentIndex((i) => i + 1);
      onSkip();

      controls.set({ x: 0, y: 0, opacity: 1 });
      setIsAnimating(false);
    }
    // Return to center
    else {
      controls.start({ x: 0, y: 0, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  // Button handlers
  const handleButtonBet = async (prediction: boolean) => {
    if (!connected) {
      setVisible(true);
      return;
    }

    if (!currentMarket || isAnimating) return;

    setIsAnimating(true);
    setShowBetConfirm(prediction ? "yes" : "no");

    if (prediction) {
      playSwipeYes();
      fireConfetti("yes");
      await controls.start({ x: 500, opacity: 0, rotate: 30, transition: { duration: 0.3 } });
    } else {
      playSwipeNo();
      fireConfetti("no");
      await controls.start({ x: -500, opacity: 0, rotate: -30, transition: { duration: 0.3 } });
    }

    try {
      await onBet(currentMarket.publicKey, prediction, betAmount);
      playBet();
    } catch (e) {
      console.error("Bet failed:", e);
    }

    setCardHistory([...cardHistory, currentMarket.publicKey]);
    setCurrentIndex((i) => i + 1);
    controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
    setShowBetConfirm(null);
    setIsAnimating(false);
  };

  const handleSkipButton = async () => {
    if (!currentMarket || isAnimating) return;

    setIsAnimating(true);
    playSkip();

    await controls.start({ y: -500, opacity: 0, transition: { duration: 0.3 } });

    setCardHistory([...cardHistory, currentMarket.publicKey]);
    setCurrentIndex((i) => i + 1);
    onSkip();

    controls.set({ x: 0, y: 0, opacity: 1 });
    setIsAnimating(false);
  };

  // Empty state
  if (!hasMore || !currentMarket) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <motion.div
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Zap className="w-20 h-20 text-[#00F3FF] mx-auto mb-4" />
          <h2 className="text-3xl font-game text-white mb-2">ALL CAUGHT UP!</h2>
          <p className="text-gray-400">No more markets to bet on right now.</p>
          <p className="text-gray-500 text-sm mt-2">Check back soon for new predictions.</p>
        </motion.div>

        <button
          onClick={() => setCurrentIndex(0)}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00F3FF] to-[#FF00FF] text-black font-game font-bold hover:scale-105 transition-transform"
        >
          START OVER
        </button>
      </div>
    );
  }

  const categoryStyle = getCategoryStyle(currentMarket.category);
  const isUrgent = currentMarket.endsIn.includes("hour") || currentMarket.endsIn === "Soon";

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px] flex flex-col">
      {/* Card Stack Container */}
      <div className="relative flex-1 flex items-center justify-center">
        {/* Background card (next card preview) */}
        {nextMarket && (
          <motion.div
            className="absolute w-full max-w-[380px] h-[480px] rounded-3xl bg-[#0a0a0f]/80 border border-white/5"
            style={{ scale: 0.95, y: 20 }}
          />
        )}

        {/* Main swipeable card */}
        <motion.div
          className="absolute w-full max-w-[380px] cursor-grab active:cursor-grabbing"
          style={{ x, y, rotate }}
          drag={!isAnimating}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          animate={controls}
          whileTap={{ scale: 0.98 }}
          onHoverStart={playHover}
        >
          {/* Card content */}
          <div className="relative bg-gradient-to-b from-[#12121a] to-[#0a0a0f] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Swipe indicators */}
            <motion.div
              className="absolute top-4 left-4 px-4 py-2 rounded-xl bg-[#00FF88] text-black font-game font-bold text-lg z-30"
              style={{ opacity: yesOpacity }}
            >
              YES!
            </motion.div>
            <motion.div
              className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-[#FF0044] text-white font-game font-bold text-lg z-30"
              style={{ opacity: noOpacity }}
            >
              NO!
            </motion.div>
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-xl bg-white/20 text-white font-game font-bold text-lg z-30 backdrop-blur-md"
              style={{ opacity: skipOpacity }}
            >
              <ChevronUp className="w-8 h-8 mx-auto" />
              SKIP
            </motion.div>

            {/* Hype HUD */}
            <HypeHUD
              yesPool={currentMarket.yesPool}
              noPool={currentMarket.noPool}
              question={currentMarket.question}
              volume={currentMarket.totalVolume}
              bettors={currentMarket.bettors}
            />

            {/* Card body */}
            <div className="pt-24 pb-6 px-6">
              {/* Category & Timer */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1.5 rounded-full text-xs font-game ${categoryStyle.bg} ${categoryStyle.border} ${categoryStyle.text} border`}>
                  {currentMarket.category.toUpperCase()}
                </span>

                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                  isUrgent
                    ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                    : "bg-white/5 text-gray-400 border border-white/10"
                }`}>
                  <Clock className="w-3 h-3" />
                  <span className="font-numbers">{currentMarket.endsIn}</span>
                </div>

                {currentMarket.totalVolume > 1000 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-orange-500/20 text-orange-400 text-xs font-bold">
                    <Flame className="w-3 h-3" />
                    HOT
                  </span>
                )}
              </div>

              {/* Question */}
              <h2 className="text-2xl font-bold text-white leading-tight mb-6 min-h-[80px]">
                {currentMarket.question}
              </h2>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-6 text-sm">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <TrendingUp className="w-4 h-4 text-[#00FF88]" />
                  <span className="font-numbers">${currentMarket.totalVolume.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Users className="w-4 h-4 text-[#00F3FF]" />
                  <span className="font-numbers">{currentMarket.bettors} bettors</span>
                </div>
              </div>

              {/* Battle Bar */}
              <div className="mb-6">
                <div className="relative h-6 rounded-full overflow-hidden bg-black/50 border border-white/10">
                  <motion.div
                    className="absolute top-0 left-0 h-full rounded-l-full"
                    style={{
                      width: `${currentMarket.yesPrice}%`,
                      background: "linear-gradient(90deg, #00ff88, #00cc66)",
                      boxShadow: "0 0 20px rgba(0, 255, 136, 0.5)"
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${currentMarket.yesPrice}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute top-0 right-0 h-full rounded-r-full"
                    style={{
                      width: `${currentMarket.noPrice}%`,
                      background: "linear-gradient(90deg, #cc0033, #ff0044)",
                      boxShadow: "0 0 20px rgba(255, 0, 68, 0.5)"
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${currentMarket.noPrice}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />

                  {/* Center VS */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-pixel text-sm text-[#FFD700] drop-shadow-lg">VS</span>
                  </div>
                </div>
              </div>

              {/* Odds Display */}
              <div className="flex items-stretch gap-4 mb-4">
                {/* YES Side */}
                <motion.div
                  className="flex-1 p-4 rounded-xl bg-[#00FF88]/5 border-2 border-[#00FF88]/30 hover:border-[#00FF88] hover:bg-[#00FF88]/10 transition-all cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleButtonBet(true)}
                >
                  <div className="text-xs text-gray-400 font-game mb-1">YES</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#00FF88] font-numbers">
                      {currentMarket.yesPrice}
                    </span>
                    <span className="text-xl text-[#00FF88]/70">%</span>
                  </div>
                </motion.div>

                {/* NO Side */}
                <motion.div
                  className="flex-1 p-4 rounded-xl bg-[#FF0044]/5 border-2 border-[#FF0044]/30 hover:border-[#FF0044] hover:bg-[#FF0044]/10 transition-all cursor-pointer text-right"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleButtonBet(false)}
                >
                  <div className="text-xs text-gray-400 font-game mb-1">NO</div>
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-4xl font-black text-[#FF0044] font-numbers">
                      {currentMarket.noPrice}
                    </span>
                    <span className="text-xl text-[#FF0044]/70">%</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Swipe direction hints */}
        <motion.div
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00FF88]/30 font-game text-sm rotate-[-90deg] origin-center"
          animate={{ x: [0, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          YES →
        </motion.div>
        <motion.div
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FF0044]/30 font-game text-sm rotate-90 origin-center"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ← NO
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 mt-6">
        {/* NO Button */}
        <motion.button
          className="w-16 h-16 rounded-full bg-[#FF0044]/20 border-2 border-[#FF0044] flex items-center justify-center text-[#FF0044] font-game text-xl hover:bg-[#FF0044]/30 transition-colors disabled:opacity-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleButtonBet(false)}
          disabled={isAnimating}
        >
          ✕
        </motion.button>

        {/* Skip Button */}
        <motion.button
          className="w-12 h-12 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-gray-400 hover:bg-white/20 transition-colors disabled:opacity-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSkipButton}
          disabled={isAnimating}
        >
          <SkipForward className="w-5 h-5" />
        </motion.button>

        {/* YES Button */}
        <motion.button
          className="w-16 h-16 rounded-full bg-[#00FF88]/20 border-2 border-[#00FF88] flex items-center justify-center text-[#00FF88] font-game text-xl hover:bg-[#00FF88]/30 transition-colors disabled:opacity-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleButtonBet(true)}
          disabled={isAnimating}
        >
          ✓
        </motion.button>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {markets.slice(0, 10).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i < currentIndex
                ? "bg-[#00F3FF]"
                : i === currentIndex
                ? "bg-[#FF00FF] w-4"
                : "bg-white/20"
            }`}
          />
        ))}
        {markets.length > 10 && (
          <span className="text-xs text-gray-500 ml-2">+{markets.length - 10} more</span>
        )}
      </div>
    </div>
  );
}
