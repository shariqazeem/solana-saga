"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Clock, DollarSign, Trophy, Target, ChevronRight,
  Check, X, Timer, Loader2, Wallet, Gift, Zap, Home, ArrowLeft, TrendingUp, TrendingDown, FileText
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
  { id: "orders", name: "Orders", icon: FileText },
  { id: "open", name: "Open", icon: Timer },
  { id: "claimable", name: "Claim", icon: Gift },
  { id: "closed", name: "Closed", icon: Check },
];

export default function MyBetsPage() {
  const [activeTab, setActiveTab] = useState("orders");
  const { connected, publicKey } = useWallet();
  const { positions, orders, history, loading, sellPosition, claimPosition, refetch } = useJupiterPrediction();
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
            const tabs = ["orders", "open", "claimable", "closed"];
            const idx = tabs.indexOf(activeTabRef.current);
            setActiveTab(tabs[Math.max(0, idx - 1)]);
            setSelectedIndex(0);
          } else if (gp.buttons[5]?.pressed) { // R1
            lastGamepadRef.current = now;
            const tabs = ["orders", "open", "claimable", "closed"];
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

  // Categorize positions + orders
  // Merge /orders (active pending orders) with /history (completed events)
  const categorized = useMemo(() => {
    // Build a unified order list: active orders first, then history
    // Active orders from /orders have real-time status ("pending")
    // History entries from /history have event records ("order_created", "order_filled", etc.)
    const activeOrderPubkeys = new Set(orders.map(o => o.pubkey));

    // Convert active orders to a display-friendly format
    const activeOrders = orders.map(o => ({
      ...o,
      _source: "orders" as const,
      _isActive: true,
    }));

    // History entries that aren't duplicates of active orders
    const historyEntries = history
      .filter(h => !activeOrderPubkeys.has(h.orderPubkey))
      .sort((a, b) => b.timestamp - a.timestamp);

    const allHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);
    const open = positions.filter(p => !p.claimed && p.contracts !== "0");
    const claimable = positions.filter(p => p.claimable && !p.claimed);
    const closed = positions.filter(p => p.claimed || p.contracts === "0");
    return { activeOrders, historyEntries, allHistory, open, claimable, closed };
  }, [positions, orders, history]);

  // Portfolio stats — include positions + active orders
  const portfolioStats = useMemo(() => {
    let totalInvested = 0;
    let totalValue = 0;
    let totalPnl = 0;

    positions.forEach(pos => {
      totalInvested += microUsdToDollars(pos.totalCostUsd);
      if (pos.valueUsd) totalValue += microUsdToDollars(pos.valueUsd);
      if (pos.pnlUsd) totalPnl += microUsdToDollars(pos.pnlUsd);
    });

    // Add active order deposits (funds locked in pending orders)
    orders.forEach(order => {
      if (order.sizeUsd) {
        totalInvested += parseFloat(order.sizeUsd) / 1_000_000;
      }
    });

    return {
      totalInvested: totalInvested.toFixed(2),
      totalValue: totalValue.toFixed(2),
      totalPnl: totalPnl.toFixed(2),
      pnlPositive: totalPnl >= 0,
      openCount: categorized.open.length,
      claimableCount: categorized.claimable.length,
      activeOrderCount: categorized.activeOrders.length,
    };
  }, [positions, orders, categorized]);

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

  const getTabCount = (tabId: string) => {
    switch (tabId) {
      case "orders": return categorized.activeOrders.length + categorized.historyEntries.length;
      case "open": return categorized.open.length;
      case "claimable": return categorized.claimable.length;
      case "closed": return categorized.closed.length;
      default: return 0;
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
                {positions.length + orders.length + history.length} total
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
                  const count = getTabCount(tab.id);
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
                    {/* Orders — Active orders + History */}
                    {activeTab === "orders" && (
                      <motion.div
                        key="orders"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                      >
                        {/* Active pending orders (from /orders endpoint) */}
                        {categorized.activeOrders.map((order, index) => {
                          const sizeUsd = order.sizeUsd ? parseFloat(order.sizeUsd) / 1_000_000 : 0;
                          const maxPrice = order.maxFillPriceUsd ? parseFloat(order.maxFillPriceUsd) / 1_000_000 : 0;
                          const eventTitle = order.eventMetadata?.title || order.eventId;
                          const marketTitle = order.marketMetadata?.title || order.marketId;
                          const createdAgo = Math.round((Date.now() / 1000 - order.createdAt) / 60);
                          const isPending = order.status === "pending";
                          const isFilled = order.status === "filled";

                          return (
                            <motion.div
                              key={`active-${order.pubkey}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`game-card p-4 ${isPending ? "border-[#ff00aa]/40 bg-[#ff00aa]/5" : isFilled ? "border-[#00ff88]/30 bg-[#00ff88]/5" : "border-yellow-500/30 bg-yellow-500/5"}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isPending ? "bg-[#ff00aa]/20 text-[#ff00aa]" : isFilled ? "bg-[#00ff88]/20 text-[#00ff88]" : "bg-yellow-500/20 text-yellow-400"}`}>
                                      {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                                      {isFilled && <Check className="w-3 h-3" />}
                                      {isPending ? "PENDING" : order.status.toUpperCase()}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      order.isYes ? "bg-[#00ff88]/20 text-[#00ff88]" : "bg-[#ff0044]/20 text-[#ff0044]"
                                    }`}>
                                      {order.isYes ? "YES" : "NO"}
                                    </span>
                                    {order.isBuy ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00f0ff]/20 text-[#00f0ff]">BUY</span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff00aa]/20 text-[#ff00aa]">SELL</span>
                                    )}
                                  </div>
                                  <h3 className="font-game text-sm text-white truncate">{eventTitle}</h3>
                                  <div className="text-xs text-gray-400 truncate">{marketTitle}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {createdAgo < 60 ? `${createdAgo}m ago` : createdAgo < 1440 ? `${Math.round(createdAgo / 60)}h ago` : `${Math.round(createdAgo / 1440)}d ago`}
                                    {isPending && ` • ${order.contracts} contracts • Processing via Jupiter keeper`}
                                    {maxPrice > 0 && ` • Max $${maxPrice.toFixed(2)}`}
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-xs text-gray-400">Size</div>
                                  <div className="text-lg font-numbers font-bold text-white">
                                    ${sizeUsd.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}

                        {/* Divider if both active and history exist */}
                        {categorized.activeOrders.length > 0 && categorized.historyEntries.length > 0 && (
                          <div className="flex items-center gap-3 py-1">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-[10px] text-gray-500 font-game">HISTORY</span>
                            <div className="flex-1 h-px bg-white/10" />
                          </div>
                        )}

                        {/* History entries (from /history endpoint) */}
                        {categorized.historyEntries.map((entry, index) => {
                          const depositUsd = entry.depositAmountUsd ? parseFloat(entry.depositAmountUsd) / 1_000_000 : 0;
                          const filledContracts = entry.filledContracts ? parseInt(entry.filledContracts) : 0;
                          const avgFillPrice = entry.avgFillPriceUsd ? parseFloat(entry.avgFillPriceUsd) / 1_000_000 : 0;
                          const maxPrice = entry.maxFillPriceUsd ? parseFloat(entry.maxFillPriceUsd) / 1_000_000 : 0;
                          const eventTitle = entry.eventMetadata?.title || entry.eventId;
                          const marketTitle = entry.marketMetadata?.title || entry.marketId;
                          const createdAgo = Math.round((Date.now() / 1000 - entry.timestamp) / 60);

                          const isCreated = entry.eventType === "order_created";
                          const isFilled = entry.eventType === "order_filled";
                          const isCancelled = entry.eventType === "order_cancelled";
                          const isPayout = entry.eventType === "payout_claimed";

                          return (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (categorized.activeOrders.length + index) * 0.05 }}
                              className={`game-card p-4 ${isFilled ? "border-[#00ff88]/30 bg-[#00ff88]/5" : isPayout ? "border-[#FFD700]/30 bg-[#FFD700]/5" : isCancelled ? "border-[#ff0044]/20 bg-[#ff0044]/5" : "border-[#00f0ff]/20 bg-[#00f0ff]/5"}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isFilled ? "bg-[#00ff88]/20 text-[#00ff88]" : isPayout ? "bg-[#FFD700]/20 text-[#FFD700]" : isCancelled ? "bg-[#ff0044]/20 text-[#ff0044]" : "bg-[#00f0ff]/20 text-[#00f0ff]"}`}>
                                      {isFilled && <Check className="w-3 h-3" />}
                                      {isCancelled && <X className="w-3 h-3" />}
                                      {isPayout && <Gift className="w-3 h-3" />}
                                      {isCreated && <Clock className="w-3 h-3" />}
                                      {isFilled ? "FILLED" : isPayout ? "CLAIMED" : isCancelled ? "CANCELLED" : entry.eventType.replace("order_", "").replace("position_", "").toUpperCase()}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      entry.isYes ? "bg-[#00ff88]/20 text-[#00ff88]" : "bg-[#ff0044]/20 text-[#ff0044]"
                                    }`}>
                                      {entry.isYes ? "YES" : "NO"}
                                    </span>
                                    {entry.isBuy ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00f0ff]/20 text-[#00f0ff]">BUY</span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff00aa]/20 text-[#ff00aa]">SELL</span>
                                    )}
                                  </div>
                                  <h3 className="font-game text-sm text-white truncate">{eventTitle}</h3>
                                  <div className="text-xs text-gray-400 truncate">{marketTitle}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {createdAgo < 60 ? `${createdAgo}m ago` : createdAgo < 1440 ? `${Math.round(createdAgo / 60)}h ago` : `${Math.round(createdAgo / 1440)}d ago`}
                                    {isFilled && filledContracts > 0 && ` • ${filledContracts} contracts @ $${avgFillPrice.toFixed(2)}`}
                                    {maxPrice > 0 && ` • Price: $${maxPrice.toFixed(2)}`}
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-xs text-gray-400">Deposit</div>
                                  <div className="text-lg font-numbers font-bold text-white">
                                    ${depositUsd.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}

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
                  {getTabCount(activeTab) === 0 && !loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16"
                    >
                      <div className="text-5xl mb-4">
                        {activeTab === "orders" ? "📋" : activeTab === "claimable" ? "🎁" : activeTab === "closed" ? "📊" : "📭"}
                      </div>
                      <h3 className="text-lg font-game text-white mb-2">
                        {activeTab === "orders"
                          ? "No pending orders"
                          : activeTab === "claimable"
                          ? "No winnings to claim"
                          : activeTab === "closed"
                          ? "No closed positions"
                          : "No open positions"}
                      </h3>
                      <p className="text-gray-400 text-sm mb-6">
                        {activeTab === "orders"
                          ? "Orders waiting for Jupiter keeper will appear here."
                          : activeTab === "open"
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
