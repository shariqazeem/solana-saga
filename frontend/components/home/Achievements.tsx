"use client";

import { motion } from "framer-motion";
import {
  Trophy, Target, Flame, Star, Zap, Crown,
  Medal, Award, TrendingUp, Clock, Shield, Gift
} from "lucide-react";
import { useSoundEffects } from "./useSoundEffects";

const achievements = [
  {
    id: 1,
    name: "First Blood",
    description: "Place your first bet",
    icon: Target,
    color: "#00ff88",
    progress: 100,
    unlocked: true,
    xp: 100,
  },
  {
    id: 2,
    name: "Hot Streak",
    description: "Win 5 bets in a row",
    icon: Flame,
    color: "#ff8800",
    progress: 60,
    unlocked: false,
    xp: 500,
  },
  {
    id: 3,
    name: "Big Spender",
    description: "Bet 1,000 USDC total",
    icon: TrendingUp,
    color: "#00f0ff",
    progress: 75,
    unlocked: false,
    xp: 300,
  },
  {
    id: 4,
    name: "Oracle",
    description: "Achieve 80% win rate (min 20 bets)",
    icon: Star,
    color: "#ffd700",
    progress: 40,
    unlocked: false,
    xp: 1000,
  },
  {
    id: 5,
    name: "Diamond Hands",
    description: "Hold a position for 7 days",
    icon: Shield,
    color: "#ff00aa",
    progress: 0,
    unlocked: false,
    xp: 250,
  },
  {
    id: 6,
    name: "Top 10",
    description: "Reach the top 10 leaderboard",
    icon: Crown,
    color: "#ffd700",
    progress: 0,
    unlocked: false,
    xp: 2000,
  },
];

const ranks = [
  { name: "Bronze", minXP: 0, color: "#cd7f32", icon: Medal },
  { name: "Silver", minXP: 1000, color: "#c0c0c0", icon: Medal },
  { name: "Gold", minXP: 5000, color: "#ffd700", icon: Trophy },
  { name: "Platinum", minXP: 15000, color: "#00f0ff", icon: Award },
  { name: "Diamond", minXP: 50000, color: "#ff00aa", icon: Crown },
];

export function Achievements() {
  const currentXP = 2450;
  const currentRank = ranks.find((r, i) => {
    const nextRank = ranks[i + 1];
    return currentXP >= r.minXP && (!nextRank || currentXP < nextRank.minXP);
  }) || ranks[0];
  const nextRank = ranks[ranks.indexOf(currentRank) + 1];
  const progressToNext = nextRank
    ? ((currentXP - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100
    : 100;

  const { playClick } = useSoundEffects();

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ffd700]/5 to-transparent" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ffd700]/20 to-[#ff8800]/20 mb-6 border border-[#ffd700]/30 shadow-[0_0_30px_rgba(255,215,0,0.2)]"
          >
            <Trophy className="w-10 h-10 text-[#ffd700]" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-game font-black mb-4 tracking-tighter">
            LEVEL UP YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] to-[#ff8800] drop-shadow-lg">GAME</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            Unlock achievements, earn XP, and climb the ranks
          </p>
        </motion.div>

        {/* Rank Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="holo-card p-8 mb-12 max-w-2xl mx-auto rounded-2xl border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${currentRank.color}20, ${currentRank.color}40)`,
                  border: `2px solid ${currentRank.color}60`,
                  boxShadow: `0 0 30px ${currentRank.color}30`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 20px ${currentRank.color}20`,
                    `0 0 40px ${currentRank.color}40`,
                    `0 0 20px ${currentRank.color}20`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
                <currentRank.icon className="w-8 h-8 relative z-10" style={{ color: currentRank.color }} />
              </motion.div>
              <div>
                <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider">Current Rank</div>
                <div className="text-2xl font-game font-bold drop-shadow-lg" style={{ color: currentRank.color }}>
                  {currentRank.name}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider">Total XP</div>
              <div className="text-3xl font-numbers font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {currentXP.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {nextRank && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress to {nextRank.name}</span>
                <span className="font-numbers font-bold" style={{ color: nextRank.color }}>
                  {currentXP.toLocaleString()} / {nextRank.minXP.toLocaleString()} XP
                </span>
              </div>
              <div className="h-4 rounded-full bg-black/50 overflow-hidden border border-white/5">
                <motion.div
                  className="h-full rounded-full relative"
                  style={{
                    background: `linear-gradient(90deg, ${currentRank.color}, ${nextRank.color})`,
                  }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progressToNext}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    }}
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`holo-card p-6 relative overflow-hidden group rounded-xl border border-white/10 ${!achievement.unlocked ? "opacity-70" : ""
                }`}
            >
              {/* Unlocked Glow */}
              {achievement.unlocked && (
                <motion.div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `radial-gradient(circle at center, ${achievement.color}, transparent 70%)`,
                  }}
                  animate={{
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center ${achievement.unlocked
                        ? ""
                        : "grayscale"
                      }`}
                    style={{
                      background: `linear-gradient(135deg, ${achievement.color}20, ${achievement.color}40)`,
                      border: `2px solid ${achievement.color}${achievement.unlocked ? "60" : "30"}`,
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <achievement.icon
                      className="w-7 h-7"
                      style={{ color: achievement.unlocked ? achievement.color : "#666" }}
                    />
                  </motion.div>

                  {achievement.unlocked ? (
                    <div className="px-3 py-1 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/30 shadow-[0_0_10px_rgba(0,255,136,0.2)]">
                      <span className="text-xs font-bold text-[#00ff88] tracking-wider">UNLOCKED</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      <span className="text-xs font-numbers text-gray-400">{achievement.progress}%</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-game font-bold text-white mb-1 group-hover:text-[#00f0ff] transition-colors">
                  {achievement.name}
                </h3>
                <p className="text-sm text-gray-400 mb-4 font-light">
                  {achievement.description}
                </p>

                {/* Progress Bar */}
                {!achievement.unlocked && (
                  <div className="h-2 rounded-full bg-black/50 overflow-hidden mb-3 border border-white/5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: achievement.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${achievement.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                )}

                {/* XP Reward */}
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#ffd700]" />
                  <span className="text-sm font-numbers font-bold text-[#ffd700] drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">
                    +{achievement.xp} XP
                  </span>
                </div>
              </div>

              {/* Locked Overlay */}
              {!achievement.unlocked && achievement.progress === 0 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-400 font-game uppercase tracking-wider">Locked</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-game text-sm hover:bg-white/10 hover:border-[#00f0ff]/50 transition-all hover:scale-105 active:scale-95"
            onClick={playClick}
          >
            View All Achievements
          </button>
        </motion.div>
      </div>
    </section>
  );
}
