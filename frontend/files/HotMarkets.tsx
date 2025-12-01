"use client";

import { motion } from "framer-motion";
import { MarketCard } from "../MarketCard";
import { ChevronRight, Flame, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

const MOCK_MARKETS = [
  {
    id: 1,
    question: "Will SOL hit $300 by Dec 20?",
    category: "Crypto",
    yesPrice: 35,
    noPrice: 65,
    volume: "$45,230",
    endsIn: "2 days",
    bettors: 342,
    trending: true,
  },
  {
    id: 2,
    question: "Will Jupiter reach 10M daily transactions?",
    category: "Crypto",
    yesPrice: 62,
    noPrice: 38,
    volume: "$38,450",
    endsIn: "5 days",
    bettors: 289,
    trending: true,
  },
  {
    id: 3,
    question: "Raydium vs Orca: Which DEX wins this week?",
    category: "Crypto",
    yesPrice: 48,
    noPrice: 52,
    volume: "$52,100",
    endsIn: "3 days",
    bettors: 456,
    trending: false,
  },
  {
    id: 4,
    question: "Will Bonk flip Dogecoin market cap?",
    category: "Meme",
    yesPrice: 12,
    noPrice: 88,
    volume: "$67,890",
    endsIn: "6 days",
    bettors: 523,
    trending: true,
  },
];

export function HotMarkets() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#ff8800]/5 via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame className="w-8 h-8 text-[#ff8800]" />
              </motion.div>
              <h2 className="text-3xl md:text-5xl font-game font-black">
                <span className="text-white">HOT</span>{" "}
                <span className="text-[#ff8800]">MARKETS</span>
              </h2>
            </div>
            <p className="text-gray-400 max-w-md">
              The most active predictions right now. Jump in before the odds shift!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff0044]/10 border border-[#ff0044]/30">
              <motion.div
                className="w-2 h-2 rounded-full bg-[#ff0044]"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-sm font-bold text-[#ff0044]">LIVE</span>
            </div>

            <Link href="/markets">
              <motion.button
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-game text-sm hover:bg-white/10 hover:border-[#00f0ff]/50 transition-all group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View All
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-6 mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5">
            <Zap className="w-4 h-4 text-[#ffd700]" />
            <span className="text-sm text-gray-400">
              <span className="text-white font-numbers font-bold">$1.2M</span> volume today
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5">
            <TrendingUp className="w-4 h-4 text-[#00ff88]" />
            <span className="text-sm text-gray-400">
              <span className="text-white font-numbers font-bold">3,421</span> players active
            </span>
          </div>
        </motion.div>

        {/* Markets Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {MOCK_MARKETS.map((market, index) => (
            <MarketCard key={market.id} {...market} delay={index * 0.1} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/markets">
            <motion.button
              className="arcade-btn arcade-btn-primary px-10 py-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-3">
                <Flame className="w-5 h-5" />
                Explore All Markets
                <ChevronRight className="w-5 h-5" />
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
