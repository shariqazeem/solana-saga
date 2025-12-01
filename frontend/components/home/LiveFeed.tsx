"use client";

import { Zap, TrendingUp, Users, Activity, DollarSign } from "lucide-react";
import { usePredictionMarkets } from "@/lib/solana/hooks/usePredictionMarkets";

export function LiveFeed() {
  const { markets, loading } = usePredictionMarkets();

  const totalVolume = markets.reduce((sum, m) => sum + m.totalVolume, 0);
  const totalBettors = markets.reduce((sum, m) => sum + m.bettors, 0);
  const activeMarkets = markets.filter(m => m.status === "Active").length;
  const totalBets = markets.reduce((sum, m) => sum + m.totalBetsCount, 0);

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
              LIVE STATS <Activity className="w-4 h-4 text-[#ff0044]" />
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-4 border-[#00f0ff]/20 border-t-[#00f0ff] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Volume */}
            <div className="game-card p-4 bg-[#0a0a0f]/80 border border-white/10 hover:border-[#00f0ff]/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-[#00f0ff]" />
                <span className="text-xs text-gray-500 font-game">TOTAL VOLUME</span>
              </div>
              <div className="font-numbers font-bold text-2xl text-white">
                ${totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
            </div>

            {/* Total Bets */}
            <div className="game-card p-4 bg-[#0a0a0f]/80 border border-white/10 hover:border-[#00ff88]/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#00ff88]" />
                <span className="text-xs text-gray-500 font-game">TOTAL BETS</span>
              </div>
              <div className="font-numbers font-bold text-2xl text-white">
                {totalBets.toLocaleString()}
              </div>
            </div>

            {/* Unique Bettors */}
            <div className="game-card p-4 bg-[#0a0a0f]/80 border border-white/10 hover:border-[#ff00aa]/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#ff00aa]" />
                <span className="text-xs text-gray-500 font-game">BETTORS</span>
              </div>
              <div className="font-numbers font-bold text-2xl text-white">
                {totalBettors.toLocaleString()}
              </div>
            </div>

            {/* Active Markets */}
            <div className="game-card p-4 bg-[#0a0a0f]/80 border border-white/10 hover:border-[#ffd700]/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#ffd700]" />
                <span className="text-xs text-gray-500 font-game">ACTIVE MARKETS</span>
              </div>
              <div className="font-numbers font-bold text-2xl text-white">
                {activeMarkets}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
