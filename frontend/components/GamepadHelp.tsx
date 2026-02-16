"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gamepad2 } from "lucide-react";

const GAMEPAD_START = 9;

interface PageControls {
  page: string;
  color: string;
  mappings: { button: string; action: string }[];
}

const PAGE_CONTROLS: PageControls[] = [
  {
    page: "ARENA",
    color: "#00F3FF",
    mappings: [
      { button: "A / D→", action: "Vote YES" },
      { button: "B / D←", action: "Vote NO" },
      { button: "Y / D↑", action: "Skip" },
      { button: "R1 / L1", action: "Bet Amount +/-" },
    ],
  },
  {
    page: "SWAP",
    color: "#00FF88",
    mappings: [
      { button: "A", action: "Confirm Swap" },
      { button: "B", action: "Cancel" },
      { button: "D↑ / D↓", action: "Amount +/-" },
    ],
  },
  {
    page: "MY BETS",
    color: "#FF00AA",
    mappings: [
      { button: "L1 / R1", action: "Switch Tabs" },
      { button: "A", action: "Select / Claim" },
      { button: "B", action: "Back" },
    ],
  },
  {
    page: "MARKETS",
    color: "#00F3FF",
    mappings: [
      { button: "D↑ / D↓", action: "Scroll" },
      { button: "X", action: "Status Filter" },
      { button: "Y", action: "Search" },
    ],
  },
  {
    page: "PROFILE",
    color: "#FF6B00",
    mappings: [
      { button: "D↑ / D↓", action: "Scroll" },
      { button: "B", action: "Back" },
    ],
  },
  {
    page: "GLOBAL",
    color: "#9966FF",
    mappings: [
      { button: "SELECT", action: "Cycle Tabs" },
      { button: "START", action: "This Menu" },
    ],
  },
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
            className="w-full max-w-md bg-[#0a0a1a] border border-[#00F3FF]/30 rounded-2xl p-5 shadow-[0_0_60px_rgba(0,243,255,0.15)] max-h-[85vh] overflow-y-auto"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-[#00F3FF]" />
                <div>
                  <h2 className="text-white font-game text-sm tracking-wider">
                    PSG1 CONTROLS
                  </h2>
                  <p className="text-gray-500 text-[10px] mt-0.5">
                    Full Gamepad Mapping
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Per-page controls */}
            <div className="space-y-3">
              {PAGE_CONTROLS.map((section, si) => (
                <motion.div
                  key={section.page}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: si * 0.06 }}
                >
                  <div
                    className="text-[10px] font-game font-bold tracking-widest mb-1.5 px-1"
                    style={{ color: section.color }}
                  >
                    {section.page}
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/5 overflow-hidden">
                    {section.mappings.map((m, mi) => (
                      <div
                        key={mi}
                        className={`flex items-center gap-3 px-3 py-1.5 ${
                          mi > 0 ? "border-t border-white/5" : ""
                        }`}
                      >
                        <span
                          className="font-game text-[10px] font-bold min-w-[72px] text-center px-1.5 py-0.5 rounded bg-black/40 border border-white/10"
                          style={{ color: section.color }}
                        >
                          {m.button}
                        </span>
                        <span className="text-gray-300 text-[11px] flex-1">
                          {m.action}
                        </span>
                      </div>
                    ))}
                  </div>
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
