"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, Zap, Trophy, Users, Rocket, Sparkles, Target, ArrowRight,
  DollarSign, Clock, Shield, Flame, Star, ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen text-white overflow-x-hidden relative" style={{background: '#050814'}}>
      {/* Neon Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Cyan glow orb */}
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-40"
          style={{
            background: 'radial-gradient(circle, #00E5FF 0%, transparent 70%)',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        />
        {/* Magenta glow orb */}
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-40"
          style={{
            background: 'radial-gradient(circle, #FF1493 0%, transparent 70%)',
            transform: `translate(${-mousePosition.x * 0.03}px, ${-mousePosition.y * 0.03}px)`,
          }}
        />
        {/* Blue accent orb */}
        <div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
          style={{
            background: 'radial-gradient(circle, #1E90FF 0%, transparent 70%)',
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`,
          }}
        />
        {/* Neon grid overlay */}
        <div className="absolute inset-0 neon-grid opacity-30" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 mb-4">
                <Sparkles className="w-12 h-12 neon-text animate-neon-pulse" />
                <h1 className="text-7xl md:text-9xl font-black bg-gradient-to-r from-[#00E5FF] via-[#FF1493] to-[#39FF14] bg-clip-text text-transparent animate-holographic" style={{fontFamily: 'var(--font-orbitron)'}}>
                  SOLANA SAGA
                </h1>
                <Rocket className="w-12 h-12 neon-text-magenta animate-neon-pulse" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl md:text-5xl font-bold mb-6"
            >
              Predict. Compete. Dominate.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto"
            >
              The most addictive prediction market game on Solana.
              <br />
              <span className="neon-text-green font-bold">Bet on the future. Win real money.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link href="/markets">
                <button className="group neon-button px-8 py-4 rounded-xl text-lg">
                  <span className="flex items-center gap-2">
                    Start Predicting
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Link>
              <Link href="/markets">
                <button className="neon-button-secondary px-8 py-4 rounded-xl text-lg">
                  View Markets
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              <StatCard icon={<TrendingUp />} value="$1.2M" label="Total Volume" />
              <StatCard icon={<Target />} value="247" label="Active Markets" />
              <StatCard icon={<Users />} value="12.5K" label="Predictors" />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-black mb-4">
                Why Solana Saga?
              </h2>
              <p className="text-xl text-slate-400">
                The future of prediction markets is here
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Zap />}
                title="Lightning Fast"
                description="Solana's 400ms blocks mean instant bets and payouts. No waiting around."
                gradient="from-yellow-500 to-orange-500"
                delay={0.1}
              />
              <FeatureCard
                icon={<Trophy />}
                title="Compete & Win"
                description="Climb the leaderboard. Unlock achievements. Prove you're the best predictor."
                gradient="from-purple-500 to-pink-500"
                delay={0.2}
              />
              <FeatureCard
                icon={<DollarSign />}
                title="Real Money"
                description="Bet with USDC. Win real money. 2% fee only on winnings."
                gradient="from-emerald-500 to-cyan-500"
                delay={0.3}
              />
              <FeatureCard
                icon={<Shield />}
                title="Trustless"
                description="Smart contracts handle everything. No middleman. Fully transparent."
                gradient="from-blue-500 to-indigo-500"
                delay={0.4}
              />
              <FeatureCard
                icon={<Flame />}
                title="Live Odds"
                description="Watch prices update in real-time as others bet. AMM-powered fair pricing."
                gradient="from-red-500 to-orange-500"
                delay={0.5}
              />
              <FeatureCard
                icon={<Star />}
                title="Gamified"
                description="Streaks, levels, achievements, and leaderboards. Make predicting fun!"
                gradient="from-pink-500 to-purple-500"
                delay={0.6}
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-4" style={{background: 'rgba(13, 18, 38, 0.5)'}}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-black mb-4">
                How It Works
              </h2>
              <p className="text-xl text-slate-400">
                4 simple steps to start winning
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              <Step
                number={1}
                title="Browse Markets"
                description="Choose from exciting predictions about Solana ecosystem"
                delay={0.1}
              />
              <Step
                number={2}
                title="Place Your Bet"
                description="Select YES or NO and enter your USDC amount"
                delay={0.2}
              />
              <Step
                number={3}
                title="Watch Live"
                description="See odds change in real-time as others bet"
                delay={0.3}
              />
              <Step
                number={4}
                title="Claim Winnings"
                description="Win big! Instant payouts with confetti celebration 🎉"
                delay={0.4}
              />
            </div>
          </div>
        </section>

        {/* Example Markets */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-black mb-4">
                Hot Markets Right Now 🔥
              </h2>
              <p className="text-xl text-slate-400">
                Bet on what you know
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              <MarketCard
                question="Will SOL hit $300 by Dec 20?"
                category="Price"
                yesPrice="35%"
                noPrice="65%"
                volume="$45,230"
                delay={0.1}
              />
              <MarketCard
                question="Will Jupiter reach 10M daily transactions?"
                category="Volume"
                yesPrice="62%"
                noPrice="38%"
                volume="$38,450"
                delay={0.2}
              />
              <MarketCard
                question="Raydium or Orca: which DEX wins this week?"
                category="Ecosystem"
                yesPrice="48%"
                noPrice="52%"
                volume="$52,100"
                delay={0.3}
              />
              <MarketCard
                question="Will Bonk flip Dogecoin this week?"
                category="Meme"
                yesPrice="12%"
                noPrice="88%"
                volume="$67,890"
                delay={0.4}
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12"
            >
              <Link href="/markets">
                <button className="group neon-button-secondary px-8 py-4 rounded-xl text-lg">
                  <span className="flex items-center gap-2">
                    View All 247 Markets
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Leaderboard Teaser */}
        <section className="py-24 px-4" style={{background: 'rgba(13, 18, 38, 0.5)'}}>
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Top Predictors This Week
              </h2>
              <p className="text-xl text-slate-400">
                Think you can beat them?
              </p>
            </motion.div>

            <div className="space-y-4">
              <LeaderboardEntry rank={1} name="sigma.sol" winRate="94%" earnings="+$12,450" />
              <LeaderboardEntry rank={2} name="chad.sol" winRate="89%" earnings="+$9,230" />
              <LeaderboardEntry rank={3} name="degen.sol" winRate="87%" earnings="+$7,890" />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center mt-8"
            >
              <Link href="/leaderboard">
                <button className="neon-button-secondary px-6 py-3 rounded-lg font-semibold">
                  View Full Leaderboard →
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="relative rounded-3xl p-1 animate-neon-border" style={{borderWidth: '2px', borderStyle: 'solid'}}>
              <div className="rounded-3xl p-12 relative overflow-hidden" style={{background: '#0D1226'}}>
                <Rocket className="w-20 h-20 mx-auto mb-6 neon-text-magenta animate-float" />
                <h2 className="text-4xl md:text-6xl font-black mb-6 font-heading bg-gradient-to-r from-[#00E5FF] via-[#FF1493] to-[#39FF14] bg-clip-text text-transparent">
                  Ready to Start Winning?
                </h2>
                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                  Join 12,500+ predictors making real money on Solana Saga.
                  <br />
                  <span className="neon-text-green font-bold">The future belongs to those who predict it.</span>
                </p>
                <Link href="/markets">
                  <button className="neon-button px-12 py-6 rounded-xl text-2xl">
                    Launch App →
                  </button>
                </Link>
                <div className="absolute top-0 left-1/2 w-64 h-64 bg-gradient-to-br from-[#00E5FF]/20 to-transparent rounded-full blur-3xl -translate-x-1/2" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-[#00E5FF]/20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 font-orbitron">
                  <Sparkles className="w-5 h-5 neon-text" />
                  Solana Saga
                </h3>
                <p className="text-slate-300 text-sm">
                  The most fun prediction market game on Solana.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 font-orbitron">Product</h4>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li><Link href="/markets" className="hover:neon-text transition-all">Markets</Link></li>
                  <li><Link href="/leaderboard" className="hover:neon-text transition-all">Leaderboard</Link></li>
                  <li><a href="#" className="hover:neon-text transition-all">How It Works</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 font-orbitron">Resources</h4>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li><a href="https://docs.solana.com" target="_blank" rel="noopener noreferrer" className="hover:neon-text transition-all">Docs</a></li>
                  <li><a href="https://github.com/shariqazeem/RizqFi" target="_blank" rel="noopener noreferrer" className="hover:neon-text transition-all">GitHub</a></li>
                  <li><a href="#" className="hover:neon-text transition-all">Blog</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 font-orbitron">Community</h4>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li><a href="#" className="hover:neon-text transition-all">Twitter</a></li>
                  <li><a href="#" className="hover:neon-text transition-all">Discord</a></li>
                  <li><a href="#" className="hover:neon-text transition-all">Telegram</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-[#00E5FF]/20 pt-8 text-center text-slate-400">
              <p className="mb-2">Built with ❤️ for <span className="neon-text-magenta font-bold">Indie.fun Hackathon</span></p>
              <p className="text-sm">Powered by <span className="neon-text-green">Solana</span> • Bringing Fun to Prediction Markets</p>
              <p className="text-xs mt-4">© 2025 Solana Saga. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Helper Components

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="glass-card rounded-2xl p-6 group">
      <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#1E90FF] mb-4 animate-neon-pulse shadow-lg shadow-cyan-500/50">
        {icon}
      </div>
      <div className="text-3xl font-black mb-1 font-numbers neon-text">{value}</div>
      <div className="text-slate-300">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="glass-card rounded-2xl p-8 group relative overflow-hidden"
    >
      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${gradient} mb-6 group-hover:scale-110 transition-transform shadow-lg`}
        style={{boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)'}}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3" style={{fontFamily: 'var(--font-orbitron)'}}>{title}</h3>
      <p className="text-slate-300">{description}</p>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00E5FF] via-[#FF1493] to-[#39FF14] opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

function Step({
  number,
  title,
  description,
  delay,
}: {
  number: number;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="relative"
    >
      <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#FF1493] flex items-center justify-center text-3xl font-black shadow-lg animate-neon-pulse font-numbers">
        {number}
      </div>
      <div className="glass-card rounded-2xl p-8 pt-12">
        <h3 className="text-xl font-bold mb-3" style={{fontFamily: 'var(--font-orbitron)'}}>{title}</h3>
        <p className="text-slate-300">{description}</p>
      </div>
    </motion.div>
  );
}

function MarketCard({
  question,
  category,
  yesPrice,
  noPrice,
  volume,
  delay,
}: {
  question: string;
  category: string;
  yesPrice: string;
  noPrice: string;
  volume: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="glass-card rounded-2xl p-6 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="px-3 py-1 bg-gradient-to-r from-[#00E5FF]/20 to-[#1E90FF]/20 text-[#00E5FF] text-sm font-bold rounded-full border border-[#00E5FF]/40 font-orbitron">
          {category}
        </span>
        <span className="text-slate-300 text-sm flex items-center gap-1 font-numbers">
          <TrendingUp className="w-4 h-4 text-[#39FF14]" />
          {volume}
        </span>
      </div>

      <h3 className="text-xl font-bold mb-6 group-hover:neon-text transition-all">
        {question}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <button className="bg-[#39FF14]/10 hover:bg-[#39FF14]/20 border-2 border-[#39FF14]/40 rounded-xl p-4 transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/50 group/yes">
          <div className="text-sm text-slate-300 mb-1 font-semibold">YES</div>
          <div className="text-2xl font-black neon-text-green font-numbers">{yesPrice}</div>
        </button>

        <button className="bg-[#FF0040]/10 hover:bg-[#FF0040]/20 border-2 border-[#FF0040]/40 rounded-xl p-4 transition-all hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 group/no">
          <div className="text-sm text-slate-300 mb-1 font-semibold">NO</div>
          <div className="text-2xl font-black text-[#FF0040] font-numbers" style={{textShadow: '0 0 10px rgba(255, 0, 64, 0.8)'}}>{noPrice}</div>
        </button>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00E5FF]/10 to-transparent rounded-full blur-2xl -z-10 group-hover:scale-150 transition-transform" />
    </motion.div>
  );
}

function LeaderboardEntry({
  rank,
  name,
  winRate,
  earnings,
}: {
  rank: number;
  name: string;
  winRate: string;
  earnings: string;
}) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-[#FFD700] to-[#FFA500]";
    if (rank === 2) return "from-[#C0C0C0] to-[#A8A8A8]";
    if (rank === 3) return "from-[#CD7F32] to-[#B87333]";
    return "from-slate-600 to-slate-700";
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: rank * 0.1 }}
      className="glass-card rounded-xl p-6 flex items-center gap-6 group"
    >
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center text-2xl font-black shadow-lg animate-neon-pulse`}>
        {getRankEmoji(rank)}
      </div>
      <div className="flex-1">
        <div className="font-bold text-xl mb-1 font-orbitron">{name}</div>
        <div className="text-slate-300 text-sm">Win Rate: <span className="neon-text-green">{winRate}</span></div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-black neon-text-green font-numbers">{earnings}</div>
        <div className="text-slate-300 text-sm">This Week</div>
      </div>
    </motion.div>
  );
}
