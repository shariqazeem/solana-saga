"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Trophy, Crown, Medal, Star, Flame, TrendingUp,
  Zap, Target, Loader2, ArrowLeft, Users
} from "lucide-react";
import { usePredictionMarkets, UserStats } from "@/lib/solana/hooks/usePredictionMarkets";
import { RetroGrid } from "@/components/RetroGrid";

// Helper to shorten wallet addresses
const shortenAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// Generate avatar based on address
const getAvatar = (address: string, index: number) => {
  const avatars = ["🦈", "💪", "🎲", "🐋", "🌙", "🚀", "💎", "🦍", "🐂", "🥷", "🎮", "🔥", "⚡", "🎯", "👑"];
  const hash = address.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return avatars[(hash + index) % avatars.length];
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1: return { bg: "from-[#ffd700]/30 to-[#ff8800]/30", border: "#ffd700", glow: "#ffd700" };
    case 2: return { bg: "from-[#c0c0c0]/30 to-[#808080]/30", border: "#c0c0c0", glow: "#c0c0c0" };
    case 3: return { bg: "from-[#cd7f32]/30 to-[#8b4513]/30", border: "#cd7f32", glow: "#cd7f32" };
    default: return { bg: "from-white/5 to-white/5", border: "transparent", glow: "transparent" };
  }
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return Crown;
    case 2: return Medal;
    case 3: return Medal;
    default: return Star;
  }
};

