"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  X,
  Coins,
  Loader2,
  CheckCircle,
  ExternalLink,
  Wallet,
  Zap,
  ArrowRight,
} from "lucide-react";

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function GetStartedModal({ isOpen, onClose, onComplete }: GetStartedModalProps) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [solReceived, setSolReceived] = useState(false);

  const requestSolAirdrop = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      // Request 1 SOL airdrop for fees
      const signature = await connection.requestAirdrop(
        publicKey,
        1 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature, "confirmed");
      setSolReceived(true);
      setStep(3);
    } catch (error: any) {
      console.error("Airdrop error:", error);
      // If rate limited, still proceed
      if (error.message?.includes("rate") || error.message?.includes("limit")) {
        setSolReceived(true);
        setStep(3);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (onComplete) onComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md bg-[#0a0a0f] border border-[#00F3FF]/30 rounded-2xl p-6 shadow-[0_0_60px_rgba(0,243,255,0.2)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-game text-white mb-2">GET STARTED</h2>
            <p className="text-sm text-gray-400">
              {step === 1 && "Connect your wallet to play"}
              {step === 2 && "Get free SOL for transaction fees"}
              {step === 3 && "Get test USDC to place bets"}
            </p>
          </div>

          {/* Progress */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-1 rounded-full transition-colors ${
                  s <= step ? "bg-[#00F3FF]" : "bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-4">
            {/* Step 1: Connect Wallet */}
            {step === 1 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#00F3FF]/20 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-[#00F3FF]" />
                </div>
                {connected ? (
                  <>
                    <div className="flex items-center justify-center gap-2 text-[#00FF88]">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-game text-sm">WALLET CONNECTED</span>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00F3FF] to-[#00FF88] text-black font-game font-bold hover:scale-105 transition-transform"
                    >
                      NEXT <ArrowRight className="inline w-4 h-4 ml-2" />
                    </button>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">
                    Click the wallet button in the navbar to connect
                  </p>
                )}
              </div>
            )}

            {/* Step 2: Get SOL */}
            {step === 2 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#AA00FF]/20 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-[#AA00FF]" />
                </div>
                <p className="text-gray-400 text-sm">
                  You need SOL for transaction fees on Solana.
                  <br />
                  We'll airdrop you free devnet SOL!
                </p>
                {solReceived ? (
                  <>
                    <div className="flex items-center justify-center gap-2 text-[#00FF88]">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-game text-sm">SOL RECEIVED</span>
                    </div>
                    <button
                      onClick={() => setStep(3)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00F3FF] to-[#00FF88] text-black font-game font-bold hover:scale-105 transition-transform"
                    >
                      NEXT <ArrowRight className="inline w-4 h-4 ml-2" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={requestSolAirdrop}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#AA00FF] to-[#FF00FF] text-white font-game font-bold hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
                        REQUESTING...
                      </>
                    ) : (
                      "GET FREE SOL"
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Step 3: Get USDC */}
            {step === 3 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                  <Coins className="w-8 h-8 text-[#FFD700]" />
                </div>
                <p className="text-gray-400 text-sm">
                  Get free test USDC to place bets!
                </p>

                {/* Option 1: SPL Token Faucet */}
                <a
                  href={`https://spl-token-faucet.com/?token-name=USDC-Dev`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-game font-bold hover:scale-105 transition-transform"
                >
                  GET TEST USDC
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Alternative: Solana Faucet */}
                <div className="text-xs text-gray-500">
                  Or use{" "}
                  <a
                    href="https://faucet.solana.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00F3FF] hover:underline"
                  >
                    Solana Faucet
                  </a>
                </div>

                {/* Skip for demo */}
                <button
                  onClick={handleComplete}
                  className="w-full py-3 rounded-xl border border-[#00F3FF]/30 text-[#00F3FF] font-game hover:bg-[#00F3FF]/10 transition-colors"
                >
                  SKIP - START PLAYING
                </button>

                <p className="text-xs text-gray-500">
                  Note: This is devnet (test network). No real money involved!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
