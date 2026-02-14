"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchTrades, type JupTrade } from "@/lib/jupiter/jupiterPredictionApi";

const shortenAddress = (address: string) =>
  `${address.slice(0, 4)}...${address.slice(-3)}`;

const getTradeEmoji = (action: string, side: string) => {
  if (action === "buy" && side === "yes") return "\u{1F7E2}";
  if (action === "buy" && side === "no") return "\u{1F534}";
  if (action === "sell" && side === "yes") return "\u{1F4B0}";
  return "\u{1F4B8}";
};

export function LiveTradeFeed() {
  const [trades, setTrades] = useState<JupTrade[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch trades on mount and every 30s
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchTrades();
        if (res.data && res.data.length > 0) {
          setTrades(res.data.slice(0, 20));
        }
      } catch {
        // Silent fail - this is a non-critical feature
      }
    };

    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Rotate through trades
  useEffect(() => {
    if (trades.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trades.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [trades.length]);

  if (trades.length === 0) return null;

  const trade = trades[currentIndex];
  if (!trade) return null;

  const emoji = getTradeEmoji(trade.action, trade.side);
  const price = parseFloat(trade.priceUsd || "0") / 1_000_000;
  const amount = parseFloat(trade.amountUsd || "0") / 1_000_000;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-[52px] left-0 right-0 z-[55] overflow-hidden bg-black/60 backdrop-blur-sm border-t border-white/5"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-4 py-1.5 text-[10px] whitespace-nowrap overflow-hidden"
        >
          <span>{emoji}</span>
          <span className="text-gray-500 font-mono">
            {shortenAddress(trade.ownerPubkey)}
          </span>
          <span className="text-gray-400">
            {trade.action === "buy" ? "bought" : "sold"}
          </span>
          <span
            className={`font-bold ${
              trade.side === "yes" ? "text-[#00FF88]" : "text-[#FF0044]"
            }`}
          >
            {trade.side.toUpperCase()}
          </span>
          <span className="text-gray-400 truncate max-w-[140px]">
            on &quot;{trade.marketTitle}&quot;
          </span>
          {amount > 0 && (
            <span className="text-[#FFD700] font-numbers font-bold ml-auto flex-shrink-0">
              ${amount.toFixed(2)}
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
