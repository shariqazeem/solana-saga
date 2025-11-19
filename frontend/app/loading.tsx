"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Target } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Animation */}
        <motion.div
          className="mb-8"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles className="w-20 h-20 text-emerald-400" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          SOLANA SAGA
        </motion.h1>

        {/* Loading Bar */}
        <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-emerald-600"
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "100%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Loading Text */}
        <motion.p
          className="text-slate-400 text-lg mb-8"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Loading markets...
        </motion.p>

        {/* Animated Icons */}
        <div className="flex items-center gap-6">
          <motion.div
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0,
            }}
          >
            <Target className="w-8 h-8 text-purple-400" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
          >
            <TrendingUp className="w-8 h-8 text-pink-400" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          >
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </motion.div>
        </div>

        {/* Fun Loading Messages */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <LoadingMessages />
        </motion.div>
      </div>

      {/* Particles */}
      <Particles />
    </div>
  );
}

function LoadingMessages() {
  const messages = [
    "Fetching prediction markets...",
    "Calculating odds...",
    "Loading the future...",
    "Summoning the oracles...",
    "Preparing your fortune...",
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <motion.p
      className="text-sm text-slate-500"
      key={randomMessage}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {randomMessage}
    </motion.p>
  );
}

function Particles() {
  return (
    <>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}
