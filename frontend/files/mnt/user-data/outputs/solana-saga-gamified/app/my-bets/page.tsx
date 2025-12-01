"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  TrendingUp, TrendingDown, Clock, DollarSign, 
  Zap, Trophy, Target, Flame, ChevronRight,
  Check, X, Timer, Filter, BarChart3
} from "lucide-react";
import Link from "next/link";

const TABS = [
  { id: "active", name: "Active Bets", icon: Timer },
  { id: "won", name: "Won", icon: Trophy },
  { id: "lost", name: "Lost", icon: X },
];

const mockBets = {
  active: [
    {
      id: 1,
      market: "Will SOL hit $300 by Dec 20?",
      side: "YES",
      amount: 250,
      odds: 35,
      potentialPayout: 714,
      endsIn: "2 days",
      currentOdds: 38,
    },
    {
      id: 2,
      market: "Jupiter reaches 10M transactions?",
      side: "NO",
      amount: 100,
      odds: 38,
      potentialPayout: 263,
      endsIn: "5 days",
      currentOdds: 35,
    },
    {
      id: 3,
      market: "Fed rate cut in December?",
      side: "YES",
      amount: 500,
      odds: 85,
      potentialPayout: 588,
      endsIn: "12 days",
      currentOdds: 87,
    },
  ],
  won: [
    {
      id: 4,
      market: "ETH ETF approved in 2024?",
      side: "YES",
      amount: 200,
      odds: 72,
      payout: 278,
      profit: 78,
      resolvedAt: "Nov 28",
    },
    {
      id: 5,
      market: "Bitcoin breaks 100k?",
      side: "YES",
      amount: 150,
      odds: 45,
      payout: 333,
      profit: 183,
      resolvedAt: "Nov 25",
    },
  ],
  lost: [
    {
      id: 6,
      market: "SOL flips ETH by Nov?",
      side: "YES",
      amount: 75,
      odds: 8,
      loss: 75,
      resolvedAt: "Nov 30",
    },
  ],
};

const portfolioStats = {
  totalInvested: 850,
  potentialReturn: 1565,
  totalWon: 511,
  totalLost: 75,
  winRate: 67,
  currentStreak: 2,
  level: 12,
  xp: 2450,
  xpToNext: 3000,
};

