"use client";

import { Github, Twitter, Disc } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-[#02040A] relative z-10">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-black font-heading text-white mb-4">
                            SOLANA SAGA
                        </h3>
                        <p className="text-slate-400 max-w-sm leading-relaxed">
                            The next generation of prediction markets on Solana.
                            Experience lightning-fast settlements, immersive gameplay, and real rewards.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 font-heading tracking-wider">Platform</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li><a href="/markets" className="hover:text-[#00F3FF] transition-colors">Markets</a></li>
                            <li><a href="/leaderboard" className="hover:text-[#00F3FF] transition-colors">Leaderboard</a></li>
                            <li><a href="/my-bets" className="hover:text-[#00F3FF] transition-colors">My Bets</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 font-heading tracking-wider">Community</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#00F3FF] hover:text-black transition-all duration-300 group">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#5865F2] hover:text-white transition-all duration-300 group">
                                <Disc className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 group">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <p>© 2025 Solana Saga. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
