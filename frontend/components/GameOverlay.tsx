"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, Wallet, Zap, Trophy, Volume2, VolumeX, X, Settings, Shield, BarChart3, Target, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";

// Admin wallets that can access the admin panel
const ADMIN_WALLETS = [
    "5TY5gts9AktYJMN6S8dGDzjAxmZLbxgbWrhRPpLfxYUD",
];

interface GameOverlayProps {
  streak: number;
  balance: number;
  trustScore: number;
  notifications: Notification[];
  onDismissNotification: (id: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  totalWins: number;
  totalBets: number;
  showAdmin?: boolean;
}

interface Notification {
  id: string;
  type: "win" | "loss" | "streak" | "info" | "error";
  message: string;
  amount?: number;
}

export function GameOverlay({
  streak,
  balance,
  trustScore,
  notifications,
  onDismissNotification,
  soundEnabled,
  onToggleSound,
  totalWins,
  totalBets,
  showAdmin = false,
}: GameOverlayProps) {
  const { connected } = useWallet();
  const wallet = useAnchorWallet();
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [showSettings, setShowSettings] = useState(false);
  const [performanceMode, setPerformanceMode] = useState<"high" | "lite">("high");

  // Check if current wallet is admin
  const isAdmin = wallet ? ADMIN_WALLETS.includes(wallet.publicKey.toString()) : false;

  // Load performance mode from localStorage
  useEffect(() => {
    const savedPerformance = localStorage.getItem("performanceMode");
    if (savedPerformance) setPerformanceMode(savedPerformance as "high" | "lite");
  }, []);

  const togglePerformance = () => {
    const newValue = performanceMode === "high" ? "lite" : "high";
    setPerformanceMode(newValue);
    localStorage.setItem("performanceMode", newValue);
  };

  // Animate balance changes
  useEffect(() => {
    if (balance !== displayBalance) {
      const diff = balance - displayBalance;
      const steps = 20;
      const increment = diff / steps;
      let current = displayBalance;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        current += increment;
        setDisplayBalance(current);
        if (step >= steps) {
          setDisplayBalance(balance);
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [balance, displayBalance]);

  return (
    <>
      {/* Top HUD Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Logo + Stats */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-[#00F3FF]" />
              <div className="hidden sm:block">
                <span className="font-game text-sm md:text-lg text-[#00F3FF]">SOLANA</span>
                <span className="font-game text-sm md:text-lg text-white ml-1">SAGA</span>
              </div>
            </motion.div>

            {/* Win Rate */}
            {connected && totalBets > 0 && (
              <motion.div
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Trophy className="w-4 h-4 text-[#FFD700]" />
                <span className="text-sm font-numbers text-gray-400">
                  Win Rate: <span className="text-white font-bold">{Math.round((totalWins / totalBets) * 100)}%</span>
                </span>
              </motion.div>
            )}
          </div>

          {/* Right: Streak, Balance, Admin, Sound */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Streak Counter */}
            {streak > 0 && (
              <motion.div
                className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Flame className="w-4 h-4 md:w-6 md:h-6 text-orange-500" />
                </motion.div>
                <div>
                  <div className="text-[8px] md:text-[10px] text-orange-400 font-game">STREAK</div>
                  <div className="text-base md:text-xl font-pixel text-white">{streak}</div>
                </div>
              </motion.div>
            )}

            {/* Balance */}
            {connected && (
              <motion.div
                className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-1.5 md:py-2 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Wallet className="w-4 h-4 md:w-5 md:h-5 text-[#00FF88]" />
                <div>
                  <div className="text-[8px] md:text-[10px] text-[#00FF88]/70 font-game">BALANCE</div>
                  <motion.div
                    className="text-sm md:text-lg font-numbers font-bold text-white"
                    key={balance}
                    animate={{ scale: [1, 1.1, 1] }}
                  >
                    ${displayBalance.toFixed(2)}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Trust Score (Health Bar Style) - Hidden on small screens */}
            <motion.div
              className="hidden lg:flex flex-col gap-1 min-w-[100px]"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-game">TRUST</span>
                <span className="text-xs font-numbers text-[#00F3FF]">{trustScore}%</span>
              </div>
              <div className="h-2.5 bg-black/50 rounded-full border border-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: trustScore > 70
                      ? "linear-gradient(90deg, #00FF88, #00F3FF)"
                      : trustScore > 40
                      ? "linear-gradient(90deg, #FFD700, #FF8800)"
                      : "linear-gradient(90deg, #FF0044, #FF4400)",
                    boxShadow: `0 0 10px ${trustScore > 70 ? "#00FF88" : trustScore > 40 ? "#FFD700" : "#FF0044"}`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${trustScore}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </motion.div>

            {/* Settings Button */}
            {showAdmin && (
              <div className="relative">
                <motion.button
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center border transition-all bg-white/5 border-white/20 text-gray-400 hover:bg-white/10 hover:text-white"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(!showSettings)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Settings className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>

                {/* Settings Dropdown */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-12 w-64 bg-[#0a0a0f]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
                    >
                      {/* Header */}
                      <div className="p-3 border-b border-white/10 flex items-center justify-between">
                        <span className="font-game text-sm text-white">Settings</span>
                        <button
                          onClick={() => setShowSettings(false)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-3 space-y-3">
                        {/* Sound Effects Toggle */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {soundEnabled ? (
                              <Volume2 className="w-4 h-4 text-[#00f0ff]" />
                            ) : (
                              <VolumeX className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="text-xs text-gray-300">Sound Effects</span>
                          </div>
                          <button
                            onClick={onToggleSound}
                            className={`relative w-10 h-5 rounded-full transition-all ${
                              soundEnabled
                                ? "bg-[#00f0ff]/30 border border-[#00f0ff]/50"
                                : "bg-white/10 border border-white/20"
                            }`}
                          >
                            <motion.div
                              className={`absolute top-0.5 w-4 h-4 rounded-full ${
                                soundEnabled ? "bg-[#00f0ff]" : "bg-gray-500"
                              }`}
                              animate={{ left: soundEnabled ? 20 : 2 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </button>
                        </div>

                        {/* Performance Mode Toggle */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className={`w-4 h-4 ${
                              performanceMode === "high" ? "text-[#ffd700]" : "text-gray-500"
                            }`} />
                            <div>
                              <span className="text-xs text-gray-300">Animations</span>
                              <p className="text-[10px] text-gray-500">
                                {performanceMode === "high" ? "High Quality" : "Lite Mode"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={togglePerformance}
                            className={`relative w-10 h-5 rounded-full transition-all ${
                              performanceMode === "high"
                                ? "bg-[#ffd700]/30 border border-[#ffd700]/50"
                                : "bg-white/10 border border-white/20"
                            }`}
                          >
                            <motion.div
                              className={`absolute top-0.5 w-4 h-4 rounded-full ${
                                performanceMode === "high" ? "bg-[#ffd700]" : "bg-gray-500"
                              }`}
                              animate={{ left: performanceMode === "high" ? 20 : 2 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="border-t border-white/10 pt-3 space-y-2">
                          <Link href="/my-bets" onClick={() => setShowSettings(false)}>
                            <motion.button
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#ff00aa]/10 to-[#00f0ff]/10 border border-[#ff00aa]/30 text-[#ff00aa] hover:border-[#ff00aa]/50 transition-all"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Gift className="w-4 h-4" />
                              <div className="text-left">
                                <div className="font-game text-xs">My Bets</div>
                                <div className="text-[10px] text-[#ff00aa]/70">View & claim winnings</div>
                              </div>
                            </motion.button>
                          </Link>

                          <Link href="/markets" onClick={() => setShowSettings(false)}>
                            <motion.button
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#00f0ff]/10 to-[#00ff88]/10 border border-[#00f0ff]/30 text-[#00f0ff] hover:border-[#00f0ff]/50 transition-all"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Target className="w-4 h-4" />
                              <div className="text-left">
                                <div className="font-game text-xs">All Markets</div>
                                <div className="text-[10px] text-[#00f0ff]/70">Browse all predictions</div>
                              </div>
                            </motion.button>
                          </Link>
                        </div>

                        {/* Admin Access - Only shown to admins */}
                        {isAdmin && (
                          <div className="border-t border-white/10 pt-3">
                            <Link href="/admin" onClick={() => setShowSettings(false)}>
                              <motion.button
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 text-red-400 hover:border-red-500/50 transition-all"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Shield className="w-4 h-4" />
                                <div className="text-left">
                                  <div className="font-game text-xs">Admin Command</div>
                                  <div className="text-[10px] text-red-400/70">Access control panel</div>
                                </div>
                              </motion.button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Sound Toggle */}
            <motion.button
              onClick={onToggleSound}
              className={`
                w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center
                border transition-all
                ${soundEnabled
                  ? "bg-[#00F3FF]/10 border-[#00F3FF]/50 text-[#00F3FF]"
                  : "bg-white/5 border-white/20 text-gray-500"
                }
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 md:w-5 md:h-5" /> : <VolumeX className="w-4 h-4 md:w-5 md:h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed bottom-20 md:bottom-4 right-4 z-50 flex flex-col gap-2 max-w-[calc(100vw-2rem)] sm:max-w-sm">
        <AnimatePresence>
          {notifications.slice(0, 3).map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md border
                ${notification.type === "win"
                  ? "bg-[#00FF88]/20 border-[#00FF88]/50"
                  : notification.type === "loss"
                  ? "bg-[#FF0044]/20 border-[#FF0044]/50"
                  : notification.type === "streak"
                  ? "bg-orange-500/20 border-orange-500/50"
                  : notification.type === "error"
                  ? "bg-red-500/20 border-red-500/50"
                  : "bg-[#00F3FF]/20 border-[#00F3FF]/50"
                }
              `}
            >
              <div className="flex-1">
                <p className={`text-sm font-bold ${
                  notification.type === "win" ? "text-[#00FF88]" :
                  notification.type === "loss" ? "text-[#FF0044]" :
                  notification.type === "streak" ? "text-orange-400" :
                  notification.type === "error" ? "text-red-400" :
                  "text-[#00F3FF]"
                }`}>
                  {notification.message}
                </p>
                {notification.amount && (
                  <p className="text-lg font-numbers font-bold text-white">
                    {notification.type === "win" ? "+" : "-"}${notification.amount.toFixed(2)}
                  </p>
                )}
              </div>
              <button
                onClick={() => onDismissNotification(notification.id)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom instruction bar */}
      <motion.div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-3 md:gap-6 px-4 md:px-6 py-2 md:py-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
            <span className="px-1.5 md:px-2 py-0.5 md:py-1 rounded bg-[#00FF88]/20 text-[#00FF88] font-game text-[10px] md:text-xs">RIGHT</span>
            <span className="text-gray-500 hidden sm:inline">or</span>
            <span className="px-1.5 md:px-2 py-0.5 md:py-1 rounded bg-[#00FF88]/20 text-[#00FF88] font-game text-[10px] md:text-xs">YES</span>
          </div>
          <div className="w-px h-4 md:h-6 bg-white/20" />
          <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
            <span className="px-1.5 md:px-2 py-0.5 md:py-1 rounded bg-[#FF0044]/20 text-[#FF0044] font-game text-[10px] md:text-xs">LEFT</span>
            <span className="text-gray-500 hidden sm:inline">or</span>
            <span className="px-1.5 md:px-2 py-0.5 md:py-1 rounded bg-[#FF0044]/20 text-[#FF0044] font-game text-[10px] md:text-xs">NO</span>
          </div>
          <div className="w-px h-4 md:h-6 bg-white/20" />
          <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
            <span className="px-1.5 md:px-2 py-0.5 md:py-1 rounded bg-white/10 text-gray-300 font-game text-[10px] md:text-xs">UP</span>
            <span className="text-gray-500 hidden sm:inline">Skip</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
