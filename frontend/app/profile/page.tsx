"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  User,
  Trophy,
  Target,
  TrendingUp,
  Zap,
  Flame,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useJupiterPrediction } from "@/hooks/useJupiterPrediction";
import { getGameData, ACHIEVEMENTS, getXpForNextLevel } from "@/lib/gameCredits";
import { getMissions, type Mission } from "@/lib/missions";
import { microUsdToDollars } from "@/lib/jupiter/jupiterPredictionApi";
import { RetroGrid } from "@/components/RetroGrid";
import { useTokenPortfolio } from "@/hooks/useTokenPortfolio";
import { useSolBalance } from "@/hooks/useUsdcBalance";
import Link from "next/link";

const shortenAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

const ACHIEVEMENT_IDS = Object.keys(ACHIEVEMENTS) as (keyof typeof ACHIEVEMENTS)[];

export default function ProfilePage() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const { profile, positions, userStats, refetch } =
    useJupiterPrediction();
  const { tokens: portfolioTokens, totalValueUsd, loading: portfolioLoading } = useTokenPortfolio();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [gameData, setGameData] = useState<ReturnType<typeof getGameData> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastActionRef = useRef(0);

  const wallet = publicKey?.toBase58() || null;

  // Load data
  useEffect(() => {
    if (wallet) {
      refetch();
      setGameData(getGameData(wallet));
      const m = getMissions(wallet);
      setMissions(m.missions);
    }
  }, [wallet, refetch]);

  // Gamepad: B = back, D-pad = scroll
  useEffect(() => {
    const poll = () => {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];
      if (gp) {
        const now = Date.now();
        if (now - lastActionRef.current >= 200) {
          // B button = back
          if (gp.buttons[1]?.pressed) {
            lastActionRef.current = now;
            router.push("/");
          }
          // D-pad up/down = scroll
          if (gp.axes[1] < -0.5 || gp.buttons[12]?.pressed) {
            scrollRef.current?.scrollBy(0, -80);
            lastActionRef.current = now;
          }
          if (gp.axes[1] > 0.5 || gp.buttons[13]?.pressed) {
            scrollRef.current?.scrollBy(0, 80);
            lastActionRef.current = now;
          }
        }
      }
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [router]);

  // Compute stats
  const level = gameData?.level ?? 1;
  const xp = gameData?.xp ?? 0;
  const xpForNext = getXpForNextLevel(level);
  const xpProgress = xpForNext > 0 ? Math.min((xp / xpForNext) * 100, 100) : 0;
  const totalBets = profile ? parseInt(profile.predictionsCount || "0") : (gameData?.totalWins ?? 0) + (gameData?.totalLosses ?? 0);
  const totalWins = profile ? parseInt(profile.correctPredictions || "0") : (gameData?.totalWins ?? 0);
  const winRate = totalBets > 0 ? ((totalWins / totalBets) * 100).toFixed(1) : "0";
  const totalVolume = profile ? microUsdToDollars(profile.totalVolumeUsd || "0") : (gameData?.totalWagered ?? 0);
  const pnl = profile ? microUsdToDollars(profile.realizedPnlUsd || "0") : ((gameData?.totalWon ?? 0) - (gameData?.totalLost ?? 0));
  const bestStreak = gameData?.bestStreak ?? 0;
  const unlockedAchievements = gameData?.achievements ?? ["first_login"];
  const missionsCompleted = missions.filter((m) => m.completed).length;

  if (!wallet) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <RetroGrid />
        <div className="text-center z-10">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-game text-sm">
            CONNECT WALLET TO VIEW PROFILE
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] relative">
      <RetroGrid />

      <div ref={scrollRef} className="relative z-10 max-w-lg mx-auto px-4 pt-4 pb-24 overflow-y-auto max-h-screen">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-game">BACK</span>
        </button>

        {/* Player Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-5 rounded-2xl bg-gradient-to-br from-[#0a0a1a] to-[#0f0f2a] border border-[#00F3FF]/20 shadow-[0_0_30px_rgba(0,243,255,0.1)] mb-4"
        >
          <div className="flex items-center gap-4">
            {/* Level ring */}
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#1a1a3e" strokeWidth="4" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#00F3FF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(xpProgress / 100) * 175.9} 175.9`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[#FFD700] font-game text-lg font-bold">
                  {level}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-white font-game text-sm tracking-wider">
                {shortenAddress(wallet)}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                Level {level} &bull; {xp} XP
              </p>
              <div className="mt-1.5 h-1 rounded-full bg-[#1a1a3e] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00F3FF] to-[#00FF88]"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-0.5">
                {xp}/{xpForNext} XP to Level {level + 1}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 mb-4"
        >
          {[
            { label: "Win Rate", value: `${winRate}%`, icon: Target, color: "#00FF88" },
            { label: "Total Bets", value: totalBets.toString(), icon: Zap, color: "#00F3FF" },
            { label: "Wins", value: totalWins.toString(), icon: Trophy, color: "#FFD700" },
            { label: "Volume", value: `$${totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume.toFixed(0)}`, icon: TrendingUp, color: "#FF00AA" },
            { label: "PnL", value: `${pnl >= 0 ? "+" : ""}$${Math.abs(pnl).toFixed(2)}`, icon: TrendingUp, color: pnl >= 0 ? "#00FF88" : "#FF0044" },
            { label: "Best Streak", value: bestStreak.toString(), icon: Flame, color: "#FF6B00" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="p-3 rounded-xl bg-[#0a0a1a] border border-[#1a1a3e]/60 text-center"
            >
              <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: stat.color }} />
              <p className="text-white font-bold text-sm">{stat.value}</p>
              <p className="text-gray-500 text-[10px] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Portfolio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-game text-sm tracking-wider">
              PORTFOLIO{" "}
              {totalValueUsd > 0 && (
                <span className="text-[#00FF88]">
                  ${totalValueUsd.toFixed(2)}
                </span>
              )}
            </h3>
            <Link
              href="/swap"
              className="px-3 py-1 rounded-lg bg-[#00F3FF]/10 border border-[#00F3FF]/30 text-[#00F3FF] text-[10px] font-game hover:bg-[#00F3FF]/20 transition-colors"
            >
              SWAP
            </Link>
          </div>

          {portfolioLoading ? (
            <div className="p-4 rounded-xl bg-[#0a0a1a] border border-[#1a1a3e]/60 text-center">
              <p className="text-gray-500 text-xs animate-pulse">Loading portfolio...</p>
            </div>
          ) : portfolioTokens.length > 0 ? (
            <div className="space-y-1.5">
              {portfolioTokens.slice(0, 8).map((token) => (
                <div
                  key={token.mint}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-[#0a0a1a] border border-[#1a1a3e]/40"
                >
                  {token.icon ? (
                    <img
                      src={token.icon}
                      alt={token.symbol}
                      className="w-7 h-7 rounded-full flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/50 to-blue-500/50 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-semibold truncate">
                      {token.symbol}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {token.balance < 0.001
                        ? token.balance.toExponential(2)
                        : token.balance < 1
                        ? token.balance.toFixed(6)
                        : token.balance.toFixed(4)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-white font-numbers">
                      ${token.usdValue.toFixed(2)}
                    </p>
                    {token.usdPrice > 0 && (
                      <p className="text-[9px] text-gray-500 font-numbers">
                        ${token.usdPrice < 0.01
                          ? token.usdPrice.toFixed(6)
                          : token.usdPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#0a0a1a] border border-[#1a1a3e]/60 text-center">
              <p className="text-gray-500 text-xs">No tokens found</p>
            </div>
          )}
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <h3 className="text-white font-game text-sm tracking-wider mb-2">
            ACHIEVEMENTS{" "}
            <span className="text-gray-500">
              ({unlockedAchievements.length}/{ACHIEVEMENT_IDS.length})
            </span>
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
            {ACHIEVEMENT_IDS.map((id) => {
              const ach = ACHIEVEMENTS[id];
              const unlocked = unlockedAchievements.includes(id);
              return (
                <div
                  key={id}
                  className={`relative p-1.5 sm:p-2 rounded-xl text-center border ${
                    unlocked
                      ? "bg-[#0a0a1a] border-[#FFD700]/30 shadow-[0_0_10px_rgba(255,215,0,0.15)]"
                      : "bg-[#080810] border-[#1a1a2e]/40 opacity-40"
                  }`}
                >
                  <span className="text-xl sm:text-2xl block">{unlocked ? ach.icon : "🔒"}</span>
                  <p className={`text-[7px] sm:text-[8px] mt-0.5 sm:mt-1 font-semibold truncate ${unlocked ? "text-[#FFD700]" : "text-gray-600"}`}>
                    {ach.name}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Today's Missions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <h3 className="text-white font-game text-sm tracking-wider mb-2">
            TODAY&apos;S MISSIONS{" "}
            <span className="text-gray-500">
              ({missionsCompleted}/{missions.length})
            </span>
          </h3>
          <div className="space-y-1.5">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  mission.completed
                    ? "bg-[#00FF88]/5 border-[#00FF88]/20"
                    : "bg-[#0a0a1a] border-[#1a1a3e]/40"
                }`}
              >
                <span className="text-lg flex-shrink-0">
                  {mission.completed ? "✅" : mission.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-semibold truncate ${
                      mission.completed ? "text-[#00FF88]" : "text-white"
                    }`}
                  >
                    {mission.title}
                  </p>
                  {!mission.completed && (
                    <div className="mt-1 h-1 rounded-full bg-[#1a1a3e] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#00F3FF]"
                        style={{
                          width: `${(mission.progress / mission.target) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
                <span
                  className={`text-[9px] font-bold flex-shrink-0 ${
                    mission.completed ? "text-[#00FF88]" : "text-gray-500"
                  }`}
                >
                  {mission.completed ? "DONE" : `${mission.progress}/${mission.target}`}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-white font-game text-sm tracking-wider mb-2">
            RECENT ACTIVITY
          </h3>
          {gameData && gameData.bets.length > 0 ? (
            <div className="space-y-1.5">
              {gameData.bets
                .slice(-5)
                .reverse()
                .map((bet) => (
                  <div
                    key={bet.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#0a0a1a] border border-[#1a1a3e]/40"
                  >
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        bet.prediction
                          ? "bg-[#00FF88]/20 text-[#00FF88]"
                          : "bg-[#FF0044]/20 text-[#FF0044]"
                      }`}
                    >
                      {bet.prediction ? "YES" : "NO"}
                    </span>
                    <p className="text-gray-300 text-xs truncate flex-1">
                      {bet.marketQuestion}
                    </p>
                    <span className="text-gray-500 text-[10px] flex-shrink-0">
                      ${bet.amount}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-600 text-xs text-center py-4">
              No bets yet. Head to the Arena!
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
