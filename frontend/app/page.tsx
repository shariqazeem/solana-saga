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
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl"
          style={{
            transform: `translate(${-mousePosition.x * 0.03}px, ${-mousePosition.y * 0.03}px)`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:64px_64px]" />
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
                <Sparkles className="w-12 h-12 text-emerald-400" />
                <h1 className="text-7xl md:text-9xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent">
                  SOLANA SAGA
                </h1>
                <Rocket className="w-12 h-12 text-purple-400" />
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
              className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto"
            >
              The most addictive prediction market game on Solana.
              <br />
              <span className="text-emerald-400 font-semibold">Bet on the future. Win real money.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link href="/markets">
                <button className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-all">
                  <span className="flex items-center gap-2">
                    Start Predicting
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Link>
              <Link href="/markets">
                <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border-2 border-emerald-500/30 hover:border-emerald-500 rounded-xl font-bold text-lg transition-all hover:scale-105">
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
        <section className="py-24 px-4 bg-slate-900/50">
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
                <button className="group px-8 py-4 bg-slate-800 hover:bg-slate-700 border-2 border-purple-500/30 hover:border-purple-500 rounded-xl font-bold text-lg transition-all hover:scale-105">
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
        <section className="py-24 px-4 bg-slate-900/50">
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
                <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-yellow-500/30 hover:border-yellow-500 rounded-lg font-semibold transition-all">
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
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-emerald-600 p-1 rounded-3xl">
              <div className="bg-slate-900 rounded-3xl p-12">
                <Rocket className="w-20 h-20 mx-auto mb-6 text-emerald-400" />
                <h2 className="text-4xl md:text-6xl font-black mb-6">
                  Ready to Start Winning?
                </h2>
                <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                  Join 12,500+ predictors making real money on Solana Saga.
                  <br />
                  <span className="text-emerald-400 font-semibold">The future belongs to those who predict it.</span>
                </p>
                <Link href="/markets">
                  <button className="px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-2xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transition-all hover:scale-105">
                    Launch App →
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Solana Saga
                </h3>
                <p className="text-slate-400 text-sm">
                  The most fun prediction market game on Solana.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><Link href="/markets" className="hover:text-emerald-400 transition-colors">Markets</Link></li>
                  <li><Link href="/leaderboard" className="hover:text-emerald-400 transition-colors">Leaderboard</Link></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><a href="https://docs.solana.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">Docs</a></li>
                  <li><a href="https://github.com/shariqazeem/RizqFi" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">GitHub</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Community</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">Discord</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">Telegram</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-8 text-center text-slate-500">
              <p className="mb-2">Built with ❤️ for <span className="text-purple-400 font-semibold">Indie.fun Hackathon</span></p>
              <p className="text-sm">Powered by Solana • Bringing Fun to Prediction Markets</p>
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
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all hover:scale-105">
      <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
        {icon}
      </div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-slate-400">{label}</div>
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
      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-emerald-500/50 transition-all hover:scale-105 group"
    >
      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${gradient} mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400">{description}</p>
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
      <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-3xl font-black shadow-lg">
        {number}
      </div>
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 pt-12 hover:border-emerald-500/50 transition-all">
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-slate-400">{description}</p>
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
      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all hover:scale-[1.02] cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-semibold rounded-full border border-purple-500/30">
          {category}
        </span>
        <span className="text-slate-400 text-sm flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          {volume}
        </span>
      </div>

      <h3 className="text-xl font-bold mb-6 group-hover:text-emerald-400 transition-colors">
        {question}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <button className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl p-4 transition-all hover:scale-105">
          <div className="text-sm text-slate-400 mb-1">YES</div>
          <div className="text-2xl font-black text-emerald-400">{yesPrice}</div>
        </button>

        <button className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl p-4 transition-all hover:scale-105">
          <div className="text-sm text-slate-400 mb-1">NO</div>
          <div className="text-2xl font-black text-red-400">{noPrice}</div>
        </button>
      </div>
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
    if (rank === 1) return "from-yellow-500 to-yellow-600";
    if (rank === 2) return "from-slate-400 to-slate-500";
    if (rank === 3) return "from-orange-600 to-orange-700";
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
      className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex items-center gap-6 hover:border-emerald-500/50 transition-all"
    >
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center text-2xl font-black`}>
        {getRankEmoji(rank)}
      </div>
      <div className="flex-1">
        <div className="font-bold text-xl mb-1">{name}</div>
        <div className="text-slate-400 text-sm">Win Rate: {winRate}</div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-black text-emerald-400">{earnings}</div>
        <div className="text-slate-400 text-sm">This Week</div>
      </div>
    </motion.div>
  );
}
