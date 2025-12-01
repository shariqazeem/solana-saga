"use client";

import { motion } from "framer-motion";
import { 
  Zap, Trophy, Shield, Flame, Star, Globe, 
  Clock, TrendingUp, Users, Gamepad2, Gift, Lock 
} from "lucide-react";

const features = [
  {
    title: "Lightning Speed",
    description: "Solana's 400ms blocks mean your bets execute instantly. No waiting, no lag, pure action.",
    icon: Zap,
    color: "#00f0ff",
    gradient: "from-[#00f0ff] to-[#0088ff]",
  },
  {
    title: "Compete & Win",
    description: "Climb the leaderboards. Unlock achievements. Build your winning streak. Show everyone who's boss.",
    icon: Trophy,
    color: "#ffd700",
    gradient: "from-[#ffd700] to-[#ff8800]",
  },
  {
    title: "Real Money",
    description: "Bet with USDC, win real money. Only 2% fee on winnings. The rest is all yours.",
    icon: Gift,
    color: "#00ff88",
    gradient: "from-[#00ff88] to-[#00cc66]",
  },
  {
    title: "Trustless",
    description: "Smart contracts handle everything. No middleman, no BS. Fully transparent and verifiable.",
    icon: Shield,
    color: "#ff00aa",
    gradient: "from-[#ff00aa] to-[#ff0066]",
  },
  {
    title: "Live Odds",
    description: "Watch prices update in real-time as others bet. AMM-powered fair pricing that never sleeps.",
    icon: TrendingUp,
    color: "#ff8800",
    gradient: "from-[#ff8800] to-[#ff4400]",
  },
  {
    title: "Play to Earn",
    description: "Earn XP, level up your profile, unlock exclusive badges. The more you play, the more you gain.",
    icon: Gamepad2,
    color: "#aa00ff",
    gradient: "from-[#aa00ff] to-[#ff00aa]",
  },
];

export function Features() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00f0ff]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ff00aa]/5 rounded-full blur-[100px]" />
      
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Star className="w-4 h-4 text-[#ffd700]" />
            <span className="text-sm font-game text-gray-300">WHY PLAYERS LOVE US</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-game font-black mb-6">
            BUILT FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#ff00aa]">WINNERS</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Every feature designed to give you the edge. This isn't your grandma's prediction market.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="game-card p-8 h-full relative overflow-hidden">
                {/* Hover Glow */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at top left, ${feature.color}15, transparent 60%)`,
                  }}
                />

                {/* Icon */}
                <motion.div
                  className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-6`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="w-full h-full rounded-xl bg-[#0a0a0f] flex items-center justify-center">
                    <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                  </div>
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-game font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text transition-all"
                    style={{ 
                      backgroundImage: `linear-gradient(135deg, white, ${feature.color})`,
                      WebkitBackgroundClip: "text",
                    }}>
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom Accent */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
                  initial={{ scaleX: 0, originX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                />

                {/* Corner Decoration */}
                <div 
                  className="absolute top-0 right-0 w-20 h-20 opacity-10"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}, transparent)`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-6">
            Ready to experience the difference?
          </p>
          <motion.button
            className="arcade-btn arcade-btn-primary text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              Start Playing Now
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
