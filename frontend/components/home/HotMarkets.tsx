"use client";

import { motion } from "framer-motion";
import { MarketCard } from "../MarketCard";
import { ChevronRight, Target } from "lucide-react";
import Link from "next/link";
import { usePredictionMarkets } from "@/lib/solana/hooks/usePredictionMarkets";
import { useMemo } from "react";

export function HotMarkets() {
    const { markets, loading } = usePredictionMarkets();

    // Get top 4 trending active markets (sorted by bettors)
    const trendingMarkets = useMemo(() => {
        return markets
            .filter(m => m.status === "Active")
            .sort((a, b) => b.bettors - a.bettors)
            .slice(0, 4)
            .map(market => ({
                id: market.publicKey,
                question: market.question,
                category: market.category,
                yesPrice: market.yesPrice,
                noPrice: market.noPrice,
                volume: `$${market.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                endsIn: market.endsIn,
                bettors: market.bettors,
                trending: market.bettors > 10,
            }));
    }, [markets]);

    return (
        <section className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-black"
                    >
                        TRENDING <span className="text-[#00FF9D]">MARKETS</span>
                    </motion.h2>

                    <Link href="/markets">
                        <button className="flex items-center gap-2 text-[#00F3FF] hover:text-white transition-colors font-bold uppercase tracking-wider text-sm group">
                            View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F3FF] mb-4"></div>
                        <p className="text-slate-400">Loading markets...</p>
                    </div>
                ) : trendingMarkets.length === 0 ? (
                    <div className="text-center py-12 glass-card rounded-2xl">
                        <Target className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                        <h3 className="text-xl font-bold mb-2">No active markets yet</h3>
                        <p className="text-slate-500 mb-6">Be the first to create a prediction market!</p>
                        <Link href="/admin">
                            <button className="px-6 py-3 neon-button rounded-xl font-bold font-orbitron">
                                Create Market
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {trendingMarkets.map((market, index) => (
                            <MarketCard key={market.id} {...market} delay={index * 0.1} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
