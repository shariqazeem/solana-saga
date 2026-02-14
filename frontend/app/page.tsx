"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Minus, Plus, AlertTriangle, Wallet, X } from "lucide-react";
import { RetroGrid } from "@/components/RetroGrid";
import { SwipeableMarketStack } from "@/components/SwipeableMarketStack";
import { GameOverlay } from "@/components/GameOverlay";
import { BetSuccessModal } from "@/components/BetSuccessModal";
import { ArcadeModal } from "@/components/ArcadeModal";
import {
  useJupiterPrediction,
  type Market,
  type EventCategory,
} from "@/hooks/useJupiterPrediction";
import { useSolBalance, useUsdcBalance } from "@/hooks/useUsdcBalance";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useHaptics } from "@/hooks/useHaptics";
import { WalletButton } from "@/components/WalletButton";
import { OnboardingOverlay } from "@/components/OnboardingOverlay";
import { AchievementToast } from "@/components/AchievementToast";
import { checkAchievements, getGameData, claimDailyBonus, getXpForNextLevel } from "@/lib/gameCredits";
import confetti from "canvas-confetti";
import { microUsdToDollars } from "@/lib/jupiter/jupiterPredictionApi";
import { useMissions } from "@/hooks/useMissions";
import { MissionsPanel } from "@/components/MissionsPanel";

const CATEGORIES: { label: string; value: EventCategory }[] = [
  { label: "ALL", value: "all" },
  { label: "CRYPTO", value: "crypto" },
  { label: "SPORTS", value: "sports" },
  { label: "POLITICS", value: "politics" },
  { label: "ESPORTS", value: "esports" },
  { label: "CULTURE", value: "culture" },
  { label: "ECONOMICS", value: "economics" },
  { label: "TECH", value: "tech" },
];

interface Notification {
  id: string;
  type: "win" | "loss" | "streak" | "info" | "error";
  message: string;
  amount?: number;
}

