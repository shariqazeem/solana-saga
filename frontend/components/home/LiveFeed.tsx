"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp, TrendingDown, DollarSign, User, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { useSoundEffects } from "./useSoundEffects";

interface FeedItem {
  id: number;
  user: string;
  action: "bet" | "win" | "claim";
  market: string;
  amount: number;
  side: "YES" | "NO";
  timestamp: Date;
}

// Generate random feed items for demo
const generateFeedItem = (id: number): FeedItem => {
  const users = ["whale.sol", "degen.sol", "sigma.sol", "chad.sol", "moon.sol", "ape.sol", "rocket.sol", "diamond.sol"];
  const markets = [
    "SOL hits $300",
    "Jupiter 10M txns",
    "Bonk flips DOGE",
    "NFT sales 50k",
    "Raydium vs Orca",
  ];
  const actions: ("bet" | "win" | "claim")[] = ["bet", "bet", "bet", "win", "claim"];

  return {
    id,
    user: users[Math.floor(Math.random() * users.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
    market: markets[Math.floor(Math.random() * markets.length)],
    amount: Math.floor(Math.random() * 500 + 10) * 10,
    side: Math.random() > 0.5 ? "YES" : "NO",
    timestamp: new Date(),
  };
};

export function LiveFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [totalBets, setTotalBets] = useState(89234);
  const { playNotification } = useSoundEffects();

  // Initialize with some items
  useEffect(() => {
    const initialItems: FeedItem[] = [];
    for (let i = 0; i < 5; i++) {
      initialItems.push(generateFeedItem(i));
    }
    setFeedItems(initialItems);
  }, []);

  // Add new items periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setFeedItems((prev) => {
        const newItem = generateFeedItem(Date.now());
        // Play sound for big bets/wins
        if (newItem.amount > 1000 || newItem.action === "win") {
          playNotification();
        }
        const updated = [newItem, ...prev.slice(0, 9)];
        return updated;
      });
      setTotalBets((prev) => prev + Math.floor(Math.random() * 3 + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [playNotification]);

  const getActionIcon = (action: string, side: string) => {
    if (action === "win") return <TrendingUp className="w-4 h-4 text-[#00ff88]" />;
    if (action === "claim") return <DollarSign className="w-4 h-4 text-[#ffd700]" />;
    return side === "YES"
      ? <TrendingUp className="w-4 h-4 text-[#00ff88]" />
      : <TrendingDown className="w-4 h-4 text-[#ff0044]" />;
  };

  const getActionText = (item: FeedItem) => {
    if (item.action === "win") return "won";
    if (item.action === "claim") return "claimed";
    return `bet ${item.side}`;
  };

  const getActionColor = (item: FeedItem) => {
    if (item.action === "win") return "text-[#00ff88]";
    if (item.action === "claim") return "text-[#ffd700]";
    return item.side === "YES" ? "text-[#00ff88]" : "text-[#ff0044]";
  };

  return (
    <section className="py-8 px-4 relative overflow-hidden border-y border-white/5 bg-black/20 backdrop-blur-sm">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/5 via-transparent to-[#ff00aa]/5" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#ff0044] rounded-full animate-ping opacity-75" />
              <div className="relative w-3 h-3 rounded-full bg-[#ff0044]" />
            </div>
            <span className="font-game text-sm text-white tracking-wider flex items-center gap-2">
              LIVE FEED <Activity className="w-4 h-4 text-[#ff0044]" />
            </span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <Zap className="w-4 h-4 text-[#00f0ff] animate-pulse" />
            <span className="font-numbers text-sm text-gray-300">
              <motion.span
                key={totalBets}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-block text-white font-bold"
              >
                {totalBets.toLocaleString()}
              </motion.span>
              {" "}bets today
            </span>
          </div>
        </div>

        {/* Feed Container */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10 pointer-events-none" />

          {/* Feed Items */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mask-linear-fade">
            <AnimatePresence mode="popLayout">
              {feedItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, x: -50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex-shrink-0 game-card p-4 min-w-[280px] bg-[#0a0a0f]/80 border border-white/10 hover:border-[#00f0ff]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-[#ff00aa]/20 flex items-center justify-center border border-white/5">
                      <User className="w-5 h-5 text-[#00f0ff]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white truncate font-game text-xs">{item.user}</span>
                        {getActionIcon(item.action, item.side)}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        <span className={`${getActionColor(item)} font-bold`}>{getActionText(item)}</span>
                        {" "}on <span className="text-white/80">{item.market}</span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className={`text-right ${getActionColor(item)}`}>
                      <div className="font-numbers font-bold text-lg">
                        {item.action === "win" ? "+" : ""}${item.amount}
                      </div>
                      <div className="text-[10px] text-gray-500 font-game">USDC</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
