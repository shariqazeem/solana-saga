"use client";

import { motion } from "framer-motion";
import {
  Trophy, TrendingUp, Target, Flame, Star, Award,
  ArrowLeft, Users, DollarSign, Zap, Crown, Medal
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { WalletButton } from "@/components/WalletButton";
import { usePredictionMarkets } from "@/lib/solana/hooks/usePredictionMarkets";
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import idl from "@/lib/solana/idl/prediction_markets.json";

interface UserStatsData {
  user: string;
  totalBets: number;
  totalWagered: number;
  totalWon: number;
  winCount: number;
  lossCount: number;
  netProfit: number;
  currentStreak: number;
  bestStreak: number;
}

interface LeaderboardEntry {
  rank: number;
  user: string;
  avatar: string;
  winRate: number;
  totalBets: number;
  netProfit: string;
  streak: number;
}

const TIMEFRAMES = ["All Time"] as const;
type Timeframe = typeof TIMEFRAMES[number];

export default function LeaderboardPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("All Time");
  const { markets, userBets } = usePredictionMarkets();
  const { connection } = useConnection();
  const [userStats, setUserStats] = useState<UserStatsData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all UserStats from blockchain
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const provider = new AnchorProvider(
          connection,
          {} as any,
          { commitment: "confirmed" }
        );
        const program = new Program(idl as any, provider);

        // Fetch all UserStats accounts
        const accounts = await (program as any).account.userStats.all();

        const stats: UserStatsData[] = accounts.map((account: any) => {
          const data = account.account;

          // Helper to safely convert BN to number
          const toNum = (value: any): number => {
            if (!value) return 0;
            if (typeof value === 'number') return value;
            if (value.toNumber) return value.toNumber();
            if (value.toString) return parseInt(value.toString());
            return 0;
          };

          return {
            user: data.user.toString(),
            totalBets: toNum(data.totalBets || data.total_bets),
            totalWagered: toNum(data.totalWagered || data.total_wagered) / 1e6,
            totalWon: toNum(data.totalWon || data.total_won) / 1e6,
            winCount: toNum(data.winCount || data.win_count),
            lossCount: toNum(data.lossCount || data.loss_count),
            netProfit: toNum(data.netProfit || data.net_profit) / 1e6,
            currentStreak: toNum(data.currentStreak || data.current_streak),
            bestStreak: toNum(data.bestStreak || data.best_streak),
          };
        });

        console.log('Fetched UserStats:', stats);
        setUserStats(stats);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();

    // Auto-refresh every 60 seconds (reduced from 30s to avoid 429 rate limiting)
    const interval = setInterval(fetchUserStats, 60000);
    return () => clearInterval(interval);
  }, [connection]);

  // Transform user stats into leaderboard entries
  const leaderboardData: LeaderboardEntry[] = useMemo(() => {
    if (userStats.length === 0) return [];

    return userStats
      .filter(stat => stat.totalBets > 0) // Only show users who have placed bets
      .sort((a, b) => b.netProfit - a.netProfit) // Sort by net profit descending
      .slice(0, 10) // Top 10
      .map((stat, index) => {
        const totalBets = stat.winCount + stat.lossCount;
        const winRate = totalBets > 0 ? Math.round((stat.winCount / totalBets) * 100) : 0;

        // Generate consistent avatar emoji based on user address
        const avatars = ["🦈", "💪", "🎲", "🐋", "🌙", "🦍", "🐂", "🚀", "💎", "👑", "🔥", "⚡", "🎯", "🏆", "⭐"];
        const avatarIndex = parseInt(stat.user.slice(0, 8), 16) % avatars.length;

        return {
          rank: index + 1,
          user: `${stat.user.slice(0, 4)}...${stat.user.slice(-4)}`,
          avatar: avatars[avatarIndex],
          winRate,
          totalBets: stat.totalBets,
          netProfit: stat.netProfit >= 0 ? `+$${stat.netProfit.toFixed(2)}` : `-$${Math.abs(stat.netProfit).toFixed(2)}`,
          streak: stat.currentStreak,
        };
      });
  }, [userStats]);

  // Calculate aggregate stats
  const aggregateStats = useMemo(() => {
    const totalPredictors = userStats.filter(s => s.totalBets > 0).length;
    const totalBets = markets.reduce((sum, m) => sum + m.totalBetsCount, 0);
    const totalVolume = markets.reduce((sum, m) => sum + m.totalVolume, 0);
    const activeBettors = new Set(userBets.map(bet => bet.user)).size;

    return {
      totalPredictors,
      totalBets,
      totalVolume: `$${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      activeBettors,
    };
  }, [userStats, markets, userBets]);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Trophy className="w-20 h-20 mx-auto mb-6 animate-neon-pulse" style={{ color: '#FFD700', filter: 'drop-shadow(0 0 20px #FFD700)' }} />
          <h1 className="text-5xl md:text-7xl font-black mb-4 font-orbitron bg-gradient-to-r from-[#FFD700] via-[#FF1493] to-[#39FF14] bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            The best predictors on <span className="neon-text-green font-bold">Solana Saga</span>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <StatBox icon={<Users />} label="Total Predictors" value={aggregateStats.totalPredictors.toString()} color="from-blue-500 to-cyan-500" />
            <StatBox icon={<Target />} label="Total Bets" value={aggregateStats.totalBets.toString()} color="from-purple-500 to-pink-500" />
            <StatBox icon={<DollarSign />} label="Total Volume" value={aggregateStats.totalVolume} color="from-emerald-500 to-green-500" />
            <StatBox icon={<Flame />} label="Active Bettors" value={aggregateStats.activeBettors.toString()} color="from-orange-500 to-red-500" />
          </div>
        </motion.div>

        {/* Timeframe Selector */}
        <section className="mb-8">
          <div className="flex justify-center gap-4">
            {TIMEFRAMES.map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-8 py-3 rounded-xl font-bold text-lg transition-all font-orbitron ${selectedTimeframe === timeframe
                    ? "bg-gradient-to-r from-[#FFD700] to-[#FF6B00] text-black shadow-xl shadow-yellow-500/50 scale-105"
                    : "neon-button-secondary"
                  }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </section>

        {/* Top 3 Podium */}
        {loading ? (
          <section className="mb-12">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mb-4"></div>
              <p className="text-slate-400">Loading leaderboard...</p>
            </div>
          </section>
        ) : leaderboardData.length === 0 ? (
          <section className="mb-12">
            <div className="text-center py-12 glass-card rounded-2xl max-w-2xl mx-auto">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-700" />
              <h3 className="text-2xl font-bold mb-2">No Leaderboard Yet</h3>
              <p className="text-slate-500 mb-6">Be the first to place bets and claim the top spot!</p>
              <Link href="/markets">
                <button className="px-6 py-3 neon-button rounded-xl font-bold font-orbitron">
                  Browse Markets
                </button>
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="mb-12">
              <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-3 gap-6 items-end">
                  {/* 2nd Place */}
                  {leaderboardData[1] && (
                    <PodiumCard
                      rank={2}
                      user={leaderboardData[1]}
                      delay={0.2}
                    />
                  )}

                  {/* 1st Place */}
                  {leaderboardData[0] && (
                    <PodiumCard
                      rank={1}
                      user={leaderboardData[0]}
                      delay={0.1}
                      isWinner
                    />
                  )}

                  {/* 3rd Place */}
                  {leaderboardData[2] && (
                    <PodiumCard
                      rank={3}
                      user={leaderboardData[2]}
                      delay={0.3}
                    />
                  )}
                </div>
              </div>
            </section>

            {/* Full Leaderboard */}
            <section className="pb-24">
              <div className="max-w-5xl mx-auto">
                <div className="glass-card rounded-2xl overflow-hidden">
                  {/* Table Header */}
                  <div className="px-6 py-4 border-b border-[#00E5FF]/20" style={{ background: 'rgba(0, 229, 255, 0.05)' }}>
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
          </>
        )}

        {/* Your Rank (if connected) */}
        <section className="pb-24">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="glass-card rounded-2xl p-8 text-center relative overflow-hidden animate-neon-border"
              style={{ borderWidth: '2px' }}
            >
              <Zap className="w-12 h-12 mx-auto mb-4 neon-text animate-neon-pulse" />
              <h3 className="text-2xl font-bold mb-2 font-orbitron neon-text-magenta">Want to see your rank?</h3>
              <p className="text-slate-300 mb-6">
                Connect your wallet to track your stats and compete for the <span className="neon-text-green font-bold">top spot!</span>
              </p>
              <div className="flex justify-center">
                <WalletButton />
              </div>
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
    if (rank === 1) return <Crown className="w-8 h-8" style={{ color: '#FFD700', filter: 'drop-shadow(0 0 10px #FFD700)' }} />;
    if (rank === 2) return <Medal className="w-8 h-8" style={{ color: '#C0C0C0', filter: 'drop-shadow(0 0 10px #C0C0C0)' }} />;
    if (rank === 3) return <Award className="w-8 h-8" style={{ color: '#CD7F32', filter: 'drop-shadow(0 0 10px #CD7F32)' }} />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`glass-card rounded-2xl p-6 hover:scale-105 transition-all relative overflow-hidden ${isWinner
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
            <Flame className="w-3 h-3" style={{ color: '#FF6B00', filter: 'drop-shadow(0 0 5px #FF6B00)' }} />
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
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#FF6B00]/20 rounded-lg font-bold font-numbers border border-[#FF6B00]/30" style={{ color: '#FF6B00' }}>
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
