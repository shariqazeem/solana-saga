"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import {
  Clock, DollarSign, Trophy, Target, ChevronRight,
  Check, X, Timer, Loader2, Wallet, Gift, Zap, Home, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePredictionMarkets, Bet, Market } from "@/lib/solana/hooks/usePredictionMarkets";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { RetroGrid } from "@/components/RetroGrid";
import { WalletButton } from "@/components/WalletButton";

const TABS = [
  { id: "active", name: "Active", icon: Timer },
  { id: "claimable", name: "Claim", icon: Gift },
  { id: "won", name: "Won", icon: Trophy },
  { id: "lost", name: "Lost", icon: X },
];

interface BetWithMarket extends Bet {
  marketData?: Market;
  status: "active" | "claimable" | "won" | "lost";
  potentialPayout?: number;
}

export default function MyBetsPage() {
  const [activeTab, setActiveTab] = useState("active");
  const { connected } = useWallet();
  const { userBets, markets, loading, claimWinnings, refetch } = usePredictionMarkets();
  const { balance: usdcBalance } = useUsdcBalance();
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  // Create a map of markets for quick lookup
  const marketMap = useMemo(() => {
    const map = new Map<string, Market>();
    markets.forEach(m => map.set(m.publicKey, m));
    return map;
  }, [markets]);

  // Categorize bets
  const categorizedBets = useMemo(() => {
    const active: BetWithMarket[] = [];
    const claimable: BetWithMarket[] = [];
    const won: BetWithMarket[] = [];
    const lost: BetWithMarket[] = [];

    userBets.forEach(bet => {
      const market = marketMap.get(bet.market);
      if (!market) return;

      // Calculate potential payout based on current pool sizes
      const totalPool = market.yesPool + market.noPool;
      const sidePool = bet.prediction ? market.yesPool : market.noPool;
      const potentialPayout = sidePool > 0 ? (bet.amount / sidePool) * totalPool : bet.amount * 2;

      const betWithMarket: BetWithMarket = {
        ...bet,
        marketData: market,
        status: "active",
        potentialPayout,
      };

      if (market.status === "Resolved") {
        const userWon = market.outcome === bet.prediction;

        if (userWon && !bet.claimed) {
          betWithMarket.status = "claimable";
          claimable.push(betWithMarket);
        } else if (userWon && bet.claimed) {
          betWithMarket.status = "won";
          won.push(betWithMarket);
        } else if (!userWon) {
          betWithMarket.status = "lost";
          lost.push(betWithMarket);
        }
      } else {
        betWithMarket.status = "active";
        active.push(betWithMarket);
      }
    });

    return { active, claimable, won, lost };
  }, [userBets, marketMap]);

  // Calculate portfolio stats
  const portfolioStats = useMemo(() => {
    let totalInvested = 0;
    let potentialReturn = 0;
    let totalWon = 0;
    let totalLost = 0;
    let winCount = 0;
    let lossCount = 0;

    categorizedBets.active.forEach(bet => {
      totalInvested += bet.amount;
      potentialReturn += bet.potentialPayout || 0;
    });

    categorizedBets.claimable.forEach(bet => {
      totalWon += bet.payout || (bet.potentialPayout || 0);
      winCount++;
    });

    categorizedBets.won.forEach(bet => {
      totalWon += bet.payout;
      winCount++;
    });

    categorizedBets.lost.forEach(bet => {
      totalLost += bet.amount;
      lossCount++;
    });

    const totalBets = winCount + lossCount;
    const winRate = totalBets > 0 ? Math.round((winCount / totalBets) * 100) : 0;

    return {
      totalInvested: totalInvested.toFixed(2),
      potentialReturn: potentialReturn.toFixed(2),
      totalWon: totalWon.toFixed(2),
      totalLost: totalLost.toFixed(2),
      winRate,
      totalBets,
    };
  }, [categorizedBets]);

  const handleClaim = async (betAddress: string) => {
    setClaiming(betAddress);
    setClaimError(null);
    setClaimSuccess(null);

    try {
      const tx = await claimWinnings(betAddress);
      setClaimSuccess(`Claimed! TX: ${tx.slice(0, 8)}...`);
      await refetch();
    } catch (error: any) {
      setClaimError(error.message || "Failed to claim");
    } finally {
      setClaiming(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getBetsForTab = (tabId: string): BetWithMarket[] => {
    switch (tabId) {
      case "active": return categorizedBets.active;
      case "claimable": return categorizedBets.claimable;
      case "won": return categorizedBets.won;
      case "lost": return categorizedBets.lost;
      default: return [];
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative">
      {/* Background */}
      <RetroGrid streak={0} />

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              <Gift className="w-6 h-6 text-[#ff00aa]" />
              <span className="font-game text-lg">
                <span className="text-white">MY </span>
                <span className="text-[#ff00aa]">BETS</span>
              </span>
            </div>
          </div>

          {/* Balance */}
          {connected && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30">
              <Wallet className="w-4 h-4 text-[#00FF88]" />
              <span className="text-sm font-numbers font-bold text-white">
                ${usdcBalance.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="relative z-10 pt-20 pb-8 px-4 min-h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Not Connected State */}
          {!connected ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-[#ff00aa]/20 to-[#00f0ff]/20 flex items-center justify-center border border-[#ff00aa]/30">
                <Wallet className="w-10 h-10 text-[#ff00aa]" />
              </div>
              <h2 className="text-2xl font-game text-white mb-3">Connect Wallet</h2>
              <p className="text-gray-400 mb-6 max-w-xs">
                Connect your wallet to view your bets and claim winnings
              </p>
              <WalletButton />
            </motion.div>
          ) : (
            <>
              {/* Success/Error Messages */}
              <AnimatePresence>
                {claimSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 rounded-xl bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88] flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {claimSuccess}
                  </motion.div>
                )}
                {claimError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 rounded-xl bg-[#ff0044]/20 border border-[#ff0044]/30 text-[#ff0044] flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    {claimError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
              >
                <div className="game-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-[#00f0ff]" />
                    <span className="text-xs text-gray-400">Active</span>
                  </div>
                  <div className="text-xl font-numbers font-bold text-white">
                    ${portfolioStats.totalInvested}
                  </div>
                </div>

                <div className="game-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-[#00ff88]" />
                    <span className="text-xs text-gray-400">Won</span>
                  </div>
                  <div className="text-xl font-numbers font-bold text-[#00ff88]">
                    +${portfolioStats.totalWon}
                  </div>
                </div>

                <div className="game-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-[#ffd700]" />
                    <span className="text-xs text-gray-400">Win Rate</span>
                  </div>
                  <div className="text-xl font-numbers font-bold text-white">
                    {portfolioStats.winRate}%
                  </div>
                </div>

                <div className="game-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-[#ff00aa]" />
                    <span className="text-xs text-gray-400">Claimable</span>
                  </div>
                  <div className="text-xl font-numbers font-bold text-[#ff00aa]">
                    {categorizedBets.claimable.length}
                  </div>
                </div>
              </motion.div>

              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-2 mb-6 overflow-x-auto pb-2"
              >
                {TABS.map((tab) => {
                  const count = getBetsForTab(tab.id).length;
                  const isClaimable = tab.id === "claimable" && count > 0;

                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-game text-xs whitespace-nowrap transition-all ${
                        activeTab === tab.id
                          ? "bg-white/10 border border-white/20 text-white"
                          : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                      } ${isClaimable ? "animate-pulse border-[#00ff88]/50" : ""}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <tab.icon className={`w-4 h-4 ${isClaimable ? "text-[#00ff88]" : ""}`} />
                      {tab.name}
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                        activeTab === tab.id ? "bg-white/20" : "bg-white/5"
                      } ${isClaimable ? "bg-[#00ff88]/30 text-[#00ff88]" : ""}`}>
                        {count}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-[#ff00aa] animate-spin" />
                </div>
              )}

              {/* Bets List */}
              {!loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <AnimatePresence mode="wait">
                    {/* Active Bets */}
                    {activeTab === "active" && (
                      <motion.div
                        key="active"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                      >
                        {categorizedBets.active.map((bet, index) => (
                          <motion.div
                            key={bet.publicKey}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="game-card p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    bet.prediction
                                      ? "bg-[#00ff88]/20 text-[#00ff88]"
                                      : "bg-[#ff0044]/20 text-[#ff0044]"
                                  }`}>
                                    {bet.prediction ? "YES" : "NO"}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {bet.marketData?.endsIn}
                                  </span>
                                </div>
                                <h3 className="font-game text-sm text-white truncate">
                                  {bet.marketData?.question || "Unknown Market"}
                                </h3>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-xs text-gray-400">Stake</div>
                                <div className="text-lg font-numbers font-bold text-white">
                                  ${bet.amount.toFixed(2)}
                                </div>
                                <div className="text-xs text-[#00ff88]">
                                  → ${(bet.potentialPayout || 0).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {/* Claimable Bets */}
                    {activeTab === "claimable" && (
                      <motion.div
                        key="claimable"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                      >
                        {categorizedBets.claimable.map((bet, index) => (
                          <motion.div
                            key={bet.publicKey}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="game-card p-4 border-[#00ff88]/50 bg-[#00ff88]/5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-5 h-5 rounded-full bg-[#00ff88] flex items-center justify-center animate-pulse">
                                    <Gift className="w-3 h-3 text-black" />
                                  </div>
                                  <span className="text-xs text-[#00ff88] font-bold">WINNER!</span>
                                </div>
                                <h3 className="font-game text-sm text-white truncate">
                                  {bet.marketData?.question || "Unknown Market"}
                                </h3>
                                <div className="text-xs text-gray-400 mt-1">
                                  Bet {bet.prediction ? "YES" : "NO"} • Won!
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="text-right">
                                  <div className="text-xs text-gray-400">Winnings</div>
                                  <div className="text-lg font-numbers font-bold text-[#00ff88]">
                                    ~${(bet.potentialPayout || 0).toFixed(2)}
                                  </div>
                                </div>
                                <motion.button
                                  onClick={() => handleClaim(bet.publicKey)}
                                  disabled={claiming === bet.publicKey}
                                  className="px-4 py-2 rounded-xl bg-[#00ff88] text-black text-xs font-bold hover:bg-[#00ff88]/90 transition-colors disabled:opacity-50"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {claiming === bet.publicKey ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    "CLAIM"
                                  )}
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {/* Won Bets */}
                    {activeTab === "won" && (
                      <motion.div
                        key="won"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                      >
                        {categorizedBets.won.map((bet, index) => (
                          <motion.div
                            key={bet.publicKey}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="game-card p-4 border-[#00ff88]/30"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-5 h-5 rounded-full bg-[#00ff88] flex items-center justify-center">
                                    <Check className="w-3 h-3 text-black" />
                                  </div>
                                  <span className="text-xs text-[#00ff88] font-bold">WON</span>
                                  <span className="text-xs text-gray-500">{formatDate(bet.timestamp)}</span>
                                </div>
                                <h3 className="font-game text-sm text-white truncate">
                                  {bet.marketData?.question || "Unknown Market"}
                                </h3>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-400">Payout</div>
                                <div className="text-lg font-numbers font-bold text-[#00ff88]">
                                  +${bet.payout.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {/* Lost Bets */}
                    {activeTab === "lost" && (
                      <motion.div
                        key="lost"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                      >
                        {categorizedBets.lost.map((bet, index) => (
                          <motion.div
                            key={bet.publicKey}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="game-card p-4 border-[#ff0044]/30 opacity-75"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-5 h-5 rounded-full bg-[#ff0044] flex items-center justify-center">
                                    <X className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="text-xs text-[#ff0044] font-bold">LOST</span>
                                  <span className="text-xs text-gray-500">{formatDate(bet.timestamp)}</span>
                                </div>
                                <h3 className="font-game text-sm text-white truncate">
                                  {bet.marketData?.question || "Unknown Market"}
                                </h3>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-400">Lost</div>
                                <div className="text-lg font-numbers font-bold text-[#ff0044]">
                                  -${bet.amount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Empty State */}
                  {getBetsForTab(activeTab).length === 0 && !loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16"
                    >
                      <div className="text-5xl mb-4">
                        {activeTab === "claimable" ? "🎁" : activeTab === "won" ? "🏆" : activeTab === "lost" ? "😢" : "📭"}
                      </div>
                      <h3 className="text-lg font-game text-white mb-2">
                        {activeTab === "claimable"
                          ? "No winnings to claim"
                          : activeTab === "won"
                          ? "No wins yet"
                          : activeTab === "lost"
                          ? "No losses - nice!"
                          : "No active bets"}
                      </h3>
                      <p className="text-gray-400 text-sm mb-6">
                        {activeTab === "claimable"
                          ? "Win some bets to claim rewards!"
                          : "Start predicting to see them here!"}
                      </p>
                      <Link href="/">
                        <motion.button
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff]/20 to-[#ff00aa]/20 border border-[#00f0ff]/30 text-[#00f0ff] font-game text-sm hover:border-[#00f0ff]/50 transition-all flex items-center gap-2 mx-auto"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Zap className="w-4 h-4" />
                          START PREDICTING
                        </motion.button>
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
