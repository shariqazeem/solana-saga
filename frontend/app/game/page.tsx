"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy, Flame, Star, ChevronUp, Gift, Volume2, VolumeX } from "lucide-react";
import { RetroGrid } from "@/components/RetroGrid";
import { WalletButton } from "@/components/WalletButton";
import { GameCreditsDisplay } from "@/components/GameCreditsDisplay";
import { GameBetModal } from "@/components/GameBetModal";
import { PSG1ControllerHints } from "@/components/PSG1ControllerHints";
import { useGameCredits } from "@/hooks/useGameCredits";
import { usePSG1Mode } from "@/hooks/usePSG1Mode";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { getRandomMarkets, resolveMarket, GameMarket, CATEGORY_INFO } from "@/lib/gameMarkets";
import confetti from "canvas-confetti";

export default function GamePage() {
  const { connected } = useWallet();
  const { isPSG1, showButtonHints } = usePSG1Mode();
  const gameCredits = useGameCredits();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playWin, playStreak, playError, playBet } = useSoundEffects(soundEnabled);

  // Game state
  const [markets, setMarkets] = useState<GameMarket[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isResolving, setIsResolving] = useState(false);
  const [lastResult, setLastResult] = useState<{ won: boolean; payout: number } | null>(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<boolean>(true);
  const [comboText, setComboText] = useState<{ text: string; x: number; y: number; id: number } | null>(null);

  // Track pending bet resolution
  const pendingBetRef = useRef<{ betId: string; market: GameMarket; prediction: boolean } | null>(null);

  // Initialize markets
  useEffect(() => {
    setMarkets(getRandomMarkets(20));
  }, []);

  // Current market
  const currentMarket = markets[currentIndex];

  // Spawn combo text
  const spawnComboText = useCallback((text: string, prediction: boolean) => {
    const x = prediction ? 70 : 30;
    const y = 40;
    setComboText({ text, x, y, id: Date.now() });
    setTimeout(() => setComboText(null), 1000);
  }, []);

  // Handle swipe/bet selection
  const handlePrediction = useCallback((prediction: boolean) => {
    if (!connected || !currentMarket || isResolving) return;

    setSelectedPrediction(prediction);
    setShowBetModal(true);
  }, [connected, currentMarket, isResolving]);

  // Handle bet placed from modal
  const handleBetPlaced = useCallback(() => {
    if (!currentMarket) return;

    // Find the bet that was just placed
    const latestBet = gameCredits.activeBets[gameCredits.activeBets.length - 1];
    if (!latestBet) return;

    pendingBetRef.current = {
      betId: latestBet.id,
      market: currentMarket,
      prediction: latestBet.prediction,
    };

    playBet();
    spawnComboText(latestBet.prediction ? "YES!" : "NO!", latestBet.prediction);

    // Fire confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x: latestBet.prediction ? 0.7 : 0.3, y: 0.5 },
      colors: latestBet.prediction ? ["#00FF88", "#00F3FF"] : ["#FF0044", "#FF00FF"],
    });

    // Start resolution countdown
    setIsResolving(true);
    setShowBetModal(false);

    // Resolve after delay
    setTimeout(() => {
      if (!pendingBetRef.current) return;

      const { betId, market, prediction } = pendingBetRef.current;
      const won = resolveMarket(market) === prediction;

      // Resolve the bet
      const result = gameCredits.resolveBet(betId, won);

      if (won) {
        playWin();
        setLastResult({ won: true, payout: result.payout || 0 });

        // Big celebration
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.6 },
          colors: ["#00FF88", "#00F3FF", "#FFD700"],
        });

        // Streak celebration
        if (result.newStreak && result.newStreak % 3 === 0) {
          playStreak(result.newStreak);
          confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.5 },
            colors: ["#FF00FF", "#00F3FF", "#FFD700", "#00FF88"],
          });
        }
      } else {
        playError();
        setLastResult({ won: false, payout: 0 });
      }

      // Clear and move to next
      setTimeout(() => {
        setIsResolving(false);
        setLastResult(null);
        pendingBetRef.current = null;

        // Move to next market or refill
        if (currentIndex >= markets.length - 1) {
          setMarkets(getRandomMarkets(20));
          setCurrentIndex(0);
        } else {
          setCurrentIndex(prev => prev + 1);
        }
      }, 2000);
    }, currentMarket.resolveDelayMs);
  }, [currentMarket, gameCredits, currentIndex, markets.length, playBet, playWin, playStreak, playError, spawnComboText]);

  // Handle skip
  const handleSkip = useCallback(() => {
    if (isResolving) return;

    spawnComboText("SKIP", true);

    if (currentIndex >= markets.length - 1) {
      setMarkets(getRandomMarkets(20));
      setCurrentIndex(0);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [isResolving, currentIndex, markets.length, spawnComboText]);

  // Gamepad controls
  useEffect(() => {
    let animationFrame: number;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0];

      if (gamepad && connected && !showBetModal) {
        // A button (index 0) = YES
        if (gamepad.buttons[0]?.pressed) {
          handlePrediction(true);
        }
        // B button (index 1) = NO
        if (gamepad.buttons[1]?.pressed) {
          handlePrediction(false);
        }
        // Y button (index 3) = SKIP
        if (gamepad.buttons[3]?.pressed) {
          handleSkip();
        }
      }

      animationFrame = requestAnimationFrame(pollGamepad);
    };

    animationFrame = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(animationFrame);
  }, [connected, showBetModal, handlePrediction, handleSkip]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (!connected || showBetModal) return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          handlePrediction(true);
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrediction(false);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleSkip();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [connected, showBetModal, handlePrediction, handleSkip]);

  return (
    <div className="fixed inset-0 flex flex-col h-[100dvh] overflow-hidden bg-[#050505]">
      <RetroGrid streak={gameCredits.currentStreak} />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-[#00F3FF]" />
          <span className="font-game text-lg text-white">
            <span className="text-[#00F3FF]">SOLANA</span> SAGA
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-white/5 border border-white/10"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-[#00F3FF]" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {connected && <GameCreditsDisplay compact />}
        </div>
      </header>

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

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-24">
        <AnimatePresence mode="wait">
          {!connected ? (
            <motion.div
              key="connect"
              className="flex flex-col items-center gap-6 text-center max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(0, 243, 255, 0.3)",
                    "0 0 60px rgba(0, 243, 255, 0.5)",
                    "0 0 20px rgba(0, 243, 255, 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00F3FF]/20 to-[#FF00FF]/20 flex items-center justify-center border border-[#00F3FF]/50"
              >
                <Zap className="w-12 h-12 text-[#00F3FF]" />
              </motion.div>

              <div>
                <h1 className="text-2xl font-game text-white mb-2">
                  <span className="text-[#00F3FF]">PREDICTION</span> GAME
                </h1>
                <p className="text-gray-400 text-sm mb-4">
                  Swipe to predict. Win credits. Climb the leaderboard.
                </p>
                <p className="text-[#FFD700] text-xs font-game">
                  START WITH 1,000 FREE CREDITS!
                </p>
              </div>

              <WalletButton />

              <div className="grid grid-cols-3 gap-2 w-full max-w-xs mt-4">
                <div className="p-2 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30 text-center">
                  <ChevronUp className="w-4 h-4 mx-auto text-[#00FF88] rotate-90" />
                  <span className="text-[10px] text-[#00FF88] font-game">YES</span>
                </div>
                <div className="p-2 rounded-lg bg-white/10 border border-white/30 text-center">
                  <ChevronUp className="w-4 h-4 mx-auto text-white" />
                  <span className="text-[10px] text-white font-game">SKIP</span>
                </div>
                <div className="p-2 rounded-lg bg-[#FF0044]/10 border border-[#FF0044]/30 text-center">
                  <ChevronUp className="w-4 h-4 mx-auto text-[#FF0044] -rotate-90" />
                  <span className="text-[10px] text-[#FF0044] font-game">NO</span>
                </div>
              </div>
            </motion.div>
          ) : currentMarket ? (
            <motion.div
              key={currentMarket.id}
              className="w-full max-w-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {/* Market Card */}
              <div className={`relative rounded-3xl overflow-hidden ${
                isResolving
                  ? lastResult?.won
                    ? "bg-gradient-to-b from-[#00FF88]/20 to-[#0a0a0f] border-2 border-[#00FF88]"
                    : lastResult?.won === false
                    ? "bg-gradient-to-b from-[#FF0044]/20 to-[#0a0a0f] border-2 border-[#FF0044]"
                    : "bg-gradient-to-b from-[#FFD700]/20 to-[#0a0a0f] border-2 border-[#FFD700] animate-pulse"
                  : "bg-gradient-to-b from-white/10 to-[#0a0a0f] border border-white/20"
              }`}>
                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div
                    className="px-3 py-1 rounded-full text-xs font-game flex items-center gap-1.5"
                    style={{
                      backgroundColor: `${CATEGORY_INFO[currentMarket.category].color}20`,
                      borderColor: `${CATEGORY_INFO[currentMarket.category].color}50`,
                      borderWidth: 1,
                      color: CATEGORY_INFO[currentMarket.category].color,
                    }}
                  >
                    <span>{CATEGORY_INFO[currentMarket.category].icon}</span>
                    <span>{CATEGORY_INFO[currentMarket.category].name}</span>
                  </div>
                </div>

                {/* Difficulty Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className={`px-2 py-1 rounded-full text-[10px] font-game ${
                    currentMarket.difficulty === "easy"
                      ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30"
                      : currentMarket.difficulty === "medium"
                      ? "bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30"
                      : "bg-[#FF0044]/20 text-[#FF0044] border border-[#FF0044]/30"
                  }`}>
                    {currentMarket.difficulty.toUpperCase()}
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-6 pt-16">
                  {/* Icon */}
                  <div className="text-6xl text-center mb-4">
                    {currentMarket.icon}
                  </div>

                  {/* Question */}
                  <h2 className="text-xl font-game text-white text-center mb-6 leading-relaxed">
                    {currentMarket.question}
                  </h2>

                  {/* Odds Display */}
                  <div className="flex justify-center gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-game text-[#00FF88]">
                        {currentMarket.yesOdds.toFixed(1)}x
                      </div>
                      <div className="text-xs text-gray-500">YES ODDS</div>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div className="text-center">
                      <div className="text-2xl font-game text-[#FF0044]">
                        {currentMarket.noOdds.toFixed(1)}x
                      </div>
                      <div className="text-xs text-gray-500">NO ODDS</div>
                    </div>
                  </div>

                  {/* Resolution Status */}
                  {isResolving && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      {lastResult ? (
                        <div className={`text-2xl font-game ${lastResult.won ? "text-[#00FF88]" : "text-[#FF0044]"}`}>
                          {lastResult.won ? (
                            <>
                              <Trophy className="w-8 h-8 mx-auto mb-2" />
                              YOU WON +{lastResult.payout}!
                            </>
                          ) : (
                            <>
                              <span className="text-4xl">😢</span>
                              <div className="mt-2">BETTER LUCK NEXT TIME</div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-[#FFD700]">
                          <motion.div
                            className="w-6 h-6 border-2 border-[#FFD700] border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="font-game">RESOLVING...</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  {!isResolving && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handlePrediction(false)}
                        className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#FF0044] to-[#FF0044]/80 text-white font-game text-lg hover:scale-105 active:scale-95 transition-transform"
                      >
                        NO
                      </button>
                      <button
                        onClick={handleSkip}
                        className="px-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-game hover:bg-white/20 transition-colors"
                      >
                        <ChevronUp className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handlePrediction(true)}
                        className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#00FF88]/80 to-[#00FF88] text-black font-game text-lg hover:scale-105 active:scale-95 transition-transform"
                      >
                        YES
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-4 flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#FFD700]" />
                  <span className="text-gray-400">{gameCredits.totalWins} wins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#FF6B00]" />
                  <span className="text-gray-400">{gameCredits.currentStreak}x streak</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#AA00FF]" />
                  <span className="text-gray-400">{gameCredits.winRate}% rate</span>
                </div>
              </div>

              {/* Daily Bonus Reminder */}
              {gameCredits.canClaimDailyBonus && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => gameCredits.claimDailyBonus()}
                  className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-[#00FF88]/20 to-[#00F3FF]/20 border border-[#00FF88]/30 text-[#00FF88] font-game flex items-center justify-center gap-2 hover:from-[#00FF88]/30 hover:to-[#00F3FF]/30 transition-colors"
                >
                  <Gift className="w-5 h-5" />
                  CLAIM DAILY BONUS
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center">
              <motion.div
                className="w-12 h-12 border-4 border-[#00F3FF] border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* PSG1 Controller Hints */}
      {connected && !isResolving && (
        <div className="fixed bottom-4 left-0 right-0 z-20">
          <PSG1ControllerHints show={showButtonHints} activeButton={null} />
        </div>
      )}

      {/* Bet Modal */}
      {currentMarket && (
        <GameBetModal
          isOpen={showBetModal}
          onClose={() => setShowBetModal(false)}
          market={{
            id: currentMarket.id,
            question: currentMarket.question,
            yesOdds: currentMarket.yesOdds,
            noOdds: currentMarket.noOdds,
            category: currentMarket.category,
          }}
          prediction={selectedPrediction}
          onBetPlaced={handleBetPlaced}
        />
      )}
    </div>
  );
}
