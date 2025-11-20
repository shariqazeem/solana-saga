"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Crown } from "lucide-react";
import Link from "next/link";

const leaders = [
    { rank: 1, name: "sigma.sol", winRate: "94%", earnings: "$12,450", icon: Crown, color: "text-yellow-400" },
    { rank: 2, name: "chad.sol", winRate: "89%", earnings: "$9,230", icon: Medal, color: "text-slate-300" },
    { rank: 3, name: "degen.sol", winRate: "87%", earnings: "$7,890", icon: Medal, color: "text-amber-600" },
];

export function LeaderboardPreview() {
    return (
        <section className="py-24 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00F3FF]/5 to-transparent pointer-events-none" />

            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <Trophy className="w-16 h-16 mx-auto mb-6 text-[#FFD700] animate-float" />
                    <h2 className="text-4xl md:text-5xl font-black mb-6">
                        TOP <span className="text-[#FFD700]">PREDICTORS</span>
                    </h2>
                    <p className="text-xl text-slate-400">
                        Compete with the best. Climb the ranks. Earn rewards.
                    </p>
                </motion.div>

                <div className="space-y-4">
                    {leaders.map((leader, index) => (
                        <motion.div
                            key={leader.rank}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-6 rounded-xl flex items-center gap-6 group hover:border-[#FFD700]/50 transition-colors"
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-2xl font-black ${leader.color}`}>
                                {leader.rank}
                            </div>

                            <div className="flex-grow">
                                <div className="text-xl font-bold font-heading mb-1 flex items-center gap-2">
                                    {leader.name}
                                    {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                                </div>
                                <div className="text-sm text-slate-400">
                                    Win Rate: <span className="text-[#00FF9D] font-bold">{leader.winRate}</span>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-2xl font-black font-numbers text-[#00FF9D]">
                                    +{leader.earnings}
                                </div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">
                                    Weekly Profit
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link href="/leaderboard">
                        <button className="btn-secondary px-8 py-3 rounded-full">
                            View Full Leaderboard
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