export default function MyBetsPage() {
  const [activeTab, setActiveTab] = useState("active");

  return (
    <div className="min-h-screen pt-24 pb-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-10 h-10 text-[#ff00aa]" />
            <h1 className="text-4xl md:text-5xl font-game font-black">
              <span className="text-white">MY </span>
              <span className="text-[#ff00aa]">BETS</span>
            </h1>
          </div>
          <p className="text-gray-400">
            Track your positions and claim your winnings
          </p>
        </motion.div>

        {/* Portfolio Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="game-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#00f0ff]" />
              </div>
              <div className="text-sm text-gray-400">Active Position</div>
            </div>
            <div className="text-3xl font-numbers font-bold text-white">
              ${portfolioStats.totalInvested}
            </div>
            <div className="text-sm text-[#00f0ff]">
              → ${portfolioStats.potentialReturn} potential
            </div>
          </div>

          <div className="game-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#00ff88]/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#00ff88]" />
              </div>
              <div className="text-sm text-gray-400">Total Won</div>
            </div>
            <div className="text-3xl font-numbers font-bold text-[#00ff88]">
              +${portfolioStats.totalWon}
            </div>
            <div className="text-sm text-gray-500">
              -{portfolioStats.totalLost} lost
            </div>
          </div>

          <div className="game-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffd700]/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#ffd700]" />
              </div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
            <div className="text-3xl font-numbers font-bold text-white">
              {portfolioStats.winRate}%
            </div>
            <div className="flex items-center gap-1 text-sm text-[#ff8800]">
              <Flame className="w-4 h-4" />
              {portfolioStats.currentStreak} streak
            </div>
          </div>

          <div className="game-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff00aa]/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#ff00aa]" />
              </div>
              <div className="text-sm text-gray-400">Level {portfolioStats.level}</div>
            </div>
            <div className="text-3xl font-numbers font-bold text-white">
              {portfolioStats.xp} XP
            </div>
            <div className="mt-2 h-2 rounded-full bg-black/50 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#ff00aa] to-[#00f0ff]"
                initial={{ width: 0 }}
                animate={{ width: `${(portfolioStats.xp / portfolioStats.xpToNext) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-6"
        >
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-game text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-white/10 border border-white/20 text-white"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? "bg-white/20" : "bg-white/5"
              }`}>
                {mockBets[tab.id as keyof typeof mockBets].length}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Bets List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {activeTab === "active" && (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {mockBets.active.map((bet, index) => (
                  <motion.div
                    key={bet.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="game-card p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            bet.side === "YES" 
                              ? "bg-[#00ff88]/20 text-[#00ff88]" 
                              : "bg-[#ff0044]/20 text-[#ff0044]"
                          }`}>
                            {bet.side}
                          </span>
                          <span className="text-xs text-gray-500">@ {bet.odds}%</span>
                          {bet.currentOdds > bet.odds && bet.side === "YES" && (
                            <span className="text-xs text-[#00ff88]">↑ now {bet.currentOdds}%</span>
                          )}
                          {bet.currentOdds < bet.odds && bet.side === "NO" && (
                            <span className="text-xs text-[#00ff88]">↓ now {bet.currentOdds}%</span>
                          )}
                        </div>
                        <h3 className="font-game text-white text-lg mb-2">{bet.market}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {bet.endsIn}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-400">Stake</div>
                          <div className="text-xl font-numbers font-bold text-white">${bet.amount}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-400">To Win</div>
                          <div className="text-xl font-numbers font-bold text-[#00ff88]">${bet.potentialPayout}</div>
                        </div>
                        <Link href={`/markets/${bet.id}`}>
                          <motion.button
                            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === "won" && (
              <motion.div
                key="won"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {mockBets.won.map((bet, index) => (
                  <motion.div
                    key={bet.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="game-card p-6 border-[#00ff88]/30"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-[#00ff88] flex items-center justify-center">
                            <Check className="w-4 h-4 text-black" />
                          </div>
                          <span className="text-xs text-[#00ff88] font-bold">WON</span>
                          <span className="text-xs text-gray-500">• {bet.resolvedAt}</span>
                        </div>
                        <h3 className="font-game text-white text-lg mb-2">{bet.market}</h3>
                        <div className="text-sm text-gray-400">
                          Bet <span className={bet.side === "YES" ? "text-[#00ff88]" : "text-[#ff0044]"}>{bet.side}</span> @ {bet.odds}%
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-400">Stake</div>
                          <div className="text-xl font-numbers font-bold text-white">${bet.amount}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-400">Profit</div>
                          <div className="text-xl font-numbers font-bold text-[#00ff88]">+${bet.profit}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === "lost" && (
              <motion.div
                key="lost"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {mockBets.lost.map((bet, index) => (
                  <motion.div
                    key={bet.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="game-card p-6 border-[#ff0044]/30 opacity-75"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-[#ff0044] flex items-center justify-center">
                            <X className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs text-[#ff0044] font-bold">LOST</span>
                          <span className="text-xs text-gray-500">• {bet.resolvedAt}</span>
                        </div>
                        <h3 className="font-game text-white text-lg mb-2">{bet.market}</h3>
                        <div className="text-sm text-gray-400">
                          Bet <span className={bet.side === "YES" ? "text-[#00ff88]" : "text-[#ff0044]"}>{bet.side}</span> @ {bet.odds}%
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-400">Lost</div>
                          <div className="text-xl font-numbers font-bold text-[#ff0044]">-${bet.loss}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {mockBets[activeTab as keyof typeof mockBets].length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-game text-white mb-2">No bets here</h3>
              <p className="text-gray-400 mb-6">Start placing bets to see them here!</p>
              <Link href="/markets">
                <motion.button
                  className="arcade-btn arcade-btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Browse Markets
                </motion.button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
