"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const GAMEPAD_START = 9;

interface ControlMapping {
  button: string;
  action: string;
  color: string;
}

const CONTROLS: ControlMapping[] = [
  { button: "A", action: "Confirm / Place Bet", color: "#00FF88" },
  { button: "B", action: "Back / Cancel", color: "#FF0044" },
  { button: "X", action: "Skip Market", color: "#00F3FF" },
  { button: "Y", action: "Toggle Sound", color: "#FFD700" },
  { button: "D-Pad L/R", action: "Swipe YES / NO", color: "#FFFFFF" },
  { button: "D-Pad U/D", action: "Scroll / Adjust Bet", color: "#FFFFFF" },
  { button: "SELECT", action: "Cycle Tabs", color: "#9966FF" },
  { button: "START", action: "This Help Menu", color: "#FF6B00" },
];

export function GamepadHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastPressRef = useRef(0);

  // Listen for START button to toggle help
  useEffect(() => {
    const poll = () => {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];

      if (gp) {
        const now = Date.now();
        if (now - lastPressRef.current >= 400) {
          if (gp.buttons[GAMEPAD_START]?.pressed) {
            lastPressRef.current = now;
            setIsOpen((prev) => !prev);
          }
        }
      }

      rafRef.current = requestAnimationFrame(poll);
    };

    rafRef.current = requestAnimationFrame(poll);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            className="w-full max-w-sm bg-[#0a0a1a] border border-[#00F3FF]/30 rounded-2xl p-5 shadow-[0_0_60px_rgba(0,243,255,0.15)]"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-game text-sm tracking-wider">
                  PSG1 CONTROLS
                </h2>
                <p className="text-gray-500 text-[10px] mt-0.5">
                  Gamepad Button Mapping
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Controls list */}
            <div className="space-y-2">
              {CONTROLS.map((ctrl, i) => (
                <motion.div
                  key={ctrl.button}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
                >
                  <span
                    className="font-game text-xs font-bold min-w-[80px] text-center px-2 py-1 rounded-lg bg-black/40 border border-white/10"
                    style={{ color: ctrl.color }}
                  >
                    {ctrl.button}
                  </span>
                  <span className="text-gray-300 text-xs flex-1">
                    {ctrl.action}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-white/10 text-center">
              <p className="text-gray-600 text-[9px]">
                Press <span className="text-[#FF6B00]">START</span> to close
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
