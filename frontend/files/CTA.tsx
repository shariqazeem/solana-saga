"use client";

import { motion } from "framer-motion";
import { Rocket, Zap, Trophy, Star, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Epic Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, transparent 60%)",
            left: "10%",
            top: "20%",
            filter: "blur(80px)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 60%)",
            right: "10%",
            bottom: "20%",
            filter: "blur(80px)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 0, 170, 0.15) 0%, transparent 60%)",
            left: "40%",
            top: "10%",
            filter: "blur(100px)",
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="game-card p-12 md:p-20 text-center relative overflow-hidden"
        >
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-2xl p-[2px] overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, #00ff88, #00f0ff, #ff00aa, #ffd700, #00ff88)",
                backgroundSize: "200% 100%",
              }}
              animate={{
                backgroundPosition: ["0% 0%", "200% 0%"],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          {/* Inner Content */}
          <div className="relative bg-[#0a0a0f] rounded-xl p-8 md:p-16">
            {/* Floating Icons */}
            <motion.div
              className="absolute top-8 left-8"
              animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Star className="w-8 h-8 text-[#ffd700]/30" />
            </motion.div>
            <motion.div
              className="absolute top-8 right-8"
              animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Trophy className="w-8 h-8 text-[#ff00aa]/30" />
            </motion.div>
            <motion.div
              className="absolute bottom-8 left-8"
              animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              <Zap className="w-8 h-8 text-[#00f0ff]/30" />
            </motion.div>
            <motion.div
              className="absolute bottom-8 right-8"
              animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Sparkles className="w-8 h-8 text-[#00ff88]/30" />
            </motion.div>

            {/* Main Icon */}
            <motion.div
              className="mb-8"
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-[#00ff88] blur-2xl opacity-30" />
                <Rocket className="w-20 h-20 text-[#00ff88] relative z-10" />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h2
              className="text-4xl md:text-7xl font-game font-black mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-white">READY TO</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#00f0ff] to-[#ff00aa]">
                DOMINATE?
              </span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Join <span className="text-[#00ff88] font-bold">12,500+</span> predictors winning real money.
              <br />
              <span className="text-gray-400">The future belongs to those who predict it.</span>
            </motion.p>

            {/* Stats Row */}
            <motion.div
              className="flex flex-wrap justify-center gap-8 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-center">
                <div className="text-3xl font-numbers font-bold text-[#ffd700]">$850K+</div>
                <div className="text-sm text-gray-400">Paid Out</div>
              </div>
              <div className="h-12 w-px bg-white/10 hidden md:block" />
              <div className="text-center">
                <div className="text-3xl font-numbers font-bold text-[#00f0ff]">247</div>
                <div className="text-sm text-gray-400">Live Markets</div>
              </div>
              <div className="h-12 w-px bg-white/10 hidden md:block" />
              <div className="text-center">
                <div className="text-3xl font-numbers font-bold text-[#ff00aa]">~400ms</div>
                <div className="text-sm text-gray-400">Execution</div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/markets">
                <motion.button
                  className="relative inline-flex items-center gap-3 px-12 py-6 rounded-xl font-game text-xl text-black overflow-hidden group"
                  style={{
                    background: "linear-gradient(135deg, #00ff88, #00f0ff)",
                    boxShadow: "0 0 40px rgba(0, 255, 136, 0.4)",
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 60px rgba(0, 255, 136, 0.6)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Shine Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  
                  <Rocket className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                  <span className="relative z-10">START WINNING NOW</span>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust Badge */}
            <motion.div
              className="mt-8 flex items-center justify-center gap-2 text-gray-500"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Zap className="w-4 h-4 text-[#00f0ff]" />
              <span className="text-sm">Powered by Solana • Instant settlements • 2% fees only on wins</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
