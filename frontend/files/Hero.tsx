"use client";

import { motion, useAnimation } from "framer-motion";
import { Rocket, Zap, Trophy, Target, Flame, Star, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Animated counter component
function AnimatedCounter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="font-numbers">
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

// Floating particle
function FloatingParticle({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{
        left: `${x}%`,
        background: `hsl(${Math.random() * 60 + 160}, 100%, 50%)`,
        boxShadow: `0 0 10px hsl(${Math.random() * 60 + 160}, 100%, 50%)`,
      }}
      initial={{ y: "100vh", opacity: 0 }}
      animate={{ 
        y: "-100vh", 
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.3} x={Math.random() * 100} />
        ))}
      </div>

      {/* Glowing Orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #00ff88 0%, transparent 70%)",
          left: "10%",
          top: "20%",
          filter: "blur(60px)",
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #00f0ff 0%, transparent 70%)",
          right: "10%",
          bottom: "20%",
          filter: "blur(60px)",
          x: -mousePosition.x,
          y: -mousePosition.y,
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #ff00aa 0%, transparent 70%)",
          left: "50%",
          top: "10%",
          filter: "blur(80px)",
          transform: "translateX(-50%)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        {/* Live Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-[#00ff88]/30">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00ff88]"></span>
            </span>
            <span className="text-[#00ff88] font-game text-sm tracking-wider">LIVE ON SOLANA</span>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-white/70 font-numbers text-sm">
              <AnimatedCounter value={247} /> Active Markets
            </span>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-game font-black mb-6 leading-none">
            <motion.span 
              className="block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              animate={{ 
                textShadow: [
                  "0 0 30px rgba(255,255,255,0.3)",
                  "0 0 60px rgba(255,255,255,0.5)",
                  "0 0 30px rgba(255,255,255,0.3)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              PREDICT
            </motion.span>
            <motion.span 
              className="block text-transparent bg-clip-text animate-gradient"
              style={{
                backgroundImage: "linear-gradient(135deg, #00ff88, #00f0ff, #ff00aa, #00ff88)",
                backgroundSize: "300% 300%",
              }}
            >
              WIN BIG
            </motion.span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          The most <span className="text-[#00ff88] font-bold">addictive</span> prediction game on Solana.
          <br />
          <span className="text-white/60">Bet on crypto, sports, and culture. Win real money.</span>
        </motion.p>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-8 mb-12"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-numbers font-bold text-white mb-1">
              $<AnimatedCounter value={1200000} suffix="" />
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Total Volume</div>
          </div>
          <div className="h-12 w-px bg-white/10 hidden md:block" />
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-numbers font-bold text-[#00ff88] mb-1">
              <AnimatedCounter value={12543} />
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Players</div>
          </div>
          <div className="h-12 w-px bg-white/10 hidden md:block" />
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-numbers font-bold text-[#ffd700] mb-1">
              $<AnimatedCounter value={850000} />
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Paid Out</div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link href="/markets">
            <motion.button
              className="arcade-btn arcade-btn-primary text-lg px-10 py-5 flex items-center gap-3 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Rocket className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
              START PLAYING
              <Zap className="w-5 h-5 animate-pulse" />
            </motion.button>
          </Link>

          <Link href="/leaderboard">
            <motion.button
              className="px-10 py-5 rounded-lg bg-white/5 border border-white/20 text-white font-game text-lg 
                         hover:bg-white/10 hover:border-[#00f0ff]/50 transition-all flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trophy className="w-5 h-5 text-[#ffd700]" />
              LEADERBOARD
            </motion.button>
          </Link>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {[
            { icon: Zap, text: "Instant Payouts", color: "#00f0ff" },
            { icon: Target, text: "Live Odds", color: "#ff00aa" },
            { icon: Flame, text: "Hot Markets", color: "#ff8800" },
            { icon: Star, text: "Win Streaks", color: "#ffd700" },
          ].map((feature, i) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10
                         hover:border-white/30 transition-all cursor-default"
            >
              <feature.icon className="w-4 h-4" style={{ color: feature.color }} />
              <span className="text-sm text-gray-300">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-gray-400"
          >
            <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
    </section>
  );
}
