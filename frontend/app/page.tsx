"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Minus, Plus, AlertTriangle, Wallet, X, ArrowDownUp, TrendingUp, Clock, Flame, Gamepad2 } from "lucide-react";
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
import { usePSG1Mode } from "@/hooks/usePSG1Mode";

const CATEGORIES: { label: string; value: EventCategory; icon?: string }[] = [
  { label: "ALL", value: "all" },
  { label: "LIVE", value: "live", icon: "live" },
  { label: "TRENDING", value: "trending", icon: "flame" },
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
  const router = useRouter();
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
  const psg1Config = usePSG1Mode();

  // PSG1 detection banner
  const [showPSG1Banner, setShowPSG1Banner] = useState(false);
  useEffect(() => {
    if (psg1Config.isPSG1 && !sessionStorage.getItem("psg1_banner_shown")) {
      setShowPSG1Banner(true);
      sessionStorage.setItem("psg1_banner_shown", "true");
      setTimeout(() => setShowPSG1Banner(false), 4000);
    }
  }, [psg1Config.isPSG1]);

  // Game state
  const [betAmount, setBetAmount] = useState(1);
  const [streak, setStreak] = useState(0);
  const [arenaSort, setArenaSort] = useState<"default" | "volume" | "ending">("default");
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
  const [streakFlash, setStreakFlash] = useState(false);
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

  // Session stats tracking for toast
  const [sessionBets, setSessionBets] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionToast, setSessionToast] = useState<{ bets: number; streak: number; xp: number } | null>(null);

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
  const { missions, completedCount, allComplete, updateProgress, setProgress, trackDiversify } = useMissions(walletAddress);
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

  // Filter to active tradable markets + sort
  const activeMarkets = useMemo(() => {
    const filtered = markets.filter((m) => m.status === "Active" && m.endsIn !== "Ended");
    if (arenaSort === "volume") {
      filtered.sort((a, b) => b.totalVolume - a.totalVolume);
    } else if (arenaSort === "ending") {
      filtered.sort((a, b) => a.endTime - b.endTime);
    }
    return filtered;
  }, [markets, arenaSort]);

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
        if (market?.category) {
          trackDiversify(market.category);
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

        // Session stats tracking - show toast every 5 bets
        setSessionBets((prev) => {
          const newCount = prev + 1;
          const xpGain = 50 + (streak >= 5 ? 25 : 0);
          setSessionXp((prevXp) => prevXp + xpGain);
          if (newCount % 5 === 0) {
            setSessionToast({ bets: newCount, streak: streak + 1, xp: sessionXp + xpGain });
            setTimeout(() => setSessionToast(null), 3500);
          }
          return newCount;
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
          // Screen flash for milestone spectacle
          setStreakFlash(true);
          setTimeout(() => setStreakFlash(false), 300);
          // Extra confetti burst for milestones
          confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.5 },
            colors: ["#00FF88", "#00F3FF", "#FF00FF", "#FFD700", "#FFFFFF"],
          });
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { x: 0.2, y: 0.4 },
            colors: ["#FFD700", "#FF8800"],
          });
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { x: 0.8, y: 0.4 },
            colors: ["#FFD700", "#FF8800"],
          });
        }
      } catch (error: any) {
        console.error("Bet error:", error);
        playError();
        vibrateError();

        let errorMessage = "Order failed. Please try again.";
        if (error.message?.includes("insufficient") || error.message?.includes("Insufficient")) {
          errorMessage = "Insufficient balance!";
        } else if (error.message?.includes("cancelled")) {
          errorMessage = "Transaction cancelled";
        } else if (error.message?.includes("too small")) {
          errorMessage = "Amount too small";
        } else if (error.message?.includes("closed") || error.message?.includes("expired")) {
          errorMessage = "Market expired! Try another one.";
        } else if (error.message) {
          errorMessage = error.message.slice(0, 200);
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
      trackDiversify,
      sessionXp,
    ]
  );

  const handleSkip = useCallback(() => {
    spawnComboText("SKIP", true);
  }, [spawnComboText]);

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
        {/* Category Filter - Always visible (except during initial load) */}
        {!(loading && isFirstLoad) && (
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 overflow-x-auto no-scrollbar flex-shrink-0 px-3 sm:px-4 max-w-lg mx-auto w-full">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.value] || 0;
              const isActive = category === cat.value;
              const isLive = cat.icon === "live";
              const isFlame = cat.icon === "flame";
              return (
                <button
                  key={cat.value}
                  onClick={() => changeCategory(cat.value)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-game whitespace-nowrap transition-all ${
                    isActive
                      ? isLive ? "bg-red-500 text-white" : "bg-[#00F3FF] text-black"
                      : isLive ? "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {isLive && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : "bg-red-400"} animate-pulse`} />}
                  {isFlame && <Flame className="w-3 h-3" />}
                  {cat.label}{!isLive && !isFlame && count > 0 ? ` (${count})` : ""}
                </button>
              );
            })}
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading && isFirstLoad ? (
            <motion.div
              key="loading"
              className="flex-1 flex flex-col items-center justify-center gap-4 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {/* Logo with glow */}
              <motion.div
                className="relative"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 rounded-full bg-[#00F3FF]/20 blur-3xl" />
                <img
                  src="/logo-200.png"
                  alt="Solana Saga"
                  className="w-36 h-36 rounded-2xl relative z-10"
                />
                {/* Spinning ring around logo */}
                <motion.div
                  className="absolute -inset-3 rounded-2xl border-2 border-[#00F3FF]/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  style={{
                    borderImage: "linear-gradient(45deg, #00F3FF, #00FF88, #FF00AA, #00F3FF) 1",
                  }}
                />
              </motion.div>

              {/* Loading text */}
              <motion.p
                className="text-[#00F3FF] font-game text-sm tracking-widest"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                LOADING MARKETS
              </motion.p>

              {/* Animated dots */}
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#00F3FF]"
                    animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>

              {/* Powered by */}
              <p className="text-gray-600 text-[10px] mt-2">
                Powered by <span className="text-[#c7f83e]">Jupiter</span> on <span className="text-[#14F195]">Solana</span>
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

              {/* Low USDC Banner - Quick Swap */}
              {connected && usdcBalance < 1 && solBalance > 0.05 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700]/10 to-[#FF8800]/10 border border-[#FFD700]/30 flex-shrink-0"
                >
                  <AlertTriangle className="w-4 h-4 text-[#FFD700] flex-shrink-0" />
                  <span className="text-xs text-gray-300 flex-1">
                    Low USDC! Swap SOL to bet.
                  </span>
                  <button
                    onClick={() => router.push("/swap")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00F3FF]/20 border border-[#00F3FF]/40 text-[#00F3FF] text-[10px] font-game hover:bg-[#00F3FF]/30 transition-colors flex-shrink-0"
                  >
                    <ArrowDownUp className="w-3 h-3" />
                    SWAP
                  </button>
                </motion.div>
              )}

              {/* Sort Toggle + Mission Progress (single row) */}
              <div className="flex items-center gap-1.5 mb-2 flex-shrink-0">
                <span className="text-[9px] text-gray-600 font-game mr-1">SORT</span>
                {([
                  { id: "default" as const, label: "MIX", Icon: Flame },
                  { id: "volume" as const, label: "HOT", Icon: TrendingUp },
                  { id: "ending" as const, label: "SOON", Icon: Clock },
                ]).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setArenaSort(id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-game transition-all ${
                      arenaSort === id
                        ? "bg-[#00F3FF]/20 text-[#00F3FF] border border-[#00F3FF]/30"
                        : "bg-white/5 text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}

                {/* Compact mission indicator */}
                {connected && missions.length > 0 && (
                  <button
                    onClick={() => setShowMissions(true)}
                    className="flex items-center gap-1.5 ml-auto px-2 py-1 rounded-md bg-[#FFD700]/10 border border-[#FFD700]/20 hover:bg-[#FFD700]/15 transition-colors"
                  >
                    <div className="w-[32px] h-1 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#FFD700] transition-all"
                        style={{ width: `${(completedCount / missions.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-[8px] text-[#FFD700] font-game whitespace-nowrap">{completedCount}/{missions.length}</span>
                  </button>
                )}
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
              className="w-full max-w-[calc(100%-1rem)] sm:max-w-lg bg-[#0a0a0f] border-t border-[#00F3FF]/30 rounded-t-3xl p-4 sm:p-6 pb-8 sm:pb-10"
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

      {/* PSG1 Detection Banner */}
      <AnimatePresence>
        {showPSG1Banner && (
          <motion.div
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[80] pointer-events-none"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
          >
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#00F3FF]/20 to-[#9966FF]/20 border border-[#00F3FF]/50 backdrop-blur-md">
              <Gamepad2 className="w-5 h-5 text-[#00F3FF]" />
              <div>
                <div className="text-[#00F3FF] font-game text-xs">PSG1 DETECTED</div>
                <div className="text-[10px] text-gray-400">Gamepad controls active</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Milestone Screen Flash */}
      <AnimatePresence>
        {streakFlash && (
          <motion.div
            className="fixed inset-0 z-[90] pointer-events-none"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "radial-gradient(circle at center, rgba(255,215,0,0.4) 0%, rgba(255,140,0,0.2) 40%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

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

      {/* Session Stats Toast */}
      <AnimatePresence>
        {sessionToast && (
          <motion.div
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[80] pointer-events-none"
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
          >
            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00F3FF]/20 to-[#FF00FF]/20 border border-[#00F3FF]/50 backdrop-blur-md">
              <div className="text-center">
                <div className="text-[#00F3FF] font-game text-sm">{sessionToast.bets} PREDICTIONS!</div>
                <div className="flex items-center justify-center gap-3 mt-1">
                  <span className="text-[10px] text-orange-400 font-game">Streak: {sessionToast.streak}x</span>
                  <span className="text-[10px] text-[#FFD700] font-game">XP: +{sessionToast.xp}</span>
                </div>
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
