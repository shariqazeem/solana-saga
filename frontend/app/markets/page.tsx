"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, Clock, Users, DollarSign, Filter, Search,
  Flame, Star, Zap, ArrowLeft, Target, ChevronRight
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { MarketCard } from "@/components/MarketCard";

// Mock data for demo
const MOCK_MARKETS = [
  {
    id: 1,
    question: "Will SOL hit $300 by Dec 20?",
    category: "Price",
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
    category: "Volume",
    yesPrice: 62,
    noPrice: 38,
    volume: "$38,450",
    endsIn: "5 days",
    bettors: 289,
    trending: true,
  },
  {
    id: 3,
    question: "Raydium or Orca: which DEX wins this week?",
    category: "Ecosystem",
    yesPrice: 48,
    noPrice: 52,
    volume: "$52,100",
    endsIn: "3 days",
    bettors: 456,
    trending: false,
  },
  {
    id: 4,
    question: "Will Bonk flip Dogecoin this week?",
    category: "Meme",
    yesPrice: 12,
    noPrice: 88,
    volume: "$67,890",
    endsIn: "6 days",
    bettors: 523,
    trending: true,
  },
  {
    id: 5,
    question: "Will Solana NFT sales exceed 50k this week?",
    category: "NFTs",
    yesPrice: 71,
    noPrice: 29,
    volume: "$29,340",
    endsIn: "4 days",
    bettors: 198,
    trending: false,
  },
  {
    id: 6,
    question: "Will any Solana DEX reach $1B volume today?",
    category: "Volume",
    yesPrice: 55,
    noPrice: 45,
    volume: "$41,230",
    endsIn: "12 hours",
    bettors: 367,
    trending: false,
  },
  {
    id: 7,
    question: "Will Tensor overtake Magic Eden in NFT volume?",
    category: "NFTs",
    yesPrice: 42,
    noPrice: 58,
    volume: "$33,890",
    endsIn: "1 week",
    bettors: 245,
    trending: false,
  },
  {
    id: 8,
    question: "Will Solana Mobile sell 100k phones this year?",
    category: "Ecosystem",
    yesPrice: 68,
    noPrice: 32,
    volume: "$28,450",
    endsIn: "30 days",
    bettors: 412,
    trending: false,
  },
];

const CATEGORIES = ["All", "Price", "Volume", "Ecosystem", "NFTs", "Meme"];

export default function MarketsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("trending");

  const filteredMarkets = MOCK_MARKETS
    .filter(market =>
      (selectedCategory === "All" || market.category === selectedCategory) &&
      market.question.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "trending") return b.bettors - a.bettors;
      if (sortBy === "volume") return parseInt(b.volume.replace(/[$,]/g, "")) - parseInt(a.volume.replace(/[$,]/g, ""));
      if (sortBy === "ending-soon") return 0; // Would sort by actual time
      return 0;
    });

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-10 h-10 text-[#00F3FF] animate-pulse" />
              <h1 className="text-4xl md:text-6xl font-black font-heading bg-gradient-to-r from-[#00F3FF] to-[#FF00FF] bg-clip-text text-transparent">
                ACTIVE MARKETS
              </h1>
            </div>
            <p className="text-xl text-slate-400 mb-8">
              Choose your prediction and start winning. <span className="text-[#00FF9D] font-bold">247 markets live now.</span>
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox icon={<Target />} label="Active Markets" value="247" />
              <StatBox icon={<TrendingUp />} label="24h Volume" value="$1.2M" />
              <StatBox icon={<Users />} label="Active Bettors" value="12.5K" />
              <StatBox icon={<Flame />} label="Trending" value="42" />
            </div>
          </motion.div>

          {/* Filters & Search */}
          <div className="glass-panel p-6 rounded-2xl mb-8">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00F3FF]" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:border-[#00F3FF] focus:outline-none transition-all"
                />
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-4">
                <span className="text-slate-400 flex items-center gap-2 font-bold text-sm">
                  <Filter className="w-4 h-4" />
                  SORT BY:
                </span>
                <div className="flex gap-2">
                  {["trending", "volume", "ending-soon"].map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${sortBy === sort
                          ? "bg-[#00FF9D] text-black shadow-[0_0_10px_rgba(0,255,157,0.4)]"
                          : "bg-white/5 text-slate-400 hover:bg-white/10"
                        }`}
                    >
                      {sort.replace("-", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${selectedCategory === category
                      ? "bg-[#00F3FF] text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Markets Grid */}
          <div className="grid md:grid-cols-2 gap-6 pb-24">
            {filteredMarkets.map((market, index) => (
              <MarketCard key={market.id} {...market} delay={index * 0.05} />
            ))}
          </div>

          {filteredMarkets.length === 0 && (
            <div className="text-center py-24">
              <Target className="w-16 h-16 mx-auto mb-4 text-slate-700" />
              <h3 className="text-2xl font-bold mb-2">No markets found</h3>
              <p className="text-slate-500">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-card rounded-xl p-4 group hover:border-[#00F3FF]/30 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-[#00F3FF]/10 rounded-lg text-[#00F3FF] group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black mb-1 font-numbers text-white">{value}</div>
      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</div>
    </div>
  );
}
