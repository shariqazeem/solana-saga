"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Minus, Plus, Wallet, AlertTriangle } from "lucide-react";
import { RetroGrid } from "@/components/RetroGrid";
import { SwipeableMarketStack } from "@/components/SwipeableMarketStack";
import { GameOverlay } from "@/components/GameOverlay";
import { BetSuccessModal } from "@/components/BetSuccessModal";
import { ArcadeModal } from "@/components/ArcadeModal";
import { usePredictionMarkets, Market } from "@/lib/solana/hooks/usePredictionMarkets";
import { useUsdcBalance, useSolBalance } from "@/hooks/useUsdcBalance";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { WalletButton } from "@/components/WalletButton";
import confetti from "canvas-confetti";

interface Notification {
  id: string;
  type: "win" | "loss" | "streak" | "info" | "error";
  message: string;
  amount?: number;
}

export default function ArenaPage() {
  const { connected, publicKey } = useWallet();
  const { markets, loading, placeBet, userBets, refetch, error: marketsError } = usePredictionMarkets();
  const { balance: usdcBalance, loading: balanceLoading, refetch: refetchBalance } = useUsdcBalance();
  const { balance: solBalance } = useSolBalance();

  // Game state
  const [betAmount, setBetAmount] = useState(1);
  const [streak, setStreak] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isBetting, setIsBetting] = useState(false);
  const [comboText, setComboText] = useState<{ text: string; x: number; y: number; id: number } | null>(null);

  // Bet success modal state
  const [lastBet, setLastBet] = useState<{
    question: string;
    side: boolean;
    amount: number;
    multiplier: string;
    potentialPayout: number;
  } | null>(null);

  // Arcade modal state
  const [showArcade, setShowArcade] = useState(false);

  // Ref for keyboard controls
  const swipeStackRef = useRef<{ triggerBet: (prediction: boolean) => void; triggerSkip: () => void } | null>(null);

  const { playWin, playStreak, playError, playBet } = useSoundEffects(soundEnabled);

  // Filter to active markets only
  const activeMarkets = useMemo(() =>
    markets.filter((m) => m.status === "Active" && m.endsIn !== "Ended"),
    [markets]
  );

  // Calculate stats from user bets
  const userStats = useMemo(() => {
    if (!userBets || userBets.length === 0) {
      return { totalBets: 0, totalWins: 0, totalWagered: 0, winStreak: 0 };
    }

    let totalBets = userBets.length;
    let totalWins = 0;
    let totalWagered = 0;

    // Get market outcomes to determine wins
    const marketOutcomes = new Map(
      markets
        .filter(m => m.isResolved && m.outcome !== null)
        .map(m => [m.publicKey, m.outcome])
    );

    // Calculate stats
    userBets.forEach(bet => {
      totalWagered += bet.amount;
      const marketOutcome = marketOutcomes.get(bet.market);
      if (marketOutcome !== undefined && bet.prediction === marketOutcome) {
        totalWins++;
      }
    });

    // Calculate current streak (simplified - just count claimed wins)
    const wonBets = userBets.filter(bet => {
      const outcome = marketOutcomes.get(bet.market);
      return outcome !== undefined && bet.prediction === outcome;
    });
    const currentStreak = wonBets.length > 0 ? Math.min(wonBets.length, 10) : 0;

    return { totalBets, totalWins, totalWagered, winStreak: currentStreak };
  }, [userBets, markets]);

  // Trust score based on win rate
  const trustScore = useMemo(() => {
    if (userStats.totalBets === 0) return 50;
    const winRate = userStats.totalWins / userStats.totalBets;
    return Math.round(Math.max(10, Math.min(100, 50 + (winRate - 0.5) * 100)));
  }, [userStats]);

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { ...notification, id }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Spawn combo text
  const spawnComboText = useCallback((text: string, prediction: boolean) => {
    const x = prediction ? 70 : 30; // percentage from left
    const y = 40; // percentage from top
    setComboText({ text, x, y, id: Date.now() });
    setTimeout(() => setComboText(null), 1000);
  }, []);

  // Handle real bet placement
  const handleBet = useCallback(
    async (marketId: string, prediction: boolean, amount: number) => {
      if (!connected) {
        addNotification({
          type: "info",
          message: "Connect wallet to place bets!",
        });
        return;
      }

      // Check balance
      if (usdcBalance < amount) {
        addNotification({
          type: "error",
          message: `Insufficient USDC! You have $${usdcBalance.toFixed(2)}`,
        });
        playError();
        return;
      }

      // Check SOL for gas
      if (solBalance < 0.01) {
        addNotification({
          type: "error",
          message: "Need SOL for transaction fees!",
        });
        playError();
        return;
      }

      // Find the market for bet details
      const market = activeMarkets.find(m => m.publicKey === marketId);

      setIsBetting(true);

      try {
        // Place the actual bet on blockchain
        await placeBet(marketId, amount, prediction);

        playBet();

        // Spawn combo text
        spawnComboText(prediction ? "YES!" : "NO!", prediction);

        // Calculate multiplier and payout for the success modal
        if (market) {
          const multiplier = prediction ? market.yesMultiplier : market.noMultiplier;
          const multiplierValue = parseFloat(multiplier.replace("x", ""));
          const potentialPayout = amount * multiplierValue;

          // Show bet success modal
          setLastBet({
            question: market.question,
            side: prediction,
            amount: amount,
            multiplier: multiplier,
            potentialPayout: potentialPayout,
          });
        }

        // Update streak
        setStreak((prev) => prev + 1);

        // Fire confetti on bet placement
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { x: prediction ? 0.7 : 0.3, y: 0.5 },
          colors: prediction ? ["#00FF88", "#00F3FF"] : ["#FF0044", "#FF00FF"],
        });

        // Streak celebration every 5 bets
        if ((streak + 1) % 5 === 0) {
          playStreak(streak + 1);
          addNotification({
            type: "streak",
            message: `${streak + 1} BETS! You're on a roll!`,
          });

          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ["#00FF88", "#00F3FF", "#FF00FF", "#FFD700"],
          });
        }

        // Refresh data
        await Promise.all([refetch(), refetchBalance()]);

      } catch (error: any) {
        console.error("Bet error:", error);
        playError();

        let errorMessage = "Bet failed. Please try again.";

        if (error.message?.includes("insufficient")) {
          errorMessage = "Insufficient USDC balance!";
        } else if (error.message?.includes("Minimum bet")) {
          errorMessage = "Minimum bet is 1 USDC";
        } else if (error.message?.includes("Maximum bet")) {
          errorMessage = "Maximum bet is 10,000 USDC";
        } else if (error.message?.includes("User rejected")) {
          errorMessage = "Transaction cancelled";
        } else if (error.message) {
          errorMessage = error.message.slice(0, 100);
        }

        addNotification({
          type: "error",
          message: errorMessage,
        });
      } finally {
        setIsBetting(false);
      }
    },
    [connected, usdcBalance, solBalance, placeBet, streak, playBet, playStreak, playError, addNotification, refetch, refetchBalance, spawnComboText, activeMarkets]
  );

  // Handle skip
  const handleSkip = useCallback(() => {
    spawnComboText("SKIP", true);
  }, [spawnComboText]);

  // Initial load animation
  useEffect(() => {
    if (!loading && isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [loading, isFirstLoad]);

  // Adjust bet amount - now with better handling
  const increaseBet = useCallback(() => {
    const maxBet = Math.max(1, Math.floor(usdcBalance));
    setBetAmount((prev) => Math.min(prev + 1, maxBet));
  }, [usdcBalance]);

  const decreaseBet = useCallback(() => {
    setBetAmount((prev) => Math.max(prev - 1, 1));
  }, []);

  // Quick bet amount setters
  const setQuickBet = useCallback((amount: number) => {
    if (amount <= usdcBalance || usdcBalance === 0) {
      setBetAmount(amount);
    }
  }, [usdcBalance]);

  // Ensure bet amount doesn't exceed balance
  useEffect(() => {
    if (usdcBalance > 0 && betAmount > usdcBalance) {
      setBetAmount(Math.max(1, Math.floor(usdcBalance)));
    }
  }, [usdcBalance, betAmount]);

  // Keyboard controls for gamer mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't trigger if modal is open or betting in progress
      if (lastBet || isBetting || !connected || activeMarkets.length === 0) {
        return;
      }

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          if (swipeStackRef.current) {
            swipeStackRef.current.triggerBet(true); // YES
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (swipeStackRef.current) {
            swipeStackRef.current.triggerBet(false); // NO
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (swipeStackRef.current) {
            swipeStackRef.current.triggerSkip(); // SKIP
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lastBet, isBetting, connected, activeMarkets.length]);

  return (
    <div className="fixed inset-0 flex flex-col h-[100dvh] overflow-hidden">
      {/* Retro Grid Background - Streak Reactive */}
      <RetroGrid streak={streak} />

      {/* Game Overlay HUD - Includes Admin Button */}
      <GameOverlay
        streak={streak}
        balance={usdcBalance}
        trustScore={trustScore}
        notifications={notifications}
        onDismissNotification={dismissNotification}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        totalWins={userStats.totalWins}
        totalBets={userStats.totalBets}
        showAdmin={connected}
        onOpenArcade={() => setShowArcade(true)}
      />

      {/* Floating Combo Text */}
      <AnimatePresence>
        {comboText && (
          <motion.div
            key={comboText.id}
            className="fixed z-[60] pointer-events-none"
            style={{ left: `${comboText.x}%`, top: `${comboText.y}%` }}
            initial={{ opacity: 1, scale: 0.5, y: 0 }}
            animate={{ opacity: 0, scale: 2, y: -100 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className={`font-game text-4xl font-bold drop-shadow-lg ${
              comboText.text === "YES!" ? "text-[#00FF88]" :
              comboText.text === "NO!" ? "text-[#FF0044]" :
              "text-white"
            }`}>
              {comboText.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Arena Content - Flexbox Layout */}
      <main className="relative z-10 flex-1 flex flex-col min-h-0 pt-20 pb-24">
        <AnimatePresence mode="wait">
          {loading && isFirstLoad ? (
            <motion.div
              key="loading"
              className="flex-1 flex flex-col items-center justify-center gap-6 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative">
                <motion.div
                  className="w-24 h-24 rounded-full border-4 border-[#00F3FF]/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#00F3FF]" />
                </motion.div>
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-[#00F3FF]" />
              </div>
              <p className="text-gray-400 font-game animate-pulse">LOADING MARKETS...</p>
            </motion.div>
          ) : !connected ? (
            <motion.div
              key="connect"
              className="flex-1 flex flex-col items-center justify-center gap-6 text-center max-w-lg mx-auto px-4 py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Hero Icon */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(0, 243, 255, 0.3)",
                    "0 0 60px rgba(0, 243, 255, 0.5)",
                    "0 0 20px rgba(0, 243, 255, 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-28 h-28 rounded-full bg-gradient-to-br from-[#00F3FF]/20 to-[#FF00FF]/20 flex items-center justify-center border border-[#00F3FF]/50"
              >
                <Zap className="w-14 h-14 text-[#00F3FF]" />
              </motion.div>

              {/* Title & Description */}
              <div>
                <h1 className="text-3xl md:text-4xl font-game text-white mb-3">
                  <span className="text-[#00F3FF]">SOLANA</span> SAGA
                </h1>
                <p className="text-xl text-[#ff00aa] font-game mb-3">
                  The Tinder of Prediction Markets
                </p>
                <p className="text-gray-400 text-sm mb-2">
                  Swipe right for YES, left for NO, up to skip
                </p>
                <p className="text-gray-500 text-xs">
                  Fast, fun, and built on Solana
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-2xl mb-1">👆</div>
                  <div className="text-[10px] text-gray-400 font-game">SWIPE</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-2xl mb-1">🎮</div>
                  <div className="text-[10px] text-gray-400 font-game">GAMEPAD</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-2xl mb-1">💰</div>
                  <div className="text-[10px] text-gray-400 font-game">WIN</div>
                </div>
              </div>

              {/* CTA */}
              <WalletButton />

              {/* Partner Badges */}
              <div className="w-full">
                <p className="text-[10px] text-gray-600 mb-3 font-game">POWERED BY</p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {/* Solana Badge */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 border border-[#9945FF]/30">
                    <svg className="w-4 h-4" viewBox="0 0 397.7 311.7" fill="none">
                      <linearGradient id="solana-grad" x1="360.8791" y1="351.4553" x2="141.213" y2="-69.2936" gradientUnits="userSpaceOnUse">
                        <stop offset="0" style={{stopColor:"#00FFA3"}} />
                        <stop offset="1" style={{stopColor:"#DC1FFF"}} />
                      </linearGradient>
                      <path fill="url(#solana-grad)" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"/>
                      <path fill="url(#solana-grad)" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"/>
                      <path fill="url(#solana-grad)" d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"/>
                    </svg>
                    <span className="text-xs text-[#14F195] font-game">Solana</span>
                  </div>

                  {/* Play Solana Badge */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30">
                    <svg className="w-4 h-4 text-[#00f0ff]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                    <span className="text-xs text-[#00f0ff] font-game">Play Solana</span>
                  </div>

                  {/* Moddio Badge */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#ff00aa]/10 border border-[#ff00aa]/30">
                    <svg className="w-4 h-4 text-[#ff00aa]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span className="text-xs text-[#ff00aa] font-game">Moddio</span>
                  </div>

                  {/* Indie.fun Badge */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#ffd700]/10 border border-[#ffd700]/30">
                    <span className="text-sm">🚀</span>
                    <span className="text-xs text-[#ffd700] font-game">Indie.fun</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-gray-600">
                <p>Requires: Phantom Wallet + Devnet USDC + SOL for gas</p>
              </div>
            </motion.div>
          ) : activeMarkets.length === 0 ? (
            <motion.div
              key="empty"
              className="flex-1 flex flex-col items-center justify-center gap-6 text-center max-w-md mx-auto px-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <AlertTriangle className="w-20 h-20 text-[#FFD700]" />
              <h2 className="text-3xl font-game text-white">NO ACTIVE MARKETS</h2>
              <p className="text-gray-400">
                {marketsError
                  ? "Failed to load markets. Check your connection."
                  : "No markets available. Create one in the admin panel!"}
              </p>

              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                  onClick={() => refetch()}
                  className="px-6 py-3 rounded-xl bg-[#00F3FF]/20 border border-[#00F3FF]/50 text-[#00F3FF] font-game hover:bg-[#00F3FF]/30 transition-colors"
                >
                  REFRESH MARKETS
                </button>
              </div>

              {/* Balance info */}
              <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/10 text-left w-full max-w-xs">
                <p className="text-xs text-gray-500 mb-2 font-game">YOUR WALLET</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">USDC:</span>
                    <span className="text-[#00FF88] font-numbers font-bold">${usdcBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">SOL:</span>
                    <span className="text-[#00F3FF] font-numbers font-bold">{solBalance.toFixed(4)}</span>
                  </div>
                </div>
                {usdcBalance === 0 && (
                  <p className="text-xs text-yellow-500 mt-2">
                    Need Devnet USDC to place bets
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="arena"
              className="flex-1 flex flex-col min-h-0 w-full max-w-lg mx-auto px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Balance Warning */}
              {usdcBalance < 1 && (
                <motion.div
                  className="mb-3 p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/50 flex items-center gap-3 flex-shrink-0"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-400 font-bold">Low USDC Balance</p>
                    <p className="text-xs text-yellow-500/80">You need Devnet USDC to place bets</p>
                  </div>
                </motion.div>
              )}

              {/* Bet Amount Selector - Compact - Always visible */}
              <div className="flex flex-col items-center gap-2 mb-4 flex-shrink-0">
                <span className="text-xs text-gray-400 font-game">BET AMOUNT (USDC)</span>

                {/* Quick bet buttons */}
                <div className="flex items-center gap-2">
                  {[1, 5, 10, 25].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setQuickBet(amount)}
                      className={`px-3 py-1 rounded-lg text-sm font-numbers font-bold transition-all ${
                        betAmount === amount
                          ? "bg-[#00F3FF] text-black"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10">
                  <motion.button
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 hover:text-white transition-colors disabled:opacity-30"
                    whileTap={{ scale: 0.9 }}
                    onClick={decreaseBet}
                    disabled={betAmount <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>

                  <div className="min-w-[80px] text-center">
                    <span className="text-2xl font-numbers font-bold text-white">
                      ${betAmount}
                    </span>
                  </div>

                  <motion.button
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 hover:text-white transition-colors disabled:opacity-30"
                    whileTap={{ scale: 0.9 }}
                    onClick={increaseBet}
                    disabled={usdcBalance > 0 && betAmount >= Math.floor(usdcBalance)}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Balance display */}
                <div className="text-xs text-gray-500">
                  Balance: <span className="text-[#00FF88] font-numbers">${usdcBalance.toFixed(2)}</span> USDC
                </div>
              </div>

              {/* Swipeable Card Stack - Takes remaining space */}
              <div className="flex-1 min-h-0">
                <SwipeableMarketStack
                  ref={swipeStackRef}
                  markets={activeMarkets}
                  onBet={handleBet}
                  onSkip={handleSkip}
                  betAmount={betAmount}
                  soundEnabled={soundEnabled}
                  streak={streak}
                />
              </div>

              {/* Betting indicator */}
              {isBetting && (
                <motion.div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      className="w-16 h-16 border-4 border-[#00F3FF] border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-[#00F3FF] font-game animate-pulse">PLACING BET...</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bet Success Modal - sits on top of everything */}
      {lastBet && (
        <BetSuccessModal
          isOpen={!!lastBet}
          onClose={() => setLastBet(null)}
          betData={lastBet}
        />
      )}

      {/* Arcade Modal - Moddio Integration */}
      <ArcadeModal
        isOpen={showArcade}
        onClose={() => setShowArcade(false)}
      />

      {/* Screen shake CSS */}
      <style jsx global>{`
        @keyframes screen-shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-10px) rotate(-1deg); }
          20% { transform: translateX(10px) rotate(1deg); }
          30% { transform: translateX(-10px) rotate(-1deg); }
          40% { transform: translateX(10px) rotate(1deg); }
          50% { transform: translateX(-5px) rotate(-0.5deg); }
          60% { transform: translateX(5px) rotate(0.5deg); }
          70% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
          90% { transform: translateX(-1px); }
        }

        .shake-screen {
          animation: screen-shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
