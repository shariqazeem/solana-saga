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
    <div className="min-h-screen text-white" style={{background: '#050814'}}>
      {/* Neon Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-30" style={{background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)'}} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-30" style={{background: 'radial-gradient(circle, #FF1493 0%, transparent 70%)'}} />
        <div className="absolute inset-0 neon-grid opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-[#00E5FF]/20 backdrop-blur-md sticky top-0 z-50" style={{background: 'rgba(13, 18, 38, 0.8)'}}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/markets">
                <button className="flex items-center gap-2 text-slate-300 hover:neon-text transition-all font-orbitron">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-semibold">Back to Markets</span>
                </button>
              </Link>

              <Link href="/">
                <h1 className="text-2xl font-black bg-gradient-to-r from-[#00E5FF] via-[#FF1493] to-[#39FF14] bg-clip-text text-transparent font-orbitron">
                  SOLANA SAGA
                </h1>
              </Link>

              <button className="neon-button px-6 py-2 rounded-lg">
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
              <Trophy className="w-20 h-20 mx-auto mb-6 animate-neon-pulse" style={{color: '#FFD700', filter: 'drop-shadow(0 0 20px #FFD700)'}} />
              <h1 className="text-5xl md:text-7xl font-black mb-4 font-orbitron bg-gradient-to-r from-[#FFD700] via-[#FF1493] to-[#39FF14] bg-clip-text text-transparent">
                Leaderboard
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                The best predictors on <span className="neon-text-green font-bold">Solana Saga</span>
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
                  className={`px-8 py-3 rounded-xl font-bold text-lg transition-all font-orbitron ${
                    selectedTimeframe === timeframe
                      ? "bg-gradient-to-r from-[#FFD700] to-[#FF6B00] text-black shadow-xl shadow-yellow-500/50 scale-105"
                      : "neon-button-secondary"
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
            <div className="glass-card rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-[#00E5FF]/20" style={{background: 'rgba(0, 229, 255, 0.05)'}}>
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-slate-300 font-orbitron">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-4">User</div>
                  <div className="col-span-2 text-center">Win Rate</div>
                  <div className="col-span-2 text-center">Total Bets</div>
                  <div className="col-span-2 text-center">Streak</div>
                  <div className="col-span-1 text-right">Profit</div>
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-[#00E5FF]/10">
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
              className="glass-card rounded-2xl p-8 text-center relative overflow-hidden animate-neon-border"
              style={{borderWidth: '2px'}}
            >
              <Zap className="w-12 h-12 mx-auto mb-4 neon-text animate-neon-pulse" />
              <h3 className="text-2xl font-bold mb-2 font-orbitron neon-text-magenta">Want to see your rank?</h3>
              <p className="text-slate-300 mb-6">
                Connect your wallet to track your stats and compete for the <span className="neon-text-green font-bold">top spot!</span>
              </p>
              <button className="neon-button px-8 py-3 rounded-xl">
                Connect Wallet
              </button>
              <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-[#FF1493]/20 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 -z-10" />
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
    <div className="glass-card rounded-xl p-4 group">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} mb-3 animate-neon-pulse shadow-lg`}>
        {icon}
      </div>
      <div className="text-2xl font-black mb-1 font-numbers neon-text">{value}</div>
      <div className="text-sm text-slate-300">{label}</div>
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
    if (rank === 1) return "from-[#FFD700] to-[#FFA500]";
    if (rank === 2) return "from-[#C0C0C0] to-[#A8A8A8]";
    if (rank === 3) return "from-[#CD7F32] to-[#B87333]";
    return "from-slate-600 to-slate-700";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-8 h-8" style={{color: '#FFD700', filter: 'drop-shadow(0 0 10px #FFD700)'}} />;
    if (rank === 2) return <Medal className="w-8 h-8" style={{color: '#C0C0C0', filter: 'drop-shadow(0 0 10px #C0C0C0)'}} />;
    if (rank === 3) return <Award className="w-8 h-8" style={{color: '#CD7F32', filter: 'drop-shadow(0 0 10px #CD7F32)'}} />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`glass-card rounded-2xl p-6 hover:scale-105 transition-all relative overflow-hidden ${
        isWinner
          ? "border-2 border-[#FFD700] shadow-xl shadow-yellow-500/50 md:-translate-y-8 animate-neon-pulse"
          : rank === 2
          ? "border-2 border-[#C0C0C0] shadow-xl shadow-slate-400/30"
          : "border-2 border-[#CD7F32] shadow-xl shadow-orange-600/30"
      }`}
    >
      <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center text-4xl font-black relative shadow-lg`}>
        {rank === 1 && (
          <div className="absolute -top-6 animate-bounce">
            {getRankIcon(rank)}
          </div>
        )}
        <div className="text-5xl">{user.avatar}</div>
      </div>

      <div className={`font-black mb-2 font-orbitron ${isWinner ? "text-2xl" : "text-xl"}`}>
        {user.user}
      </div>

      <div className="text-3xl font-black neon-text-green mb-4 font-numbers">
        {user.netProfit}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-300">Win Rate:</span>
          <span className="font-bold neon-text-green font-numbers">{user.winRate}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300">Bets:</span>
          <span className="font-bold font-numbers">{user.totalBets}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300">Streak:</span>
          <span className="font-bold flex items-center gap-1 font-numbers">
            <Flame className="w-3 h-3" style={{color: '#FF6B00', filter: 'drop-shadow(0 0 5px #FF6B00)'}} />
            {user.streak}
          </span>
        </div>
      </div>

      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#FFD700]/10 to-transparent rounded-full blur-2xl" />
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
      className="px-6 py-4 hover:bg-[#00E5FF]/5 transition-all cursor-pointer group"
    >
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-1 text-center">
          {getRankDisplay(user.rank)}
        </div>

        <div className="col-span-4 flex items-center gap-3">
          <div className="text-3xl">{user.avatar}</div>
          <div className="font-bold font-orbitron group-hover:neon-text transition-all">{user.user}</div>
        </div>

        <div className="col-span-2 text-center">
          <div className="inline-flex px-3 py-1 bg-[#39FF14]/20 neon-text-green rounded-lg font-bold font-numbers border border-[#39FF14]/30">
            {user.winRate}%
          </div>
        </div>

        <div className="col-span-2 text-center font-semibold font-numbers">
          {user.totalBets}
        </div>

        <div className="col-span-2 text-center">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#FF6B00]/20 rounded-lg font-bold font-numbers border border-[#FF6B00]/30" style={{color: '#FF6B00'}}>
            <Flame className="w-4 h-4" />
            {user.streak}
          </div>
        </div>

        <div className="col-span-1 text-right font-black neon-text-green font-numbers">
          {user.netProfit}
        </div>
      </div>
    </motion.div>
  );
}
