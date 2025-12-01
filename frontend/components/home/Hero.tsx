"use client";

import { Rocket, Zap, Trophy, Target, Flame, Star, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePredictionMarkets } from "@/lib/solana/hooks/usePredictionMarkets";

export function Hero() {
  const { markets, loading } = usePredictionMarkets();

  const totalVolume = markets.reduce((sum, m) => sum + m.totalVolume, 0);
  const totalBettors = markets.reduce((sum, m) => sum + m.bettors, 0);
  const activeMarkets = markets.filter(m => m.status === "Active").length;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Simple background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/50 to-[#0a0a0f]" />

      {/* Subtle static glows */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #00ff88 0%, transparent 70%)",
          left: "5%",
          top: "10%",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #00f0ff 0%, transparent 70%)",
          right: "5%",
          bottom: "10%",
          filter: "blur(80px)",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        {/* Live Badge */}
        <div className="mb-12 inline-block">
          <div className="relative group cursor-default">
            <div className="relative flex items-center gap-4 px-8 py-3 rounded-full bg-black/60 backdrop-blur-xl border border-[#00ff88]/30 ring-1 ring-white/10">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00ff88]"></span>
              </span>
              <span className="text-[#00ff88] font-game text-sm tracking-[0.2em]">LIVE PROTOCOL</span>
              <div className="w-px h-4 bg-white/20" />
              <span className="text-white/90 font-numbers text-sm flex items-center gap-2">
                <Zap className="w-3 h-3 text-[#ffd700]" />
                {loading ? "..." : activeMarkets} MARKETS ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="relative mb-8">
          <h1 className="text-7xl md:text-9xl font-game font-black leading-none tracking-tighter">
            <span className="block text-white">
              PREDICT
            </span>
            <span
              className="block text-transparent bg-clip-text mt-2"
              style={{
                backgroundImage: "linear-gradient(135deg, #00ff88, #00f0ff, #ff00aa)",
                filter: "drop-shadow(0 0 20px rgba(0,240,255,0.3))"
              }}
            >
              WIN BIG
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
          The most <span className="text-[#00ff88] font-bold font-game">addictive</span> prediction market on Solana.
          <br />
          <span className="text-white/60">Bet on crypto, sports, and culture. Win real money.</span>
        </p>

        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          <div className="holo-card px-8 py-6 rounded-2xl min-w-[200px] hover:scale-105 transition-transform">
            <div
              className="text-3xl md:text-4xl font-numbers font-bold text-white mb-1"
              style={{ textShadow: "0 0 20px #00f0ff" }}
            >
              ${loading ? "..." : totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] font-game">Total Volume</div>
          </div>

          <div className="holo-card px-8 py-6 rounded-2xl min-w-[200px] hover:scale-105 transition-transform">
            <div
              className="text-3xl md:text-4xl font-numbers font-bold text-white mb-1"
              style={{ textShadow: "0 0 20px #00ff88" }}
            >
              {loading ? "..." : totalBettors.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] font-game">Active Players</div>
          </div>

          <div className="holo-card px-8 py-6 rounded-2xl min-w-[200px] hover:scale-105 transition-transform">
            <div
              className="text-3xl md:text-4xl font-numbers font-bold text-white mb-1"
              style={{ textShadow: "0 0 20px #ffd700" }}
            >
              {loading ? "..." : activeMarkets}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] font-game">Active Markets</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
          <Link href="/markets">
            <button className="relative group hover:scale-105 transition-transform">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00ff88] to-[#00f0ff] rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-200" />
              <div className="relative px-12 py-6 bg-black rounded-xl border border-white/10 flex items-center gap-4">
                <Rocket className="w-6 h-6 text-[#00ff88] group-hover:-translate-y-1 transition-transform" />
                <span className="font-game text-xl text-white tracking-wider">START PLAYING</span>
                <Zap className="w-5 h-5 text-[#ffd700]" />
              </div>
            </button>
          </Link>

          <Link href="/leaderboard">
            <button className="px-10 py-6 rounded-xl bg-white/5 border border-white/10 text-white font-game text-lg
                         hover:bg-white/10 hover:border-[#00f0ff]/50 transition-all flex items-center gap-3 backdrop-blur-md hover:scale-105">
              <Trophy className="w-5 h-5 text-[#ffd700]" />
              LEADERBOARD
            </button>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { icon: Zap, text: "Instant Payouts", color: "#00f0ff" },
            { icon: Target, text: "Live Odds", color: "#ff00aa" },
            { icon: Flame, text: "Hot Markets", color: "#ff8800" },
            { icon: Star, text: "Win Streaks", color: "#ffd700" },
          ].map((feature) => (
            <div
              key={feature.text}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10
                         hover:bg-white/10 hover:scale-105 transition-all cursor-default backdrop-blur-sm"
            >
              <feature.icon className="w-4 h-4" style={{ color: feature.color }} />
              <span className="text-sm text-gray-300 font-medium">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-gray-500 animate-bounce">
            <span className="text-[10px] uppercase tracking-[0.3em] font-game">Scroll to explore</span>
            <ChevronDown className="w-5 h-5 text-[#00ff88]" />
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
    </section>
  );
}
