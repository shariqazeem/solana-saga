"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  TrendingUp, TrendingDown, Clock, Users, DollarSign,
  Zap, Share2, Star, ChevronRight, AlertCircle, Check,
  ArrowLeft, Flame, Target, Trophy, Loader2
} from "lucide-react";
import Link from "next/link";
import { usePredictionMarkets, Market } from "@/lib/solana/hooks/usePredictionMarkets";
import { useWallet } from "@solana/wallet-adapter-react";
import { BetSuccessModal } from "@/components/BetSuccessModal";

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = params.id as string;
  const wallet = useWallet();

  const { getMarket, placeBet, loading: hookLoading } = usePredictionMarkets();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSide, setSelectedSide] = useState<boolean | null>(null); // true = YES, false = NO
  const [betAmount, setBetAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betSuccess, setBetSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successBetData, setSuccessBetData] = useState<{
    question: string;
    side: boolean;
    amount: number;
    multiplier: string;
    potentialPayout: number;
  } | null>(null);

  // Fetch market data
  const fetchMarket = useCallback(async () => {
    if (!marketId || !getMarket) return;

    try {
      setLoading(true);
      setError(null);
      const marketData = await getMarket(marketId);
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
  }, [marketId, getMarket]);

  useEffect(() => {
    fetchMarket();
  }, [fetchMarket]);

  const calculatePayout = () => {
    if (!betAmount || selectedSide === null || !market) return "0";
    const amount = parseFloat(betAmount);
    // Use multiplier for more accurate payout calculation
    const multiplierStr = selectedSide ? market.yesMultiplier : market.noMultiplier;
    const multiplier = parseFloat(multiplierStr.replace("x", ""));
    return (amount * multiplier).toFixed(2);
  };

  const getMultiplierValue = () => {
    if (selectedSide === null || !market) return 1;
    const multiplierStr = selectedSide ? market.yesMultiplier : market.noMultiplier;
    return parseFloat(multiplierStr.replace("x", ""));
  };

  const handlePlaceBet = async () => {
    if (!wallet.connected) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!market || selectedSide === null || !betAmount) return;

    try {
      setIsPlacingBet(true);
      const amount = parseFloat(betAmount);
      const multiplier = selectedSide ? market.yesMultiplier : market.noMultiplier;
      const potentialPayout = parseFloat(calculatePayout());

      await placeBet(market.publicKey, amount, selectedSide);

      // Store bet data for success modal
      setSuccessBetData({
        question: market.question,
        side: selectedSide,
        amount: amount,
        multiplier: multiplier,
        potentialPayout: potentialPayout,
      });

      setShowConfirm(false);
      setShowSuccessModal(true);

      // Refresh market data
      setTimeout(async () => {
        const updated = await getMarket(marketId);
        if (updated) setMarket(updated);
        setBetAmount("");
        setSelectedSide(null);
      }, 1000);
    } catch (err: any) {
      console.error("Error placing bet:", err);
      alert(err.message || "Failed to place bet");
    } finally {
      setIsPlacingBet(false);
    }
  };

  // Loading state
  if (loading || hookLoading) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#00f0ff] animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-game">Loading market data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !market) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-game text-white mb-2">Market Not Found</h2>
          <p className="text-gray-400 mb-6">{error || "This market doesn't exist"}</p>
          <Link href="/markets">
            <button className="px-6 py-3 rounded-xl bg-[#00f0ff]/20 border border-[#00f0ff]/50 text-[#00f0ff] font-game hover:bg-[#00f0ff]/30 transition-all">
              Back to Markets
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const endsInText = market.endsIn === "Ended" ? "Ended" : market.endsIn;
  const isExpired = market.endsIn === "Ended";
  const totalPool = market.yesPool + market.noPool;

  return (
    <div className="min-h-screen pt-24 pb-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/markets">
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-game text-sm">Back to Markets</span>
            </button>
          </Link>
        </div>

        {/* Bet Success Modal */}
        {successBetData && (
          <BetSuccessModal
            isOpen={showSuccessModal}
            onClose={() => {
              setShowSuccessModal(false);
              setSuccessBetData(null);
            }}
            betData={successBetData}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Card */}
            <div className="game-card p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`category-pill ${
                      market.category.toLowerCase() === 'crypto' || market.category.toLowerCase() === 'price'
                        ? 'category-pill-crypto'
                        : market.category.toLowerCase() === 'sports'
                        ? 'category-pill-sports'
                        : market.category.toLowerCase() === 'meme'
                        ? 'category-pill-meme'
                        : 'category-pill-politics'
                    }`}>
                      {market.category}
                    </span>
                    {market.totalVolume > 100 && (
                      <span className="hot-badge">
                        <Flame className="w-3 h-3" />
                        HOT
                      </span>
                    )}
                    {isExpired && (
                      <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                        ENDED
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-game font-bold text-white">
                    {market.question}
                  </h1>
                </div>
              </div>

              {/* Big Battle Bar */}
              <div className="mb-8">
                <div className="relative h-24 rounded-2xl overflow-hidden bg-black/50">
                  {/* YES Side */}
                  <div
                    className="absolute left-0 top-0 bottom-0 flex items-center justify-start px-6 transition-all duration-1000"
                    style={{
                      width: `${market.yesPrice}%`,
                      background: "linear-gradient(90deg, rgba(0, 255, 136, 0.3), rgba(0, 255, 136, 0.1))",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-[#00ff88]" />
                      <div>
                        <div className="text-2xl font-numbers font-black text-[#00ff88]">
                          {market.yesMultiplier}
                        </div>
                        <div className="text-sm font-game text-[#00ff88]/70">YES PAYOUT</div>
                        <div className="text-xs font-numbers text-[#00ff88]/50">{market.yesPrice}% chance</div>
                      </div>
                    </div>
                  </div>

                  {/* NO Side */}
                  <div
                    className="absolute right-0 top-0 bottom-0 flex items-center justify-end px-6 transition-all duration-1000"
                    style={{
                      width: `${market.noPrice}%`,
                      background: "linear-gradient(270deg, rgba(255, 0, 68, 0.3), rgba(255, 0, 68, 0.1))",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-numbers font-black text-[#ff0044]">
                          {market.noMultiplier}
                        </div>
                        <div className="text-sm font-game text-[#ff0044]/70">NO PAYOUT</div>
                        <div className="text-xs font-numbers text-[#ff0044]/50">{market.noPrice}% chance</div>
                      </div>
                      <TrendingDown className="w-8 h-8 text-[#ff0044]" />
                    </div>
                  </div>

                  {/* Center VS */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-12 h-12 rounded-full bg-[#0a0a0f] border-2 border-[#ffd700] flex items-center justify-center">
                      <span className="font-pixel text-[#ffd700] text-xs">VS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="stat-box">
                  <DollarSign className="w-5 h-5 text-[#00f0ff] mb-2" />
                  <div className="text-xl font-numbers font-bold text-white">
                    ${market.totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-gray-500">Volume</div>
                </div>
                <div className="stat-box">
                  <Users className="w-5 h-5 text-[#ff00aa] mb-2" />
                  <div className="text-xl font-numbers font-bold text-white">{market.bettors}</div>
                  <div className="text-xs text-gray-500">Bettors</div>
                </div>
                <div className="stat-box">
                  <Zap className="w-5 h-5 text-[#ffd700] mb-2" />
                  <div className="text-xl font-numbers font-bold text-white">
                    ${totalPool.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-gray-500">Pool</div>
                </div>
                <div className="stat-box">
                  <Clock className="w-5 h-5 text-[#ff8800] mb-2" />
                  <div className="text-xl font-numbers font-bold text-white">{endsInText}</div>
                  <div className="text-xs text-gray-500">
                    {isExpired ? "Status" : "Remaining"}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-game text-sm text-gray-400 mb-2">MARKET DETAILS</h3>
                <p className="text-gray-300 leading-relaxed">
                  {market.description || "No description provided."}
                </p>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div>Market ID: <span className="text-[#00f0ff] font-mono text-xs">{market.id}</span></div>
                <div>•</div>
                <div>Status: <span className="text-white">{market.status}</span></div>
                {market.isResolved && (
                  <>
                    <div>•</div>
                    <div>Winner: <span className={market.outcome ? "text-[#00ff88]" : "text-[#ff0044]"}>
                      {market.outcome ? "YES" : "NO"}
                    </span></div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Betting Panel */}
          <div className="lg:col-span-1">
            <div className="game-card p-6 sticky top-24">
              <h3 className="font-game text-white text-lg mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#00f0ff]" />
                Place Your Bet
              </h3>

              {/* Wallet Connection Check */}
              {!wallet.connected ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">Connect your wallet to place bets</p>
                </div>
              ) : isExpired ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">This market has ended</p>
                </div>
              ) : (
                <>
                  {/* Side Selection */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setSelectedSide(true)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedSide === true
                          ? "border-[#00ff88] bg-[#00ff88]/10"
                          : "border-white/10 bg-white/5 hover:border-[#00ff88]/50"
                      }`}
                    >
                      <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${
                        selectedSide === true ? "text-[#00ff88]" : "text-gray-400"
                      }`} />
                      <div className={`font-game text-sm ${
                        selectedSide === true ? "text-[#00ff88]" : "text-gray-400"
                      }`}>YES</div>
                      <div className="text-2xl font-numbers font-bold text-white">{market.yesMultiplier}</div>
                      <div className="text-xs text-gray-500 font-numbers">{market.yesPrice}% chance</div>
                    </button>

                    <button
                      onClick={() => setSelectedSide(false)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedSide === false
                          ? "border-[#ff0044] bg-[#ff0044]/10"
                          : "border-white/10 bg-white/5 hover:border-[#ff0044]/50"
                      }`}
                    >
                      <TrendingDown className={`w-8 h-8 mx-auto mb-2 ${
                        selectedSide === false ? "text-[#ff0044]" : "text-gray-400"
                      }`} />
                      <div className={`font-game text-sm ${
                        selectedSide === false ? "text-[#ff0044]" : "text-gray-400"
                      }`}>NO</div>
                      <div className="text-2xl font-numbers font-bold text-white">{market.noMultiplier}</div>
                      <div className="text-xs text-gray-500 font-numbers">{market.noPrice}% chance</div>
                    </button>
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
                        min="1"
                        max="10000"
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
                  {selectedSide !== null && betAmount && parseFloat(betAmount) > 0 && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#00ff88]/5 to-[#00f0ff]/5 border border-[#00ff88]/20 mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Potential Payout</span>
                        <span className="font-numbers font-bold text-[#00ff88] text-xl">
                          ${calculatePayout()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Multiplier</span>
                        <span className="text-[#ffd700] font-numbers font-bold">
                          {selectedSide ? market.yesMultiplier : market.noMultiplier}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Place Bet Button */}
                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={selectedSide === null || !betAmount || parseFloat(betAmount) < 1}
                    className={`w-full py-4 rounded-xl font-game text-lg flex items-center justify-center gap-2 transition-all ${
                      selectedSide !== null && betAmount && parseFloat(betAmount) >= 1
                        ? "bg-gradient-to-r from-[#00ff88] to-[#00f0ff] text-black hover:shadow-lg hover:shadow-[#00ff88]/30"
                        : "bg-white/10 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                    {selectedSide !== null && betAmount ? "Place Bet" : "Select Side & Amount"}
                  </button>

                  {/* Info */}
                  <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>2% fee only on winnings. Min: 1 USDC, Max: 10,000 USDC.</span>
                  </div>
                </>
              )}
            </div>
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
            onClick={() => !isPlacingBet && setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="game-card p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00ff88]/20 to-[#00f0ff]/20 flex items-center justify-center mx-auto mb-4">
                  {isPlacingBet ? (
                    <Loader2 className="w-8 h-8 text-[#00ff88] animate-spin" />
                  ) : (
                    <Check className="w-8 h-8 text-[#00ff88]" />
                  )}
                </div>
                <h3 className="font-game text-xl text-white mb-2">
                  {isPlacingBet ? "Placing Bet..." : "Confirm Your Bet"}
                </h3>
                <p className="text-gray-400">
                  {isPlacingBet ? "Please approve the transaction in your wallet" : "You're about to place a bet"}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-gray-400">Side</span>
                  <span className={`font-bold ${selectedSide === true ? "text-[#00ff88]" : "text-[#ff0044]"}`}>
                    {selectedSide === true ? "YES" : "NO"}
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
                  disabled={isPlacingBet}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 font-game hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePlaceBet}
                  disabled={isPlacingBet}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00f0ff] text-black font-game disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlacingBet ? "Processing..." : "Confirm Bet"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
