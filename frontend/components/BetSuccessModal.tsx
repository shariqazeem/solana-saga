"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Share2, X, Sparkles, Trophy, Ticket, Twitter } from "lucide-react";
import { useState } from "react";

interface BetSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    betData: {
        question: string;
        side: boolean; // true = YES, false = NO
        amount: number;
        multiplier: string;
        potentialPayout: number;
    };
}

export function BetSuccessModal({ isOpen, onClose, betData }: BetSuccessModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const text = `I just bet $${betData.amount} on "${betData.question}" - Potential ${betData.multiplier} payout! Join me on Solana Saga`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "My Prediction Bet",
                text: `I just bet $${betData.amount} on "${betData.question}" - Potential ${betData.multiplier} payout!`,
                url: window.location.href,
            });
        } else {
            handleCopy();
        }
    };

    const handleTwitterShare = () => {
        const tweetText = `I just bet $${betData.amount} ${betData.side ? "YES" : "NO"} on "${betData.question.slice(0, 100)}${betData.question.length > 100 ? '...' : ''}"

Potential ${betData.multiplier} payout! 🎯

Swipe to predict on @playsolanasaga - the Tinder of prediction markets 🔥

#Solana #PredictionMarkets #Web3Gaming`;

        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, rotateY: -30 }}
                        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                        exit={{ scale: 0.5, opacity: 0, rotateY: 30 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Holographic Ticket Card */}
                        <div className="relative overflow-hidden rounded-3xl">
                            {/* Animated Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/20 via-[#00f0ff]/10 to-[#ff00aa]/20" />
                            <motion.div
                                className="absolute inset-0 opacity-30"
                                animate={{
                                    background: [
                                        "linear-gradient(45deg, transparent 0%, rgba(0, 255, 136, 0.3) 50%, transparent 100%)",
                                        "linear-gradient(45deg, transparent 100%, rgba(0, 255, 136, 0.3) 50%, transparent 0%)",
                                    ],
                                }}
                                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                            />

                            {/* Holographic Lines */}
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage: `repeating-linear-gradient(
                                        0deg,
                                        transparent,
                                        transparent 2px,
                                        rgba(0, 240, 255, 0.1) 2px,
                                        rgba(0, 240, 255, 0.1) 4px
                                    )`,
                                }}
                            />

                            {/* Main Content */}
                            <div className="relative bg-[#0a0a0f]/90 backdrop-blur-xl border border-[#00ff88]/30 rounded-3xl p-6">
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {/* Header */}
                                <div className="text-center mb-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                                        className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#00ff88]/30 to-[#00f0ff]/30 flex items-center justify-center border border-[#00ff88]/50 relative"
                                    >
                                        <motion.div
                                            className="absolute inset-0 rounded-2xl"
                                            animate={{
                                                boxShadow: [
                                                    "0 0 20px rgba(0, 255, 136, 0.3)",
                                                    "0 0 40px rgba(0, 255, 136, 0.5)",
                                                    "0 0 20px rgba(0, 255, 136, 0.3)",
                                                ],
                                            }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                        <Ticket className="w-10 h-10 text-[#00ff88] relative z-10" />
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#00ff88] flex items-center justify-center"
                                        >
                                            <Check className="w-5 h-5 text-black" />
                                        </motion.div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <h2 className="text-2xl font-game text-white mb-1 flex items-center justify-center gap-2">
                                            <Sparkles className="w-5 h-5 text-[#ffd700]" />
                                            BET CONFIRMED
                                            <Sparkles className="w-5 h-5 text-[#ffd700]" />
                                        </h2>
                                        <p className="text-gray-400 text-sm">Your prediction is locked in!</p>
                                    </motion.div>
                                </div>

                                {/* Ticket Stub Design */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="relative"
                                >
                                    {/* Perforated Edge */}
                                    <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 16px)" }} />

                                    <div className="pt-4 space-y-4">
                                        {/* Question */}
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <p className="text-xs text-gray-500 font-game mb-1">PREDICTION</p>
                                            <p className="text-white font-medium line-clamp-2">{betData.question}</p>
                                        </div>

                                        {/* Bet Details Grid */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                                <p className="text-xs text-gray-500 font-game mb-1">YOUR BET</p>
                                                <p className={`text-lg font-bold ${betData.side ? "text-[#00ff88]" : "text-[#ff0044]"}`}>
                                                    {betData.side ? "YES" : "NO"}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                                <p className="text-xs text-gray-500 font-game mb-1">WAGERED</p>
                                                <p className="text-lg font-numbers font-bold text-white">
                                                    ${betData.amount}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                                <p className="text-xs text-gray-500 font-game mb-1">MULTIPLIER</p>
                                                <p className="text-lg font-numbers font-bold text-[#ffd700]">
                                                    {betData.multiplier}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Potential Payout */}
                                        <div className="p-4 rounded-xl bg-gradient-to-r from-[#00ff88]/10 to-[#00f0ff]/10 border border-[#00ff88]/30">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Trophy className="w-5 h-5 text-[#ffd700]" />
                                                    <span className="text-gray-300 font-game text-sm">POTENTIAL PAYOUT</span>
                                                </div>
                                                <motion.span
                                                    className="text-2xl font-numbers font-black text-[#00ff88]"
                                                    initial={{ scale: 0.5 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.6, type: "spring" }}
                                                >
                                                    ${betData.potentialPayout.toFixed(2)}
                                                </motion.span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Action Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-6 space-y-3"
                                >
                                    {/* Twitter Share - Primary CTA */}
                                    <motion.button
                                        onClick={handleTwitterShare}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1DA1F2] text-white font-game text-sm font-bold hover:bg-[#1a8cd8] transition-all"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                        Share on X
                                    </motion.button>

                                    {/* Secondary buttons */}
                                    <div className="flex gap-3">
                                        <motion.button
                                            onClick={handleCopy}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/20 text-gray-300 font-game text-sm hover:bg-white/10 transition-all"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-4 h-4 text-[#00ff88]" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    Copy
                                                </>
                                            )}
                                        </motion.button>
                                        <motion.button
                                            onClick={handleShare}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00f0ff] text-black font-game text-sm font-bold"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Share2 className="w-4 h-4" />
                                            Share
                                        </motion.button>
                                    </div>
                                </motion.div>

                                {/* Close Text */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="text-center text-xs text-gray-500 mt-4"
                                >
                                    Good luck! May the odds be in your favor.
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
