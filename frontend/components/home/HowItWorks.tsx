"use client";

import { motion } from "framer-motion";
import { Search, Target, Zap, Trophy, ArrowRight, ChevronRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Find Your Battle",
    description: "Browse trending markets across crypto, sports, memes, and more. Find predictions that match your expertise.",
    icon: Search,
    color: "#00f0ff",
    hint: "Pro tip: Hot markets have higher volume!",
  },
  {
    number: "02",
    title: "Pick Your Side",
    description: "Will it happen? YES or NO. Check the odds, analyze the situation, and make your prediction.",
    icon: Target,
    color: "#ff00aa",
    hint: "Early predictors often get better odds!",
  },
  {
    number: "03",
    title: "Make Your Move",
    description: "Connect your wallet, choose your stake, and execute instantly. Solana means no waiting around.",
    icon: Zap,
    color: "#00ff88",
    hint: "Start small, learn the game!",
  },
  {
    number: "04",
    title: "Claim Victory",
    description: "When the market resolves, winners get paid automatically. Collect your rewards and level up!",
    icon: Trophy,
    color: "#ffd700",
    hint: "Win streaks earn bonus XP!",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <span className="font-pixel text-xs text-[#00ff88]">NEW PLAYER?</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-game font-black mb-6">
            HOW TO <span className="text-[#00f0ff]">PLAY</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Four simple steps to becoming a prediction master
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00f0ff]/20 to-transparent -translate-y-1/2" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative group"
              >
                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-20 -translate-y-1/2">
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ChevronRight className="w-6 h-6 text-[#00f0ff]/30" />
                    </motion.div>
                  </div>
                )}

                <div className="game-card p-6 h-full relative overflow-hidden">
                  {/* Step Number */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-24 h-24 flex items-center justify-center opacity-10"
                    style={{ color: step.color }}
                  >
                    <span className="text-7xl font-game font-black">{step.number}</span>
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className="relative z-10 w-16 h-16 rounded-2xl mb-6 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                      border: `2px solid ${step.color}40`,
                      boxShadow: `0 0 30px ${step.color}20`,
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <step.icon className="w-8 h-8" style={{ color: step.color }} />
                    
                    {/* Pulse Ring */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2"
                      style={{ borderColor: step.color }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="font-numbers text-sm font-bold"
                        style={{ color: step.color }}
                      >
                        STEP {step.number}
                      </span>
                    </div>
                    <h3 className="text-xl font-game font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* Hint Box */}
                    <div 
                      className="px-3 py-2 rounded-lg text-xs"
                      style={{
                        background: `${step.color}10`,
                        border: `1px solid ${step.color}20`,
                        color: step.color,
                      }}
                    >
                      💡 {step.hint}
                    </div>
                  </div>

                  {/* Bottom Progress Indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <motion.div
                      className="h-full"
                      style={{ background: step.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${((index + 1) / steps.length) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#00f0ff]/10 to-[#ff00aa]/10 border border-[#00f0ff]/30 text-white font-game hover:from-[#00f0ff]/20 hover:to-[#ff00aa]/20 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Ready to Start?</span>
            <ArrowRight className="w-5 h-5 text-[#00f0ff]" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
