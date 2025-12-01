"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { TrendingUp, Users, Clock, Flame, Zap, Target, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useRef, MouseEvent } from "react";
import { useSoundEffects } from "./home/useSoundEffects";

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
    const [isHovered, setIsHovered] = useState(false);
    const isUrgent = endsIn.includes("hour") || endsIn === "Soon";
    const { playClick, playBet } = useSoundEffects();

    // 3D Tilt Effect
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        setIsHovered(false);
    };

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
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className="group relative perspective-1000"
        >
            {/* Glow Effect on Hover */}
            <motion.div
                className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: "linear-gradient(135deg, rgba(0, 255, 136, 0.4), rgba(0, 240, 255, 0.4), rgba(255, 0, 170, 0.4))",
                    filter: "blur(20px)",
                    transform: "translateZ(-20px)",
                }}
            />

            {/* Card */}
            <div
                className="relative game-card p-6 h-full flex flex-col bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 rounded-2xl"
                style={{ transform: "translateZ(20px)" }}
            >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4" style={{ transform: "translateZ(30px)" }}>
                    <div className="flex flex-wrap gap-2">
                        <span className={`category-pill ${getCategoryStyle()}`}>
                            {category}
                        </span>
                        {trending && (
                            <motion.span
                                className="hot-badge"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <Flame className="w-3 h-3" />
                                HOT
                            </motion.span>
                        )}
                    </div>

                    {/* Timer */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
            ${isUrgent
                            ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                            : "bg-white/5 text-gray-400 border border-white/10"
                        }`}
                    >
                        <Clock className="w-3 h-3" />
                        <span className="font-numbers">{endsIn}</span>
                    </div>
                </div>

                {/* Question */}
                <Link href={`/markets/${id}`} className="flex-grow" onClick={playClick}>
                    <h3
                        className="text-xl font-bold mb-4 leading-snug text-white group-hover:text-[#00f0ff] transition-colors"
                        style={{ transform: "translateZ(40px)" }}
                    >
                        {question}
                    </h3>
                </Link>

                {/* Stats Row */}
                <div className="flex items-center gap-4 mb-5 text-sm" style={{ transform: "translateZ(30px)" }}>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                        <span className="font-numbers">{volume}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <Users className="w-4 h-4 text-[#00f0ff]" />
                        <span className="font-numbers">{bettors}</span>
                    </div>
                </div>

                {/* Battle Bar - The Main Attraction */}
                <div className="mb-4" style={{ transform: "translateZ(35px)" }}>
                    <div className="relative h-4 rounded-full overflow-hidden bg-black/50 border border-white/5">
                        {/* YES Side */}
                        <motion.div
                            className="absolute top-0 left-0 h-full rounded-l-full"
                            style={{
                                background: "linear-gradient(90deg, #00ff88, #00cc66)",
                                boxShadow: isHovered ? "0 0 20px rgba(0, 255, 136, 0.5)" : "none",
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${yesPrice}%` }}
                            transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
                        />
                        {/* NO Side */}
                        <motion.div
                            className="absolute top-0 right-0 h-full rounded-r-full"
                            style={{
                                background: "linear-gradient(90deg, #cc0033, #ff0044)",
                                boxShadow: isHovered ? "0 0 20px rgba(255, 0, 68, 0.5)" : "none",
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${noPrice}%` }}
                            transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
                        />

                        {/* Center Divider Spark */}
                        <motion.div
                            className="absolute top-1/2 -translate-y-1/2 w-1 h-full bg-white"
                            style={{ left: `${yesPrice}%`, transform: "translateX(-50%) translateY(-50%)" }}
                            animate={{
                                boxShadow: [
                                    "0 0 5px #fff, 0 0 10px #fff",
                                    "0 0 10px #fff, 0 0 20px #fff",
                                    "0 0 5px #fff, 0 0 10px #fff",
                                ],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </div>
                </div>

                {/* VS Display */}
                <div className="flex items-center justify-between" style={{ transform: "translateZ(40px)" }}>
                    {/* YES Button */}
                    <Link href={`/markets/${id}`} className="flex-1" onClick={playBet}>
                        <motion.div
                            className="text-left p-3 rounded-xl bg-[#00ff88]/5 border border-[#00ff88]/20 
                         hover:bg-[#00ff88]/20 hover:border-[#00ff88]/50 transition-all cursor-pointer group/yes"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="text-xs text-gray-400 mb-1 font-game">YES</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-[#00ff88] font-numbers group-hover/yes:animate-number-pop">
                                    {yesPrice}
                                </span>
                                <span className="text-lg text-[#00ff88]/70">%</span>
                            </div>
                        </motion.div>
                    </Link>

                    {/* VS Badge */}
                    <div className="px-4">
                        <motion.div
                            className="font-pixel text-xl text-[#ffd700]"
                            animate={{
                                textShadow: [
                                    "0 0 10px #ffd700",
                                    "0 0 20px #ffd700, 0 0 30px #ff8800",
                                    "0 0 10px #ffd700",
                                ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            VS
                        </motion.div>
                    </div>

                    {/* NO Button */}
                    <Link href={`/markets/${id}`} className="flex-1" onClick={playBet}>
                        <motion.div
                            className="text-right p-3 rounded-xl bg-[#ff0044]/5 border border-[#ff0044]/20 
                         hover:bg-[#ff0044]/20 hover:border-[#ff0044]/50 transition-all cursor-pointer group/no"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="text-xs text-gray-400 mb-1 font-game text-right">NO</div>
                            <div className="flex items-baseline gap-1 justify-end">
                                <span className="text-2xl font-black text-[#ff0044] font-numbers group-hover/no:animate-number-pop">
                                    {noPrice}
                                </span>
                                <span className="text-lg text-[#ff0044]/70">%</span>
                            </div>
                        </motion.div>
                    </Link>
                </div>

                {/* Quick Play Button */}
                <Link href={`/markets/${id}`} onClick={playClick}>
                    <motion.button
                        className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff]/10 to-[#ff00aa]/10 
                       border border-[#00f0ff]/30 text-[#00f0ff] font-game text-sm
                       hover:from-[#00f0ff]/20 hover:to-[#ff00aa]/20 hover:border-[#00f0ff]/50
                       transition-all flex items-center justify-center gap-2 group/play"
                        style={{ transform: "translateZ(30px)" }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Target className="w-4 h-4" />
                        <span>PLACE BET</span>
                        <ChevronRight className="w-4 h-4 group-hover/play:translate-x-1 transition-transform" />
                    </motion.button>
                </Link>
            </div>
        </motion.div>
    );
}
