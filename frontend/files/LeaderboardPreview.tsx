"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Flame, TrendingUp, ChevronRight, Star } from "lucide-react";
import Link from "next/link";

const leaders = [
  { 
    rank: 1, 
    name: "sigma.sol", 
    avatar: "🦈",
    winRate: 94, 
    earnings: 12450, 
    streak: 8,
    level: 42,
  },
  { 
    rank: 2, 
    name: "chad.sol", 
    avatar: "💪",
    winRate: 89, 
    earnings: 9230, 
    streak: 6,
    level: 38,
  },
  { 
    rank: 3, 
    name: "degen.sol", 
    avatar: "🎲",
    winRate: 87, 
    earnings: 7890, 
    streak: 5,
    level: 35,
  },
  { 
    rank: 4, 
    name: "whale.sol", 
    avatar: "🐋",
    winRate: 82, 
    earnings: 6540, 
    streak: 4,
    level: 31,
  },
  { 
    rank: 5, 
    name: "moon.sol", 
    avatar: "🌙",
    winRate: 79, 
    earnings: 5230, 
    streak: 3,
    level: 28,
  },
];

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1: return { bg: "#ffd700", text: "#000" };
    case 2: return { bg: "#c0c0c0", text: "#000" };
    case 3: return { bg: "#cd7f32", text: "#fff" };
    default: return { bg: "#333", text: "#fff" };
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

export function LeaderboardPreview() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ffd700]/5 to-transparent" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Trophy className="w-16 h-16 text-[#ffd700] mb-6" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-game font-black mb-4">
            TOP <span className="text-[#ffd700]">PREDICTORS</span>
          </h2>
          <p className="text-xl text-gray-400">
            The best of the best. Can you beat them?
          </p>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="game-card overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-white/5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-game text-sm text-gray-400">THIS WEEK'S CHAMPIONS</span>
              <div className="flex items-center gap-2 text-xs text-[#ffd700]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-4 h-4" />
                </motion.div>
                <span>Updated live</span>
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {leaders.map((leader, index) => {
              const rankStyle = getRankColor(leader.rank);
              const RankIcon = getRankIcon(leader.rank);

              return (
                <motion.div
                  key={leader.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-6 hover:bg-white/5 transition-colors group"
                >
                  {/* Rank */}
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-numbers font-black text-lg relative"
                    style={{
                      background: leader.rank <= 3 
                        ? `linear-gradient(135deg, ${rankStyle.bg}, ${rankStyle.bg}80)`
                        : "rgba(255,255,255,0.1)",
                      color: rankStyle.text,
                      boxShadow: leader.rank <= 3 ? `0 0 20px ${rankStyle.bg}40` : "none",
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {leader.rank <= 3 ? (
                      <RankIcon className="w-6 h-6" />
                    ) : (
                      `#${leader.rank}`
                    )}
                  </motion.div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-3xl">{leader.avatar}</div>
                    <div>
                      <div className="font-game font-bold text-white group-hover:text-[#00f0ff] transition-colors">
                        {leader.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Level {leader.level}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6">
                    {/* Win Rate */}
                    <div className="text-center">
                      <div className="text-lg font-numbers font-bold text-[#00ff88]">
                        {leader.winRate}%
                      </div>
                      <div className="text-xs text-gray-500">Win Rate</div>
                    </div>

                    {/* Streak */}
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center text-lg font-numbers font-bold text-[#ff8800]">
                        <Flame className="w-4 h-4" />
                        {leader.streak}
                      </div>
                      <div className="text-xs text-gray-500">Streak</div>
                    </div>
                  </div>

                  {/* Earnings */}
                  <div className="text-right">
                    <div className="text-xl font-numbers font-black text-[#00ff88]">
                      +${leader.earnings.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">This Week</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white/5 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Your rank: <span className="text-white font-bold">#42</span>
              </div>
              <Link href="/leaderboard">
                <motion.button
                  className="flex items-center gap-2 text-[#00f0ff] font-game text-sm hover:text-white transition-colors group"
                  whileHover={{ x: 5 }}
                >
                  View Full Leaderboard
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Your Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 game-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-[#ff00aa]/20 flex items-center justify-center border border-[#00f0ff]/30">
                <span className="text-2xl">🎮</span>
              </div>
              <div>
                <div className="font-game text-white">Ready to climb?</div>
                <div className="text-sm text-gray-400">Connect wallet to track your rank</div>
              </div>
            </div>
            <motion.button
              className="arcade-btn arcade-btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Playing
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
