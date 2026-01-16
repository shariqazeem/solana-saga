"use client";

import { TrendingUp, Users, Clock, Flame, Target, ChevronRight, CheckCircle, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
    isResolved?: boolean;
    outcome?: boolean | null;
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
    isResolved,
    outcome,
}: MarketCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const isUrgent = endsIn.includes("hour") || endsIn === "Soon";

    // Category colors
    const getCategoryStyle = () => {
        switch (category.toLowerCase()) {
            case "price":
            case "crypto":
                return "category-pill-crypto";
            case "sports":
                return "category-pill-sports";
            case "meme":
                return "category-pill-meme";
            case "politics":
                return "category-pill-politics";
            default:
                return "category-pill-crypto";
        }
    };

    return (
        <div
            className="group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Simplified glow on hover */}
            {isHovered && (
                <div
                    className="absolute -inset-1 rounded-2xl opacity-50 transition-opacity duration-300"
                    style={{
                        background: "linear-gradient(135deg, rgba(0, 255, 136, 0.3), rgba(0, 240, 255, 0.3))",
                        filter: "blur(15px)",
                    }}
                />
            )}

            {/* Card */}
            <div className="relative game-card p-6 h-full flex flex-col bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 rounded-2xl transition-transform hover:scale-[1.02]">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-wrap gap-2">
                        <span className={`category-pill ${getCategoryStyle()}`}>
                            {category}
                        </span>
                        {trending && !isResolved && (
                            <span className="hot-badge">
                                <Flame className="w-3 h-3" />
                                HOT
                            </span>
                        )}
                        {isResolved && (
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                                outcome ? "bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30"
                                       : "bg-[#ff0044]/20 text-[#ff0044] border border-[#ff0044]/30"
                            }`}>
                                <Trophy className="w-3 h-3" />
                                {outcome ? "YES WON" : "NO WON"}
                            </span>
                        )}
                    </div>

                    {/* Timer / Resolved Badge */}
                    {isResolved ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#ffd700]/20 text-[#ffd700] border border-[#ffd700]/30">
                            <CheckCircle className="w-3 h-3" />
                            <span>RESOLVED</span>
                        </div>
                    ) : (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                ${isUrgent
                                ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                                : "bg-white/5 text-gray-400 border border-white/10"
                            }`}
                        >
                            <Clock className="w-3 h-3" />
                            <span className="font-numbers">{endsIn}</span>
                        </div>
                    )}
                </div>

                {/* Question */}
                <Link href={`/market?id=${id}`} className="flex-grow">
                    <h3 className="text-xl font-bold mb-4 leading-snug text-white group-hover:text-[#00f0ff] transition-colors">
                        {question}
                    </h3>
                </Link>

                {/* Stats Row */}
                <div className="flex items-center gap-4 mb-5 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                        <span className="font-numbers">{volume}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <Users className="w-4 h-4 text-[#00f0ff]" />
                        <span className="font-numbers">{bettors}</span>
                    </div>
                </div>

                {/* Battle Bar - Simplified animation */}
                <div className="mb-4">
                    <div className="relative h-4 rounded-full overflow-hidden bg-black/50 border border-white/5">
                        {/* YES Side */}
                        <div
                            className="absolute top-0 left-0 h-full rounded-l-full transition-all duration-700"
                            style={{
                                width: `${yesPrice}%`,
                                background: "linear-gradient(90deg, #00ff88, #00cc66)",
                                boxShadow: isHovered ? "0 0 15px rgba(0, 255, 136, 0.4)" : "none",
                            }}
                        />
                        {/* NO Side */}
                        <div
                            className="absolute top-0 right-0 h-full rounded-r-full transition-all duration-700"
                            style={{
                                width: `${noPrice}%`,
                                background: "linear-gradient(90deg, #cc0033, #ff0044)",
                                boxShadow: isHovered ? "0 0 15px rgba(255, 0, 68, 0.4)" : "none",
                            }}
                        />

                        {/* Center Divider */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-1 h-full bg-white/50"
                            style={{ left: `${yesPrice}%`, transform: "translateX(-50%) translateY(-50%)" }}
                        />
                    </div>
                </div>

                {/* VS Display */}
                <div className="flex items-center justify-between">
                    {/* YES Button */}
                    <Link href={`/market?id=${id}`} className="flex-1">
                        <div className="text-left p-3 rounded-xl bg-[#00ff88]/5 border border-[#00ff88]/20
                         hover:bg-[#00ff88]/20 hover:border-[#00ff88]/50 transition-all cursor-pointer">
                            <div className="text-xs text-gray-400 mb-1 font-game">YES</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-[#00ff88] font-numbers">
                                    {yesPrice}
                                </span>
                                <span className="text-lg text-[#00ff88]/70">%</span>
                            </div>
                        </div>
                    </Link>

                    {/* VS Badge */}
                    <div className="px-4">
                        <div className="font-pixel text-xl text-[#ffd700]">
                            VS
                        </div>
                    </div>

                    {/* NO Button */}
                    <Link href={`/market?id=${id}`} className="flex-1">
                        <div className="text-right p-3 rounded-xl bg-[#ff0044]/5 border border-[#ff0044]/20
                         hover:bg-[#ff0044]/20 hover:border-[#ff0044]/50 transition-all cursor-pointer">
                            <div className="text-xs text-gray-400 mb-1 font-game text-right">NO</div>
                            <div className="flex items-baseline gap-1 justify-end">
                                <span className="text-2xl font-black text-[#ff0044] font-numbers">
                                    {noPrice}
                                </span>
                                <span className="text-lg text-[#ff0044]/70">%</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Quick Play Button */}
                <Link href={`/market?id=${id}`}>
                    <button className={`w-full mt-4 py-3 rounded-xl font-game text-sm transition-all flex items-center justify-center gap-2 group/play ${
                        isResolved
                            ? "bg-[#ffd700]/10 border border-[#ffd700]/30 text-[#ffd700] hover:bg-[#ffd700]/20"
                            : "bg-gradient-to-r from-[#00f0ff]/10 to-[#ff00aa]/10 border border-[#00f0ff]/30 text-[#00f0ff] hover:from-[#00f0ff]/20 hover:to-[#ff00aa]/20 hover:border-[#00f0ff]/50"
                    }`}>
                        {isResolved ? (
                            <>
                                <Trophy className="w-4 h-4" />
                                <span>VIEW RESULT</span>
                            </>
                        ) : (
                            <>
                                <Target className="w-4 h-4" />
                                <span>PLACE BET</span>
                            </>
                        )}
                        <ChevronRight className="w-4 h-4 group-hover/play:translate-x-1 transition-transform" />
                    </button>
                </Link>
            </div>
        </div>
    );
}
