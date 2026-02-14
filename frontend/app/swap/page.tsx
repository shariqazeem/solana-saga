"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  ArrowDownUp,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Search,
  X,
} from "lucide-react";
import { RetroGrid } from "@/components/RetroGrid";
import { WalletButton } from "@/components/WalletButton";
import { useJupiterSwap } from "@/hooks/useJupiterSwap";
import { useSolBalance, useUsdcBalance } from "@/hooks/useUsdcBalance";
import {
  SOL_MINT,
  USDC_MINT,
  solToLamports,
  usdcToRaw,
  type QuoteResponse,
} from "@/lib/jupiter/jupiterSwapApi";
import { searchTokens, type TokenInfo } from "@/lib/jupiter/jupiterTokenApi";
import confetti from "canvas-confetti";

// Popular tokens for quick selection
const POPULAR_TOKENS = [
  { symbol: "SOL", mint: SOL_MINT, icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png", decimals: 9 },
  { symbol: "USDC", mint: USDC_MINT, icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png", decimals: 6 },
  { symbol: "JUP", mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", icon: null, decimals: 6 },
  { symbol: "BONK", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", icon: null, decimals: 5 },
];

// Quick swap SOL amounts for getting USDC
const QUICK_AMOUNTS = [
  { label: "$5", sol: 0.03 },
  { label: "$10", sol: 0.06 },
  { label: "$25", sol: 0.15 },
  { label: "$50", sol: 0.3 },
];

type SwapStatus = "idle" | "quoting" | "signing" | "confirming" | "success" | "error";

export default function SwapPage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { balance: solBalance, refetch: refetchSol } = useSolBalance();
  const { balance: usdcBalance, refetch: refetchUsdc } = useUsdcBalance();
  const {
    quote,
    quoteLoading,
    swapping,
    error: swapError,
    quoteDisplay,
    fetchQuote,
    executeSwap,
    clearError,
  } = useJupiterSwap();

  // Input state
  const [inputMint, setInputMint] = useState(SOL_MINT);
  const [outputMint, setOutputMint] = useState(USDC_MINT);
  const [inputAmount, setInputAmount] = useState("");
  const [swapStatus, setSwapStatus] = useState<SwapStatus>("idle");
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Token selector modal
  const [showTokenSelector, setShowTokenSelector] = useState<"input" | "output" | null>(null);
  const [tokenSearchQuery, setTokenSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TokenInfo[]>([]);
  const [searching, setSearching] = useState(false);

  // Gamepad
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastActionRef = useRef(0);
  const [focusedItem, setFocusedItem] = useState(0);

  // Get token info for display
  const getTokenSymbol = (mint: string) => POPULAR_TOKENS.find((t) => t.mint === mint)?.symbol || mint.slice(0, 4) + "...";
  const getTokenIcon = (mint: string) => POPULAR_TOKENS.find((t) => t.mint === mint)?.icon || null;
  const getTokenDecimals = (mint: string) => POPULAR_TOKENS.find((t) => t.mint === mint)?.decimals || 9;

  // Auto-fetch quote when input changes
  useEffect(() => {
    const amount = parseFloat(inputAmount);
    if (!amount || amount <= 0 || !inputMint || !outputMint) return;

    const decimals = getTokenDecimals(inputMint);
    const rawAmount = Math.round(amount * Math.pow(10, decimals));

    const timeout = setTimeout(() => {
      fetchQuote(inputMint, outputMint, rawAmount);
    }, 500);

    return () => clearTimeout(timeout);
  }, [inputAmount, inputMint, outputMint, fetchQuote]);

  // Token search debounce
  useEffect(() => {
    if (!tokenSearchQuery || tokenSearchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const timeout = setTimeout(async () => {
      const results = await searchTokens(tokenSearchQuery);
      setSearchResults(results.slice(0, 10));
      setSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [tokenSearchQuery]);

  // Handle swap
  const handleSwap = useCallback(async () => {
    if (!quote || !connected) return;

    setSwapStatus("signing");
    setLastError(null);
    clearError();

    try {
      setSwapStatus("confirming");
      const sig = await executeSwap(quote);
      setTxSignature(sig);
      setSwapStatus("success");

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#00F3FF", "#00FF88", "#FFD700"],
      });

      // Refresh balances
      setTimeout(() => {
        refetchSol();
        refetchUsdc();
      }, 2000);
    } catch (err: any) {
      setLastError(err.message || "Swap failed");
      setSwapStatus("error");
    }
  }, [quote, connected, executeSwap, clearError, refetchSol, refetchUsdc]);

  // Handle quick swap
  const handleQuickSwap = useCallback(
    (solAmount: number) => {
      setInputMint(SOL_MINT);
      setOutputMint(USDC_MINT);
      setInputAmount(solAmount.toString());
    },
    []
  );

  // Flip tokens
  const flipTokens = useCallback(() => {
    setInputMint(outputMint);
    setOutputMint(inputMint);
    setInputAmount("");
  }, [inputMint, outputMint]);

  // Select token from modal
  const selectToken = useCallback(
    (mint: string) => {
      if (showTokenSelector === "input") {
        if (mint === outputMint) setOutputMint(inputMint);
        setInputMint(mint);
      } else {
        if (mint === inputMint) setInputMint(outputMint);
        setOutputMint(mint);
      }
      setShowTokenSelector(null);
      setTokenSearchQuery("");
      setInputAmount("");
    },
    [showTokenSelector, inputMint, outputMint]
  );

  // Gamepad support
  useEffect(() => {
    const poll = () => {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];
      if (gp) {
        const now = Date.now();
        if (now - lastActionRef.current >= 200) {
          // B = back
          if (gp.buttons[1]?.pressed) {
            lastActionRef.current = now;
            router.push("/");
          }
          // D-pad up/down = scroll
          if (gp.axes[1] < -0.5 || gp.buttons[12]?.pressed) {
            scrollRef.current?.scrollBy(0, -80);
            lastActionRef.current = now;
          }
          if (gp.axes[1] > 0.5 || gp.buttons[13]?.pressed) {
            scrollRef.current?.scrollBy(0, 80);
            lastActionRef.current = now;
          }
          // A = confirm / swap
          if (gp.buttons[0]?.pressed && quote && !swapping && swapStatus === "idle") {
            lastActionRef.current = now;
            handleSwap();
          }
        }
      }
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [router, quote, swapping, swapStatus, handleSwap]);

  // Reset status after showing result
  useEffect(() => {
    if (swapStatus === "success" || swapStatus === "error") {
      const timeout = setTimeout(() => {
        setSwapStatus("idle");
        if (swapStatus === "success") {
          setInputAmount("");
          setTxSignature(null);
        }
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [swapStatus]);

  const inputBalance = inputMint === SOL_MINT ? solBalance : inputMint === USDC_MINT ? usdcBalance : 0;

  return (
    <div className="min-h-screen bg-[#050505] relative">
      <RetroGrid />

      <div
        ref={scrollRef}
        className="relative z-10 max-w-lg mx-auto px-4 pt-4 pb-24 overflow-y-auto max-h-screen"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-game">BACK</span>
          </button>
          <h1 className="text-lg font-game text-white tracking-wider">
            JUPITER SWAP
          </h1>
          <div className="w-12" />
        </div>

        {/* Quick Swap Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#0a0a1a] to-[#0f0f2a] border border-[#00F3FF]/20 shadow-[0_0_30px_rgba(0,243,255,0.1)] mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-game text-[#00F3FF] tracking-wider">
              QUICK SWAP
            </h2>
            <span className="text-[10px] text-gray-500 font-game">
              SOL &rarr; USDC
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-3">
            Need USDC to bet? Swap SOL instantly.
          </p>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {QUICK_AMOUNTS.map((qa) => (
              <motion.button
                key={qa.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickSwap(qa.sol)}
                className={`py-2.5 rounded-xl text-center transition-all border ${
                  inputAmount === qa.sol.toString() && inputMint === SOL_MINT
                    ? "bg-[#00F3FF]/20 border-[#00F3FF]/50 text-[#00F3FF]"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                <div className="text-sm font-bold">{qa.label}</div>
                <div className="text-[9px] text-gray-500 mt-0.5">
                  ~{qa.sol} SOL
                </div>
              </motion.button>
            ))}
          </div>

          {connected && (
            <div className="text-[10px] text-gray-500 text-center">
              Balance: <span className="text-[#00F3FF] font-numbers">{solBalance.toFixed(4)} SOL</span>
              {" | "}
              <span className="text-[#00FF88] font-numbers">{usdcBalance.toFixed(2)} USDC</span>
            </div>
          )}
        </motion.div>

        {/* General Swap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#0a0a1a] to-[#0f0f2a] border border-[#00FF88]/20 shadow-[0_0_20px_rgba(0,255,136,0.05)] mb-4"
        >
          <h2 className="text-sm font-game text-[#00FF88] tracking-wider mb-3">
            SWAP TOKENS
          </h2>

          {/* Input Token */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-500 font-game">YOU PAY</span>
              {connected && (
                <button
                  onClick={() => {
                    if (inputBalance > 0) {
                      const maxAmount = inputMint === SOL_MINT
                        ? Math.max(0, inputBalance - 0.01) // Keep 0.01 SOL for fees
                        : inputBalance;
                      setInputAmount(maxAmount.toString());
                    }
                  }}
                  className="text-[10px] text-[#00F3FF] font-game hover:underline"
                >
                  MAX: {inputBalance.toFixed(inputMint === SOL_MINT ? 4 : 2)}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent text-white text-xl font-numbers font-bold outline-none placeholder:text-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => setShowTokenSelector("input")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
              >
                {getTokenIcon(inputMint) ? (
                  <img
                    src={getTokenIcon(inputMint)!}
                    alt=""
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                )}
                <span className="text-white font-game text-sm">
                  {getTokenSymbol(inputMint)}
                </span>
              </button>
            </div>
          </div>

          {/* Flip button */}
          <div className="flex justify-center -my-1 relative z-10">
            <motion.button
              whileTap={{ scale: 0.9, rotate: 180 }}
              onClick={flipTokens}
              className="w-9 h-9 rounded-full bg-[#0a0a1a] border border-white/20 flex items-center justify-center text-gray-400 hover:text-[#00F3FF] hover:border-[#00F3FF]/50 transition-all"
            >
              <ArrowDownUp className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Output Token */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-500 font-game">YOU RECEIVE</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-xl font-numbers font-bold">
                {quoteLoading ? (
                  <span className="text-gray-500 animate-pulse">Loading...</span>
                ) : quoteDisplay ? (
                  <span className="text-[#00FF88]">
                    {quoteDisplay.outputAmount.toFixed(
                      outputMint === USDC_MINT ? 2 : 6
                    )}
                  </span>
                ) : (
                  <span className="text-gray-600">0.00</span>
                )}
              </div>
              <button
                onClick={() => setShowTokenSelector("output")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
              >
                {getTokenIcon(outputMint) ? (
                  <img
                    src={getTokenIcon(outputMint)!}
                    alt=""
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-teal-500" />
                )}
                <span className="text-white font-game text-sm">
                  {getTokenSymbol(outputMint)}
                </span>
              </button>
            </div>
          </div>

          {/* Quote details */}
          {quoteDisplay && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 p-2.5 rounded-lg bg-white/5 space-y-1.5"
            >
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Rate</span>
                <span className="text-white font-numbers">
                  1 {getTokenSymbol(inputMint)} = {quoteDisplay.exchangeRate.toFixed(
                    outputMint === USDC_MINT ? 2 : 6
                  )}{" "}
                  {getTokenSymbol(outputMint)}
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Price Impact</span>
                <span
                  className={`font-numbers ${
                    quoteDisplay.priceImpact > 1
                      ? "text-[#FF0044]"
                      : quoteDisplay.priceImpact > 0.5
                      ? "text-[#FFD700]"
                      : "text-[#00FF88]"
                  }`}
                >
                  {quoteDisplay.priceImpact.toFixed(3)}%
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Min Received</span>
                <span className="text-white font-numbers">
                  {quoteDisplay.minimumReceived.toFixed(
                    outputMint === USDC_MINT ? 2 : 6
                  )}{" "}
                  {getTokenSymbol(outputMint)}
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Route</span>
                <span className="text-gray-400 font-numbers">
                  {quoteDisplay.routeSteps} step{quoteDisplay.routeSteps > 1 ? "s" : ""}
                </span>
              </div>
            </motion.div>
          )}

          {/* Swap button */}
          <div className="mt-4">
            {!connected ? (
              <div className="flex justify-center">
                <WalletButton />
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSwap}
                disabled={!quote || swapping || quoteLoading || swapStatus !== "idle"}
                className={`w-full py-3.5 rounded-xl font-game text-sm tracking-wider transition-all ${
                  !quote || swapping || quoteLoading
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#00F3FF] to-[#00FF88] text-black hover:shadow-[0_0_30px_rgba(0,243,255,0.3)]"
                }`}
              >
                {swapping ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {swapStatus === "signing"
                      ? "SIGN IN WALLET..."
                      : "CONFIRMING..."}
                  </span>
                ) : quoteLoading ? (
                  "GETTING QUOTE..."
                ) : !quote ? (
                  "ENTER AMOUNT"
                ) : (
                  "SWAP"
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Status Messages */}
        <AnimatePresence>
          {swapStatus === "success" && txSignature && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 mb-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-[#00FF88]" />
                <span className="text-sm font-game text-[#00FF88]">
                  SWAP SUCCESSFUL
                </span>
              </div>
              <a
                href={`https://solscan.io/tx/${txSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#00F3FF] hover:underline break-all"
              >
                View on Solscan
              </a>
            </motion.div>
          )}

          {(swapStatus === "error" || swapError || lastError) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 rounded-xl bg-[#FF0044]/10 border border-[#FF0044]/30 mb-4"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FF0044]" />
                <span className="text-xs text-[#FF0044]">
                  {lastError || swapError || "Swap failed"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jupiter branding */}
        <div className="text-center text-[10px] text-gray-600 mt-2">
          Powered by <span className="text-[#c7f83e]">Jupiter</span> Swap API
        </div>
      </div>

      {/* Token Selector Modal */}
      <AnimatePresence>
        {showTokenSelector && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowTokenSelector(null);
              setTokenSearchQuery("");
            }}
          >
            <motion.div
              className="w-full max-w-lg bg-[#0a0a0f] border-t border-[#00F3FF]/30 rounded-t-3xl p-4 pb-8 max-h-[70vh] flex flex-col"
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-game text-white">SELECT TOKEN</h3>
                <button
                  onClick={() => {
                    setShowTokenSelector(null);
                    setTokenSearchQuery("");
                  }}
                  className="p-1.5 rounded-full bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={tokenSearchQuery}
                  onChange={(e) => setTokenSearchQuery(e.target.value)}
                  placeholder="Search by name or mint..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[#00F3FF]/50 placeholder:text-gray-600"
                />
              </div>

              {/* Popular tokens */}
              <div className="flex gap-2 mb-3">
                {POPULAR_TOKENS.map((t) => (
                  <button
                    key={t.mint}
                    onClick={() => selectToken(t.mint)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    {t.icon ? (
                      <img src={t.icon} alt="" className="w-4 h-4 rounded-full" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                    )}
                    <span className="text-xs text-white font-game">{t.symbol}</span>
                  </button>
                ))}
              </div>

              {/* Search results */}
              <div className="flex-1 overflow-y-auto space-y-1">
                {searching && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                  </div>
                )}
                {searchResults.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => selectToken(token.address)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    {token.logoURI ? (
                      <img
                        src={token.logoURI}
                        alt=""
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/50 to-blue-500/50" />
                    )}
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm text-white font-semibold truncate">
                        {token.symbol}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {token.name}
                      </p>
                    </div>
                    <span className="text-[9px] text-gray-600 font-mono">
                      {token.address.slice(0, 4)}...{token.address.slice(-4)}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