export default function ArenaPage() {
  const { connected, publicKey } = useWallet();
  const {
    markets,
    loading,
    placeBet,
    positions,
    profile,
    userStats,
    category,
    changeCategory,
    refetch,
    error: marketsError,
  } = useJupiterPrediction();

  const { balance: solBalance } = useSolBalance();
  const { balance: usdcBalance } = useUsdcBalance();

  // Game state
  const [betAmount, setBetAmount] = useState(1);
  const [streak, setStreak] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isBetting, setIsBetting] = useState(false);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  const [comboText, setComboText] = useState<{
    text: string;
    x: number;
    y: number;
    id: number;
  } | null>(null);
  const [showCategories, setShowCategories] = useState(false);

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
  const swipeStackRef = useRef<{
    triggerBet: (prediction: boolean) => void;
    triggerSkip: () => void;
  } | null>(null);

  const { playWin, playStreak, playError, playBet } =
    useSoundEffects(soundEnabled);
  const { vibrateBetConfirmed, vibrateStreakMilestone, vibrateError } =
    useHaptics();

  // Achievement toast state
  const [achievementToast, setAchievementToast] = useState<string | null>(null);

  // Daily bonus state
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [dailyBonusAmount, setDailyBonusAmount] = useState(0);

  // Missions
  const walletAddress = publicKey?.toBase58() || null;
  const { missions, completedCount, allComplete, updateProgress, setProgress } = useMissions(walletAddress);
  const [showMissions, setShowMissions] = useState(false);
  const missionsRemaining = missions.length - completedCount;

  // Derive XP and Level from Jupiter profile + local game data
  const { playerLevel, playerXp, xpForNextLevel, xpProgress } = useMemo(() => {
    let xp = 0;
    if (profile) {
      const predictions = parseInt(profile.predictionsCount) || 0;
      const correct = parseInt(profile.correctPredictions) || 0;
      const volume = microUsdToDollars(profile.totalVolumeUsd);
      xp = predictions * 50 + correct * 100 + Math.floor(volume);
    }
    // Also merge local XP if wallet connected
    if (publicKey) {
      const gameData = getGameData(publicKey.toBase58());
      xp += gameData.xp;
    }
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const nextLevelXp = getXpForNextLevel(level);
    const prevLevelXp = level > 1 ? getXpForNextLevel(level - 1) : 0;
    const progress = nextLevelXp > prevLevelXp
      ? Math.min(100, ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100)
      : 100;
    return { playerLevel: level, playerXp: xp, xpForNextLevel: nextLevelXp, xpProgress: progress };
  }, [profile, publicKey]);

  // Daily login bonus on wallet connect
  useEffect(() => {
    if (connected && publicKey) {
      const result = claimDailyBonus(publicKey.toBase58());
      if (result.success && result.amount) {
        setDailyBonusAmount(result.amount);
        setShowDailyBonus(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.3 },
          colors: ["#FFD700", "#00F3FF", "#00FF88"],
        });
        setTimeout(() => setShowDailyBonus(false), 3000);
      }
    }
  }, [connected, publicKey]);

  // Filter to active tradable markets
  const activeMarkets = useMemo(
    () => markets.filter((m) => m.status === "Active" && m.endsIn !== "Ended"),
    [markets]
  );

  // Count markets per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: activeMarkets.length };
    activeMarkets.forEach((m) => {
      const cat = m.category.toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [activeMarkets]);

  // Trust score based on win rate
  const trustScore = useMemo(() => {
    if (userStats.totalBets === 0) return 50;
    const winRate = userStats.totalWins / userStats.totalBets;
    return Math.round(Math.max(10, Math.min(100, 50 + (winRate - 0.5) * 100)));
  }, [userStats]);

  // Add notification
  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = Date.now().toString();
      setNotifications((prev) => [...prev, { ...notification, id }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    },
    []
  );

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Spawn combo text
  const spawnComboText = useCallback(
    (text: string, prediction: boolean) => {
      const x = prediction ? 70 : 30;
      const y = 40;
      setComboText({ text, x, y, id: Date.now() });
      setTimeout(() => setComboText(null), 1000);
    },
    []
  );

  // Auto-dismiss connect prompt when wallet connects
  useEffect(() => {
    if (connected) setShowConnectPrompt(false);
  }, [connected]);

  // Handle real bet placement via Jupiter API
  const handleBet = useCallback(
    async (marketId: string, prediction: boolean, amount: number) => {
      if (!connected) {
        setShowConnectPrompt(true);
        return;
      }

      if (solBalance < 0.005) {
        addNotification({
          type: "error",
          message: "Need SOL for transaction fees!",
        });
        playError();
        return;
      }

      const market = activeMarkets.find((m) => m.publicKey === marketId);
      setIsBetting(true);

      try {
        await placeBet(marketId, prediction, amount);

        playBet();
        vibrateBetConfirmed();
        spawnComboText(prediction ? "YES!" : "NO!", prediction);

        // Check achievements
        if (publicKey) {
          const gameData = getGameData(publicKey.toBase58());
          const newAchievements = checkAchievements(gameData);
          if (newAchievements.length > 0) {
            setAchievementToast(newAchievements[0]);
          }
        }

        // Update missions
        updateProgress("first_blood");
        if (market) {
          updateProgress("diversify");
        }
        if (amount >= 10) {
          updateProgress("whale_watch");
        }

        if (market) {
          const multiplier = prediction
            ? market.yesMultiplier
            : market.noMultiplier;
          const multiplierValue = parseFloat(multiplier.replace("x", ""));
          const potentialPayout = amount * multiplierValue;

          setLastBet({
            question: market.question,
            side: prediction,
            amount,
            multiplier,
            potentialPayout,
          });
        }

        setStreak((prev) => {
          const newStreak = prev + 1;
          setProgress("streak_starter", newStreak);
          return newStreak;
        });

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { x: prediction ? 0.7 : 0.3, y: 0.5 },
          colors: prediction
            ? ["#00FF88", "#00F3FF"]
            : ["#FF0044", "#FF00FF"],
        });

        if ((streak + 1) % 5 === 0) {
          playStreak(streak + 1);
          vibrateStreakMilestone();
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
      } catch (error: any) {
        console.error("Bet error:", error);
        playError();
        vibrateError();

        let errorMessage = "Order failed. Please try again.";
        if (error.message?.includes("insufficient")) {
          errorMessage = "Insufficient balance!";
        } else if (error.message?.includes("cancelled")) {
          errorMessage = "Transaction cancelled";
        } else if (error.message?.includes("too small")) {
          errorMessage = "Amount too small";
        } else if (error.message) {
          errorMessage = error.message.slice(0, 100);
        }

        addNotification({ type: "error", message: errorMessage });
      } finally {
        setIsBetting(false);
      }
    },
    [
      connected,
      publicKey,
      solBalance,
      placeBet,
      streak,
      playBet,
      playStreak,
      playError,
      vibrateBetConfirmed,
      vibrateStreakMilestone,
      vibrateError,
      addNotification,
      spawnComboText,
      activeMarkets,
      updateProgress,
      setProgress,
    ]
  );

  const handleSkip = useCallback(() => {
    spawnComboText("SKIP", true);
    updateProgress("market_explorer");
  }, [spawnComboText, updateProgress]);

  // Loading timeout - never show spinner for more than 8 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isFirstLoad) setIsFirstLoad(false);
    }, 8000);
    return () => clearTimeout(timeout);
  }, [isFirstLoad]);

  // Initial load animation
  useEffect(() => {
    if (!loading && isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [loading, isFirstLoad]);

  // Bet amount controls
  const increaseBet = useCallback(() => {
    setBetAmount((prev) => Math.min(prev + 1, 100));
  }, []);

  const decreaseBet = useCallback(() => {
    setBetAmount((prev) => Math.max(prev - 1, 1));
  }, []);

  const setQuickBet = useCallback((amount: number) => {
    setBetAmount(amount);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (lastBet || isBetting || activeMarkets.length === 0) return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          swipeStackRef.current?.triggerBet(true);
          break;
        case "ArrowLeft":
          e.preventDefault();
          swipeStackRef.current?.triggerBet(false);
          break;
        case "ArrowUp":
          e.preventDefault();
          swipeStackRef.current?.triggerSkip();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lastBet, isBetting, activeMarkets.length]);

  return (
    <div className="fixed inset-0 flex flex-col h-[100dvh] overflow-hidden">
      <RetroGrid streak={streak} />

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
        showAdmin={false}
        onOpenArcade={() => setShowArcade(true)}
        playerLevel={playerLevel}
        xpProgress={xpProgress}
        missionsCount={missionsRemaining > 0 ? String(missionsRemaining) : undefined}
        onOpenMissions={() => setShowMissions(true)}
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
            <span
              className={`font-game text-4xl font-bold drop-shadow-lg ${
                comboText.text === "YES!"
                  ? "text-[#00FF88]"
                  : comboText.text === "NO!"
                  ? "text-[#FF0044]"
                  : "text-white"
              }`}
            >
              {comboText.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Arena Content */}
      <main className="relative z-10 flex-1 flex flex-col min-h-0 pt-20 pb-16">
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
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#00F3FF]" />
                </motion.div>
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-[#00F3FF]" />
              </div>
              <p className="text-gray-400 font-game animate-pulse">
                LOADING JUPITER MARKETS...
              </p>
            </motion.div>
          ) : activeMarkets.length === 0 ? (
            <motion.div
              key="empty"
              className="flex-1 flex flex-col items-center justify-center gap-6 text-center max-w-md mx-auto px-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <AlertTriangle className="w-20 h-20 text-[#FFD700]" />
              <h2 className="text-3xl font-game text-white">
                NO ACTIVE MARKETS
              </h2>
              <p className="text-gray-400">
                {marketsError
                  ? `API Error: ${marketsError}`
                  : "No tradable markets available right now."}
              </p>
              <button
                onClick={() => refetch()}
                className="px-6 py-3 rounded-xl bg-[#00F3FF]/20 border border-[#00F3FF]/50 text-[#00F3FF] font-game hover:bg-[#00F3FF]/30 transition-colors"
              >
                REFRESH MARKETS
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="arena"
              className="flex-1 flex flex-col min-h-0 w-full max-w-lg mx-auto px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Connect Wallet Banner */}
              {!connected && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00F3FF]/10 to-[#00FF88]/10 border border-[#00F3FF]/30 flex-shrink-0"
                >
                  <Wallet className="w-4 h-4 text-[#00F3FF] flex-shrink-0" />
                  <span className="text-xs text-gray-300 flex-1">
                    Connect wallet to place real bets
                  </span>
                  <div className="flex-shrink-0 scale-90">
                    <WalletButton />
                  </div>
                </motion.div>
              )}

              {/* Category Filter - Horizontal Scroll */}
              <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar flex-shrink-0">
                {CATEGORIES.map((cat) => {
                  const count = categoryCounts[cat.value] || 0;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => changeCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-game whitespace-nowrap transition-all ${
                        category === cat.value
                          ? "bg-[#00F3FF] text-black"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {cat.label}{count > 0 ? ` (${count})` : ""}
                    </button>
                  );
                })}
              </div>

              {/* Bet Amount Selector */}
              <div className="flex flex-col items-center gap-2 mb-3 flex-shrink-0">
                <span className="text-xs text-gray-400 font-game">
                  BET AMOUNT (USD)
                </span>

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
                    disabled={betAmount >= 100}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>

                {connected && (
                  <div className="text-xs text-gray-500">
                    SOL:{" "}
                    <span className="text-[#00F3FF] font-numbers">
                      {solBalance.toFixed(4)}
                    </span>{" "}
                    | Positions:{" "}
                    <span className="text-[#00FF88] font-numbers">
                      {positions.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Swipeable Card Stack */}
              <div className="flex-1 min-h-0">
                <SwipeableMarketStack
                  ref={swipeStackRef}
                  markets={activeMarkets}
                  onBet={handleBet}
                  onSkip={handleSkip}
                  betAmount={betAmount}
                  soundEnabled={soundEnabled}
                  streak={streak}
                  onIncreaseBet={increaseBet}
                  onDecreaseBet={decreaseBet}
                  onConnectWallet={() => {
                    if (!connected) setShowConnectPrompt(true);
                  }}
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
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <p className="text-[#00F3FF] font-game animate-pulse">
                      PLACING ORDER...
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Connect Wallet Modal */}
      <AnimatePresence>
        {showConnectPrompt && !connected && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConnectPrompt(false)}
          >
            <motion.div
              className="w-full max-w-lg bg-[#0a0a0f] border-t border-[#00F3FF]/30 rounded-t-3xl p-6 pb-10"
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowConnectPrompt(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00F3FF]/20 to-[#00FF88]/20 flex items-center justify-center border border-[#00F3FF]/40">
                  <Wallet className="w-8 h-8 text-[#00F3FF]" />
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-game text-white mb-2">
                    CONNECT TO BET
                  </h3>
                  <p className="text-sm text-gray-400">
                    Connect your Solana wallet to place real bets on Jupiter
                    Prediction Markets
                  </p>
                </div>

                <div className="w-full flex justify-center">
                  <WalletButton />
                </div>

                <div className="flex items-center gap-4 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-[#c7f83e]">Jupiter</span> Powered
                  </span>
                  <span className="w-px h-3 bg-white/10" />
                  <span className="flex items-center gap-1">
                    <span className="text-[#14F195]">Solana</span> Network
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bet Success Modal */}
      {lastBet && (
        <BetSuccessModal
          isOpen={!!lastBet}
          onClose={() => setLastBet(null)}
          betData={lastBet}
        />
      )}

      {/* Arcade Modal */}
      <ArcadeModal
        isOpen={showArcade}
        onClose={() => setShowArcade(false)}
      />

      {/* Onboarding Overlay */}
      <OnboardingOverlay />

      {/* Achievement Toast */}
      <AchievementToast
        achievementId={achievementToast}
        onDismiss={() => setAchievementToast(null)}
      />

      {/* Daily Bonus Popup */}
      <AnimatePresence>
        {showDailyBonus && (
          <motion.div
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[80] pointer-events-none"
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
          >
            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FFD700]/20 to-[#FF8800]/20 border border-[#FFD700]/50 backdrop-blur-md">
              <div className="text-center">
                <div className="text-[#FFD700] font-game text-lg">+{dailyBonusAmount} XP</div>
                <div className="text-xs text-[#FFD700]/70 font-game">DAILY BONUS</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Missions Panel */}
      <MissionsPanel
        isOpen={showMissions}
        onClose={() => setShowMissions(false)}
        missions={missions}
        completedCount={completedCount}
        allComplete={allComplete}
      />

      {/* Screen shake CSS */}
      <style jsx global>{`
        @keyframes screen-shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10% {
            transform: translateX(-10px) rotate(-1deg);
          }
          20% {
            transform: translateX(10px) rotate(1deg);
          }
          30% {
            transform: translateX(-10px) rotate(-1deg);
          }
          40% {
            transform: translateX(10px) rotate(1deg);
          }
          50% {
            transform: translateX(-5px) rotate(-0.5deg);
          }
          60% {
            transform: translateX(5px) rotate(0.5deg);
          }
          70% {
            transform: translateX(-2px);
          }
          80% {
            transform: translateX(2px);
          }
          90% {
            transform: translateX(-1px);
          }
        }
        .shake-screen {
          animation: screen-shake 0.3s ease-in-out;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
