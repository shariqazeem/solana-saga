"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft, TrendingUp, Users, DollarSign, Clock, Target,
  AlertCircle, Check, Share2, Trophy, Flame, ChevronRight
} from "lucide-react";
import { useState, use, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { WalletButton } from "@/components/WalletButton";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { usePredictionMarkets, Market as MarketType } from "@/lib/solana/hooks/usePredictionMarkets";

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const wallet = useAnchorWallet();
  const { getMarket, placeBet, userBets, loading: hookLoading } = usePredictionMarkets();

  const [market, setMarket] = useState<MarketType | null>(null);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState("");
  const [selectedSide, setSelectedSide] = useState<"YES" | "NO" | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch market data - id is the market public key
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const marketData = await getMarket(id);
        if (marketData) {
          setMarket(marketData);
        } else {
          setError("Market not found");
        }
      } catch (err: any) {
        console.error("Error fetching market:", err);
        setError(err.message || "Failed to load market");
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [id, getMarket]);

  const handlePlaceBet = async () => {
    if (!betAmount || !selectedSide || !market || !wallet) {
      if (!wallet) {
        setError("Please connect your wallet first");
      }
      return;
    }

    setIsPlacingBet(true);
    setError(null);
    setSuccess(null);

    try {
      const amount = parseFloat(betAmount);

      // Validate amount
      if (amount < 1) {
        throw new Error("Minimum bet is 1 USDC");
      }
      if (amount > 10000) {
        throw new Error("Maximum bet is 10,000 USDC");
      }

      const prediction = selectedSide === "YES";

      // Place bet on blockchain
      const signature = await placeBet(market.publicKey, amount, prediction);

      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSuccess(`Bet placed successfully! Transaction: ${signature.slice(0, 8)}... Refreshing market data...`);
      setBetAmount("");
      setSelectedSide(null);

      // Aggressively refresh market data
      console.log("=== Starting market data refresh ===");
      console.log("Current market state:", {
        volume: market.totalVolume,
        bettors: market.bettors,
        totalBets: market.totalBetsCount
      });

      // Wait longer initially for blockchain to finalize (8 seconds)
      await new Promise(resolve => setTimeout(resolve, 8000));

      // Aggressive polling with increasing delays
      for (let attempt = 1; attempt <= 6; attempt++) {
        console.log(`Refresh attempt ${attempt}/6...`);

        const updatedMarket = await getMarket(market.publicKey);
        if (updatedMarket) {
          console.log(`Attempt ${attempt} fetched data:`, {
            volume: updatedMarket.totalVolume,
            bettors: updatedMarket.bettors,
            totalBets: updatedMarket.totalBetsCount,
            status: updatedMarket.status,
            endsIn: updatedMarket.endsIn
          });

          // Always update the state with latest data
          setMarket(updatedMarket);

          // Check if data has actually changed
          if (updatedMarket.totalBetsCount > market.totalBetsCount) {
            console.log("✓ Market data successfully updated!");
            setSuccess(`Bet placed successfully! Market updated.`);
            break;
          }

          // On last attempt, show message to refresh
          if (attempt === 6) {
            setSuccess(`Bet placed successfully! Please refresh the page if stats don't update.`);
          }
        }

        // Wait before next attempt with increasing delay
        if (attempt < 6) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    } catch (err: any) {
      console.error("Error placing bet:", err);
      setError(err.message || "Failed to place bet");
    } finally {
      setIsPlacingBet(false);
    }
  };

  const calculatePotentialPayout = () => {
    if (!betAmount || !selectedSide || !market) return "0";
    const amount = parseFloat(betAmount);
    const price = selectedSide === "YES" ? market.yesPrice : market.noPrice;
    if (price === 0) return "0";
    const payout = (amount / price) * 100;
    return payout.toFixed(2);
  };

  const calculateROI = () => {
    if (!betAmount) return "0";
    const amount = parseFloat(betAmount);
    const payout = parseFloat(calculatePotentialPayout());
    if (amount === 0) return "0";
    const roi = ((payout - amount) / amount) * 100;
    return roi.toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00E5FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-orbitron">Loading market...</p>
        </div>
      </div>
    );
  }

  if (error && !market) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-white">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-orbitron text-red-500">{error}</p>
          <Link href="/markets" className="mt-4 inline-block neon-button px-6 py-2 rounded-lg">
            Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  if (!market) return null;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/markets">
            <button className="flex items-center gap-2 text-slate-300 hover:neon-text transition-all font-orbitron">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Markets</span>
            </button>
          </Link>
          <button
            onClick={async () => {
              setLoading(true);
              const refreshedMarket = await getMarket(id);
              if (refreshedMarket) {
                setMarket(refreshedMarket);
              }
              setLoading(false);
            }}
            className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg hover:border-[#00F3FF] transition-all font-orbitron text-sm"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Main Content */}
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
                    {market.category}
                  </span>
                  <span className={`px-4 py-1.5 font-bold rounded-full flex items-center gap-1.5 ${market.status === "Active"
                      ? "bg-gradient-to-r from-[#39FF14]/20 to-[#00FFA3]/20 text-[#39FF14] border border-[#39FF14]/40 animate-neon-pulse"
                      : market.status === "Resolved"
                        ? "bg-gradient-to-r from-[#FF6B00]/20 to-[#FF1493]/20 text-[#FF6B00] border border-[#FF6B00]/40"
                        : "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border border-gray-500/40"
                    }`}>
                    {market.status === "Active" && <Flame className="w-4 h-4" />}
                    {market.status}
                  </span>
                </div>
                <button className="p-2 glass-card rounded-lg transition-all hover:border-[#00E5FF]">
                  <Share2 className="w-5 h-5 neon-text" />
                </button>
              </div>

              <h1 className="text-4xl font-black mb-6 font-orbitron bg-gradient-to-r from-[#00E5FF] to-[#FF1493] bg-clip-text text-transparent">
                {market.question}
              </h1>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatItem icon={<TrendingUp />} label="Volume" value={`$${market.totalVolume.toFixed(2)}`} />
                <StatItem icon={<Users />} label="Bettors" value={market.bettors.toString()} />
                <StatItem icon={<Target />} label="Total Bets" value={market.totalBetsCount.toString()} />
                <StatItem icon={<Clock />} label="Ends In" value={market.endsIn} />
              </div>

              <div className="p-4 bg-[#1E90FF]/10 border border-[#00E5FF]/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 neon-text flex-shrink-0 mt-0.5 animate-neon-pulse" />
                  <div className="text-sm text-slate-300">
                    <strong className="neon-text">Resolution Criteria:</strong> {market.description}
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
                    {market.yesPrice}%
                  </div>
                  <div className="text-sm text-slate-300 font-numbers">
                    Pool: <span className="neon-text-green">${market.yesPool.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-[#FF0040]/10 border-2 border-[#FF0040]/40 rounded-xl p-6 hover:shadow-lg hover:shadow-red-500/50 transition-all group">
                  <div className="text-sm text-slate-300 mb-2 font-semibold">NO</div>
                  <div className="text-5xl font-black text-[#FF0040] mb-2 font-numbers" style={{ textShadow: '0 0 10px rgba(255, 0, 64, 0.8)' }}>
                    {market.noPrice}%
                  </div>
                  <div className="text-sm text-slate-300 font-numbers">
                    Pool: <span className="text-[#FF0040]">${market.noPool.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 glass-card rounded-lg">
                <div className="text-sm text-slate-300 mb-2 font-orbitron font-semibold">Price Distribution</div>
                <div className="h-3 rounded-full overflow-hidden flex relative" style={{ background: '#0D1226' }}>
                  <div
                    className="bg-gradient-to-r from-[#39FF14] to-[#00FFA3] relative"
                    style={{ width: `${market.yesPrice}%`, boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
                  />
                  <div
                    className="bg-gradient-to-r from-[#FF0040] to-[#FF1493] relative"
                    style={{ width: `${market.noPrice}%`, boxShadow: '0 0 10px rgba(255, 0, 64, 0.5)' }}
                  />
                </div>
              </div>
            </motion.div>

            {/* User's Bets */}
            {wallet && userBets.filter(bet => bet.market === market.publicKey).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold mb-6 font-orbitron neon-text">Your Bets</h2>

                <div className="space-y-3">
                  {userBets.filter(bet => bet.market === market.publicKey).map((bet, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 glass-card rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-lg font-bold text-sm ${bet.prediction
                            ? "bg-[#39FF14]/20 neon-text-green border border-[#39FF14]/30"
                            : "bg-[#FF0040]/20 text-[#FF0040] border border-[#FF0040]/30"
                          }`}>
                          {bet.prediction ? "YES" : "NO"}
                        </div>
                        <div>
                          <div className="font-semibold font-numbers">${bet.amount.toFixed(2)} USDC</div>
                          <div className="text-sm text-slate-400">
                            {bet.claimed ? "Claimed" : "Pending"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {bet.claimed && bet.payout > 0 && (
                          <div className="text-lg font-bold font-numbers neon-text-green">
                            +${bet.payout.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Betting Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 sticky top-24 relative overflow-hidden animate-neon-border"
              style={{ borderWidth: '2px' }}
            >
              <h2 className="text-2xl font-bold mb-6 font-orbitron neon-text-magenta">Place Your Bet</h2>

              {!wallet && (
                <div className="mb-6 p-4 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-xl">
                  <p className="text-sm text-slate-300 text-center">
                    Connect your wallet to place bets
                  </p>
                </div>
              )}

              {wallet && market.status !== "Active" && (
                <div className="mb-6 p-4 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-xl">
                  <p className="text-sm text-slate-300 text-center">
                    This market is {market.status.toLowerCase()} and not accepting bets
                  </p>
                </div>
              )}

              {/* Side Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setSelectedSide("YES")}
                  disabled={!wallet || market.status !== "Active"}
                  className={`p-4 rounded-xl font-bold text-lg transition-all font-orbitron disabled:opacity-50 disabled:cursor-not-allowed ${selectedSide === "YES"
                      ? "bg-[#39FF14] text-black scale-105 shadow-xl shadow-green-500/70"
                      : "bg-[#39FF14]/10 neon-text-green border-2 border-[#39FF14]/40 hover:bg-[#39FF14]/20 hover:shadow-lg hover:shadow-green-500/50"
                    }`}
                >
                  <div className="mb-1">YES</div>
                  <div className="text-2xl font-numbers">{market.yesPrice}%</div>
                </button>

                <button
                  onClick={() => setSelectedSide("NO")}
                  disabled={!wallet || market.status !== "Active"}
                  className={`p-4 rounded-xl font-bold text-lg transition-all font-orbitron disabled:opacity-50 disabled:cursor-not-allowed ${selectedSide === "NO"
                      ? "bg-[#FF0040] text-white scale-105 shadow-xl shadow-red-500/70"
                      : "bg-[#FF0040]/10 text-[#FF0040] border-2 border-[#FF0040]/40 hover:bg-[#FF0040]/20 hover:shadow-lg hover:shadow-red-500/50"
                    }`}
                  style={selectedSide !== "NO" ? { textShadow: '0 0 10px rgba(255, 0, 64, 0.8)' } : {}}
                >
                  <div className="mb-1">NO</div>
                  <div className="text-2xl font-numbers">{market.noPrice}%</div>
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
                  disabled={!wallet || market.status !== "Active"}
                  className="w-full glass-card rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-[#00E5FF] focus:outline-none transition-all font-numbers disabled:opacity-50"
                  style={{ borderWidth: '2px' }}
                  min="1"
                  max="10000"
                  step="0.01"
                />
                <div className="flex gap-2 mt-2">
                  {["10", "50", "100", "500"].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      disabled={!wallet || market.status !== "Active"}
                      className="flex-1 px-3 py-1.5 glass-card hover:border-[#00E5FF] rounded-lg text-sm font-bold transition-all font-numbers neon-text disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-400">{success}</p>
                </div>
              )}

              {/* Place Bet Button */}
              <button
                onClick={handlePlaceBet}
                disabled={!betAmount || !selectedSide || isPlacingBet || !wallet || market.status !== "Active"}
                className="w-full py-4 neon-button rounded-xl text-lg font-bold font-orbitron disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isPlacingBet ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Placing Bet...
                  </span>
                ) : !wallet ? (
                  "Connect Wallet"
                ) : market.status !== "Active" ? (
                  "Market Closed"
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
