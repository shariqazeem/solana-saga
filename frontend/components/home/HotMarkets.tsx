"use client";

import { MarketCard } from "../MarketCard";
import { ChevronRight, Flame, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { usePredictionMarkets } from "@/lib/solana/hooks/usePredictionMarkets";

export function HotMarkets() {
  const { markets, loading } = usePredictionMarkets();

  // Get top 4 markets by volume
  const hotMarkets = markets
    .filter(m => m.status === "Active")
    .sort((a, b) => b.totalVolume - a.totalVolume)
    .slice(0, 4);

  const totalVolume = markets.reduce((sum, m) => sum + m.totalVolume, 0);
  const activePlayers = markets.reduce((sum, m) => sum + m.bettors, 0);

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#ff8800]/5 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Flame className="w-10 h-10 text-[#ff8800]" />
              <h2 className="text-4xl md:text-6xl font-game font-black tracking-tighter">
                <span className="text-white drop-shadow-lg">HOT</span>{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8800] to-[#ff0044] drop-shadow-lg">MARKETS</span>
              </h2>
            </div>
            <p className="text-gray-400 max-w-md font-light text-lg">
              The most active predictions right now. <span className="text-[#ff8800] font-bold">Jump in</span> before the odds shift!
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff0044]/10 border border-[#ff0044]/30 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-[#ff0044] animate-pulse" />
              <span className="text-sm font-bold text-[#ff0044] font-game tracking-wider">LIVE</span>
            </div>

            <Link href="/markets">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-game text-sm hover:bg-white/10 hover:border-[#00f0ff]/50 transition-all group backdrop-blur-sm">
                View All
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-6 mb-12">
          <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm hover:border-[#ffd700]/30 transition-colors">
            <div className="p-2 rounded-lg bg-[#ffd700]/10">
              <Zap className="w-5 h-5 text-[#ffd700]" />
            </div>
            <span className="text-sm text-gray-400">
              <span className="text-white font-numbers font-bold text-lg block">
                ${totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span> total volume
            </span>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm hover:border-[#00ff88]/30 transition-colors">
            <div className="p-2 rounded-lg bg-[#00ff88]/10">
              <TrendingUp className="w-5 h-5 text-[#00ff88]" />
            </div>
            <span className="text-sm text-gray-400">
              <span className="text-white font-numbers font-bold text-lg block">{activePlayers}</span> total bettors
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#00f0ff]/20 border-t-[#00f0ff] rounded-full animate-spin mb-4" />
            <p className="text-gray-400 font-game">Loading hot markets...</p>
          </div>
        )}

        {/* Markets Grid */}
        {!loading && hotMarkets.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8">
            {hotMarkets.map((market) => (
              <MarketCard
                key={market.publicKey}
                id={market.publicKey}
                question={market.question}
                category={market.category}
                yesPrice={market.yesPrice}
                noPrice={market.noPrice}
                volume={`$${market.totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                endsIn={market.endsIn}
                bettors={market.bettors}
                trending={market.totalVolume > 100}
                delay={0}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && hotMarkets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 font-game">No active markets yet. Check back soon!</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Link href="/markets">
            <button className="relative group hover:scale-105 transition-transform">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ff8800] to-[#ff0044] rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-200" />
              <div className="relative px-12 py-5 bg-black rounded-xl border border-white/10 flex items-center gap-3">
                <Flame className="w-5 h-5 text-[#ff8800]" />
                <span className="font-game text-white tracking-wider">EXPLORE ALL MARKETS</span>
                <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
