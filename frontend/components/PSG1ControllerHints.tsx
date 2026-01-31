"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PSG1_BUTTON_LABELS } from "@/hooks/usePSG1Mode";

interface PSG1ControllerHintsProps {
  show: boolean;
  activeButton: "yes" | "no" | "skip" | null;
  compact?: boolean;
}

export function PSG1ControllerHints({ show, activeButton, compact = false }: PSG1ControllerHintsProps) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`flex items-center justify-center gap-3 ${compact ? "scale-90" : ""}`}
      >
        {/* NO - B Button / D-Pad Left */}
        <motion.div
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-150 ${
            activeButton === "no"
              ? "bg-[#FF0044]/30 scale-95"
              : "bg-black/40"
          }`}
          animate={activeButton === "no" ? { scale: [1, 0.9, 1] } : {}}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                activeButton === "no"
                  ? "bg-[#FF0044] border-[#FF0044] text-white shadow-[0_0_15px_#FF0044]"
                  : "bg-transparent border-[#FF0044]/50 text-[#FF0044]"
              }`}
            >
              B
            </div>
            <span className="text-gray-500 text-xs">/</span>
            <div
              className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                activeButton === "no"
                  ? "bg-[#FF0044] text-white"
                  : "bg-white/10 text-gray-400"
              }`}
            >
              ←
            </div>
          </div>
          <span className="text-[10px] font-game text-[#FF0044] uppercase tracking-wider">
            No
          </span>
        </motion.div>

        {/* SKIP - Y Button / D-Pad Up */}
        <motion.div
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-150 ${
            activeButton === "skip"
              ? "bg-[#FFD700]/30 scale-95"
              : "bg-black/40"
          }`}
          animate={activeButton === "skip" ? { scale: [1, 0.9, 1] } : {}}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                activeButton === "skip"
                  ? "bg-[#FFD700] border-[#FFD700] text-black shadow-[0_0_15px_#FFD700]"
                  : "bg-transparent border-[#FFD700]/50 text-[#FFD700]"
              }`}
            >
              Y
            </div>
            <span className="text-gray-500 text-xs">/</span>
            <div
              className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                activeButton === "skip"
                  ? "bg-[#FFD700] text-black"
                  : "bg-white/10 text-gray-400"
              }`}
            >
              ↑
            </div>
          </div>
          <span className="text-[10px] font-game text-[#FFD700] uppercase tracking-wider">
            Skip
          </span>
        </motion.div>

        {/* YES - A Button / D-Pad Right */}
        <motion.div
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-150 ${
            activeButton === "yes"
              ? "bg-[#00FF88]/30 scale-95"
              : "bg-black/40"
          }`}
          animate={activeButton === "yes" ? { scale: [1, 0.9, 1] } : {}}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                activeButton === "yes"
                  ? "bg-[#00FF88] border-[#00FF88] text-black shadow-[0_0_15px_#00FF88]"
                  : "bg-transparent border-[#00FF88]/50 text-[#00FF88]"
              }`}
            >
              A
            </div>
            <span className="text-gray-500 text-xs">/</span>
            <div
              className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                activeButton === "yes"
                  ? "bg-[#00FF88] text-black"
                  : "bg-white/10 text-gray-400"
              }`}
            >
              →
            </div>
          </div>
          <span className="text-[10px] font-game text-[#00FF88] uppercase tracking-wider">
            Yes
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Compact inline button hints that can be shown next to action buttons
export function PSG1ButtonHint({
  action,
  showDpad = true,
}: {
  action: "yes" | "no" | "skip";
  showDpad?: boolean;
}) {
  const config = PSG1_BUTTON_LABELS[action.toUpperCase() as keyof typeof PSG1_BUTTON_LABELS];

  return (
    <div
      className="psg1-btn-hint flex items-center gap-1"
      style={{ borderColor: config.color, color: config.color }}
    >
      <span>{config.button}</span>
      {showDpad && (
        <>
          <span className="text-gray-500">/</span>
          <span>{config.dpad}</span>
        </>
      )}
    </div>
  );
}
