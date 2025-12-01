"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Rocket, Zap, Trophy, Target, Flame, Star, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useSoundEffects } from "./useSoundEffects";

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

// 3D Floating particle
function FloatingParticle({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full mix-blend-screen"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: `hsl(${Math.random() * 60 + 160}, 100%, 70%)`,
        boxShadow: `0 0 ${size * 2}px hsl(${Math.random() * 60 + 160}, 100%, 50%)`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        y: [0, -100, 0],
        x: [0, Math.random() * 50 - 25, 0],
        scale: [0, 1, 0],
        opacity: [0, 0.8, 0],
      }}
      transition={{
        duration: 5 + Math.random() * 5,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const { playClick, playSuccess } = useSoundEffects();

  const springConfig = { damping: 25, stiffness: 120 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 40;
      const y = (clientY / innerHeight - 0.5) * 40;

      setMousePosition({ x, y });
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden perspective-1000">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-cyber-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/50 to-[#0a0a0f]" />

      {/* Scanlines */}
      <div className="scanlines" />

      {/* 3D Particle System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.2}
            x={Math.random() * 100}
            y={Math.random() * 100}
            size={Math.random() * 4 + 2}
          />
        ))}
      </div>

      {/* Dynamic Glowing Orbs */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-15 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, #00ff88 0%, transparent 70%)",
          left: "5%",
          top: "10%",
          filter: "blur(80px)",
          x: mouseX,
          y: mouseY,
        }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-15 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, #00f0ff 0%, transparent 70%)",
          right: "5%",
          bottom: "10%",
          filter: "blur(80px)",
          x: useTransform(mouseX, (val) => -val),
          y: useTransform(mouseY, (val) => -val),
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        {/* Live Badge */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-12 inline-block"
        >
          <div className="relative group cursor-default">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00ff88] to-[#00f0ff] rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center gap-4 px-8 py-3 rounded-full bg-black/60 backdrop-blur-xl border border-[#00ff88]/30 ring-1 ring-white/10">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00ff88]"></span>
              </span>
              <span className="text-[#00ff88] font-game text-sm tracking-[0.2em] animate-pulse">LIVE PROTOCOL</span>
              <div className="w-px h-4 bg-white/20" />
              <span className="text-white/90 font-numbers text-sm flex items-center gap-2">
                <Zap className="w-3 h-3 text-[#ffd700]" />
                <AnimatedCounter value={247} /> MARKETS ACTIVE
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Title with Glitch Effect */}
        <motion.div
          style={{ y: y2 }}
          className="relative mb-8"
        >
          <h1 className="text-7xl md:text-9xl font-game font-black leading-none tracking-tighter">
            <div className="relative inline-block group">
              <span className="absolute -inset-2 bg-[#00ff88] blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <span className="relative block text-white mix-blend-overlay animate-glitch" data-text="PREDICT">
                PREDICT
              </span>
              <span className="absolute top-0 left-0 text-[#00ff88] opacity-50 animate-glitch" style={{ clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)", transform: "translate(-2px)" }}>
                PREDICT
              </span>
              <span className="absolute top-0 left-0 text-[#ff00aa] opacity-50 animate-glitch" style={{ clipPath: "polygon(0 80%, 100% 20%, 100% 100%, 0 100%)", transform: "translate(2px)" }}>
                PREDICT
              </span>
            </div>
            <br />
            <span
              className="block text-transparent bg-clip-text animate-gradient mt-2"
              style={{
                backgroundImage: "linear-gradient(135deg, #00ff88, #00f0ff, #ff00aa, #00ff88)",
                backgroundSize: "300% 300%",
                filter: "drop-shadow(0 0 20px rgba(0,240,255,0.3))"
              }}
            >
              WIN BIG
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed font-light"
        >
          The most <span className="text-[#00ff88] font-bold font-game">addictive</span> prediction market on Solana.
          <br />
          <span className="text-white/60">Bet on crypto, sports, and culture. Win real money.</span>
        </motion.p>

        {/* Stats Row - Holographic Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 mb-16"
        >
          {[
            { label: "Total Volume", value: 1200000, prefix: "$", color: "#00f0ff" },
            { label: "Active Players", value: 12543, prefix: "", color: "#00ff88" },
            { label: "Total Paid Out", value: 850000, prefix: "$", color: "#ffd700" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -5, scale: 1.02 }}
              className="holo-card px-8 py-6 rounded-2xl min-w-[200px]"
            >
              <div className="text-3xl md:text-4xl font-numbers font-bold text-white mb-1" style={{ textShadow: `0 0 20px ${stat.color}` }}>
                {stat.prefix}<AnimatedCounter value={stat.value} />
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-[0.2em] font-game">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
        >
          <Link href="/markets">
            <motion.button
              className="relative group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={playClick}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00ff88] to-[#00f0ff] rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-200" />
              <div className="relative px-12 py-6 bg-black rounded-xl border border-white/10 flex items-center gap-4">
                <Rocket className="w-6 h-6 text-[#00ff88] group-hover:-translate-y-1 transition-transform" />
                <span className="font-game text-xl text-white tracking-wider">START PLAYING</span>
                <Zap className="w-5 h-5 text-[#ffd700] animate-pulse" />
              </div>
            </motion.button>
          </Link>

          <Link href="/leaderboard">
            <motion.button
              className="px-10 py-6 rounded-xl bg-white/5 border border-white/10 text-white font-game text-lg 
                         hover:bg-white/10 hover:border-[#00f0ff]/50 transition-all flex items-center gap-3 backdrop-blur-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={playClick}
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
              whileHover={{ scale: 1.05, borderColor: feature.color }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10
                         hover:bg-white/10 transition-all cursor-default backdrop-blur-sm"
            >
              <feature.icon className="w-4 h-4" style={{ color: feature.color }} />
              <span className="text-sm text-gray-300 font-medium">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-gray-500"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-game">Scroll to explore</span>
            <ChevronDown className="w-5 h-5 text-[#00ff88]" />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
    </section>
  );
}
