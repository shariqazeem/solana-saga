"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const STORAGE_KEY = "onboarding_seen";
const TOTAL_PHASES = 4;

export function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState(0);
  // Sub-state for boot sequence text
  const [bootText, setBootText] = useState<"init" | "name" | "ready">("init");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const advance = useCallback(() => {
    if (phase < TOTAL_PHASES - 1) {
      setPhase((p) => p + 1);
    } else {
      // Final phase — dismiss with confetti
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#00F3FF", "#FF00FF", "#00FF88", "#FFD700", "#c7f83e"],
      });
      localStorage.setItem(STORAGE_KEY, "true");
      setVisible(false);
    }
  }, [phase]);

  // Phase 0 auto-advance: boot sequence timing
  useEffect(() => {
    if (!visible || phase !== 0) return;
    const t1 = setTimeout(() => setBootText("name"), 800);
    const t2 = setTimeout(() => setBootText("ready"), 1600);
    const t3 = setTimeout(() => setPhase(1), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [visible, phase]);

  // Gamepad polling to advance (any button)
  useEffect(() => {
    if (!visible) return;
    let rafId: number;
    let cooldown = false;
    const poll = () => {
      const gp = navigator.getGamepads?.()[0];
      if (gp && !cooldown) {
        for (const btn of gp.buttons) {
          if (btn.pressed) {
            cooldown = true;
            advance();
            setTimeout(() => { cooldown = false; }, 300);
            break;
          }
        }
      }
      rafId = requestAnimationFrame(poll);
    };
    rafId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafId);
  }, [visible, advance]);

  if (!visible) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="onboarding-root"
        className="fixed inset-0 z-[70] bg-black overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* CRT Scan Line */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(0,243,255,0.4), transparent)",
          }}
          animate={{ top: ["-2px", "100vh"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Subtle perspective grid background */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            perspective: "400px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          <div
            className="absolute w-[200%] h-[200%] left-[-50%]"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateX(75deg) translateY(-50%)",
              backgroundSize: "60px 60px",
              backgroundImage: `linear-gradient(90deg, rgba(0,243,255,0.5) 1px, transparent 1px),
                               linear-gradient(0deg, rgba(255,0,255,0.3) 1px, transparent 1px)`,
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
            }}
          />
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.8) 100%)",
          }}
        />

        {/* Phase indicator dots */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {Array.from({ length: TOTAL_PHASES }).map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: i === phase ? 32 : 16,
                background:
                  i === phase
                    ? "#00F3FF"
                    : i < phase
                    ? "rgba(0,243,255,0.5)"
                    : "rgba(255,255,255,0.15)",
                boxShadow:
                  i === phase ? "0 0 8px #00F3FF, 0 0 16px #00F3FF" : "none",
              }}
            />
          ))}
        </div>

        {/* Phase content */}
        <div className="relative z-10 flex items-center justify-center h-full p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {phase === 0 && (
              <BootSequence key="boot" bootText={bootText} onTap={advance} />
            )}
            {phase === 1 && (
              <SwipeDemo key="swipe" onTap={advance} />
            )}
            {phase === 2 && (
              <RealMoney key="money" onTap={advance} />
            )}
            {phase === 3 && (
              <EnterArena key="arena" onEnter={advance} />
            )}
          </AnimatePresence>
        </div>

        {/* Tap hint (phases 1-2 only) */}
        {phase > 0 && phase < 3 && (
          <motion.p
            className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 text-gray-600 text-[10px] font-pixel"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            onClick={advance}
          >
            TAP TO CONTINUE
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Phase 0: Boot Sequence ───────────────────────────────────────────

function BootSequence({
  bootText,
  onTap,
}: {
  bootText: "init" | "name" | "ready";
  onTap: () => void;
}) {
  return (
    <motion.div
      className="text-center max-w-sm w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.3 }}
      onClick={onTap}
    >
      <AnimatePresence mode="wait">
        {bootText === "init" && (
          <motion.div
            key="init"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="font-game text-lg text-[#00F3FF] animate-glitch tracking-[0.3em]">
              INITIALIZING...
            </p>
          </motion.div>
        )}

        {bootText === "name" && (
          <motion.div
            key="name"
            className="flex flex-col items-center gap-4 sm:gap-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Logo with glow ring */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-[#00F3FF]/15 blur-2xl" />
              <motion.div
                className="absolute -inset-3 rounded-2xl border-2 border-[#00F3FF]/40"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  borderImage:
                    "linear-gradient(45deg, #00F3FF, #00FF88, #FF00AA, #00F3FF) 1",
                }}
              />
              <img
                src="/logo-200.png"
                alt="Solana Saga"
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl relative z-10"
              />
            </div>

            <h1
              className="font-game text-2xl sm:text-4xl text-glow-cyan tracking-wider"
              style={{
                textShadow:
                  "0 0 20px #00F3FF, 0 0 40px #00F3FF, 0 0 80px #00F3FF",
              }}
            >
              SOLANA SAGA
            </h1>
          </motion.div>
        )}

        {bootText === "ready" && (
          <motion.div
            key="ready"
            className="flex flex-col items-center gap-4 sm:gap-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Logo */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-[#00F3FF]/15 blur-2xl" />
              <motion.div
                className="absolute -inset-3 rounded-2xl border-2 border-[#00F3FF]/40"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  borderImage:
                    "linear-gradient(45deg, #00F3FF, #00FF88, #FF00AA, #00F3FF) 1",
                }}
              />
              <img
                src="/logo-200.png"
                alt="Solana Saga"
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl relative z-10"
              />
            </div>

            <h1
              className="font-game text-2xl sm:text-4xl text-glow-cyan tracking-wider"
              style={{
                textShadow:
                  "0 0 20px #00F3FF, 0 0 40px #00F3FF, 0 0 80px #00F3FF",
              }}
            >
              SOLANA SAGA
            </h1>

            <motion.p
              className="font-pixel text-[8px] sm:text-[10px] text-glow-pink tracking-[0.2em]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              PREDICTION ARCADE • SOLANA MAINNET
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Phase 1: Swipe Demo ──────────────────────────────────────────────

function SwipeDemo({ onTap }: { onTap: () => void }) {
  return (
    <motion.div
      className="text-center max-w-sm w-full flex flex-col items-center gap-3 sm:gap-6"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 250, damping: 25 }}
      onClick={onTap}
    >
      {/* Mock card with swipe animation */}
      <div className="relative w-44 h-56 sm:w-52 sm:h-72">
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          animate={{
            x: [0, 60, 0, -60, 0],
            rotate: [0, 6, 0, -6, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Card gradient top */}
          <div className="h-1 w-full bg-gradient-to-r from-[#00F3FF] via-[#FF00FF] to-[#00FF88]" />

          {/* Card content */}
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
              <span className="text-[8px] text-gray-500 font-game">LIVE</span>
            </div>

            <p className="font-game text-white text-sm leading-tight mb-4">
              Will BTC hit $100K by March?
            </p>

            {/* Fake odds bar */}
            <div className="flex gap-1 mb-3">
              <div className="flex-1 h-6 rounded-lg bg-[#00FF88]/15 border border-[#00FF88]/30 flex items-center justify-center">
                <span className="text-[10px] text-[#00FF88] font-numbers font-bold">
                  YES 62%
                </span>
              </div>
              <div className="flex-1 h-6 rounded-lg bg-[#FF0044]/15 border border-[#FF0044]/30 flex items-center justify-center">
                <span className="text-[10px] text-[#FF0044] font-numbers font-bold">
                  NO 38%
                </span>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between">
              <span className="text-[8px] text-gray-600 font-game">
                via Jupiter
              </span>
              <span className="text-[8px] text-[#c7f83e] font-numbers">
                $24.5K VOL
              </span>
            </div>
          </div>

          {/* YES/NO overlays that sync with swipe */}
          <motion.div
            className="absolute inset-0 rounded-2xl flex items-center justify-center bg-[#00FF88]/10 border-2 border-[#00FF88]/50"
            animate={{ opacity: [0, 0, 1, 0, 0, 0, 0, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span
              className="font-game text-3xl text-[#00FF88] font-bold -rotate-12"
              style={{
                textShadow: "0 0 20px #00FF88",
              }}
            >
              YES
            </span>
          </motion.div>

          <motion.div
            className="absolute inset-0 rounded-2xl flex items-center justify-center bg-[#FF0044]/10 border-2 border-[#FF0044]/50"
            animate={{ opacity: [0, 0, 0, 0, 0, 0, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span
              className="font-game text-3xl text-[#FF0044] font-bold rotate-12"
              style={{
                textShadow: "0 0 20px #FF0044",
              }}
            >
              NO
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Title */}
      <div>
        <h2
          className="font-game text-xl sm:text-2xl text-glow-cyan mb-1 sm:mb-2"
          style={{ textShadow: "0 0 15px #00F3FF" }}
        >
          SWIPE TO PREDICT
        </h2>
        <p className="text-gray-400 text-[10px] sm:text-xs font-game tracking-wider">
          RIGHT = YES • LEFT = NO • UP = SKIP
        </p>
      </div>

      {/* Gamepad buttons */}
      <div className="flex items-center gap-4 sm:gap-5">
        {[
          { label: "A", sublabel: "YES", color: "#00FF88" },
          { label: "B", sublabel: "NO", color: "#FF0044" },
          { label: "Y", sublabel: "SKIP", color: "#FFD700" },
        ].map((btn, i) => (
          <motion.div
            key={btn.label}
            className="flex flex-col items-center gap-1"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          >
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-game font-bold text-xs sm:text-sm"
              style={{
                background: `${btn.color}15`,
                border: `2px solid ${btn.color}`,
                color: btn.color,
                boxShadow: `0 0 12px ${btn.color}40, 0 0 24px ${btn.color}20`,
              }}
            >
              {btn.label}
            </div>
            <span
              className="text-[8px] font-game"
              style={{ color: `${btn.color}99` }}
            >
              {btn.sublabel}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Phase 2: Real Money ──────────────────────────────────────────────

function RealMoney({ onTap }: { onTap: () => void }) {
  const [showLines, setShowLines] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowLines(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="text-center max-w-sm w-full flex flex-col items-center gap-5 sm:gap-8"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 250, damping: 25 }}
      onClick={onTap}
    >
      {/* USDC coin with 3D flip */}
      <div className="relative" style={{ perspective: "600px" }}>
        <div className="absolute -inset-6 rounded-full bg-[#c7f83e]/10 blur-2xl" />
        <motion.div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center relative z-10"
          style={{
            background:
              "linear-gradient(135deg, #2775CA 0%, #1A5BB5 50%, #2775CA 100%)",
            border: "3px solid rgba(255,255,255,0.2)",
            boxShadow:
              "0 0 30px rgba(39,117,202,0.4), 0 0 60px rgba(39,117,202,0.2)",
          }}
          animate={{
            rotateY: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span className="font-bold text-3xl text-white drop-shadow-lg">
            $
          </span>
        </motion.div>
      </div>

      {/* Title */}
      <div>
        <h2
          className="font-game text-xl sm:text-2xl text-glow-cyan mb-1 sm:mb-2"
          style={{ textShadow: "0 0 15px #00F3FF" }}
        >
          BET WITH REAL MONEY
        </h2>
        <p className="text-gray-500 text-[10px] sm:text-xs font-game">
          Powered by Jupiter on Solana
        </p>
      </div>

      {/* Feature lines — staggered entrance */}
      <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-xs">
        {[
          {
            text: "REAL USDC",
            color: "#00FF88",
            delay: 0,
            icon: "💵",
          },
          {
            text: "SOLANA MAINNET",
            color: "#14F195",
            delay: 200,
            icon: "⚡",
          },
          {
            text: "4 JUPITER APIs",
            color: "#c7f83e",
            delay: 400,
            icon: "🪐",
          },
        ].map((line, i) => (
          <motion.div
            key={line.text}
            className="flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl"
            style={{
              background: `${line.color}08`,
              border: `1px solid ${line.color}25`,
            }}
            initial={{ opacity: 0, x: -30 }}
            animate={
              showLines
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: -30 }
            }
            transition={{
              delay: line.delay / 1000,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
          >
            <span className="text-lg">{line.icon}</span>
            <span
              className="font-game text-sm font-bold tracking-wider"
              style={{
                color: line.color,
                textShadow: `0 0 10px ${line.color}60`,
              }}
            >
              {line.text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Powered by badges */}
      <div className="flex items-center gap-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "#c7f83e" }}
          />
          <span style={{ color: "#c7f83e" }}>Jupiter</span>
        </span>
        <span className="w-px h-3 bg-white/10" />
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "#14F195" }}
          />
          <span style={{ color: "#14F195" }}>Solana</span>
        </span>
      </div>
    </motion.div>
  );
}

// ─── Phase 3: Enter the Arena ─────────────────────────────────────────

function EnterArena({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      className="text-center max-w-sm w-full flex flex-col items-center gap-5 sm:gap-8"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ type: "spring", stiffness: 250, damping: 25 }}
    >
      {/* Logo small */}
      <motion.img
        src="/logo-200.png"
        alt="Solana Saga"
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl"
        style={{
          boxShadow: "0 0 30px rgba(0,243,255,0.3)",
        }}
        animate={{
          boxShadow: [
            "0 0 20px rgba(0,243,255,0.2)",
            "0 0 40px rgba(0,243,255,0.4)",
            "0 0 20px rgba(0,243,255,0.2)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Feature chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { text: "6 DAILY MISSIONS", color: "#FFD700" },
          { text: "10 ACHIEVEMENTS", color: "#FF00FF" },
          { text: "XP & LEVELS", color: "#00F3FF" },
          { text: "LEADERBOARD", color: "#00FF88" },
        ].map((chip, i) => (
          <motion.span
            key={chip.text}
            className="px-3 py-1.5 rounded-full text-[9px] font-game"
            style={{
              background: `${chip.color}10`,
              border: `1px solid ${chip.color}30`,
              color: chip.color,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring" }}
          >
            {chip.text}
          </motion.span>
        ))}
      </div>

      {/* CTA Button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onEnter();
        }}
        className="relative px-8 py-3 sm:px-10 sm:py-4 rounded-2xl font-game text-base sm:text-lg font-bold text-black tracking-wider overflow-hidden"
        style={{
          background: "linear-gradient(90deg, #00F3FF, #FF00FF, #00F3FF)",
          backgroundSize: "200% 100%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          boxShadow: [
            "0 0 20px rgba(0,243,255,0.4), 0 0 40px rgba(255,0,255,0.2)",
            "0 0 30px rgba(255,0,255,0.4), 0 0 60px rgba(0,243,255,0.2)",
            "0 0 20px rgba(0,243,255,0.4), 0 0 40px rgba(255,0,255,0.2)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ENTER THE ARENA
      </motion.button>

      {/* Sub text */}
      <p className="text-gray-600 text-[10px] font-pixel tracking-wider">
        SWIPE • BET • WIN
      </p>
    </motion.div>
  );
}
