"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Clock, Flame, ArrowRight } from "lucide-react";
import Link from "next/link";

interface MarketCardProps {
    id: string | number;
    question: string;
    category: string;
    yesPrice: number;
    noPrice: number;
    volume: string;
    endsIn: string;
    bettors: number;
    trending?: boolean;
    delay?: number;
}

export function MarketCard({
    id,
    question,
    category,
    yesPrice,
    noPrice,
    volume,
    endsIn,
    bettors,
    trending,
    delay = 0,
}: MarketCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="group relative"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-[#00F3FF]/20 to-[#FF00FF]/20 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />

            <div className="relative glass-card rounded-xl p-6 h-full flex flex-col border border-white/10 group-hover:border-[#00F3FF]/50 transition-colors">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                        <span className="px-2 py-1 rounded bg-white/5 text-xs font-bold uppercase tracking-wider text-slate-300 border border-white/10">
                            {category}
                        </span>
                        {trending && (
                            <span className="px-2 py-1 rounded bg-[#FF3366]/20 text-[#FF3366] text-xs font-bold uppercase tracking-wider border border-[#FF3366]/30 flex items-center gap-1 animate-pulse">
                                <Flame className="w-3 h-3" /> Hot
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-numbers">
                        <Clock className="w-3 h-3" /> {endsIn}
                    </div>
                </div>

                {/* Question */}
                <Link href={`/markets/${id}`} className="flex-grow">
                    <h3 className="text-lg font-bold mb-4 leading-snug group-hover:text-[#00F3FF] transition-colors">
                        {question}
                    </h3>
                </Link>

                {/* Stats */}
                <div className="flex items-center justify-between mb-6 text-xs text-slate-400 font-numbers">
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-[#00FF9D]" /> {volume} Vol
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#00F3FF]" /> {bettors}
                    </div>
                </div>

                {/* Battle Bar */}
                <div className="space-y-3">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                        <div
                            className="h-full bg-[#00FF9D] shadow-[0_0_10px_#00FF9D]"
                            style={{ width: `${yesPrice}%` }}
                        />
                        <div
                            className="h-full bg-[#FF3366] shadow-[0_0_10px_#FF3366]"
                            style={{ width: `${noPrice}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <button className="flex-1 text-left group/yes">
                            <div className="text-xs text-slate-400 mb-1">YES</div>
                            <div className="text-xl font-black text-[#00FF9D] font-numbers group-hover/yes:scale-110 transition-transform origin-left">
                                {yesPrice}%
                            </div>
                        </button>

                        <Link href={`/markets/${id}`}>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#00F3FF] hover:text-black transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>

                        <button className="flex-1 text-right group/no">
                            <div className="text-xs text-slate-400 mb-1">NO</div>
                            <div className="text-xl font-black text-[#FF3366] font-numbers group-hover/no:scale-110 transition-transform origin-right">
                                {noPrice}%
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
