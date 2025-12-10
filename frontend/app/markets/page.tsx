"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import Link from "next/link";
import { MarketCard } from "@/components/MarketCard";
import {
  Search, Filter, TrendingUp, Flame, Clock,
  Grid, List, Zap, ChevronDown, Star, Target, Loader2,
  CheckCircle, Timer, ArrowLeft
} from "lucide-react";
import { usePredictionMarkets } from "@/lib/solana/hooks/usePredictionMarkets";
import { RetroGrid } from "@/components/RetroGrid";

const CATEGORIES = [
  { id: "all", name: "All Markets", icon: Grid, color: "#00f0ff" },
  { id: "crypto", name: "Crypto", icon: TrendingUp, color: "#00ff88" },
  { id: "price", name: "Price", icon: TrendingUp, color: "#00ff88" },
  { id: "sports", name: "Sports", icon: Target, color: "#ff8800" },
  { id: "meme", name: "Meme", icon: Flame, color: "#ff00aa" },
  { id: "politics", name: "Politics", icon: Star, color: "#ffd700" },
];

const STATUS_FILTERS = [
  { id: "active", name: "Active", icon: Timer, color: "#00ff88" },
  { id: "resolved", name: "Resolved", icon: CheckCircle, color: "#ffd700" },
  { id: "all", name: "All", icon: Grid, color: "#00f0ff" },
];

const SORT_OPTIONS = [
  { id: "volume", name: "Volume", icon: TrendingUp },
  { id: "newest", name: "Newest", icon: Clock },
  { id: "ending", name: "Ending Soon", icon: Zap },
];

export default function MarketsPage() {
  const { markets, loading, error } = usePredictionMarkets();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStatus, setActiveStatus] = useState("active");
  const [activeSort, setActiveSort] = useState("volume");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort markets
  const filteredMarkets = useMemo(() => {
    let filtered = markets.filter((market) => {
      const matchesCategory = activeCategory === "all" ||
        market.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch = market.question.toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (activeStatus === "active") {
        matchesStatus = market.status === "Active";
      } else if (activeStatus === "resolved") {
        matchesStatus = market.status === "Resolved";
      }
      // "all" shows everything

      return matchesCategory && matchesSearch && matchesStatus;
    });

    // Sort markets
    switch (activeSort) {
      case "volume":
        filtered.sort((a, b) => b.totalVolume - a.totalVolume);
        break;
      case "newest":
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "ending":
        filtered.sort((a, b) => a.endTime - b.endTime);
        break;
    }

    return filtered;
  }, [markets, activeCategory, activeStatus, searchQuery, activeSort]);

  // Calculate total volume
  const totalVolume = useMemo(() => {
    return filteredMarkets.reduce((sum, m) => sum + m.totalVolume, 0);
  }, [filteredMarkets]);

  return (
    <div className="min-h-screen bg-[#050505] relative">
      {/* Background */}
      <RetroGrid streak={0} />

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link href="/">
            <motion.button
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-[#00f0ff]" />
            <span className="font-game text-lg">
              <span className="text-white">ALL </span>
              <span className="text-[#00f0ff]">MARKETS</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-20 pb-8 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm">
            Find your edge. Pick your battles. Win big.
          </p>
        </div>

        {/* Search & Filters Bar */}
        <div className="game-card p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="game-input pl-12 w-full"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all w-full lg:w-auto"
              >
                <Filter className="w-5 h-5 text-[#00f0ff]" />
                <span className="font-game text-sm">
                  {SORT_OPTIONS.find(s => s.id === activeSort)?.name}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 right-0 w-48 game-card p-2 z-50"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setActiveSort(option.id);
                          setShowFilters(false);
                        }}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all ${
                          activeSort === option.id
                            ? "bg-[#00f0ff]/20 text-[#00f0ff]"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <option.icon className="w-4 h-4" />
                        {option.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-4">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status.id}
              onClick={() => setActiveStatus(status.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-game text-xs whitespace-nowrap transition-all ${
                activeStatus === status.id
                  ? "text-black"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
              style={{
                background: activeStatus === status.id ? status.color : undefined,
                boxShadow: activeStatus === status.id ? `0 0 15px ${status.color}40` : undefined,
              }}
            >
              <status.icon className="w-3 h-3" />
              {status.name}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-game text-sm whitespace-nowrap transition-all ${
                activeCategory === category.id
                  ? "text-black"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
              style={{
                background: activeCategory === category.id ? category.color : undefined,
                boxShadow: activeCategory === category.id ? `0 0 20px ${category.color}40` : undefined,
              }}
            >
              <category.icon className="w-4 h-4" />
              {category.name}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-6 mb-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-gray-400">
              <span className="text-white font-numbers font-bold">{filteredMarkets.length}</span> markets found
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ffd700]" />
            <span className="text-gray-400">
              <span className="text-white font-numbers font-bold">${totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> total volume
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-[#00f0ff] animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-game">Loading markets from blockchain...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-game text-white mb-2">Error Loading Markets</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        )}

        {/* Markets Grid */}
        {!loading && !error && (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredMarkets.map((market) => (
                <MarketCard
                  key={market.publicKey}
                  id={market.publicKey}
                  question={market.question}
                  category={market.category}
                  yesPrice={market.yesPrice}
                  noPrice={market.noPrice}
                  volume={`$${market.totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                  endsIn={market.endsIn}
                  bettors={market.bettors}
                  trending={market.totalVolume > 100}
                  delay={0}
                  isResolved={market.status === "Resolved"}
                  outcome={market.outcome}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredMarkets.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-game text-white mb-2">No markets found</h3>
                <p className="text-gray-400">Try adjusting your filters or search query</p>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
