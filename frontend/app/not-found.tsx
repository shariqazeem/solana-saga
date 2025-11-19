"use client";

import { motion } from "framer-motion";
import { Sparkles, Home, Search, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Animation */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-20 h-20 text-emerald-400" />
              </motion.div>
            </div>

            <h1 className="text-9xl md:text-[200px] font-black bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent leading-none mb-4">
              404
            </h1>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Page Not Found
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Looks like this prediction didn't come true. The page you're looking for has vanished into the void.
            </p>
          </motion.div>

          {/* Fun Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12"
          >
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="text-3xl font-black text-red-400 mb-1">0%</div>
              <div className="text-sm text-slate-400">Chance this page exists</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="text-3xl font-black text-purple-400 mb-1">404</div>
              <div className="text-sm text-slate-400">Error code</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="text-3xl font-black text-emerald-400 mb-1">100%</div>
              <div className="text-sm text-slate-400">You should go back</div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-purple-500/50 flex items-center gap-2 w-full sm:w-auto">
                <Home className="w-5 h-5" />
                Back to Home
              </button>
            </Link>

            <Link href="/markets">
              <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold transition-all flex items-center gap-2 w-full sm:w-auto">
                <TrendingUp className="w-5 h-5" />
                Browse Markets
              </button>
            </Link>
          </motion.div>

          {/* Fun Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-12"
          >
            <p className="text-slate-500 text-sm">
              Pro tip: While you're lost, why not check out our{" "}
              <Link href="/leaderboard" className="text-emerald-400 hover:text-emerald-300 underline">
                leaderboard
              </Link>{" "}
              to see who's dominating?
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 text-6xl opacity-20"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        ?
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-6xl opacity-20"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        !
      </motion.div>
    </div>
  );
}
