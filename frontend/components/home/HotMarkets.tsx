"use client";

import { motion } from "framer-motion";
import { MarketCard } from "../MarketCard";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const MOCK_MARKETS = [
    {
        id: 1,
        question: "Will SOL hit $300 by Dec 20?",
        category: "Price",
        yesPrice: 35,
        noPrice: 65,
        volume: "$45,230",
        endsIn: "2 days",
        bettors: 342,
        trending: true,
    },
    {
        id: 2,
        question: "Will Jupiter reach 10M daily transactions?",
        category: "Volume",
        yesPrice: 62,
        noPrice: 38,
        volume: "$38,450",
        endsIn: "5 days",
        bettors: 289,
        trending: true,
    },
    {
        id: 3,
        question: "Raydium or Orca: which DEX wins this week?",
        category: "Ecosystem",
        yesPrice: 48,
        noPrice: 52,
        volume: "$52,100",
        endsIn: "3 days",
        bettors: 456,
        trending: false,
    },
    {
        id: 4,
        question: "Will Bonk flip Dogecoin this week?",
        category: "Meme",
        yesPrice: 12,
        noPrice: 88,
        volume: "$67,890",
        endsIn: "6 days",
        bettors: 523,
        trending: true,
    },
];

export function HotMarkets() {
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

                <div className="grid md:grid-cols-2 gap-6">
                    {MOCK_MARKETS.map((market, index) => (
                        <MarketCard key={market.id} {...market} delay={index * 0.1} />
                    ))}
                </div>
            </div>
        </section>
    );
}
