"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Clock, Flame, ArrowRight, Zap } from "lucide-react";
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
            {/* Holographic Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#00F3FF]/10 to-[#FF00FF]/10 rounded-xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500" />

            {/* Scanline Effect */}
            <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00F3FF]/10 to-transparent h-[200%] w-full animate-[scanline_3s_linear_infinite]" />
            </div>

            <div className="relative glass-card rounded-xl p-6 h-full flex flex-col border border-white/5 group-hover:border-[#00F3FF]/50 transition-all duration-300 z-10 bg-[#050A14]/80 backdrop-blur-md">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                        <span className="px-2 py-1 rounded-sm bg-[#00F3FF]/10 text-[10px] font-bold uppercase tracking-widest text-[#00F3FF] border border-[#00F3FF]/20 font-heading">
                            {category}
                        </span>
                        {trending && (
                            <span className="px-2 py-1 rounded-sm bg-[#FF003C]/10 text-[#FF003C] text-[10px] font-bold uppercase tracking-widest border border-[#FF003C]/20 flex items-center gap-1 animate-pulse font-heading">
                                <Flame className="w-3 h-3" /> Hot
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-numbers tracking-wider">
                        <Clock className="w-3 h-3 text-[#00F3FF]" /> {endsIn}
                    </div>
                </div>

                {/* Question */}
                <Link href={`/markets/${id}`} className="flex-grow group/link">
                    <h3 className="text-lg font-bold mb-4 leading-snug text-white group-hover/link:text-[#00F3FF] transition-colors font-heading tracking-wide">
                        {question}
                    </h3>
                </Link>

                {/* Stats */}
                <div className="flex items-center justify-between mb-6 text-xs text-slate-400 font-numbers border-b border-white/5 pb-4">
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-[#00FF9D]" /> <span className="text-white">{volume}</span> Vol
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#00F3FF]" /> <span className="text-white">{bettors}</span> Bettors
                    </div>
                </div>

                {/* Battle Bar */}
                <div className="space-y-3">
                    <div className="h-2 bg-black/50 rounded-full overflow-hidden flex border border-white/5 relative">
                        <div
                            className="h-full bg-[#00FF9D] shadow-[0_0_15px_#00FF9D]"
                            style={{ width: `${yesPrice}%` }}
                        />
                        <div
                            className="h-full bg-[#FF003C] shadow-[0_0_15px_#FF003C]"
                            style={{ width: `${noPrice}%` }}
                        />
                        {/* Center Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/20" />
                    </div>

                    <div className="flex justify-between items-center">
                        <button className="flex-1 text-left group/yes hover:bg-[#00FF9D]/5 p-1 rounded transition-colors">
                            <div className="text-[10px] font-bold text-[#00FF9D] mb-0.5 tracking-wider">YES</div>
                            <div className="text-xl font-black text-white font-numbers group-hover/yes:text-[#00FF9D] transition-colors">
                                {yesPrice}%
                            </div>
                        </button>

                        <Link href={`/markets/${id}`}>
                            <div className="w-10 h-10 rounded-none border border-[#00F3FF] flex items-center justify-center hover:bg-[#00F3FF] hover:text-black transition-all group/btn relative overflow-hidden">
                                <div className="absolute inset-0 bg-[#00F3FF]/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                <ArrowRight className="w-5 h-5 relative z-10" />
                            </div>
                        </Link>

                        <button className="flex-1 text-right group/no hover:bg-[#FF003C]/5 p-1 rounded transition-colors">
                            <div className="text-[10px] font-bold text-[#FF003C] mb-0.5 tracking-wider">NO</div>
                            <div className="text-xl font-black text-white font-numbers group-hover/no:text-[#FF003C] transition-colors">
                                {noPrice}%
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
