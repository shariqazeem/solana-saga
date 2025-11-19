"use client";

import { motion } from "framer-motion";
import {
  Trophy, TrendingUp, Target, Flame, Star, Award,
  ArrowLeft, Users, DollarSign, Zap, Crown, Medal
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// Mock leaderboard data
const MOCK_LEADERBOARD = {
  daily: [
    { rank: 1, user: "sigma.sol", avatar: "🦈", winRate: 94, totalBets: 28, netProfit: "+$12,450", streak: 8 },
    { rank: 2, user: "chad.sol", avatar: "💪", winRate: 89, totalBets: 45, netProfit: "+$9,230", streak: 6 },
    { rank: 3, user: "degen.sol", avatar: "🎲", winRate: 87, totalBets: 67, netProfit: "+$7,890", streak: 5 },
    { rank: 4, user: "whale.sol", avatar: "🐋", winRate: 82, totalBets: 23, netProfit: "+$6,540", streak: 4 },
    { rank: 5, user: "moon.sol", avatar: "🌙", winRate: 79, totalBets: 34, netProfit: "+$5,230", streak: 3 },
    { rank: 6, user: "ape.sol", avatar: "🦍", winRate: 76, totalBets: 56, netProfit: "+$4,120", streak: 7 },
    { rank: 7, user: "bull.sol", avatar: "🐂", winRate: 73, totalBets: 41, netProfit: "+$3,890", streak: 2 },
    { rank: 8, user: "rocket.sol", avatar: "🚀", winRate: 71, totalBets: 38, netProfit: "+$3,450", streak: 5 },
    { rank: 9, user: "diamond.sol", avatar: "💎", winRate: 68, totalBets: 29, netProfit: "+$2,980", streak: 1 },
    { rank: 10, user: "king.sol", avatar: "👑", winRate: 65, totalBets: 52, netProfit: "+$2,560", streak: 4 },
  ],
  weekly: [
    { rank: 1, user: "sigma.sol", avatar: "🦈", winRate: 92, totalBets: 156, netProfit: "+$45,230", streak: 12 },
    { rank: 2, user: "whale.sol", avatar: "🐋", winRate: 88, totalBets: 134, netProfit: "+$38,450", streak: 9 },
    { rank: 3, user: "chad.sol", avatar: "💪", winRate: 85, totalBets: 189, netProfit: "+$32,100", streak: 8 },
    { rank: 4, user: "moon.sol", avatar: "🌙", winRate: 83, totalBets: 98, netProfit: "+$28,790", streak: 11 },
    { rank: 5, user: "degen.sol", avatar: "🎲", winRate: 81, totalBets: 245, netProfit: "+$25,340", streak: 6 },
    { rank: 6, user: "ape.sol", avatar: "🦍", winRate: 78, totalBets: 167, netProfit: "+$22,450", streak: 7 },
    { rank: 7, user: "bull.sol", avatar: "🐂", winRate: 76, totalBets: 143, netProfit: "+$19,230", streak: 5 },
    { rank: 8, user: "rocket.sol", avatar: "🚀", winRate: 74, totalBets: 121, netProfit: "+$17,890", streak: 4 },
    { rank: 9, user: "diamond.sol", avatar: "💎", winRate: 71, totalBets: 156, netProfit: "+$15,670", streak: 3 },
    { rank: 10, user: "king.sol", avatar: "👑", winRate: 69, totalBets: 178, netProfit: "+$13,450", streak: 8 },
  ],
  allTime: [
    { rank: 1, user: "sigma.sol", avatar: "🦈", winRate: 91, totalBets: 1243, netProfit: "+$234,560", streak: 23 },
    { rank: 2, user: "whale.sol", avatar: "🐋", winRate: 87, totalBets: 1098, netProfit: "+$198,340", streak: 18 },
    { rank: 3, user: "chad.sol", avatar: "💪", winRate: 84, totalBets: 1567, netProfit: "+$176,230", streak: 15 },
    { rank: 4, user: "moon.sol", avatar: "🌙", winRate: 82, totalBets: 876, netProfit: "+$154,890", streak: 21 },
    { rank: 5, user: "degen.sol", avatar: "🎲", winRate: 79, totalBets: 2134, netProfit: "+$142,670", streak: 12 },
    { rank: 6, user: "ape.sol", avatar: "🦍", winRate: 77, totalBets: 1456, netProfit: "+$128,450", streak: 16 },
    { rank: 7, user: "bull.sol", avatar: "🐂", winRate: 75, totalBets: 1289, netProfit: "+$115,230", streak: 9 },
    { rank: 8, user: "rocket.sol", avatar: "🚀", winRate: 73, totalBets: 1034, netProfit: "+$103,890", streak: 14 },
    { rank: 9, user: "diamond.sol", avatar: "💎", winRate: 71, totalBets: 1678, netProfit: "+$95,670", streak: 7 },
    { rank: 10, user: "king.sol", avatar: "👑", winRate: 69, totalBets: 1823, netProfit: "+$87,450", streak: 11 },
  ],
};

const TIMEFRAMES = ["Daily", "Weekly", "All Time"] as const;
type Timeframe = typeof TIMEFRAMES[number];

export default function LeaderboardPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("Weekly");

  const getLeaderboardData = () => {
    switch (selectedTimeframe) {
      case "Daily": return MOCK_LEADERBOARD.daily;
      case "Weekly": return MOCK_LEADERBOARD.weekly;
      case "All Time": return MOCK_LEADERBOARD.allTime;
    }
  };

  const leaderboardData = getLeaderboardData();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/markets">
                <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-semibold">Back to Markets</span>
                </button>
              </Link>

              <Link href="/">
                <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                  SOLANA SAGA
                </h1>
              </Link>

              <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:scale-105 transition-all">
                Connect Wallet
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-400" />
              <h1 className="text-5xl md:text-7xl font-black mb-4">
                Leaderboard
              </h1>
              <p className="text-xl text-slate-400 mb-8">
                The best predictors on Solana Saga
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox icon={<Users />} label="Total Predictors" value="12,543" color="from-blue-500 to-cyan-500" />
                <StatBox icon={<Target />} label="Total Bets" value="89,234" color="from-purple-500 to-pink-500" />
                <StatBox icon={<DollarSign />} label="Total Volume" value="$4.2M" color="from-emerald-500 to-green-500" />
                <StatBox icon={<Flame />} label="Active Today" value="3,421" color="from-orange-500 to-red-500" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Timeframe Selector */}
        <section className="px-4 mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center gap-4">
              {TIMEFRAMES.map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${
                    selectedTimeframe === timeframe
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/50 scale-105"
                      : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Top 3 Podium */}
        <section className="px-4 mb-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 items-end">
              {/* 2nd Place */}
              <PodiumCard
                rank={2}
                user={leaderboardData[1]}
                delay={0.2}
              />

              {/* 1st Place */}
              <PodiumCard
                rank={1}
                user={leaderboardData[0]}
                delay={0.1}
                isWinner
              />

              {/* 3rd Place */}
              <PodiumCard
                rank={3}
                user={leaderboardData[2]}
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Full Leaderboard */}
        <section className="px-4 pb-24">
          <div className="max-w-5xl mx-auto">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-slate-400">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-4">User</div>
                  <div className="col-span-2 text-center">Win Rate</div>
                  <div className="col-span-2 text-center">Total Bets</div>
                  <div className="col-span-2 text-center">Streak</div>
                  <div className="col-span-1 text-right">Profit</div>
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-slate-800">
                {leaderboardData.map((user, index) => (
                  <LeaderboardRow
                    key={user.user}
                    user={user}
                    delay={0.4 + index * 0.05}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Your Rank (if connected) */}
        <section className="px-4 pb-24">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-emerald-600/20 border-2 border-purple-500/30 rounded-2xl p-8 text-center"
            >
              <Zap className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <h3 className="text-2xl font-bold mb-2">Want to see your rank?</h3>
              <p className="text-slate-400 mb-6">
                Connect your wallet to track your stats and compete for the top spot!
              </p>
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:scale-105 transition-all">
                Connect Wallet
              </button>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-emerald-500/50 transition-all">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-black mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

function PodiumCard({ rank, user, delay, isWinner = false }: {
  rank: number;
  user: any;
  delay: number;
  isWinner?: boolean;
}) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-500 to-yellow-600";
    if (rank === 2) return "from-slate-400 to-slate-500";
    if (rank === 3) return "from-orange-600 to-orange-700";
    return "from-slate-600 to-slate-700";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-8 h-8" />;
    if (rank === 2) return <Medal className="w-8 h-8" />;
    if (rank === 3) return <Award className="w-8 h-8" />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`bg-slate-900/50 border-2 rounded-2xl p-6 hover:scale-105 transition-all ${
        isWinner
          ? "border-yellow-500 shadow-lg shadow-yellow-500/50 md:-translate-y-8"
          : rank === 2
          ? "border-slate-400 shadow-lg shadow-slate-400/30"
          : "border-orange-600 shadow-lg shadow-orange-600/30"
      }`}
    >
      <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center text-4xl font-black relative`}>
        {rank === 1 && (
          <div className="absolute -top-6 animate-bounce">
            {getRankIcon(rank)}
          </div>
        )}
        <div className="text-5xl">{user.avatar}</div>
      </div>

      <div className={`text-xl font-black mb-2 ${isWinner ? "text-2xl" : ""}`}>
        {user.user}
      </div>

      <div className="text-3xl font-black text-emerald-400 mb-4">
        {user.netProfit}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Win Rate:</span>
          <span className="font-bold">{user.winRate}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Bets:</span>
          <span className="font-bold">{user.totalBets}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Streak:</span>
          <span className="font-bold flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" />
            {user.streak}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function LeaderboardRow({ user, delay }: { user: any; delay: number }) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="font-bold text-slate-400">#{rank}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="px-6 py-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
    >
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-1 text-center">
          {getRankDisplay(user.rank)}
        </div>

        <div className="col-span-4 flex items-center gap-3">
          <div className="text-3xl">{user.avatar}</div>
          <div className="font-bold">{user.user}</div>
        </div>

        <div className="col-span-2 text-center">
          <div className="inline-flex px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold">
            {user.winRate}%
          </div>
        </div>

        <div className="col-span-2 text-center font-semibold">
          {user.totalBets}
        </div>

        <div className="col-span-2 text-center">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg font-bold">
            <Flame className="w-4 h-4" />
            {user.streak}
          </div>
        </div>

        <div className="col-span-1 text-right font-black text-emerald-400">
          {user.netProfit}
        </div>
      </div>
    </motion.div>
  );
}
