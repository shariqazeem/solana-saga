"use client";

import { motion } from "framer-motion";
import {
  Trophy, TrendingUp, Clock, AlertCircle, Check,
  ArrowRight, Target, DollarSign, Calendar
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { usePredictionMarkets } from "@/lib/solana/hooks/usePredictionMarkets";
import { WalletButton } from "@/components/WalletButton";

export default function MyBetsPage() {
  const wallet = useAnchorWallet();
  const { userBets, markets, loading, claimWinnings, refetch } = usePredictionMarkets();
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  const handleClaimWinnings = async (betPublicKey: string) => {
    setClaiming(betPublicKey);
    setClaimError(null);
    setClaimSuccess(null);

    try {
      const tx = await claimWinnings(betPublicKey);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#00E5FF', '#FF1493', '#39FF14']
      });
      setClaimSuccess(`Winnings claimed! Transaction: ${tx.slice(0, 8)}...`);
      await new Promise(r => setTimeout(r, 2000));
      await refetch();
    } catch (error: any) {
      console.error("Error claiming winnings:", error);
      setClaimError(error.message || "Failed to claim winnings");
    } finally {
      setClaiming(null);
    }
  };

  if (!wallet) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <Target className="w-12 h-12 text-[#00F3FF]" />
          </div>
          <h1 className="text-3xl font-black mb-4 font-heading">Connect Wallet</h1>
          <p className="text-slate-400 mb-8">
            Connect your Solana wallet to view your betting history and track your performance.
          </p>
          <div className="flex justify-center">
            <WalletButton />
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalWagered = userBets.reduce((acc, bet) => acc + bet.amount, 0);
  const totalWon = userBets.reduce((acc, bet) => acc + (bet.claimed ? bet.payout : 0), 0);
  const activeBetsCount = userBets.filter(bet => !bet.claimed && !bet.payout).length;
  const winRate = userBets.length > 0
    ? Math.round((userBets.filter(bet => bet.payout > 0).length / userBets.length) * 100)
    : 0;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black mb-4 font-heading bg-gradient-to-r from-[#00F3FF] to-[#FF00FF] bg-clip-text text-transparent">
            MY DASHBOARD
          </h1>
          <p className="text-xl text-slate-400">
            Track your performance and claim your winnings.
          </p>
        </motion.div>

        {/* HUD Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            label="Total Wagered"
            value={`$${totalWagered.toFixed(2)}`}
            icon={<DollarSign />}
            color="text-[#00F3FF]"
            borderColor="border-[#00F3FF]/30"
          />
          <StatCard
            label="Total Won"
            value={`$${totalWon.toFixed(2)}`}
            icon={<Trophy />}
            color="text-[#FFD700]"
            borderColor="border-[#FFD700]/30"
          />
          <StatCard
            label="Active Bets"
            value={activeBetsCount.toString()}
            icon={<Target />}
            color="text-[#FF00FF]"
            borderColor="border-[#FF00FF]/30"
          />
          <StatCard
            label="Win Rate"
            value={`${winRate}%`}
            icon={<TrendingUp />}
            color="text-[#00FF9D]"
            borderColor="border-[#00FF9D]/30"
          />
        </div>

        {/* Messages */}
        {claimError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-400">{claimError}</span>
          </motion.div>
        )}
        {claimSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3"
          >
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-green-400">{claimSuccess}</span>
          </motion.div>
        )}

        {/* Bets List */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <h2 className="text-xl font-bold font-heading">Bet History</h2>
            <div className="text-sm text-slate-400 font-numbers">{userBets.length} Total Bets</div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-[#00F3FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading your bets...</p>
            </div>
          ) : userBets.length === 0 ? (
            <div className="p-12 text-center">
              <Target className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No bets yet</h3>
              <p className="text-slate-500 mb-6">Start predicting to see your history here.</p>
              <Link href="/markets">
                <button className="btn-primary px-8 py-3 rounded-full">
                  Browse Markets
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {userBets.map((bet, index) => (
                <BetRow
                  key={index}
                  bet={bet}
                  onClaim={handleClaimWinnings}
                  claiming={claiming === bet.publicKey.toString()}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, borderColor }: any) {
  return (
    <div className={`glass-card p-6 rounded-xl border ${borderColor} relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity ${color}`}>
        {icon}
      </div>
      <div className="text-3xl font-black font-numbers mb-1 text-white">{value}</div>
      <div className={`text-sm font-bold uppercase tracking-wider ${color}`}>{label}</div>
    </div>
  );
}

function BetRow({ bet, onClaim, claiming }: any) {
  const { markets } = usePredictionMarkets();
  const isWin = bet.claimed && bet.payout > 0;
  const isLoss = bet.claimed && bet.payout === 0;
  const isPending = !bet.claimed;

  // Find the market for this bet
  const market = markets.find(m => m.publicKey === bet.market);
  const marketQuestion = market?.question || "Unknown Market";

  return (
    <div className="p-6 hover:bg-white/5 transition-colors flex flex-col md:flex-row items-center gap-6">
      <div className="flex-grow">
        <div className="flex items-center gap-3 mb-2">
          <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${bet.prediction
              ? "bg-[#00FF9D]/10 text-[#00FF9D] border-[#00FF9D]/30"
              : "bg-[#FF3366]/10 text-[#FF3366] border-[#FF3366]/30"
            }`}>
            {bet.prediction ? "YES" : "NO"}
          </span>
          <span className="text-slate-400 text-sm flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {new Date(bet.timestamp * 1000).toLocaleDateString()}
          </span>
        </div>
        <Link href={`/markets/${bet.market}`} className="hover:text-[#00F3FF] transition-colors">
          <h3 className="font-bold text-lg mb-1">{marketQuestion}</h3>
        </Link>
        <div className="text-sm text-slate-400 font-numbers">
          Wagered: <span className="text-white">${bet.amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</div>
          <div className={`font-bold ${isWin ? "text-[#00FF9D]" : isLoss ? "text-[#FF3366]" : "text-[#00F3FF]"
            }`}>
            {isWin ? "WON" : isLoss ? "LOST" : "PENDING"}
          </div>
        </div>

        {isWin && (
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Payout</div>
            <div className="font-black font-numbers text-[#00FF9D] text-xl">
              +${bet.payout.toFixed(2)}
            </div>
          </div>
        )}

        {isPending && bet.canClaim && (
          <button
            onClick={() => onClaim(bet.publicKey.toString())}
            disabled={claiming}
            className="btn-primary px-6 py-2 rounded-lg text-sm"
          >
            {claiming ? "Claiming..." : "Claim Winnings"}
          </button>
        )}
      </div>
    </div>
  );
}
