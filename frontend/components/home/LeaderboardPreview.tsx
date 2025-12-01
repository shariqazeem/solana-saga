"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Flame, TrendingUp, ChevronRight, Star, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSoundEffects } from "./useSoundEffects";

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
  const { playClick } = useSoundEffects();

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ffd700]/5 to-transparent" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex relative"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 bg-[#ffd700] blur-2xl opacity-20 animate-pulse" />
            <Trophy className="w-16 h-16 text-[#ffd700] mb-6 relative z-10 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-[#ffd700]" />
            </motion.div>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-game font-black mb-4 tracking-tighter">
            TOP <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] to-[#ff8800] drop-shadow-lg">PREDICTORS</span>
          </h2>
          <p className="text-xl text-gray-400 font-light">
            The best of the best. Can you beat them?
          </p>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="holo-card rounded-2xl overflow-hidden border border-white/10"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-white/5 border-b border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="font-game text-sm text-gray-400 tracking-wider">THIS WEEK'S CHAMPIONS</span>
              <div className="flex items-center gap-2 text-xs text-[#ffd700] font-bold">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-4 h-4" />
                </motion.div>
                <span>UPDATED LIVE</span>
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
                  className="flex items-center gap-4 p-6 hover:bg-white/5 transition-colors group relative overflow-hidden"
                >
                  {/* Hover Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ffd700]/0 via-[#ffd700]/5 to-[#ffd700]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                  {/* Rank */}
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-numbers font-black text-lg relative z-10"
                    style={{
                      background: leader.rank <= 3
                        ? `linear-gradient(135deg, ${rankStyle.bg}, ${rankStyle.bg}80)`
                        : "rgba(255,255,255,0.1)",
                      color: rankStyle.text,
                      boxShadow: leader.rank <= 3 ? `0 0 20px ${rankStyle.bg}40` : "none",
                      border: leader.rank <= 3 ? `1px solid ${rankStyle.bg}` : "1px solid rgba(255,255,255,0.1)",
                    }}
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  >
                    {leader.rank <= 3 ? (
                      <RankIcon className="w-6 h-6" />
                    ) : (
                      `#${leader.rank}`
                    )}
                  </motion.div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
                    <div className="text-3xl filter drop-shadow-lg">{leader.avatar}</div>
                    <div>
                      <div className="font-game font-bold text-white group-hover:text-[#00f0ff] transition-colors flex items-center gap-2">
                        {leader.name}
                        {leader.rank === 1 && <Crown className="w-3 h-3 text-[#ffd700]" />}
                      </div>
                      <div className="text-xs text-gray-500 font-numbers">
                        Level {leader.level}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-8 relative z-10">
                    {/* Win Rate */}
                    <div className="text-center">
                      <div className="text-lg font-numbers font-bold text-[#00ff88] drop-shadow-[0_0_5px_rgba(0,255,136,0.5)]">
                        {leader.winRate}%
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">Win Rate</div>
                    </div>

                    {/* Streak */}
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center text-lg font-numbers font-bold text-[#ff8800] drop-shadow-[0_0_5px_rgba(255,136,0,0.5)]">
                        <Flame className="w-4 h-4" />
                        {leader.streak}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">Streak</div>
                    </div>
                  </div>

                  {/* Earnings */}
                  <div className="text-right relative z-10">
                    <div className="text-xl font-numbers font-black text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">
                      +${leader.earnings.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">This Week</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white/5 border-t border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Your rank: <span className="text-white font-bold font-numbers">#42</span>
              </div>
              <Link href="/leaderboard" onClick={playClick}>
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
          className="mt-6 holo-card p-6 rounded-2xl border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-[#ff00aa]/20 flex items-center justify-center border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                <span className="text-2xl">🎮</span>
              </div>
              <div>
                <div className="font-game text-white tracking-wide">Ready to climb?</div>
                <div className="text-sm text-gray-400">Connect wallet to track your rank</div>
              </div>
            </div>
            <motion.button
              className="arcade-btn arcade-btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={playClick}
            >
              Start Playing
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
