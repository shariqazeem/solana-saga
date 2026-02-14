"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Clock, DollarSign, Trophy, Target, ChevronRight,
  Check, X, Timer, Loader2, Wallet, Gift, Zap, Home, ArrowLeft, TrendingUp, TrendingDown
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useJupiterPrediction } from "@/hooks/useJupiterPrediction";
import { RetroGrid } from "@/components/RetroGrid";
import { WalletButton } from "@/components/WalletButton";
import { microUsdToDollars } from "@/lib/jupiter/jupiterPredictionApi";
import confetti from "canvas-confetti";
import { updateMissionProgress } from "@/lib/missions";

const TABS = [
  { id: "open", name: "Open", icon: Timer },
  { id: "claimable", name: "Claim", icon: Gift },
  { id: "closed", name: "Closed", icon: Check },
];

export default function MyBetsPage() {
  const [activeTab, setActiveTab] = useState("open");
  const { connected, publicKey } = useWallet();
  const { positions, orders, loading, sellPosition, claimPosition, refetch } = useJupiterPrediction();
  const [selling, setSelling] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const lastGamepadRef = useRef(0);
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  // Gamepad support for My Bets page
  useEffect(() => {
    const DEBOUNCE = 300;
    let raf: number;

    const poll = () => {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];

      if (gp) {
        const now = Date.now();
        if (now - lastGamepadRef.current >= DEBOUNCE) {
          // D-pad up/down: scroll through positions
          if (gp.buttons[12]?.pressed) { // DPAD_UP
            lastGamepadRef.current = now;
            setSelectedIndex((prev) => Math.max(0, prev - 1));
          } else if (gp.buttons[13]?.pressed) { // DPAD_DOWN
            lastGamepadRef.current = now;
            setSelectedIndex((prev) => prev + 1);
          }
          // L1/R1: switch tabs
          else if (gp.buttons[4]?.pressed) { // L1
            lastGamepadRef.current = now;
            const tabs = ["open", "claimable", "closed"];
            const idx = tabs.indexOf(activeTabRef.current);
            setActiveTab(tabs[Math.max(0, idx - 1)]);
            setSelectedIndex(0);
          } else if (gp.buttons[5]?.pressed) { // R1
            lastGamepadRef.current = now;
            const tabs = ["open", "claimable", "closed"];
            const idx = tabs.indexOf(activeTabRef.current);
            setActiveTab(tabs[Math.min(tabs.length - 1, idx + 1)]);
            setSelectedIndex(0);
          }
          // B button: go back
          else if (gp.buttons[1]?.pressed) { // B_CIRCLE
            lastGamepadRef.current = now;
            router.push("/");
          }
        }
      }

      raf = requestAnimationFrame(poll);
    };

    raf = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(raf);
  }, [router]);

  // Categorize positions
  const categorized = useMemo(() => {
    const open = positions.filter(p => !p.claimed && p.contracts !== "0");
    const claimable = positions.filter(p => p.claimable && !p.claimed);
    const closed = positions.filter(p => p.claimed || p.contracts === "0");
    return { open, claimable, closed };
  }, [positions]);

  // Portfolio stats
  const portfolioStats = useMemo(() => {
    let totalInvested = 0;
    let totalValue = 0;
    let totalPnl = 0;

    positions.forEach(pos => {
      totalInvested += microUsdToDollars(pos.totalCostUsd);
      if (pos.valueUsd) totalValue += microUsdToDollars(pos.valueUsd);
      if (pos.pnlUsd) totalPnl += microUsdToDollars(pos.pnlUsd);
    });

    return {
      totalInvested: totalInvested.toFixed(2),
      totalValue: totalValue.toFixed(2),
      totalPnl: totalPnl.toFixed(2),
      pnlPositive: totalPnl >= 0,
      openCount: categorized.open.length,
      claimableCount: categorized.claimable.length,
    };
  }, [positions, categorized]);

  const handleSell = async (positionPubkey: string) => {
    setSelling(positionPubkey);
    setActionError(null);
    setActionSuccess(null);

    try {
      await sellPosition(positionPubkey);
      setActionSuccess("Position sold successfully!");
      await refetch();
    } catch (error: any) {
      setActionError(error.message || "Failed to sell position");
    } finally {
      setSelling(null);
    }
  };

  const handleClaim = async (positionPubkey: string) => {
    setClaiming(positionPubkey);
    setActionError(null);
    setActionSuccess(null);

    try {
      await claimPosition(positionPubkey);
      setActionSuccess("Payout claimed successfully!");
      // Update claim_victory mission
      if (publicKey) {
        updateMissionProgress(publicKey.toBase58(), "claim_victory");
      }
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#00FF88", "#00F3FF", "#FFD700", "#FF00FF"],
      });
      await refetch();
    } catch (error: any) {
      setActionError(error.message || "Failed to claim payout");
    } finally {
      setClaiming(null);
    }
  };

  const getPositionsForTab = (tabId: string) => {
    switch (tabId) {
      case "open": return categorized.open;
      case "claimable": return categorized.claimable;
      case "closed": return categorized.closed;
      default: return [];
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative">
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
                <span className="text-[#ff00aa]">POSITIONS</span>
              </span>
            </div>
          </div>

          {connected && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30">
              <Target className="w-4 h-4 text-[#00FF88]" />
              <span className="text-sm font-numbers font-bold text-white">
                {positions.length} positions
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-20 pb-24 px-4 min-h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto">
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
                Connect your wallet to view your Jupiter positions
              </p>
              <WalletButton />
            </motion.div>
          ) : (
            <>
              {/* Messages */}
              <AnimatePresence>
                {actionSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 rounded-xl bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88] flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {actionSuccess}
                  </motion.div>
                )}
                {actionError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 rounded-xl bg-[#ff0044]/20 border border-[#ff0044]/30 text-[#ff0044] flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    {actionError}
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
                    <span className="text-xs text-gray-400">Invested</span>
                  </div>
                  <div className="text-xl font-numbers font-bold text-white">
                    ${portfolioStats.totalInvested}
                  </div>
                </div>

                <div className="game-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                    <span className="text-xs text-gray-400">Value</span>
                  </div>
                  <div className="text-xl font-numbers font-bold text-white">
                    ${portfolioStats.totalValue}
                  </div>
                </div>

                <div className="game-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {portfolioStats.pnlPositive ? (
                      <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-[#ff0044]" />
                    )}
                    <span className="text-xs text-gray-400">PnL</span>
                  </div>
                  <div className={`text-xl font-numbers font-bold ${portfolioStats.pnlPositive ? "text-[#00ff88]" : "text-[#ff0044]"}`}>
                    {portfolioStats.pnlPositive ? "+" : ""}${portfolioStats.totalPnl}
                  </div>
                </div>

                <div className="game-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-[#ff00aa]" />
                    <span className="text-xs text-gray-400">Claimable</span>
                  </div>
                  <div className="text-xl font-numbers font-bold text-[#ff00aa]">
                    {portfolioStats.claimableCount}
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
                  const count = getPositionsForTab(tab.id).length;
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

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-[#ff00aa] animate-spin" />
                </div>
              )}

              {/* Positions List */}
              {!loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <AnimatePresence mode="wait">
                    {/* Open Positions */}
                    {activeTab === "open" && (
                      <motion.div
                        key="open"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                      >
                        {categorized.open.map((pos, index) => {
                          const invested = microUsdToDollars(pos.totalCostUsd);
                          const value = pos.valueUsd ? microUsdToDollars(pos.valueUsd) : 0;
                          const pnl = pos.pnlUsd ? microUsdToDollars(pos.pnlUsd) : 0;
                          const pnlPct = pos.pnlUsdPercent;
                          const marketTitle = pos.marketMetadata?.title || pos.eventMetadata?.title || "Unknown Market";

                          return (
                            <motion.div
                              key={pos.pubkey}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="game-card p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      pos.isYes
                                        ? "bg-[#00ff88]/20 text-[#00ff88]"
                                        : "bg-[#ff0044]/20 text-[#ff0044]"
                                    }`}>
                                      {pos.isYes ? "YES" : "NO"}
                                    </span>
                                    <span className="text-xs text-gray-500 font-mono">
                                      {pos.contracts} contracts
                                    </span>
                                  </div>
                                  <h3 className="font-game text-sm text-white truncate">
                                    {marketTitle}
                                  </h3>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                    <span>Avg: ${microUsdToDollars(pos.avgPriceUsd).toFixed(2)}</span>
                                    {pos.markPriceUsd && (
                                      <span>Mark: ${microUsdToDollars(pos.markPriceUsd).toFixed(2)}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-xs text-gray-400">Value</div>
                                  <div className="text-lg font-numbers font-bold text-white">
                                    ${value.toFixed(2)}
                                  </div>
                                  <div className={`text-xs font-numbers font-bold ${pnl >= 0 ? "text-[#00ff88]" : "text-[#ff0044]"}`}>
                                    {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                                    {pnlPct !== null && ` (${pnlPct > 0 ? "+" : ""}${pnlPct.toFixed(1)}%)`}
                                  </div>
                                </div>
                              </div>
                              {/* Sell Button */}
                              <motion.button
                                onClick={() => handleSell(pos.pubkey)}
                                disabled={selling === pos.pubkey}
                                className="mt-3 w-full py-2 rounded-xl bg-[#ff00aa]/10 border border-[#ff00aa]/30 text-[#ff00aa] text-xs font-bold hover:bg-[#ff00aa]/20 transition-colors disabled:opacity-50"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                {selling === pos.pubkey ? (
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                  "SELL POSITION"
                                )}
                              </motion.button>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}

                    {/* Claimable Positions */}
                    {activeTab === "claimable" && (
                      <motion.div
                        key="claimable"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                      >
                        {categorized.claimable.map((pos, index) => {
                          const payout = microUsdToDollars(pos.payoutUsd);
                          const marketTitle = pos.marketMetadata?.title || pos.eventMetadata?.title || "Unknown Market";

                          return (
                            <motion.div
                              key={pos.pubkey}
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
                                    {marketTitle}
                                  </h3>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {pos.isYes ? "YES" : "NO"} • {pos.contracts} contracts
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-xs text-gray-400">Payout</div>
                                  <div className="text-lg font-numbers font-bold text-[#00ff88]">
                                    ${payout.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                              {/* Claim Payout Button */}
                              <motion.button
                                onClick={() => handleClaim(pos.pubkey)}
                                disabled={claiming === pos.pubkey}
                                className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00ff88]/20 to-[#00f0ff]/20 border border-[#00ff88]/50 text-[#00ff88] text-xs font-bold hover:from-[#00ff88]/30 hover:to-[#00f0ff]/30 transition-all disabled:opacity-50"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                {claiming === pos.pubkey ? (
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                  "CLAIM PAYOUT"
                                )}
                              </motion.button>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}

                    {/* Closed Positions */}
                    {activeTab === "closed" && (
                      <motion.div
                        key="closed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                      >
                        {categorized.closed.map((pos, index) => {
                          const pnl = pos.pnlUsd ? microUsdToDollars(pos.pnlUsd) : pos.realizedPnlUsd / 1_000_000;
                          const marketTitle = pos.marketMetadata?.title || pos.eventMetadata?.title || "Unknown Market";
                          const won = pnl > 0;

                          return (
                            <motion.div
                              key={pos.pubkey}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`game-card p-4 opacity-75 ${won ? "border-[#00ff88]/30" : "border-[#ff0044]/30"}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${won ? "bg-[#00ff88]" : "bg-[#ff0044]"}`}>
                                      {won ? <Check className="w-3 h-3 text-black" /> : <X className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={`text-xs font-bold ${won ? "text-[#00ff88]" : "text-[#ff0044]"}`}>
                                      {won ? "WON" : "LOST"}
                                    </span>
                                  </div>
                                  <h3 className="font-game text-sm text-white truncate">
                                    {marketTitle}
                                  </h3>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-gray-400">PnL</div>
                                  <div className={`text-lg font-numbers font-bold ${won ? "text-[#00ff88]" : "text-[#ff0044]"}`}>
                                    {won ? "+" : ""}${pnl.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Empty State */}
                  {getPositionsForTab(activeTab).length === 0 && !loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16"
                    >
                      <div className="text-5xl mb-4">
                        {activeTab === "claimable" ? "🎁" : activeTab === "closed" ? "📊" : "📭"}
                      </div>
                      <h3 className="text-lg font-game text-white mb-2">
                        {activeTab === "claimable"
                          ? "No winnings to claim"
                          : activeTab === "closed"
                          ? "No closed positions"
                          : "No open positions"}
                      </h3>
                      <p className="text-gray-400 text-sm mb-6">
                        {activeTab === "open"
                          ? "Start betting on Jupiter markets!"
                          : "Your positions will appear here."}
                      </p>
                      <Link href="/">
                        <motion.button
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff]/20 to-[#ff00aa]/20 border border-[#00f0ff]/30 text-[#00f0ff] font-game text-sm hover:border-[#00f0ff]/50 transition-all flex items-center gap-2 mx-auto"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Zap className="w-4 h-4" />
                          START BETTING
                        </motion.button>
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </>
          )}

          {/* Jupiter Branding Footer */}
          <div className="mt-8 text-center text-[10px] text-gray-600">
            <span className="text-[#c7f83e]">Powered by Jupiter</span> Prediction Markets on <span className="text-[#14F195]">Solana</span>
          </div>
        </div>
      </div>
    </div>
  );
}
