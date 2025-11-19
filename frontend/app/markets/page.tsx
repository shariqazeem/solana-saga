"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, Clock, Users, DollarSign, Filter, Search,
  Flame, Star, Zap, ArrowLeft, Target, ChevronRight
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

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
    <div className="min-h-screen text-white" style={{background: '#050814'}}>
      {/* Neon Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-30" style={{background: 'radial-gradient(circle, #00E5FF 0%, transparent 70%)'}} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-30" style={{background: 'radial-gradient(circle, #FF1493 0%, transparent 70%)'}} />
        <div className="absolute inset-0 neon-grid opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-[#00E5FF]/20 backdrop-blur-md sticky top-0 z-50" style={{background: 'rgba(13, 18, 38, 0.8)'}}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/">
                <button className="flex items-center gap-2 text-slate-300 hover:neon-text transition-all font-orbitron">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-semibold">Back to Home</span>
                </button>
              </Link>

              <div className="flex items-center gap-3">
                <Link href="/">
                  <h1 className="text-2xl font-black bg-gradient-to-r from-[#00E5FF] via-[#FF1493] to-[#39FF14] bg-clip-text text-transparent font-orbitron">
                    SOLANA SAGA
                  </h1>
                </Link>
              </div>

              <WalletMultiButton />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-10 h-10 neon-text animate-neon-pulse" />
                <h1 className="text-4xl md:text-6xl font-black font-orbitron bg-gradient-to-r from-[#00E5FF] to-[#FF1493] bg-clip-text text-transparent">
                  Active Markets
                </h1>
              </div>
              <p className="text-xl text-slate-300 mb-8">
                Choose your prediction and start winning. <span className="neon-text-green font-bold">247 markets live now.</span>
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatBox icon={<Target />} label="Active Markets" value="247" />
                <StatBox icon={<TrendingUp />} label="24h Volume" value="$1.2M" />
                <StatBox icon={<Users />} label="Active Bettors" value="12.5K" />
                <StatBox icon={<Flame />} label="Trending" value="42" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters & Search */}
        <section className="px-4 mb-8">
          <div className="max-w-7xl mx-auto">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 neon-text" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full glass-card rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-400 focus:border-[#00E5FF] focus:outline-none transition-all font-inter"
                  style={{borderWidth: '2px'}}
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-lg font-bold whitespace-nowrap transition-all font-orbitron ${
                    selectedCategory === category
                      ? "neon-button"
                      : "neon-button-secondary"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <span className="text-slate-300 flex items-center gap-2 font-orbitron font-semibold">
                <Filter className="w-4 h-4 neon-text" />
                Sort by:
              </span>
              <div className="flex gap-2">
                {["trending", "volume", "ending-soon"].map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      sortBy === sort
                        ? "bg-gradient-to-r from-[#39FF14] to-[#00FFA3] text-black shadow-lg shadow-green-500/50"
                        : "glass-card text-slate-300 hover:border-[#00E5FF]"
                    }`}
                  >
                    {sort.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Markets Grid */}
        <section className="px-4 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {filteredMarkets.map((market, index) => (
                <MarketCard key={market.id} market={market} delay={index * 0.05} />
              ))}
            </div>

            {filteredMarkets.length === 0 && (
              <div className="text-center py-24">
                <Target className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-2xl font-bold mb-2">No markets found</h3>
                <p className="text-slate-400">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-card rounded-xl p-4 group">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-br from-[#00E5FF] to-[#1E90FF] rounded-lg animate-neon-pulse shadow-lg shadow-cyan-500/50">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black mb-1 font-numbers neon-text">{value}</div>
      <div className="text-sm text-slate-300">{label}</div>
    </div>
  );
}

function MarketCard({ market, delay }: { market: any; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card rounded-2xl p-6 group relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-gradient-to-r from-[#00E5FF]/20 to-[#1E90FF]/20 text-[#00E5FF] text-sm font-bold rounded-full border border-[#00E5FF]/40 font-orbitron">
            {market.category}
          </span>
          {market.trending && (
            <span className="px-3 py-1 bg-gradient-to-r from-[#FF6B00]/20 to-[#FF1493]/20 text-[#FF6B00] text-sm font-bold rounded-full border border-[#FF6B00]/40 flex items-center gap-1 animate-neon-pulse">
              <Flame className="w-3 h-3" />
              Hot
            </span>
          )}
        </div>
        <span className="text-slate-300 text-sm flex items-center gap-1 font-numbers">
          <Clock className="w-4 h-4 neon-text-magenta" />
          {market.endsIn}
        </span>
      </div>

      {/* Question */}
      <h3 className="text-xl font-bold mb-6 group-hover:neon-text transition-all">
        {market.question}
      </h3>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-6 text-sm text-slate-300">
        <div className="flex items-center gap-2 font-numbers">
          <TrendingUp className="w-4 h-4 neon-text-green" />
          <span>{market.volume}</span>
        </div>
        <div className="flex items-center gap-2 font-numbers">
          <Users className="w-4 h-4 neon-text" />
          <span>{market.bettors} bettors</span>
        </div>
      </div>

      {/* Betting Options */}
      <div className="grid grid-cols-2 gap-4">
        <Link href={`/markets/${market.id}`}>
          <button className="w-full bg-[#39FF14]/10 hover:bg-[#39FF14]/20 border-2 border-[#39FF14]/40 rounded-xl p-4 transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/50 group/yes">
            <div className="text-sm text-slate-300 mb-1 font-semibold">YES</div>
            <div className="text-3xl font-black neon-text-green font-numbers">{market.yesPrice}%</div>
            <div className="text-xs text-slate-400 mt-1">Click to bet</div>
          </button>
        </Link>

        <Link href={`/markets/${market.id}`}>
          <button className="w-full bg-[#FF0040]/10 hover:bg-[#FF0040]/20 border-2 border-[#FF0040]/40 rounded-xl p-4 transition-all hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 group/no">
            <div className="text-sm text-slate-300 mb-1 font-semibold">NO</div>
            <div className="text-3xl font-black text-[#FF0040] font-numbers" style={{textShadow: '0 0 10px rgba(255, 0, 64, 0.8)'}}>{market.noPrice}%</div>
            <div className="text-xs text-slate-400 mt-1">Click to bet</div>
          </button>
        </Link>
      </div>

      {/* View Details */}
      <Link href={`/markets/${market.id}`}>
        <button className="w-full mt-4 py-3 neon-button-secondary rounded-lg font-semibold flex items-center justify-center gap-2 group/btn">
          View Details
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </Link>

      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00E5FF]/10 to-transparent rounded-full blur-2xl -z-10 group-hover:scale-150 transition-transform" />
    </motion.div>
  );
}
