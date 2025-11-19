"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft, TrendingUp, Users, DollarSign, Clock, Target,
  AlertCircle, Check, Share2, Trophy, Flame, ChevronRight
} from "lucide-react";
import { useState, use } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";

// Mock market data (in real app, fetch from blockchain)
const MOCK_MARKET = {
  id: 1,
  question: "Will SOL hit $300 by Dec 20?",
  description: "This market resolves YES if Solana (SOL) reaches a price of $300 USD or higher on any major CEX (Binance, Coinbase, or Kraken) at any point before December 20, 2025 at 11:59 PM UTC. Price will be verified using CoinGecko API.",
  category: "Price",
  created: "Nov 15, 2025",
  endsAt: "Dec 20, 2025 11:59 PM UTC",
  endsIn: "32 days",
  creator: "sigma.sol",

  // Market stats
  yesPrice: 35,
  noPrice: 65,
  totalVolume: "$45,230",
  totalBets: 342,
  uniqueBettors: 218,

  // AMM pool info
  yesPool: "$15,830",
  noPool: "$29,400",

  // Recent activity
  recentBets: [
    { user: "chad.sol", amount: "$250", side: "YES", time: "2 mins ago" },
    { user: "degen.sol", amount: "$100", side: "NO", time: "5 mins ago" },
    { user: "whale.sol", amount: "$1,000", side: "YES", time: "12 mins ago" },
    { user: "anon.sol", amount: "$50", side: "NO", time: "18 mins ago" },
    { user: "sigma.sol", amount: "$500", side: "YES", time: "25 mins ago" },
  ],

  // User's position (if any)
  userPosition: null,
};

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [betAmount, setBetAmount] = useState("");
  const [selectedSide, setSelectedSide] = useState<"YES" | "NO" | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const handlePlaceBet = async () => {
    if (!betAmount || !selectedSide) return;

    setIsPlacingBet(true);

    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Celebrate!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsPlacingBet(false);
    setBetAmount("");
    setSelectedSide(null);

    alert(`Bet placed! ${betAmount} USDC on ${selectedSide}`);
  };

  const calculatePotentialPayout = () => {
    if (!betAmount || !selectedSide) return "0";
    const amount = parseFloat(betAmount);
    const price = selectedSide === "YES" ? MOCK_MARKET.yesPrice : MOCK_MARKET.noPrice;
    const payout = (amount / price) * 100;
    return payout.toFixed(2);
  };

  const calculateROI = () => {
    if (!betAmount) return "0";
    const amount = parseFloat(betAmount);
    const payout = parseFloat(calculatePotentialPayout());
    const roi = ((payout - amount) / amount) * 100;
    return roi.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/markets">
                <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-semibold">Back to Markets</span>
                </button>
              </Link>

              <Link href="/">
                <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                  SOLANA SAGA
                </h1>
              </Link>

              <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:scale-105 transition-all">
                Connect Wallet
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Market Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Market Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-purple-500/20 text-purple-300 font-semibold rounded-full border border-purple-500/30">
                      {MOCK_MARKET.category}
                    </span>
                    <span className="px-4 py-1.5 bg-orange-500/20 text-orange-300 font-semibold rounded-full border border-orange-500/30 flex items-center gap-1.5">
                      <Flame className="w-4 h-4" />
                      Trending
                    </span>
                  </div>
                  <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                <h1 className="text-4xl font-black mb-6">
                  {MOCK_MARKET.question}
                </h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <StatItem icon={<TrendingUp />} label="Volume" value={MOCK_MARKET.totalVolume} />
                  <StatItem icon={<Users />} label="Bettors" value={MOCK_MARKET.uniqueBettors.toString()} />
                  <StatItem icon={<Target />} label="Total Bets" value={MOCK_MARKET.totalBets.toString()} />
                  <StatItem icon={<Clock />} label="Ends In" value={MOCK_MARKET.endsIn} />
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-300">
                      <strong>Resolution Criteria:</strong> {MOCK_MARKET.description}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Current Odds */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold mb-6">Current Odds</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-emerald-600/10 border-2 border-emerald-500/30 rounded-xl p-6">
                    <div className="text-sm text-slate-400 mb-2">YES</div>
                    <div className="text-5xl font-black text-emerald-400 mb-2">
                      {MOCK_MARKET.yesPrice}%
                    </div>
                    <div className="text-sm text-slate-400">
                      Pool: {MOCK_MARKET.yesPool}
                    </div>
                  </div>

                  <div className="bg-red-600/10 border-2 border-red-500/30 rounded-xl p-6">
                    <div className="text-sm text-slate-400 mb-2">NO</div>
                    <div className="text-5xl font-black text-red-400 mb-2">
                      {MOCK_MARKET.noPrice}%
                    </div>
                    <div className="text-sm text-slate-400">
                      Pool: {MOCK_MARKET.noPool}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-sm text-slate-400 mb-2">Price Distribution</div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600"
                      style={{ width: `${MOCK_MARKET.yesPrice}%` }}
                    />
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-600"
                      style={{ width: `${MOCK_MARKET.noPrice}%` }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>

                <div className="space-y-3">
                  {MOCK_MARKET.recentBets.map((bet, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                          bet.side === "YES"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}>
                          {bet.side}
                        </div>
                        <div>
                          <div className="font-semibold">{bet.user}</div>
                          <div className="text-sm text-slate-400">{bet.time}</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold">{bet.amount}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Betting Panel */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sticky top-24"
              >
                <h2 className="text-2xl font-bold mb-6">Place Your Bet</h2>

                {/* Side Selection */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setSelectedSide("YES")}
                    className={`p-4 rounded-xl font-bold text-lg transition-all ${
                      selectedSide === "YES"
                        ? "bg-emerald-600 text-white scale-105 shadow-lg shadow-emerald-500/50"
                        : "bg-emerald-600/20 text-emerald-400 border-2 border-emerald-500/30 hover:bg-emerald-600/30"
                    }`}
                  >
                    <div className="mb-1">YES</div>
                    <div className="text-2xl">{MOCK_MARKET.yesPrice}%</div>
                  </button>

                  <button
                    onClick={() => setSelectedSide("NO")}
                    className={`p-4 rounded-xl font-bold text-lg transition-all ${
                      selectedSide === "NO"
                        ? "bg-red-600 text-white scale-105 shadow-lg shadow-red-500/50"
                        : "bg-red-600/20 text-red-400 border-2 border-red-500/30 hover:bg-red-600/30"
                    }`}
                  >
                    <div className="mb-1">NO</div>
                    <div className="text-2xl">{MOCK_MARKET.noPrice}%</div>
                  </button>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Bet Amount (USDC)</label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  <div className="flex gap-2 mt-2">
                    {["10", "50", "100", "500"].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setBetAmount(amount)}
                        className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-semibold transition-colors"
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation */}
                {betAmount && selectedSide && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-6 p-4 bg-slate-800/50 rounded-xl space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Your Bet:</span>
                      <span className="font-bold">${betAmount} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Potential Payout:</span>
                      <span className="font-bold text-emerald-400">${calculatePotentialPayout()} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Potential ROI:</span>
                      <span className="font-bold text-emerald-400">+{calculateROI()}%</span>
                    </div>
                    <div className="border-t border-slate-700 pt-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Platform Fee (2%):</span>
                        <span className="text-slate-400">-${(parseFloat(calculatePotentialPayout()) * 0.02).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Place Bet Button */}
                <button
                  onClick={handlePlaceBet}
                  disabled={!betAmount || !selectedSide || isPlacingBet}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isPlacingBet ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Placing Bet...
                    </span>
                  ) : (
                    "Place Bet"
                  )}
                </button>

                <p className="text-xs text-center text-slate-500 mt-4">
                  By placing a bet, you agree to the market resolution criteria and platform terms.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
        {icon}
      </div>
      <div>
        <div className="text-sm text-slate-400">{label}</div>
        <div className="font-bold">{value}</div>
      </div>
    </div>
  );
}
