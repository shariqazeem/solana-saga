"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useParams } from "next/navigation";
import { 
  TrendingUp, TrendingDown, Clock, Users, DollarSign, 
  Zap, Share2, Star, ChevronRight, AlertCircle, Check,
  ArrowLeft, Flame, Target, Trophy
} from "lucide-react";
import Link from "next/link";

// Mock market data
const MARKET_DATA = {
  id: 1,
  question: "Will SOL hit $300 by December 20th?",
  description: "This market resolves YES if the price of Solana (SOL) reaches or exceeds $300 USD on any major exchange (Binance, Coinbase, Kraken) before December 20th, 2024 at 11:59 PM UTC.",
  category: "Crypto",
  yesPrice: 35,
  noPrice: 65,
  volume: "$45,230",
  totalPool: "$89,450",
  endsIn: "2 days 14 hours",
  endDate: "Dec 20, 2024",
  bettors: 342,
  trending: true,
  creator: "admin.sol",
  createdAt: "Dec 10, 2024",
  resolution: "Price data from CoinGecko API",
  recentBets: [
    { user: "whale.sol", side: "YES", amount: 500, time: "2 min ago" },
    { user: "degen.sol", side: "NO", amount: 250, time: "5 min ago" },
    { user: "chad.sol", side: "YES", amount: 1000, time: "12 min ago" },
    { user: "moon.sol", side: "YES", amount: 150, time: "18 min ago" },
    { user: "sigma.sol", side: "NO", amount: 800, time: "25 min ago" },
  ],
  priceHistory: [
    { time: "12h ago", yes: 42, no: 58 },
    { time: "10h ago", yes: 38, no: 62 },
    { time: "8h ago", yes: 35, no: 65 },
    { time: "6h ago", yes: 40, no: 60 },
    { time: "4h ago", yes: 37, no: 63 },
    { time: "2h ago", yes: 33, no: 67 },
    { time: "now", yes: 35, no: 65 },
  ],
};

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function MarketDetailPage() {
  const params = useParams();
  const [selectedSide, setSelectedSide] = useState<"YES" | "NO" | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const market = MARKET_DATA;

  const calculatePayout = () => {
    if (!betAmount || !selectedSide) return 0;
    const amount = parseFloat(betAmount);
    const odds = selectedSide === "YES" ? market.yesPrice : market.noPrice;
    return (amount / (odds / 100)).toFixed(2);
  };

  return (
    <div className="min-h-screen pt-24 pb-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/markets">
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-game text-sm">Back to Markets</span>
            </button>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="game-card p-8"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="category-pill category-crypto">{market.category}</span>
                    {market.trending && (
                      <motion.span 
                        className="hot-badge"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Flame className="w-3 h-3" />
                        HOT
                      </motion.span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-game font-bold text-white">
                    {market.question}
                  </h1>
                </div>
                <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Big Battle Bar */}
              <div className="mb-8">
                <div className="relative h-20 rounded-2xl overflow-hidden bg-black/50">
                  {/* YES Side */}
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 flex items-center justify-start px-6"
                    style={{
                      width: `${market.yesPrice}%`,
                      background: "linear-gradient(90deg, rgba(0, 255, 136, 0.3), rgba(0, 255, 136, 0.1))",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${market.yesPrice}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-[#00ff88]" />
                      <div>
                        <div className="text-3xl font-numbers font-black text-[#00ff88]">
                          {market.yesPrice}%
                        </div>
                        <div className="text-sm font-game text-[#00ff88]/70">YES</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* NO Side */}
                  <motion.div
                    className="absolute right-0 top-0 bottom-0 flex items-center justify-end px-6"
                    style={{
                      width: `${market.noPrice}%`,
                      background: "linear-gradient(270deg, rgba(255, 0, 68, 0.3), rgba(255, 0, 68, 0.1))",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${market.noPrice}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-3xl font-numbers font-black text-[#ff0044]">
                          {market.noPrice}%
                        </div>
                        <div className="text-sm font-game text-[#ff0044]/70">NO</div>
                      </div>
                      <TrendingDown className="w-8 h-8 text-[#ff0044]" />
                    </div>
                  </motion.div>

                  {/* Center VS */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <motion.div
                      className="w-12 h-12 rounded-full bg-[#0a0a0f] border-2 border-[#ffd700] flex items-center justify-center"
                      animate={{ 
                        boxShadow: ["0 0 10px #ffd700", "0 0 30px #ffd700", "0 0 10px #ffd700"],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="font-pixel text-[#ffd700] text-xs">VS</span>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="stat-box">
                  <DollarSign className="w-5 h-5 text-[#00f0ff] mb-2" />
                  <div className="text-xl font-numbers font-bold text-white">{market.volume}</div>
                  <div className="text-xs text-gray-500">Volume</div>
                </div>
                <div className="stat-box">
                  <Users className="w-5 h-5 text-[#ff00aa] mb-2" />
                  <div className="text-xl font-numbers font-bold text-white">{market.bettors}</div>
                  <div className="text-xs text-gray-500">Bettors</div>
                </div>
                <div className="stat-box">
                  <Zap className="w-5 h-5 text-[#ffd700] mb-2" />
                  <div className="text-xl font-numbers font-bold text-white">{market.totalPool}</div>
                  <div className="text-xs text-gray-500">Pool</div>
                </div>
                <div className="stat-box">
                  <Clock className="w-5 h-5 text-[#ff8800] mb-2" />
                  <div className="text-xl font-numbers font-bold text-white">{market.endsIn}</div>
                  <div className="text-xs text-gray-500">Remaining</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-game text-sm text-gray-400 mb-2">RESOLUTION CRITERIA</h3>
                <p className="text-gray-300 leading-relaxed">{market.description}</p>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div>Created by <span className="text-[#00f0ff]">{market.creator}</span></div>
                <div>•</div>
                <div>Ends {market.endDate}</div>
                <div>•</div>
                <div>Oracle: {market.resolution}</div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="game-card p-6"
            >
              <h3 className="font-game text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#ffd700]" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {market.recentBets.map((bet, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f0ff]/20 to-[#ff00aa]/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-[#00f0ff]" />
                      </div>
                      <div>
                        <span className="font-bold text-white">{bet.user}</span>
                        <span className="text-gray-400"> bet </span>
                        <span className={bet.side === "YES" ? "text-[#00ff88]" : "text-[#ff0044]"}>
                          {bet.side}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-numbers font-bold text-white">${bet.amount}</div>
                      <div className="text-xs text-gray-500">{bet.time}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Betting Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="game-card p-6 sticky top-24"
            >
              <h3 className="font-game text-white text-lg mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#00f0ff]" />
                Place Your Bet
              </h3>

              {/* Side Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.button
                  onClick={() => setSelectedSide("YES")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedSide === "YES"
                      ? "border-[#00ff88] bg-[#00ff88]/10"
                      : "border-white/10 bg-white/5 hover:border-[#00ff88]/50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${
                    selectedSide === "YES" ? "text-[#00ff88]" : "text-gray-400"
                  }`} />
                  <div className={`font-game ${
                    selectedSide === "YES" ? "text-[#00ff88]" : "text-gray-400"
                  }`}>YES</div>
                  <div className="text-2xl font-numbers font-bold text-white">{market.yesPrice}%</div>
                </motion.button>

                <motion.button
                  onClick={() => setSelectedSide("NO")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedSide === "NO"
                      ? "border-[#ff0044] bg-[#ff0044]/10"
                      : "border-white/10 bg-white/5 hover:border-[#ff0044]/50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <TrendingDown className={`w-8 h-8 mx-auto mb-2 ${
                    selectedSide === "NO" ? "text-[#ff0044]" : "text-gray-400"
                  }`} />
                  <div className={`font-game ${
                    selectedSide === "NO" ? "text-[#ff0044]" : "text-gray-400"
                  }`}>NO</div>
                  <div className="text-2xl font-numbers font-bold text-white">{market.noPrice}%</div>
                </motion.button>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block font-game text-sm text-gray-400 mb-2">Amount (USDC)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="0.00"
                    className="game-input pl-12 w-full text-xl font-numbers"
                  />
                </div>
              </div>

              {/* Quick Amounts */}
              <div className="flex flex-wrap gap-2 mb-6">
                {QUICK_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount.toString())}
                    className="quick-amount"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {/* Payout Preview */}
              {selectedSide && betAmount && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6"
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Potential Payout</span>
                    <span className="font-numbers font-bold text-[#00ff88] text-xl">
                      ${calculatePayout()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Return</span>
                    <span className="text-gray-400">
                      {((parseFloat(calculatePayout()) / parseFloat(betAmount) - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Place Bet Button */}
              <motion.button
                onClick={() => setShowConfirm(true)}
                disabled={!selectedSide || !betAmount}
                className={`w-full py-4 rounded-xl font-game text-lg flex items-center justify-center gap-2 transition-all ${
                  selectedSide && betAmount
                    ? "bg-gradient-to-r from-[#00ff88] to-[#00f0ff] text-black hover:shadow-lg hover:shadow-[#00ff88]/30"
                    : "bg-white/10 text-gray-500 cursor-not-allowed"
                }`}
                whileHover={selectedSide && betAmount ? { scale: 1.02 } : {}}
                whileTap={selectedSide && betAmount ? { scale: 0.98 } : {}}
              >
                <Zap className="w-5 h-5" />
                {selectedSide && betAmount ? "Place Bet" : "Select Side & Amount"}
              </motion.button>

              {/* Info */}
              <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>2% fee only on winnings. Funds locked until resolution.</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="game-card p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00ff88]/20 to-[#00f0ff]/20 flex items-center justify-center mx-auto mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Check className="w-8 h-8 text-[#00ff88]" />
                </motion.div>
                <h3 className="font-game text-xl text-white mb-2">Confirm Your Bet</h3>
                <p className="text-gray-400">You're about to place a bet</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-gray-400">Side</span>
                  <span className={`font-bold ${selectedSide === "YES" ? "text-[#00ff88]" : "text-[#ff0044]"}`}>
                    {selectedSide}
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-numbers font-bold text-white">${betAmount} USDC</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-gray-400">Potential Payout</span>
                  <span className="font-numbers font-bold text-[#00ff88]">${calculatePayout()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 font-game hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00f0ff] text-black font-game"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Confirm Bet
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
