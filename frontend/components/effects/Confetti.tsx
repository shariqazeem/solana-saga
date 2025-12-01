"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

const COLORS = ["#00ff88", "#00f0ff", "#ff00aa", "#ffd700", "#ff8800", "#aa00ff"];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10,
    rotation: Math.random() * 360,
    scale: Math.random() * 0.5 + 0.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.5,
  }));
}

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
}

export function Confetti({ isActive, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive) {
      setPieces(generateConfetti(100));
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute w-3 h-3"
              style={{
                left: `${piece.x}%`,
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? "50%" : "0",
              }}
              initial={{
                y: -20,
                rotate: 0,
                opacity: 1,
                scale: piece.scale,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: piece.rotation + Math.random() * 720,
                opacity: [1, 1, 0],
                x: [0, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 400],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: piece.delay,
                ease: "easeIn",
              }}
              exit={{ opacity: 0 }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Win Popup Component
interface WinPopupProps {
  isVisible: boolean;
  amount: number;
  onClose: () => void;
}

export function WinPopup({ isVisible, amount, onClose }: WinPopupProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <Confetti isActive={isVisible} />
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="result-popup result-popup-win p-12"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              transition={{ type: "spring", damping: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-8xl mb-6"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              >
                🎉
              </motion.div>
              <h2 className="font-game text-4xl text-white mb-4">YOU WON!</h2>
              <motion.div
                className="text-6xl font-numbers font-black text-[#00ff88] mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                +${amount.toLocaleString()}
              </motion.div>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-white/10 text-white font-game hover:bg-white/20 transition-colors"
              >
                Claim Winnings
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Lose Popup Component
interface LosePopupProps {
  isVisible: boolean;
  amount: number;
  onClose: () => void;
}

export function LosePopup({ isVisible, amount, onClose }: LosePopupProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="result-popup result-popup-lose p-12"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", damping: 15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-8xl mb-6">😢</div>
            <h2 className="font-game text-4xl text-white mb-4">BETTER LUCK NEXT TIME</h2>
            <div className="text-4xl font-numbers font-bold text-[#ff0044] mb-6">
              -${amount.toLocaleString()}
            </div>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-white/10 text-white font-game hover:bg-white/20 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