export default function LeaderboardPage() {
  const { publicKey } = useWallet();
  const { fetchAllUserStats } = usePredictionMarkets();
  const [leaderboardData, setLeaderboardData] = useState<(UserStats & { rank: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<(UserStats & { rank: number }) | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const stats = await fetchAllUserStats();
        const rankedStats = stats.map((s, i) => ({ ...s, rank: i + 1 }));
        setLeaderboardData(rankedStats);

        // Find current user's rank
        if (publicKey) {
          const userStats = rankedStats.find(s => s.user === publicKey.toString());
          if (userStats) {
            setUserRank(userStats);
          }
        }
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [fetchAllUserStats, publicKey]);

  // Get top 3 for podium (or pad with empty if less than 3)
  const top3 = leaderboardData.slice(0, 3);
  while (top3.length < 3) {
    top3.push({ rank: top3.length + 1, user: "", publicKey: "", totalBets: 0, totalWagered: 0, totalWon: 0, totalLost: 0, winCount: 0, lossCount: 0, currentStreak: 0, bestStreak: 0, netProfit: 0 });
  }

  return (
    <div className="min-h-screen bg-[#050505] relative">
      {/* Background */}
      <RetroGrid streak={0} />

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/">
            <motion.button
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#ffd700]" />
            <span className="font-game text-lg">
              <span className="text-white">HALL OF </span>
              <span className="text-[#ffd700]">FAME</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-20 pb-8 px-4 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-4"
            >
              <Trophy className="w-16 h-16 text-[#ffd700]" />
            </motion.div>
            <p className="text-gray-400">
              The greatest predictors on Solana
            </p>
            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{leaderboardData.length} players ranked</span>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#ffd700] animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && leaderboardData.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-game text-white mb-2">No Rankings Yet</h3>
              <p className="text-gray-400 mb-6">Be the first to place a bet and claim the top spot!</p>
              <Link href="/">
                <motion.button
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffd700]/20 to-[#ff8800]/20 border border-[#ffd700]/30 text-[#ffd700] font-game text-sm hover:border-[#ffd700]/50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap className="w-4 h-4 inline mr-2" />
                  START BETTING
                </motion.button>
              </Link>
            </motion.div>
          )}

          {/* Leaderboard Content */}
          {!loading && leaderboardData.length > 0 && (
            <>
              {/* Top 3 Podium */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center items-end gap-3 mb-8 px-4"
              >
                {/* 2nd Place */}
                {top3[1] && top3[1].user && (
                  <div className="flex-1 max-w-[160px]">
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="game-card p-3 text-center relative overflow-hidden"
                      style={{
                        background: "linear-gradient(180deg, rgba(192,192,192,0.2), rgba(192,192,192,0.05))",
                        borderColor: "#c0c0c0",
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[#c0c0c0]" />
                      <div className="text-3xl mb-1">{getAvatar(top3[1].user, 1)}</div>
                      <Medal className="w-5 h-5 text-[#c0c0c0] mx-auto mb-1" />
                      <div className="font-game text-white text-xs truncate">{shortenAddress(top3[1].user)}</div>
                      <div className="text-lg font-numbers font-bold text-[#00ff88]">
                        {top3[1].netProfit >= 0 ? '+' : ''}${top3[1].netProfit.toFixed(0)}
                      </div>
                      <div className="text-[10px] text-gray-400">2nd Place</div>
                    </motion.div>
                    <div className="h-16 bg-gradient-to-t from-[#c0c0c0]/20 to-[#c0c0c0]/5 rounded-b-xl" />
                  </div>
                )}

                {/* 1st Place */}
                {top3[0] && top3[0].user && (
                  <div className="flex-1 max-w-[180px]">
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="game-card p-4 text-center relative overflow-hidden"
                      style={{
                        background: "linear-gradient(180deg, rgba(255,215,0,0.2), rgba(255,215,0,0.05))",
                        borderColor: "#ffd700",
                        boxShadow: "0 0 30px rgba(255,215,0,0.2)",
                      }}
                    >
                      <motion.div
                        className="absolute top-0 left-0 right-0 h-1 bg-[#ffd700]"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="text-4xl mb-1">{getAvatar(top3[0].user, 0)}</div>
                      <Crown className="w-6 h-6 text-[#ffd700] mx-auto mb-1" />
                      <div className="font-game text-white text-sm truncate">{shortenAddress(top3[0].user)}</div>
                      <div className="text-2xl font-numbers font-bold text-[#00ff88]">
                        {top3[0].netProfit >= 0 ? '+' : ''}${top3[0].netProfit.toFixed(0)}
                      </div>
                      <div className="text-xs text-[#ffd700]">Champion</div>
                    </motion.div>
                    <div className="h-24 bg-gradient-to-t from-[#ffd700]/20 to-[#ffd700]/5 rounded-b-xl" />
                  </div>
                )}

                {/* 3rd Place */}
                {top3[2] && top3[2].user && (
                  <div className="flex-1 max-w-[160px]">
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="game-card p-3 text-center relative overflow-hidden"
                      style={{
                        background: "linear-gradient(180deg, rgba(205,127,50,0.2), rgba(205,127,50,0.05))",
                        borderColor: "#cd7f32",
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[#cd7f32]" />
                      <div className="text-3xl mb-1">{getAvatar(top3[2].user, 2)}</div>
                      <Medal className="w-5 h-5 text-[#cd7f32] mx-auto mb-1" />
                      <div className="font-game text-white text-xs truncate">{shortenAddress(top3[2].user)}</div>
                      <div className="text-lg font-numbers font-bold text-[#00ff88]">
                        {top3[2].netProfit >= 0 ? '+' : ''}${top3[2].netProfit.toFixed(0)}
                      </div>
                      <div className="text-[10px] text-gray-400">3rd Place</div>
                    </motion.div>
                    <div className="h-10 bg-gradient-to-t from-[#cd7f32]/20 to-[#cd7f32]/5 rounded-b-xl" />
                  </div>
                )}
              </motion.div>

              {/* Full Leaderboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="game-card overflow-hidden"
              >
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-white/5 border-b border-white/10 text-[10px] font-game text-gray-400">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-4">Player</div>
                  <div className="col-span-2 text-center">Win Rate</div>
                  <div className="col-span-2 text-center hidden md:block">Streak</div>
                  <div className="col-span-3 text-right">Profit</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/5">
                  {leaderboardData.slice(0, 10).map((player, index) => {
                    const style = getRankStyle(player.rank);
                    const RankIcon = getRankIcon(player.rank);
                    const winRate = player.totalBets > 0
                      ? Math.round((player.winCount / player.totalBets) * 100)
                      : 0;
                    const isCurrentUser = publicKey && player.user === publicKey.toString();

                    return (
                      <motion.div
                        key={player.publicKey}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className={`grid grid-cols-12 gap-2 px-4 py-4 items-center hover:bg-white/5 transition-colors group ${
                          player.rank <= 3 ? `bg-gradient-to-r ${style.bg}` : ""
                        } ${isCurrentUser ? "ring-1 ring-[#00f0ff]/50" : ""}`}
                      >
                        {/* Rank */}
                        <div className="col-span-1">
                          {player.rank <= 3 ? (
                            <motion.div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${style.border}40, ${style.border}20)`,
                                border: `2px solid ${style.border}`,
                                boxShadow: `0 0 10px ${style.glow}30`,
                              }}
                              whileHover={{ scale: 1.1 }}
                            >
                              <RankIcon className="w-4 h-4" style={{ color: style.border }} />
                            </motion.div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-numbers font-bold text-gray-400 text-sm">
                              {player.rank}
                            </div>
                          )}
                        </div>

                        {/* Player */}
                        <div className="col-span-4 flex items-center gap-2">
                          <div className="text-xl">{getAvatar(player.user, index)}</div>
                          <div>
                            <div className={`font-game text-xs group-hover:text-[#00f0ff] transition-colors ${isCurrentUser ? "text-[#00f0ff]" : "text-white"}`}>
                              {isCurrentUser ? "You" : shortenAddress(player.user)}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {player.totalBets} bets
                            </div>
                          </div>
                        </div>

                        {/* Win Rate */}
                        <div className="col-span-2 text-center">
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#00ff88]/10">
                            <Target className="w-3 h-3 text-[#00ff88]" />
                            <span className="font-numbers font-bold text-[#00ff88] text-xs">{winRate}%</span>
                          </div>
                        </div>

                        {/* Streak */}
                        <div className="col-span-2 text-center hidden md:block">
                          {player.currentStreak > 0 ? (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#ff8800]/10">
                              <Flame className="w-3 h-3 text-[#ff8800]" />
                              <span className="font-numbers font-bold text-[#ff8800] text-xs">{player.currentStreak}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">-</span>
                          )}
                        </div>

                        {/* Profit */}
                        <div className="col-span-3 text-right">
                          <div className={`text-lg font-numbers font-bold ${player.netProfit >= 0 ? "text-[#00ff88]" : "text-[#ff0044]"}`}>
                            {player.netProfit >= 0 ? '+' : ''}${player.netProfit.toFixed(2)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Your Position (if not in top 10) */}
                {userRank && userRank.rank > 10 && (
                  <div className="px-4 py-4 bg-gradient-to-r from-[#00f0ff]/10 to-[#ff00aa]/10 border-t border-[#00f0ff]/30">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-1">
                        <div className="w-8 h-8 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/50 flex items-center justify-center font-numbers font-bold text-[#00f0ff] text-sm">
                          {userRank.rank}
                        </div>
                      </div>
                      <div className="col-span-4 flex items-center gap-2">
                        <div className="text-xl">🎮</div>
                        <div>
                          <div className="font-game text-[#00f0ff] text-xs">You</div>
                          <div className="text-[10px] text-gray-500">{userRank.totalBets} bets</div>
                        </div>
                      </div>
                      <div className="col-span-2 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#00ff88]/10">
                          <Target className="w-3 h-3 text-[#00ff88]" />
                          <span className="font-numbers font-bold text-[#00ff88] text-xs">
                            {userRank.totalBets > 0 ? Math.round((userRank.winCount / userRank.totalBets) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2 text-center hidden md:block">
                        {userRank.currentStreak > 0 ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#ff8800]/10">
                            <Flame className="w-3 h-3 text-[#ff8800]" />
                            <span className="font-numbers font-bold text-[#ff8800] text-xs">{userRank.currentStreak}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                      <div className="col-span-3 text-right">
                        <div className={`text-lg font-numbers font-bold ${userRank.netProfit >= 0 ? "text-[#00ff88]" : "text-[#ff0044]"}`}>
                          {userRank.netProfit >= 0 ? '+' : ''}${userRank.netProfit.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Climb the Ranks CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 game-card p-6 text-center"
              >
                <Zap className="w-10 h-10 text-[#ffd700] mx-auto mb-3" />
                <h3 className="font-game text-xl text-white mb-2">Ready to Climb?</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Place more winning bets to rise up the leaderboard!
                </p>
                <Link href="/">
                  <motion.button
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffd700]/20 to-[#ff8800]/20 border border-[#ffd700]/30 text-[#ffd700] font-game text-sm hover:border-[#ffd700]/50 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Target className="w-4 h-4 inline mr-2" />
                    Start Betting
                  </motion.button>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
