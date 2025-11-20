"use client";

import { motion } from "framer-motion";
import { Zap, Trophy, Shield, Flame, Star, Globe } from "lucide-react";

const features = [
    {
        title: "Lightning Fast",
        description: "Solana's 400ms blocks mean instant bets and payouts. No waiting around.",
        icon: Zap,
        color: "from-yellow-500 to-orange-500"
    },
    {
        title: "Compete & Win",
        description: "Climb the leaderboard. Unlock achievements. Prove you're the best predictor.",
        icon: Trophy,
        color: "from-purple-500 to-pink-500"
    },
    {
        title: "Real Money",
        description: "Bet with USDC. Win real money. 2% fee only on winnings.",
        icon: Globe,
        color: "from-emerald-500 to-cyan-500"
    },
    {
        title: "Trustless",
        description: "Smart contracts handle everything. No middleman. Fully transparent.",
        icon: Shield,
        color: "from-blue-500 to-indigo-500"
    },
    {
        title: "Live Odds",
        description: "Watch prices update in real-time as others bet. AMM-powered fair pricing.",
        icon: Flame,
        color: "from-red-500 to-orange-500"
    },
    {
        title: "Gamified",
        description: "Streaks, levels, achievements, and leaderboards. Make predicting fun!",
        icon: Star,
        color: "from-pink-500 to-purple-500"
    }
];

export function Features() {
    return (
        <section className="py-24 px-4 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black mb-6">
                        WHY <span className="text-[#00F3FF]">SOLANA SAGA?</span>
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Built for speed, designed for winners. Experience the next evolution of prediction markets.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-8 rounded-2xl relative overflow-hidden group hover:bg-white/5 transition-colors"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 blur-2xl rounded-full group-hover:opacity-20 transition-opacity`} />

                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} p-3 mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-full h-full text-white" />
                            </div>

                            <h3 className="text-xl font-bold mb-3 font-heading">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
