"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { MarketCard } from "@/components/MarketCard";
import { 
  Search, Filter, TrendingUp, Flame, Clock, 
  Grid, List, Zap, ChevronDown, Star, Target 
} from "lucide-react";

const CATEGORIES = [
  { id: "all", name: "All Markets", icon: Grid, color: "#00f0ff" },
  { id: "crypto", name: "Crypto", icon: TrendingUp, color: "#00ff88" },
  { id: "sports", name: "Sports", icon: Target, color: "#ff8800" },
  { id: "meme", name: "Meme", icon: Flame, color: "#ff00aa" },
  { id: "politics", name: "Politics", icon: Star, color: "#ffd700" },
];

const SORT_OPTIONS = [
  { id: "trending", name: "Trending", icon: Flame },
  { id: "volume", name: "Volume", icon: TrendingUp },
  { id: "newest", name: "Newest", icon: Clock },
  { id: "ending", name: "Ending Soon", icon: Zap },
];

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
  {
    id: 5,
    question: "Lakers win vs Celtics tonight?",
    category: "Sports",
    yesPrice: 55,
    noPrice: 45,
    volume: "$23,100",
    endsIn: "8 hours",
    bettors: 189,
    trending: false,
  },
  {
    id: 6,
    question: "Will Bitcoin ETF outflows continue this week?",
    category: "Crypto",
    yesPrice: 72,
    noPrice: 28,
    volume: "$89,200",
    endsIn: "4 days",
    bettors: 612,
    trending: true,
  },
  {
    id: 7,
    question: "Fed rate cut in December meeting?",
    category: "Politics",
    yesPrice: 85,
    noPrice: 15,
    volume: "$156,000",
    endsIn: "12 days",
    bettors: 892,
    trending: true,
  },
  {
    id: 8,
    question: "Will a new memecoin reach $1B mcap this month?",
    category: "Meme",
    yesPrice: 28,
    noPrice: 72,
    volume: "$34,500",
    endsIn: "18 days",
    bettors: 234,
    trending: false,
  },
];

export default function MarketsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSort, setActiveSort] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredMarkets = MOCK_MARKETS.filter((market) => {
    const matchesCategory = activeCategory === "all" || 
      market.category.toLowerCase() === activeCategory;
    const matchesSearch = market.question.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Target className="w-10 h-10 text-[#00f0ff]" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-game font-black">
              <span className="text-white">ALL </span>
              <span className="text-[#00f0ff]">MARKETS</span>
            </h1>
          </div>
          <p className="text-gray-400">
            Find your edge. Pick your battles. Win big.
          </p>
        </motion.div>

        {/* Search & Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="game-card p-4 mb-6"
        >
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
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide"
        >
          {CATEGORIES.map((category) => (
            <motion.button
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <category.icon className="w-4 h-4" />
              {category.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-6 mb-8 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
            <span className="text-gray-400">
              <span className="text-white font-numbers font-bold">{filteredMarkets.length}</span> markets found
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ffd700]" />
            <span className="text-gray-400">
              <span className="text-white font-numbers font-bold">$1.2M</span> total volume
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#ff8800]" />
            <span className="text-gray-400">
              <span className="text-white font-numbers font-bold">
                {filteredMarkets.filter(m => m.trending).length}
              </span> trending
            </span>
          </div>
        </motion.div>

        {/* Markets Grid */}
        <motion.div
          layout
          className="grid md:grid-cols-2 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredMarkets.map((market, index) => (
              <motion.div
                key={market.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <MarketCard {...market} delay={0} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredMarkets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-game text-white mb-2">No markets found</h3>
            <p className="text-gray-400">Try adjusting your filters or search query</p>
          </motion.div>
        )}

        {/* Load More */}
        {filteredMarkets.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12"
          >
            <motion.button
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-game hover:bg-white/10 hover:border-[#00f0ff]/50 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Load More Markets
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
