"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Skull, Brain, TrendingUp, AlertTriangle } from "lucide-react";

interface HypeHUDProps {
  yesPool: number;
  noPool: number;
  question: string;
  volume?: number;
  bettors?: number;
}

// Trash talk / hype lines for different scenarios
const BULLISH_LINES = [
  "Whales are betting YES. Are you scared?",
  "FREE MONEY GLITCH DETECTED. APING IN.",
  "Smart money is loading. NGMI if you fade.",
  "This is giving 100x energy. LFG!",
  "The degen play is obvious here...",
  "Insiders know something. Just saying.",
  "Your grandma could win this bet.",
  "Literally can't go tits up.",
];

const BEARISH_LINES = [
  "Bagholders in shambles. Fade this.",
  "NO is the galaxy brain play here.",
  "Contrarians eating good tonight.",
  "This reeks of hopium. Stay vigilant.",
  "Red pill moment incoming...",
  "The crowd is always wrong. Short it.",
  "Capitulation vibes detected.",
  "Someone's getting rugged today.",
];

const NEUTRAL_LINES = [
  "50/50 chaos mode engaged.",
  "Flip a coin or trust your gut.",
  "The market is confused AF right now.",
  "High IQ play: wait for momentum.",
  "Volatility about to go crazy...",
  "Whales are baiting both sides.",
  "Pure gambling territory. I respect it.",
  "This is anyone's game.",
];

export function HypeHUD({ yesPool, noPool, question, volume = 0, bettors = 0 }: HypeHUDProps) {
  const [currentLine, setCurrentLine] = useState("");
  const [isAnimating, setIsAnimating] = useState(true);

  const total = yesPool + noPool;
  const yesRatio = total > 0 ? yesPool / total : 0.5;

  const sentiment = useMemo(() => {
    if (yesRatio > 0.6) return "BULLISH";
    if (yesRatio < 0.4) return "BEARISH";
    return "NEUTRAL";
  }, [yesRatio]);

  const lines = useMemo(() => {
    if (sentiment === "BULLISH") return BULLISH_LINES;
    if (sentiment === "BEARISH") return BEARISH_LINES;
    return NEUTRAL_LINES;
  }, [sentiment]);

  useEffect(() => {
    // Pick random line on mount or when sentiment changes
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setCurrentLine(lines[Math.floor(Math.random() * lines.length)]);
      setIsAnimating(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [lines, yesPool, noPool]);

  const sentimentConfig = {
    BULLISH: {
      color: "#00FF88",
      icon: TrendingUp,
      glow: "shadow-[0_0_20px_rgba(0,255,136,0.5)]",
      bg: "bg-[#00FF88]/10",
      border: "border-[#00FF88]/50"
    },
    BEARISH: {
      color: "#FF0044",
      icon: Skull,
      glow: "shadow-[0_0_20px_rgba(255,0,68,0.5)]",
      bg: "bg-[#FF0044]/10",
      border: "border-[#FF0044]/50"
    },
    NEUTRAL: {
      color: "#FFD700",
      icon: AlertTriangle,
      glow: "shadow-[0_0_20px_rgba(255,215,0,0.5)]",
      bg: "bg-[#FFD700]/10",
      border: "border-[#FFD700]/50"
    }
  };

  const config = sentimentConfig[sentiment];
  const Icon = config.icon;

  return (
    <motion.div
      className={`w-full z-20 mb-4`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        backdrop-blur-md border ${config.border} ${config.bg}
        ${config.glow}
      `}>
        {/* AI Bot Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${config.color}33, transparent)`,
            border: `1px solid ${config.color}66`
          }}
        >
          <Brain className="w-5 h-5" style={{ color: config.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Sentiment Badge */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-game tracking-wider"
              style={{ color: config.color }}
            >
              AI HYPE-METER
            </span>
            <motion.div
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold"
              style={{
                background: `${config.color}22`,
                color: config.color
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Icon className="w-3 h-3" />
              {sentiment}
            </motion.div>
          </div>

          {/* Trash Talk Line */}
          <AnimatePresence mode="wait">
            {!isAnimating && (
              <motion.p
                key={currentLine}
                className="text-sm font-bold text-white truncate"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <span className="text-[#00F3FF] mr-1">&gt;</span>
                {currentLine}
              </motion.p>
            )}
            {isAnimating && (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Zap className="w-4 h-4 text-[#00F3FF] animate-pulse" />
                <span className="text-sm text-gray-400 font-mono">analyzing...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Power Indicator */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] text-gray-500 font-game">CONFIDENCE</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => {
              const threshold = sentiment === "NEUTRAL" ? 2 :
                Math.abs(yesRatio - 0.5) * 10;
              const isActive = i < Math.ceil(threshold);
              return (
                <motion.div
                  key={i}
                  className="w-2 h-4 rounded-sm"
                  style={{
                    background: isActive ? config.color : "rgba(255,255,255,0.1)"
                  }}
                  animate={isActive ? { opacity: [1, 0.5, 1] } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
