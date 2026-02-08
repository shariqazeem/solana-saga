"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "onboarding_seen";

const steps = [
  {
    title: "SWIPE TO PREDICT",
    description: "Swipe Right = YES, Swipe Left = NO",
    graphic: (
      <div className="relative w-32 h-32 mx-auto">
        <motion.div
          className="absolute inset-0 rounded-2xl bg-white/5 border border-white/10"
          animate={{ x: [0, 40, 0, -40, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl"
          animate={{ x: [0, 30, 0, -30, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-5xl">👆</span>
        </motion.div>
        <motion.span
          className="absolute right-0 top-1/2 -translate-y-1/2 text-[#00FF88] font-game text-sm font-bold"
          animate={{ opacity: [0, 1, 1, 0, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          YES
        </motion.span>
        <motion.span
          className="absolute left-0 top-1/2 -translate-y-1/2 text-[#FF0044] font-game text-sm font-bold"
          animate={{ opacity: [0, 0, 0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          NO
        </motion.span>
      </div>
    ),
  },
  {
    title: "GAMEPAD READY",
    description: "Use controller: A=Yes, B=No, Y=Skip",
    graphic: (
      <div className="relative w-40 h-28 mx-auto flex items-center justify-center gap-4">
        <motion.div
          className="w-12 h-12 rounded-full bg-[#00FF88]/20 border-2 border-[#00FF88] flex items-center justify-center text-[#00FF88] font-game font-bold"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        >
          A
        </motion.div>
        <motion.div
          className="w-12 h-12 rounded-full bg-[#FF0044]/20 border-2 border-[#FF0044] flex items-center justify-center text-[#FF0044] font-game font-bold"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        >
          B
        </motion.div>
        <motion.div
          className="w-12 h-12 rounded-full bg-[#FFD700]/20 border-2 border-[#FFD700] flex items-center justify-center text-[#FFD700] font-game font-bold"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
        >
          Y
        </motion.div>
      </div>
    ),
  },
  {
    title: "BET REAL USDC",
    description: "Connect wallet to bet on Jupiter markets",
    graphic: (
      <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
        <motion.div
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00F3FF]/20 to-[#c7f83e]/20 border border-[#00F3FF]/40 flex items-center justify-center"
          animate={{
            boxShadow: [
              "0 0 20px rgba(0, 243, 255, 0.2)",
              "0 0 40px rgba(0, 243, 255, 0.4)",
              "0 0 20px rgba(0, 243, 255, 0.2)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg
            className="w-10 h-10 text-[#00F3FF]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
            />
          </svg>
        </motion.div>
        <motion.div
          className="absolute -bottom-1 px-3 py-1 rounded-full bg-[#c7f83e]/20 border border-[#c7f83e]/40"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[10px] text-[#c7f83e] font-bold">
            Jupiter
          </span>
        </motion.div>
      </div>
    ),
  },
];

export function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const advance = useCallback(() => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      localStorage.setItem(STORAGE_KEY, "true");
      setVisible(false);
    }
  }, [step]);

  // Gamepad button to advance
  useEffect(() => {
    if (!visible) return;
    let rafId: number;
    const poll = () => {
      const gp = navigator.getGamepads?.()[0];
      if (gp) {
        for (const btn of gp.buttons) {
          if (btn.pressed) {
            advance();
            return;
          }
        }
      }
      rafId = requestAnimationFrame(poll);
    };
    rafId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafId);
  }, [visible, advance]);

  if (!visible) return null;

  const current = steps[step];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={advance}
      >
        <motion.div
          key={step}
          className="max-w-sm w-full text-center"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === step
                    ? "w-8 bg-[#00F3FF]"
                    : i < step
                    ? "w-4 bg-[#00F3FF]/50"
                    : "w-4 bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Graphic */}
          <div className="mb-6">{current.graphic}</div>

          {/* Text */}
          <h2 className="text-2xl font-game text-white mb-2">
            {current.title}
          </h2>
          <p className="text-gray-400 text-sm mb-8">{current.description}</p>

          {/* Button */}
          <motion.button
            onClick={advance}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00F3FF] to-[#FF00FF] text-black font-game font-bold text-sm hover:scale-105 transition-transform"
            whileTap={{ scale: 0.95 }}
          >
            {step === steps.length - 1 ? "GOT IT!" : "NEXT"}
          </motion.button>

          <p className="text-gray-600 text-xs mt-4">Tap anywhere to continue</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
