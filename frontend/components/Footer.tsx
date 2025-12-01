"use client";

import { Github, Twitter, Disc, Heart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
    return (
        <footer className="relative border-t border-white/5 bg-[#02040A] overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00f0ff]/5 via-transparent to-transparent" />

            <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="inline-block mb-6">
                            <h3 className="text-2xl font-black font-game text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#00f0ff] to-[#ff00aa]">
                                SOLANA SAGA
                            </h3>
                        </Link>
                        <p className="text-slate-400 max-w-sm leading-relaxed font-light">
                            The next generation of prediction markets on Solana.
                            Experience lightning-fast settlements, immersive gameplay, and real rewards.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 font-game tracking-wider text-sm">PLATFORM</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li>
                                <Link href="/markets" className="hover:text-[#00F3FF] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#00F3FF] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    Markets
                                </Link>
                            </li>
                            <li>
                                <Link href="/leaderboard" className="hover:text-[#ffd700] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#ffd700] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    Leaderboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/my-bets" className="hover:text-[#ff00aa] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#ff00aa] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    My Bets
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 font-game tracking-wider text-sm">COMMUNITY</h4>
                        <div className="flex gap-4">
                            <motion.a
                                href="#"
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#00F3FF]/10 hover:border-[#00F3FF]/50 hover:text-[#00F3FF] transition-all duration-300 group"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Twitter className="w-5 h-5" />
                            </motion.a>
                            <motion.a
                                href="#"
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#5865F2]/10 hover:border-[#5865F2]/50 hover:text-[#5865F2] transition-all duration-300 group"
                                whileHover={{ scale: 1.1, rotate: -5 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Disc className="w-5 h-5" />
                            </motion.a>
                            <motion.a
                                href="#"
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/50 hover:text-white transition-all duration-300 group"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Github className="w-5 h-5" />
                            </motion.a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <p className="flex items-center gap-1">
                        © 2025 Solana Saga. Made with <Heart className="w-3 h-3 text-[#ff0044] fill-[#ff0044]" /> for the Community.
                    </p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors hover:underline decoration-[#00f0ff] underline-offset-4">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors hover:underline decoration-[#ff00aa] underline-offset-4">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
