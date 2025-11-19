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
              <Link href="/markets">
                <button className="flex items-center gap-2 text-slate-300 hover:neon-text transition-all font-orbitron">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-semibold">Back to Markets</span>
                </button>
              </Link>

              <Link href="/">
                <h1 className="text-2xl font-black bg-gradient-to-r from-[#00E5FF] via-[#FF1493] to-[#39FF14] bg-clip-text text-transparent font-orbitron">
                  SOLANA SAGA
                </h1>
              </Link>

              <button className="neon-button px-6 py-2 rounded-lg">
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
                className="glass-card rounded-2xl p-8 relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-gradient-to-r from-[#00E5FF]/20 to-[#1E90FF]/20 text-[#00E5FF] font-bold rounded-full border border-[#00E5FF]/40 font-orbitron">
                      {MOCK_MARKET.category}
                    </span>
                    <span className="px-4 py-1.5 bg-gradient-to-r from-[#FF6B00]/20 to-[#FF1493]/20 text-[#FF6B00] font-bold rounded-full border border-[#FF6B00]/40 flex items-center gap-1.5 animate-neon-pulse">
                      <Flame className="w-4 h-4" />
                      Trending
                    </span>
                  </div>
                  <button className="p-2 glass-card rounded-lg transition-all hover:border-[#00E5FF]">
                    <Share2 className="w-5 h-5 neon-text" />
                  </button>
                </div>

                <h1 className="text-4xl font-black mb-6 font-orbitron bg-gradient-to-r from-[#00E5FF] to-[#FF1493] bg-clip-text text-transparent">
                  {MOCK_MARKET.question}
                </h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <StatItem icon={<TrendingUp />} label="Volume" value={MOCK_MARKET.totalVolume} />
                  <StatItem icon={<Users />} label="Bettors" value={MOCK_MARKET.uniqueBettors.toString()} />
                  <StatItem icon={<Target />} label="Total Bets" value={MOCK_MARKET.totalBets.toString()} />
                  <StatItem icon={<Clock />} label="Ends In" value={MOCK_MARKET.endsIn} />
                </div>

                <div className="p-4 bg-[#1E90FF]/10 border border-[#00E5FF]/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 neon-text flex-shrink-0 mt-0.5 animate-neon-pulse" />
                    <div className="text-sm text-slate-300">
                      <strong className="neon-text">Resolution Criteria:</strong> {MOCK_MARKET.description}
                    </div>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#00E5FF]/20 to-transparent rounded-full blur-3xl" />
              </motion.div>

              {/* Current Odds */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold mb-6 font-orbitron neon-text">Current Odds</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#39FF14]/10 border-2 border-[#39FF14]/40 rounded-xl p-6 hover:shadow-lg hover:shadow-green-500/50 transition-all group">
                    <div className="text-sm text-slate-300 mb-2 font-semibold">YES</div>
                    <div className="text-5xl font-black neon-text-green mb-2 font-numbers">
                      {MOCK_MARKET.yesPrice}%
                    </div>
                    <div className="text-sm text-slate-300 font-numbers">
                      Pool: <span className="neon-text-green">{MOCK_MARKET.yesPool}</span>
                    </div>
                  </div>

                  <div className="bg-[#FF0040]/10 border-2 border-[#FF0040]/40 rounded-xl p-6 hover:shadow-lg hover:shadow-red-500/50 transition-all group">
                    <div className="text-sm text-slate-300 mb-2 font-semibold">NO</div>
                    <div className="text-5xl font-black text-[#FF0040] mb-2 font-numbers" style={{textShadow: '0 0 10px rgba(255, 0, 64, 0.8)'}}>
                      {MOCK_MARKET.noPrice}%
                    </div>
                    <div className="text-sm text-slate-300 font-numbers">
                      Pool: <span className="text-[#FF0040]">{MOCK_MARKET.noPool}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 glass-card rounded-lg">
                  <div className="text-sm text-slate-300 mb-2 font-orbitron font-semibold">Price Distribution</div>
                  <div className="h-3 rounded-full overflow-hidden flex relative" style={{background: '#0D1226'}}>
                    <div
                      className="bg-gradient-to-r from-[#39FF14] to-[#00FFA3] relative"
                      style={{ width: `${MOCK_MARKET.yesPrice}%`, boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
                    />
                    <div
                      className="bg-gradient-to-r from-[#FF0040] to-[#FF1493] relative"
                      style={{ width: `${MOCK_MARKET.noPrice}%`, boxShadow: '0 0 10px rgba(255, 0, 64, 0.5)' }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold mb-6 font-orbitron neon-text">Recent Activity</h2>

                <div className="space-y-3">
                  {MOCK_MARKET.recentBets.map((bet, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center justify-between p-4 glass-card rounded-lg hover:border-[#00E5FF] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                          bet.side === "YES"
                            ? "bg-[#39FF14]/20 neon-text-green border border-[#39FF14]/30"
                            : "bg-[#FF0040]/20 text-[#FF0040] border border-[#FF0040]/30"
                        }`}>
                          {bet.side}
                        </div>
                        <div>
                          <div className="font-semibold font-orbitron text-slate-200">{bet.user}</div>
                          <div className="text-sm text-slate-400">{bet.time}</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold font-numbers neon-text">{bet.amount}</div>
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
                className="glass-card rounded-2xl p-6 sticky top-24 relative overflow-hidden animate-neon-border"
                style={{borderWidth: '2px'}}
              >
                <h2 className="text-2xl font-bold mb-6 font-orbitron neon-text-magenta">Place Your Bet</h2>

                {/* Side Selection */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setSelectedSide("YES")}
                    className={`p-4 rounded-xl font-bold text-lg transition-all font-orbitron ${
                      selectedSide === "YES"
                        ? "bg-[#39FF14] text-black scale-105 shadow-xl shadow-green-500/70"
                        : "bg-[#39FF14]/10 neon-text-green border-2 border-[#39FF14]/40 hover:bg-[#39FF14]/20 hover:shadow-lg hover:shadow-green-500/50"
                    }`}
                  >
                    <div className="mb-1">YES</div>
                    <div className="text-2xl font-numbers">{MOCK_MARKET.yesPrice}%</div>
                  </button>

                  <button
                    onClick={() => setSelectedSide("NO")}
                    className={`p-4 rounded-xl font-bold text-lg transition-all font-orbitron ${
                      selectedSide === "NO"
                        ? "bg-[#FF0040] text-white scale-105 shadow-xl shadow-red-500/70"
                        : "bg-[#FF0040]/10 text-[#FF0040] border-2 border-[#FF0040]/40 hover:bg-[#FF0040]/20 hover:shadow-lg hover:shadow-red-500/50"
                    }`}
                    style={selectedSide !== "NO" ? {textShadow: '0 0 10px rgba(255, 0, 64, 0.8)'} : {}}
                  >
                    <div className="mb-1">NO</div>
                    <div className="text-2xl font-numbers">{MOCK_MARKET.noPrice}%</div>
                  </button>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 font-orbitron text-slate-300">Bet Amount (USDC)</label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="w-full glass-card rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-[#00E5FF] focus:outline-none transition-all font-numbers"
                    style={{borderWidth: '2px'}}
                  />
                  <div className="flex gap-2 mt-2">
                    {["10", "50", "100", "500"].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setBetAmount(amount)}
                        className="flex-1 px-3 py-1.5 glass-card hover:border-[#00E5FF] rounded-lg text-sm font-bold transition-all font-numbers neon-text"
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
                    className="mb-6 p-4 glass-card rounded-xl space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 font-orbitron">Your Bet:</span>
                      <span className="font-bold font-numbers neon-text">${betAmount} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 font-orbitron">Potential Payout:</span>
                      <span className="font-bold neon-text-green font-numbers">${calculatePotentialPayout()} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 font-orbitron">Potential ROI:</span>
                      <span className="font-bold neon-text-green font-numbers">+{calculateROI()}%</span>
                    </div>
                    <div className="border-t border-[#00E5FF]/20 pt-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-orbitron">Platform Fee (2%):</span>
                        <span className="text-slate-400 font-numbers">-${(parseFloat(calculatePotentialPayout()) * 0.02).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Place Bet Button */}
                <button
                  onClick={handlePlaceBet}
                  disabled={!betAmount || !selectedSide || isPlacingBet}
                  className="w-full py-4 neon-button rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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

                <p className="text-xs text-center text-slate-400 mt-4">
                  By placing a bet, you agree to the market resolution criteria and platform terms.
                </p>

                {/* Glow Effect */}
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-[#FF1493]/20 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 -z-10" />
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
      <div className="p-2 bg-gradient-to-br from-[#00E5FF] to-[#1E90FF] rounded-lg animate-neon-pulse shadow-lg shadow-cyan-500/50">
        {icon}
      </div>
      <div>
        <div className="text-sm text-slate-300">{label}</div>
        <div className="font-bold font-numbers neon-text">{value}</div>
      </div>
    </div>
  );
}
