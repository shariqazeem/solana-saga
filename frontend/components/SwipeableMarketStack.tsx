"use client";

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  useSpring,
  PanInfo,
  AnimatePresence,
} from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Flame, Clock, Users, TrendingUp, Zap, ChevronUp, SkipForward, Gamepad2 } from "lucide-react";
import confetti from "canvas-confetti";
import { HypeHUD } from "./HypeHUD";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Market } from "@/lib/solana/hooks/usePredictionMarkets";

// Gamepad button mappings (Standard Controller Layout)
const GAMEPAD_BUTTONS = {
  A_X: 0,           // A (Xbox) / X (PlayStation) - Vote YES
  B_CIRCLE: 1,      // B (Xbox) / Circle (PlayStation) - Vote NO
  Y_TRIANGLE: 3,    // Y (Xbox) / Triangle (PlayStation) - Skip
  DPAD_UP: 12,      // D-Pad Up - Skip
  DPAD_DOWN: 13,    // D-Pad Down
  DPAD_LEFT: 14,    // D-Pad Left - Vote NO
  DPAD_RIGHT: 15,   // D-Pad Right - Vote YES
};

// Debounce time in ms
const GAMEPAD_DEBOUNCE_MS = 500;

interface SwipeableMarketStackProps {
  markets: Market[];
  onBet: (marketId: string, prediction: boolean, amount: number) => Promise<void>;
  onSkip: () => void;
  betAmount: number;
  soundEnabled: boolean;
  streak?: number;
}

export interface SwipeableMarketStackRef {
  triggerBet: (prediction: boolean) => void;
  triggerSkip: () => void;
}

const SWIPE_THRESHOLD = 100;

