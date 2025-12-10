"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Gamepad2, ExternalLink } from "lucide-react";
import { useRef, useEffect } from "react";

interface ArcadeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArcadeModal({ isOpen, onClose }: ArcadeModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Focus iframe when modal opens to enable keyboard controls in game
  useEffect(() => {
    if (isOpen && iframeRef.current) {
      // Small delay to ensure iframe is loaded
      const timer = setTimeout(() => {
        iframeRef.current?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={(e) => {
            // Close if clicking backdrop
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-[95vw] h-[90vh] max-w-6xl bg-[#0a0a0f] rounded-2xl border border-white/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#ff00aa]/20 to-[#00f0ff]/20 border-b border-white/10">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 10px rgba(255, 0, 170, 0.5)",
                      "0 0 20px rgba(0, 240, 255, 0.5)",
                      "0 0 10px rgba(255, 0, 170, 0.5)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff00aa] to-[#00f0ff] flex items-center justify-center"
                >
                  <Gamepad2 className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="font-game text-lg text-white flex items-center gap-2">
                    ARCADE LOUNGE
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30">
                      MODDIO
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400">
                    Waiting for results? Play on Moddio.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Open in new tab button */}
                <motion.a
                  href="https://www.modd.io/play/braainsio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Open in Tab</span>
                </motion.a>

                {/* Close button */}
                <motion.button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Game iframe container */}
            <div className="flex-1 relative bg-black">
              {/* Loading state */}
              <div className="absolute inset-0 flex items-center justify-center bg-black z-0">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-4 border-[#00f0ff]/30 border-t-[#00f0ff] mx-auto mb-4"
                  />
                  <p className="text-gray-400 font-game text-sm animate-pulse">LOADING GAME...</p>
                </div>
              </div>

              {/* Moddio game iframe */}
              <iframe
                ref={iframeRef}
                src="https://www.modd.io/play/braainsio"
                className="w-full h-full border-none relative z-10"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; keyboard-map"
                allowFullScreen
                tabIndex={0}
                title="Moddio Arcade - Braains.io"
              />
            </div>

            {/* Footer with controls hint */}
            <div className="px-4 py-2 bg-black/50 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] text-gray-500">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-400">ESC</kbd>
                  Close Arcade
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-400">WASD</kbd>
                  /
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-400">Arrows</kbd>
                  Move
                </span>
              </div>
              <div className="text-[10px] text-gray-500">
                Powered by{" "}
                <a
                  href="https://www.modd.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00f0ff] hover:underline"
                >
                  Moddio
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
