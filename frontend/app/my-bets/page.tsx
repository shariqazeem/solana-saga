"use client";

import { useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";
import { usePredictionMarkets } from "@/lib/solana/hooks/usePredictionMarkets";
import Link from "next/link";
import confetti from "canvas-confetti";

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

      // Celebrate!
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });

      setClaimSuccess(`Winnings claimed! Transaction: ${tx.slice(0, 8)}...`);

      // Refresh bets
      await new Promise(r => setTimeout(r, 2000));
      await refetch();
    } catch (error: any) {
      console.error("Error claiming winnings:", error);
      setClaimError(error.message || "Failed to claim winnings");
    } finally {
      setClaiming(null);
    }
  };

  // Get market details for each bet
  const betsWithMarkets = userBets.map(bet => {
    const market = markets.find(m => m.publicKey === bet.market);
    return { ...bet, marketData: market };
  });

  // Categorize bets
  const activeBets = betsWithMarkets.filter(b => b.marketData?.status === "Active");
  const claimableBets = betsWithMarkets.filter(
    b => b.marketData?.status === "Resolved" &&
         b.marketData?.outcome === b.prediction &&
         !b.claimed
  );
  const lostBets = betsWithMarkets.filter(
    b => b.marketData?.status === "Resolved" &&
         b.marketData?.outcome !== b.prediction
  );
  const claimedBets = betsWithMarkets.filter(b => b.claimed);

  // Calculate stats
  const totalWagered = userBets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalWon = claimedBets.reduce((sum, bet) => sum + bet.payout, 0);
  const pendingWinnings = claimableBets.reduce((sum, bet) => sum + bet.payout, 0);

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">My Bets</h1>
            <WalletButton />
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
            <p className="text-yellow-400">Please connect your wallet to view your bets</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Bets</h1>
            <p className="text-gray-400">Track your predictions and claim winnings</p>
          </div>
          <WalletButton />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Bets</p>
            <p className="text-3xl font-bold">{userBets.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Wagered</p>
            <p className="text-3xl font-bold">${totalWagered.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Won</p>
            <p className="text-3xl font-bold text-green-400">${totalWon.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Pending Winnings</p>
            <p className="text-3xl font-bold text-yellow-400">${pendingWinnings.toFixed(2)}</p>
          </div>
        </div>

        {/* Messages */}
        {claimError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4 text-red-400">
            {claimError}
          </div>
        )}

        {claimSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4 text-green-400">
            {claimSuccess}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-400">Loading your bets...</p>
          </div>
        )}

        {!loading && userBets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">You haven't placed any bets yet</p>
            <Link
              href="/markets"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
            >
              Browse Markets
            </Link>
          </div>
        )}

        {/* Claimable Bets */}
        {claimableBets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-green-400">🎉 Claimable Winnings ({claimableBets.length})</h2>
            <div className="grid gap-4">
              {claimableBets.map((bet) => (
                <div key={bet.publicKey} className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{bet.marketData?.question}</h3>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-400">Bet: ${bet.amount.toFixed(2)}</span>
                        <span className={bet.prediction ? "text-green-400" : "text-red-400"}>
                          Predicted: {bet.prediction ? "YES" : "NO"}
                        </span>
                        <span className="text-green-400 font-bold">Winnings: ${bet.payout.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClaimWinnings(bet.publicKey)}
                    disabled={claiming === bet.publicKey}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                  >
                    {claiming === bet.publicKey ? "Claiming..." : `Claim $${bet.payout.toFixed(2)} Winnings`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Bets */}
        {activeBets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">⏳ Active Bets ({activeBets.length})</h2>
            <div className="grid gap-4">
              {activeBets.map((bet) => (
                <div key={bet.publicKey} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-2">{bet.marketData?.question}</h3>
                  <div className="flex gap-4 text-sm mb-4">
                    <span className="text-gray-400">Bet: ${bet.amount.toFixed(2)}</span>
                    <span className={bet.prediction ? "text-green-400" : "text-red-400"}>
                      Predicted: {bet.prediction ? "YES" : "NO"}
                    </span>
                    <span className="text-gray-400">Potential: ${bet.tokensReceived.toFixed(2)}</span>
                  </div>
                  <Link
                    href={`/markets/${bet.marketData?.publicKey}`}
                    className="inline-block text-purple-400 hover:text-purple-300 text-sm"
                  >
                    View Market →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lost Bets */}
        {lostBets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-400">❌ Lost Bets ({lostBets.length})</h2>
            <div className="grid gap-4">
              {lostBets.map((bet) => (
                <div key={bet.publicKey} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 opacity-60">
                  <h3 className="text-xl font-bold mb-2">{bet.marketData?.question}</h3>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-400">Lost: ${bet.amount.toFixed(2)}</span>
                    <span className={bet.prediction ? "text-green-400" : "text-red-400"}>
                      You predicted: {bet.prediction ? "YES" : "NO"}
                    </span>
                    <span className="text-gray-400">
                      Outcome: {bet.marketData?.outcome ? "YES" : "NO"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claimed Bets */}
        {claimedBets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-400">✅ Claimed Winnings ({claimedBets.length})</h2>
            <div className="grid gap-4">
              {claimedBets.map((bet) => (
                <div key={bet.publicKey} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 opacity-60">
                  <h3 className="text-xl font-bold mb-2">{bet.marketData?.question}</h3>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-400">Bet: ${bet.amount.toFixed(2)}</span>
                    <span className="text-green-400">Won: ${bet.payout.toFixed(2)}</span>
                    <span className="text-gray-500">✓ Claimed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