export const SwipeableMarketStack = forwardRef<SwipeableMarketStackRef, SwipeableMarketStackProps>(({
  markets,
  onBet,
  onSkip,
  betAmount,
  soundEnabled,
  streak = 0,
}, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardHistory, setCardHistory] = useState<string[]>([]);
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [gamepadActive, setGamepadActive] = useState<"yes" | "no" | "skip" | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const lastGamepadActionRef = useRef<number>(0);
  const gamepadAnimationRef = useRef<number | null>(null);

  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { playHover, playSwipeYes, playSwipeNo, playSkip, playBet } = useSoundEffects(soundEnabled);

  // Swipe motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();

  // 3D Tilt motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring for tilt
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  // Glare position
  const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  // Transform values for swipe rotation and opacity
  const rotate = useTransform(x, [-300, 0, 300], [-30, 0, 30]);
  const yesOpacity = useTransform(x, [0, 100], [0, 1]);
  const noOpacity = useTransform(x, [-100, 0], [1, 0]);
  const skipOpacity = useTransform(y, [-100, 0], [1, 0]);

  const currentMarket = markets[currentIndex];
  const nextMarket = markets[currentIndex + 1];
  const hasMore = currentIndex < markets.length;

  // Handle mouse move for 3D tilt
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normalizedX = (e.clientX - centerX) / (rect.width / 2);
    const normalizedY = (e.clientY - centerY) / (rect.height / 2);
    mouseX.set(Math.max(-0.5, Math.min(0.5, normalizedX)));
    mouseY.set(Math.max(-0.5, Math.min(0.5, normalizedY)));
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

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

  // Expose methods for keyboard controls
  useImperativeHandle(ref, () => ({
    triggerBet: (prediction: boolean) => {
      handleButtonBet(prediction);
    },
    triggerSkip: () => {
      handleSkipButton();
    },
  }));

  // Gamepad support - Poll for controller input using requestAnimationFrame
  useEffect(() => {
    // Handle gamepad connection events
    const handleGamepadConnected = (e: GamepadEvent) => {
      console.log("Gamepad connected:", e.gamepad.id);
      setGamepadConnected(true);
    };

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      console.log("Gamepad disconnected:", e.gamepad.id);
      setGamepadConnected(false);
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    // Check if gamepad is already connected
    const gamepads = navigator.getGamepads();
    for (const gp of gamepads) {
      if (gp) {
        setGamepadConnected(true);
        break;
      }
    }

    // Polling loop for gamepad input
    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];

      if (gamepad && !isAnimating && currentMarket) {
        const now = Date.now();
        const timeSinceLastAction = now - lastGamepadActionRef.current;

        // Only process if debounce time has passed
        if (timeSinceLastAction >= GAMEPAD_DEBOUNCE_MS) {
          // Check for YES actions (A/X button or D-Pad Right)
          if (gamepad.buttons[GAMEPAD_BUTTONS.A_X]?.pressed ||
            gamepad.buttons[GAMEPAD_BUTTONS.DPAD_RIGHT]?.pressed) {
            lastGamepadActionRef.current = now;
            setGamepadActive("yes");
            handleButtonBet(true);
            setTimeout(() => setGamepadActive(null), 200);
          }
          // Check for NO actions (B/Circle button or D-Pad Left)
          else if (gamepad.buttons[GAMEPAD_BUTTONS.B_CIRCLE]?.pressed ||
            gamepad.buttons[GAMEPAD_BUTTONS.DPAD_LEFT]?.pressed) {
            lastGamepadActionRef.current = now;
            setGamepadActive("no");
            handleButtonBet(false);
            setTimeout(() => setGamepadActive(null), 200);
          }
          // Check for SKIP actions (Y/Triangle button or D-Pad Up)
          else if (gamepad.buttons[GAMEPAD_BUTTONS.Y_TRIANGLE]?.pressed ||
            gamepad.buttons[GAMEPAD_BUTTONS.DPAD_UP]?.pressed) {
            lastGamepadActionRef.current = now;
            setGamepadActive("skip");
            handleSkipButton();
            setTimeout(() => setGamepadActive(null), 200);
          }
        }
      }

      gamepadAnimationRef.current = requestAnimationFrame(pollGamepad);
    };

    // Start polling
    gamepadAnimationRef.current = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected);
      if (gamepadAnimationRef.current) {
        cancelAnimationFrame(gamepadAnimationRef.current);
      }
    };
  }, [isAnimating, currentMarket, handleButtonBet, handleSkipButton]);

  // Empty state
  if (!hasMore || !currentMarket) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
        <motion.div
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Zap className="w-16 h-16 md:w-20 md:h-20 text-[#00F3FF] mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-game text-white mb-2">ALL CAUGHT UP!</h2>
          <p className="text-gray-400 text-sm md:text-base">No more markets to bet on right now.</p>
          <p className="text-gray-500 text-xs md:text-sm mt-2">Check back soon for new predictions.</p>
        </motion.div>

        <button
          onClick={() => setCurrentIndex(0)}
          className="px-6 py-3 md:px-8 md:py-4 rounded-xl bg-gradient-to-r from-[#00F3FF] to-[#FF00FF] text-black font-game font-bold text-sm md:text-base hover:scale-105 transition-transform"
        >
          START OVER
        </button>
      </div>
    );
  }

  const categoryStyle = getCategoryStyle(currentMarket.category);
  const isUrgent = currentMarket.endsIn.includes("hour") || currentMarket.endsIn === "Soon";

  // Streak-based card glow
  const cardGlow = streak >= 10
    ? "shadow-[0_0_60px_rgba(255,215,0,0.5)]"
    : streak >= 5
      ? "shadow-[0_0_40px_rgba(255,140,0,0.4)]"
      : "shadow-2xl";

  // Display bettors - use totalBetsCount as fallback if uniqueBettors is 0
  const displayBettors = currentMarket.bettors > 0 ? currentMarket.bettors : currentMarket.totalBetsCount;

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Card Stack Container - Flexbox to fill space */}
      <div className="relative flex-1 flex items-center justify-center min-h-0 py-2">
        {/* Background card (next card preview) */}
        {nextMarket && (
          <motion.div
            className="absolute w-[92%] max-w-[380px] h-[85%] max-h-[500px] rounded-3xl bg-[#0a0a0f]/80 border border-white/5"
            style={{ scale: 0.95, y: 15 }}
          />
        )}

        {/* Main swipeable card with 3D tilt */}
        <motion.div
          ref={cardRef}
          className={`absolute w-[92%] max-w-[380px] h-[85%] max-h-[500px] cursor-grab active:cursor-grabbing ${cardGlow}`}
          style={{
            x,
            y,
            rotate,
            rotateX: rotateX,
            rotateY: rotateY,
            transformStyle: "preserve-3d",
            perspective: 1000,
          }}
          drag={!isAnimating}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          animate={controls}
          whileTap={{ scale: 0.98 }}
          onHoverStart={playHover}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Card content - Obsidian Glass Aesthetic */}
          <div className="relative bg-gradient-to-b from-[#0f1115] to-[#050505] rounded-[2rem] border border-white/5 overflow-hidden h-full flex flex-col shadow-2xl">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen opacity-20" />

            {/* Holographic noise texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("/noise.png")' }} />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full p-5 md:p-6">

              {/* Header: Category & Meta */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold tracking-wider uppercase border ${categoryStyle.bg} ${categoryStyle.border} ${categoryStyle.text} shadow-[0_0_10px_inset_rgba(255,255,255,0.05)]`}>
                    {currentMarket.category}
                  </span>
                  {currentMarket.totalVolume > 1000 && (
                    <span className="flex items-center gap-1 text-[10px] text-orange-400 font-bold animate-pulse">
                      <Flame className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] md:text-xs font-mono font-bold ${isUrgent ? "bg-red-950/30 border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(220,38,38,0.2)]" : "bg-white/5 border-white/10 text-gray-400"
                  }`}>
                  <Clock className="w-3 h-3" />
                  <span>{currentMarket.endsIn}</span>
                </div>
              </div>

              {/* Main Subject: Question */}
              <div className="flex-1 min-h-0 flex flex-col justify-center mb-2">
                <h2 className="text-lg md:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-lg line-clamp-4 md:line-clamp-5">
                  {currentMarket.question}
                </h2>
              </div>

              {/* Embedded Hype Ticker - separate from Question */}
              <div className="mb-4 flex-shrink-0">
                <HypeHUD
                  yesPool={currentMarket.yesPool}
                  noPool={currentMarket.noPool}
                  question={currentMarket.question}
                  volume={currentMarket.totalVolume}
                  bettors={displayBettors}
                />
              </div>

              {/* Stats & Volume */}
              <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-3 px-1 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#00F3FF]" />
                  <span className="text-gray-300 font-mono">{displayBettors}</span>
                  <span className="text-gray-500">players</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#00FF88]" />
                  <span className="text-gray-300 font-mono">${currentMarket.totalVolume.toLocaleString()}</span>
                </div>
              </div>

              {/* Interaction Area */}
              <div className="flex-shrink-0">
                {/* Battle Bar - Slim Neon */}
                <div className="relative h-1.5 rounded-full bg-white/5 overflow-hidden mb-3">
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 bg-[#00FF88] shadow-[0_0_10px_#00FF88]"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentMarket.yesPrice}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div
                    className="absolute right-0 top-0 bottom-0 bg-[#FF0044] shadow-[0_0_10px_#FF0044]"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentMarket.noPrice}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Massive Trigger Buttons - Slightly adjusted height */}
                <div className="flex gap-3 h-16 md:h-20">
                  {/* YES Trigger */}
                  <motion.button
                    className="flex-1 relative rounded-xl border border-[#00FF88]/20 bg-gradient-to-b from-[#00FF88]/10 to-transparent overflow-hidden group"
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(0, 255, 136, 0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleButtonBet(true)}
                  >
                    <div className="absolute inset-0 bg-[url('/grid.png')] opacity-10" />
                    <div className="relative h-full flex flex-col items-center justify-center">
                      <span className="text-[#00FF88] text-[10px] mobile:text-xs font-bold tracking-widest mb-0.5 group-hover:text-white transition-colors">VOTE YES</span>
                      <span className="text-2xl md:text-3xl font-black text-white font-numbers drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]">
                        {currentMarket.yesMultiplier}x
                      </span>
                      <span className="text-[10px] text-[#00FF88]/60 mt-0.5">{currentMarket.yesPrice}% PROB</span>
                    </div>
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00FF88]" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00FF88]" />
                  </motion.button>

                  {/* NO Trigger */}
                  <motion.button
                    className="flex-1 relative rounded-xl border border-[#FF0044]/20 bg-gradient-to-b from-[#FF0044]/10 to-transparent overflow-hidden group"
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 0, 68, 0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleButtonBet(false)}
                  >
                    <div className="absolute inset-0 bg-[url('/grid.png')] opacity-10" />
                    <div className="relative h-full flex flex-col items-center justify-center">
                      <span className="text-[#FF0044] text-[10px] mobile:text-xs font-bold tracking-widest mb-0.5 group-hover:text-white transition-colors">VOTE NO</span>
                      <span className="text-2xl md:text-3xl font-black text-white font-numbers drop-shadow-[0_0_10px_rgba(255,0,68,0.5)]">
                        {currentMarket.noMultiplier}x
                      </span>
                      <span className="text-[10px] text-[#FF0044]/60 mt-0.5">{currentMarket.noPrice}% PROB</span>
                    </div>
                    {/* Corner accents */}
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#FF0044]" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#FF0044]" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Swipe direction hints - hidden on mobile */}
        <motion.div
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-[#00FF88]/30 font-game text-xs md:text-sm rotate-[-90deg] origin-center hidden md:block"
          animate={{ x: [0, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          YES →
        </motion.div>
        <motion.div
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-[#FF0044]/30 font-game text-xs md:text-sm rotate-90 origin-center hidden md:block"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ← NO
        </motion.div>
      </div>

      {/* Action Buttons - Fixed at bottom of card stack */}
      <div className="flex items-center justify-center gap-3 md:gap-4 py-4 flex-shrink-0">
        {/* NO Button */}
        <motion.button
          className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#FF0044]/20 border-2 border-[#FF0044] flex items-center justify-center text-[#FF0044] font-game text-lg md:text-xl hover:bg-[#FF0044]/30 transition-colors disabled:opacity-50 ${gamepadActive === "no" ? "scale-90 bg-[#FF0044]/40" : ""
            }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleButtonBet(false)}
          disabled={isAnimating}
          animate={gamepadActive === "no" ? { scale: [1, 0.9, 1] } : {}}
        >
          ✕
        </motion.button>

        {/* Skip Button */}
        <motion.button
          className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-gray-400 hover:bg-white/20 transition-colors disabled:opacity-50 ${gamepadActive === "skip" ? "scale-90 bg-[#FFD700]/40 border-[#FFD700]" : ""
            }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSkipButton}
          disabled={isAnimating}
          animate={gamepadActive === "skip" ? { scale: [1, 0.9, 1] } : {}}
        >
          <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
        </motion.button>

        {/* YES Button */}
        <motion.button
          className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#00FF88]/20 border-2 border-[#00FF88] flex items-center justify-center text-[#00FF88] font-game text-lg md:text-xl hover:bg-[#00FF88]/30 transition-colors disabled:opacity-50 ${gamepadActive === "yes" ? "scale-90 bg-[#00FF88]/40" : ""
            }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleButtonBet(true)}
          disabled={isAnimating}
          animate={gamepadActive === "yes" ? { scale: [1, 0.9, 1] } : {}}
        >
          ✓
        </motion.button>
      </div>

      {/* Gamepad Connected Indicator */}
      <AnimatePresence>
        {gamepadConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-center gap-2 pb-2"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00F3FF]/10 border border-[#00F3FF]/30">
              <Gamepad2 className="w-4 h-4 text-[#00F3FF]" />
              <span className="text-[10px] text-[#00F3FF] font-game">CONTROLLER CONNECTED</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-1.5 md:gap-2 pb-2 flex-shrink-0">
        {markets.slice(0, 10).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${i < currentIndex
              ? "bg-[#00F3FF]"
              : i === currentIndex
                ? "bg-[#FF00FF] w-3 md:w-4"
                : "bg-white/20"
              }`}
          />
        ))}
        {markets.length > 10 && (
          <span className="text-[10px] md:text-xs text-gray-500 ml-2">+{markets.length - 10}</span>
        )}
      </div>
    </div>
  );
});

SwipeableMarketStack.displayName = "SwipeableMarketStack";
