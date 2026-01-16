"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2 } from "lucide-react";

interface PSG1ControlsProps {
  show?: boolean;
  variant?: "full" | "compact" | "minimal";
}

/**
 * PSG1 Controller Button Hints
 *
 * Shows button mapping for PSG1 console:
 * - A Button (Green) = YES / Confirm
 * - B Button (Red) = NO / Back
 * - Y Button (Yellow) = SKIP
 * - D-Pad = Navigation
 */
export function PSG1Controls({ show = true, variant = "full" }: PSG1ControlsProps) {
  const [gamepadConnected, setGamepadConnected] = useState(false);

  useEffect(() => {
    const checkGamepad = () => {
      const gamepads = navigator.getGamepads();
      const connected = Array.from(gamepads).some((gp) => gp !== null);
      setGamepadConnected(connected);
    };

    // Check initially
    checkGamepad();

    // Listen for gamepad events
    const handleConnect = () => setGamepadConnected(true);
    const handleDisconnect = () => {
      const gamepads = navigator.getGamepads();
      const stillConnected = Array.from(gamepads).some((gp) => gp !== null);
      setGamepadConnected(stillConnected);
    };

    window.addEventListener("gamepadconnected", handleConnect);
    window.addEventListener("gamepaddisconnected", handleDisconnect);

    // Poll periodically (some browsers need this)
    const interval = setInterval(checkGamepad, 1000);

    return () => {
      window.removeEventListener("gamepadconnected", handleConnect);
      window.removeEventListener("gamepaddisconnected", handleDisconnect);
      clearInterval(interval);
    };
  }, []);

  if (!show) return null;

  if (variant === "minimal") {
    return (
      <AnimatePresence>
        {gamepadConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2"
          >
            <Gamepad2 className="w-4 h-4 text-[#00F3FF]" />
            <span className="text-[10px] text-[#00F3FF] font-game">PSG1</span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3"
      >
        <div className="flex items-center gap-1">
          <span className="psg1-button-hint psg1-button-hint-a text-xs">A</span>
          <span className="text-[10px] text-gray-400">YES</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="psg1-button-hint psg1-button-hint-b text-xs">B</span>
          <span className="text-[10px] text-gray-400">NO</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="psg1-button-hint psg1-button-hint-y text-xs">Y</span>
          <span className="text-[10px] text-gray-400">SKIP</span>
        </div>
      </motion.div>
    );
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="psg1-controls"
    >
      {/* Controller Icon */}
      <div className="flex items-center gap-2">
        <Gamepad2 className={`w-5 h-5 ${gamepadConnected ? "text-[#00F3FF]" : "text-gray-500"}`} />
        {gamepadConnected && (
          <span className="text-[10px] text-[#00F3FF] font-game animate-pulse">CONNECTED</span>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10" />

      {/* A Button - YES */}
      <div className="psg1-control-item">
        <span className="psg1-button-hint psg1-button-hint-a">A</span>
        <span>YES</span>
      </div>

      {/* B Button - NO */}
      <div className="psg1-control-item">
        <span className="psg1-button-hint psg1-button-hint-b">B</span>
        <span>NO</span>
      </div>

      {/* Y Button - SKIP */}
      <div className="psg1-control-item">
        <span className="psg1-button-hint psg1-button-hint-y">Y</span>
        <span>SKIP</span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10" />

      {/* D-Pad hint */}
      <div className="psg1-control-item">
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-3 h-3 border border-gray-500 rounded-sm" />
          <div className="flex gap-0.5">
            <div className="w-3 h-3 border border-gray-500 rounded-sm" />
            <div className="w-3 h-3" />
            <div className="w-3 h-3 border border-gray-500 rounded-sm" />
          </div>
        </div>
        <span>NAV</span>
      </div>
    </motion.div>
  );
}

/**
 * PSG1 Button Hint - Single button indicator
 */
export function PSG1ButtonHint({
  button,
  label,
  size = "md",
}: {
  button: "A" | "B" | "Y" | "X";
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const colorMap = {
    A: "psg1-button-hint-a",
    B: "psg1-button-hint-b",
    Y: "psg1-button-hint-y",
    X: "psg1-button-hint-y", // X uses same yellow
  };

  const sizeMap = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`psg1-button-hint ${colorMap[button]} ${sizeMap[size]}`}
        style={{ marginRight: 0 }}
      >
        {button}
      </span>
      {label && (
        <span className="text-xs text-gray-400 font-game uppercase">{label}</span>
      )}
    </div>
  );
}

/**
 * PSG1 Action Buttons Row
 */
export function PSG1ActionButtons({
  onYes,
  onNo,
  onSkip,
  disabled = false,
  activeButton,
}: {
  onYes: () => void;
  onNo: () => void;
  onSkip: () => void;
  disabled?: boolean;
  activeButton?: "yes" | "no" | "skip" | null;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* NO Button */}
      <motion.button
        className={`psg1-action-btn psg1-action-btn-no ${activeButton === "no" ? "scale-90" : ""}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNo}
        disabled={disabled}
        animate={activeButton === "no" ? { scale: [1, 0.9, 1] } : {}}
      >
        <span>B</span>
      </motion.button>

      {/* SKIP Button */}
      <motion.button
        className={`psg1-action-btn psg1-action-btn-skip ${activeButton === "skip" ? "scale-90" : ""}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSkip}
        disabled={disabled}
        animate={activeButton === "skip" ? { scale: [1, 0.9, 1] } : {}}
      >
        <span>Y</span>
      </motion.button>

      {/* YES Button */}
      <motion.button
        className={`psg1-action-btn psg1-action-btn-yes ${activeButton === "yes" ? "scale-90" : ""}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onYes}
        disabled={disabled}
        animate={activeButton === "yes" ? { scale: [1, 0.9, 1] } : {}}
      >
        <span>A</span>
      </motion.button>
    </div>
  );
}
