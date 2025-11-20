"use client";

import { motion } from "framer-motion";
import { Rocket, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#00F3FF]/20 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#FF00FF]/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
            </div>

            <div className="max-w-6xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
                >
                    <Sparkles className="w-4 h-4 text-[#00F3FF] animate-pulse" />
                    <span className="text-sm font-bold tracking-wide text-[#00F3FF]">LIVE ON SOLANA MAINNET</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 tracking-tight"
                >
                    <span className="block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">PREDICT</span>
                    <span className="block bg-gradient-to-r from-[#00F3FF] via-[#FF00FF] to-[#00F3FF] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                        THE FUTURE
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
                >
                    Join the ultimate prediction market arena.
                    <span className="text-white font-bold"> Trade on news, crypto, and culture </span>
                    with instant settlements and zero friction.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                >
                    <Link href="/markets">
                        <button className="btn-primary px-8 py-4 rounded-none text-lg min-w-[200px] group">
                            <span className="flex items-center justify-center gap-3">
                                Launch App <Rocket className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                            </span>
                        </button>
                    </Link>

                    <Link href="/leaderboard">
                        <button className="btn-secondary px-8 py-4 rounded-none text-lg min-w-[200px] group">
                            <span className="flex items-center justify-center gap-3">
                                Leaderboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
