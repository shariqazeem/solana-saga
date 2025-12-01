"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

const COLORS = ["#00ff88", "#00f0ff", "#ff00aa", "#ffd700", "#ff8800", "#aa00ff"];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 8 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
}

interface ConfettiProps {
  isActive: boolean;
  count?: number;
}

export function Confetti({ isActive, count = 100 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive) {
      setPieces(generateConfetti(count));
    }
  }, [isActive, count]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute"
              style={{
                left: `${piece.x}%`,
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              }}
              initial={{
                top: -20,
                rotate: piece.rotation,
                opacity: 1,
              }}
              animate={{
                top: "110vh",
                rotate: piece.rotation + 720,
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: "linear",
              }}
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
          <Confetti isActive={true} count={150} />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-[#00ff88] blur-[100px] opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Content */}
              <div className="relative game-card p-12 text-center">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-8xl mb-6"
                >
                  🎉
                </motion.div>
                
                <h2 className="font-game text-3xl text-[#00ff88] mb-4">
                  YOU WON!
                </h2>
                
                <motion.div
                  className="text-6xl font-numbers font-black text-white mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  +${amount.toLocaleString()}
                </motion.div>
                
                <p className="text-gray-400 mb-8">
                  Funds have been added to your wallet
                </p>
                
                <motion.button
                  className="arcade-btn arcade-btn-primary px-8 py-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                >
                  Awesome!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Streak Popup Component
interface StreakPopupProps {
  isVisible: boolean;
  streak: number;
  onClose: () => void;
}

export function StreakPopup({ isVisible, streak, onClose }: StreakPopupProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className="fixed top-24 right-4 z-50"
        >
          <div className="game-card p-4 flex items-center gap-4">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="text-4xl"
            >
              🔥
            </motion.div>
            <div>
              <div className="font-game text-[#ff8800] text-sm">WIN STREAK!</div>
              <div className="font-numbers text-2xl font-bold text-white">
                {streak} in a row
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Level Up Popup
interface LevelUpPopupProps {
  isVisible: boolean;
  level: number;
  onClose: () => void;
}

export function LevelUpPopup({ isVisible, level, onClose }: LevelUpPopupProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <Confetti isActive={true} count={80} />
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <motion.div
              className="game-card px-8 py-4 flex items-center gap-4"
              style={{
                background: "linear-gradient(135deg, rgba(170,0,255,0.2), rgba(0,240,255,0.2))",
                borderColor: "#aa00ff",
              }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(170,0,255,0.3)",
                  "0 0 40px rgba(170,0,255,0.5)",
                  "0 0 20px rgba(170,0,255,0.3)",
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: "linear" }}
                className="text-4xl"
              >
                ⭐
              </motion.div>
              <div>
                <div className="font-game text-[#aa00ff] text-sm">LEVEL UP!</div>
                <div className="font-numbers text-3xl font-bold text-white">
                  Level {level}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
