"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Trophy, Crown, Medal, Star, Flame, TrendingUp, 
  ChevronDown, Zap, Target, Award, Shield
} from "lucide-react";

const TIME_FILTERS = [
  { id: "weekly", name: "This Week" },
  { id: "monthly", name: "This Month" },
  { id: "alltime", name: "All Time" },
];

const leaderboardData = [
  { rank: 1, name: "sigma.sol", avatar: "🦈", winRate: 94, earnings: 12450, streak: 8, level: 42, bets: 156 },
  { rank: 2, name: "chad.sol", avatar: "💪", winRate: 89, earnings: 9230, streak: 6, level: 38, bets: 134 },
  { rank: 3, name: "degen.sol", avatar: "🎲", winRate: 87, earnings: 7890, streak: 5, level: 35, bets: 198 },
  { rank: 4, name: "whale.sol", avatar: "🐋", winRate: 82, earnings: 6540, streak: 4, level: 31, bets: 89 },
  { rank: 5, name: "moon.sol", avatar: "🌙", winRate: 79, earnings: 5230, streak: 3, level: 28, bets: 112 },
  { rank: 6, name: "rocket.sol", avatar: "🚀", winRate: 77, earnings: 4890, streak: 2, level: 26, bets: 145 },
  { rank: 7, name: "diamond.sol", avatar: "💎", winRate: 75, earnings: 4120, streak: 0, level: 24, bets: 167 },
  { rank: 8, name: "ape.sol", avatar: "🦍", winRate: 73, earnings: 3650, streak: 1, level: 22, bets: 234 },
  { rank: 9, name: "bull.sol", avatar: "🐂", winRate: 71, earnings: 3200, streak: 0, level: 20, bets: 98 },
  { rank: 10, name: "ninja.sol", avatar: "🥷", winRate: 69, earnings: 2890, streak: 2, level: 19, bets: 76 },
];

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
  const [timeFilter, setTimeFilter] = useState("weekly");

  return (
    <div className="min-h-screen pt-24 pb-32 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Trophy className="w-20 h-20 text-[#ffd700]" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-game font-black mb-4">
            <span className="text-white">HALL OF </span>
            <span className="text-[#ffd700]">FAME</span>
          </h1>
          <p className="text-xl text-gray-400">
            The greatest predictors on Solana
          </p>
        </motion.div>

        {/* Time Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-2 mb-8"
        >
          {TIME_FILTERS.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => setTimeFilter(filter.id)}
              className={`px-6 py-3 rounded-xl font-game text-sm transition-all ${
                timeFilter === filter.id
                  ? "bg-[#ffd700] text-black"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {filter.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center items-end gap-4 mb-12 px-4"
        >
          {/* 2nd Place */}
          <div className="flex-1 max-w-[200px]">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="game-card p-4 text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(180deg, rgba(192,192,192,0.2), rgba(192,192,192,0.05))",
                borderColor: "#c0c0c0",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#c0c0c0]" />
              <div className="text-4xl mb-2">{leaderboardData[1].avatar}</div>
              <Medal className="w-6 h-6 text-[#c0c0c0] mx-auto mb-1" />
              <div className="font-game text-white text-sm truncate">{leaderboardData[1].name}</div>
              <div className="text-2xl font-numbers font-bold text-[#00ff88]">+${leaderboardData[1].earnings.toLocaleString()}</div>
              <div className="text-xs text-gray-400">2nd Place</div>
            </motion.div>
            <div className="h-20 bg-gradient-to-t from-[#c0c0c0]/20 to-[#c0c0c0]/5 rounded-b-xl" />
          </div>

          {/* 1st Place */}
          <div className="flex-1 max-w-[220px]">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="game-card p-6 text-center relative overflow-hidden"
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
              <div className="text-5xl mb-2">{leaderboardData[0].avatar}</div>
              <Crown className="w-8 h-8 text-[#ffd700] mx-auto mb-1" />
              <div className="font-game text-white truncate">{leaderboardData[0].name}</div>
              <div className="text-3xl font-numbers font-bold text-[#00ff88]">+${leaderboardData[0].earnings.toLocaleString()}</div>
              <div className="text-xs text-[#ffd700]">🏆 Champion</div>
            </motion.div>
            <div className="h-28 bg-gradient-to-t from-[#ffd700]/20 to-[#ffd700]/5 rounded-b-xl" />
          </div>

          {/* 3rd Place */}
          <div className="flex-1 max-w-[200px]">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="game-card p-4 text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(180deg, rgba(205,127,50,0.2), rgba(205,127,50,0.05))",
                borderColor: "#cd7f32",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#cd7f32]" />
              <div className="text-4xl mb-2">{leaderboardData[2].avatar}</div>
              <Medal className="w-6 h-6 text-[#cd7f32] mx-auto mb-1" />
              <div className="font-game text-white text-sm truncate">{leaderboardData[2].name}</div>
              <div className="text-2xl font-numbers font-bold text-[#00ff88]">+${leaderboardData[2].earnings.toLocaleString()}</div>
              <div className="text-xs text-gray-400">3rd Place</div>
            </motion.div>
            <div className="h-12 bg-gradient-to-t from-[#cd7f32]/20 to-[#cd7f32]/5 rounded-b-xl" />
          </div>
        </motion.div>

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="game-card overflow-hidden"
        >
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/5 border-b border-white/10 text-xs font-game text-gray-400">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-2 text-center">Win Rate</div>
            <div className="col-span-2 text-center hidden md:block">Streak</div>
            <div className="col-span-3 text-right">Earnings</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {leaderboardData.map((player, index) => {
              const style = getRankStyle(player.rank);
              const RankIcon = getRankIcon(player.rank);

              return (
                <motion.div
                  key={player.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className={`grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-white/5 transition-colors group ${
                    player.rank <= 3 ? `bg-gradient-to-r ${style.bg}` : ""
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1">
                    {player.rank <= 3 ? (
                      <motion.div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${style.border}40, ${style.border}20)`,
                          border: `2px solid ${style.border}`,
                          boxShadow: `0 0 15px ${style.glow}30`,
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <RankIcon className="w-5 h-5" style={{ color: style.border }} />
                      </motion.div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-numbers font-bold text-gray-400">
                        {player.rank}
                      </div>
                    )}
                  </div>

                  {/* Player */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="text-2xl">{player.avatar}</div>
                    <div>
                      <div className="font-game text-white group-hover:text-[#00f0ff] transition-colors">
                        {player.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Level {player.level} • {player.bets} bets
                      </div>
                    </div>
                  </div>

                  {/* Win Rate */}
                  <div className="col-span-2 text-center">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#00ff88]/10">
                      <Target className="w-3 h-3 text-[#00ff88]" />
                      <span className="font-numbers font-bold text-[#00ff88]">{player.winRate}%</span>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="col-span-2 text-center hidden md:block">
                    {player.streak > 0 ? (
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ff8800]/10">
                        <Flame className="w-3 h-3 text-[#ff8800]" />
                        <span className="font-numbers font-bold text-[#ff8800]">{player.streak}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </div>

                  {/* Earnings */}
                  <div className="col-span-3 text-right">
                    <div className="text-xl font-numbers font-bold text-[#00ff88]">
                      +${player.earnings.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Your Position */}
          <div className="px-6 py-5 bg-gradient-to-r from-[#00f0ff]/10 to-[#ff00aa]/10 border-t border-[#00f0ff]/30">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1">
                <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/20 border border-[#00f0ff]/50 flex items-center justify-center font-numbers font-bold text-[#00f0ff]">
                  42
                </div>
              </div>
              <div className="col-span-4 flex items-center gap-3">
                <div className="text-2xl">🎮</div>
                <div>
                  <div className="font-game text-[#00f0ff]">You</div>
                  <div className="text-xs text-gray-500">Level 12 • 23 bets</div>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#00ff88]/10">
                  <Target className="w-3 h-3 text-[#00ff88]" />
                  <span className="font-numbers font-bold text-[#00ff88]">68%</span>
                </div>
              </div>
              <div className="col-span-2 text-center hidden md:block">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ff8800]/10">
                  <Flame className="w-3 h-3 text-[#ff8800]" />
                  <span className="font-numbers font-bold text-[#ff8800]">2</span>
                </div>
              </div>
              <div className="col-span-3 text-right">
                <div className="text-xl font-numbers font-bold text-[#00ff88]">+$340</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Climb the Ranks CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 game-card p-8 text-center"
        >
          <Zap className="w-12 h-12 text-[#ffd700] mx-auto mb-4" />
          <h3 className="font-game text-2xl text-white mb-2">Ready to Climb?</h3>
          <p className="text-gray-400 mb-6">
            Place more winning bets to rise up the leaderboard!
          </p>
          <motion.button
            className="arcade-btn arcade-btn-primary px-8 py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Start Betting
            </span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
