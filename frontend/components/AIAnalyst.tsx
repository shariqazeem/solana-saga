"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Brain, Sparkles, Terminal } from "lucide-react";

interface AIAnalystProps {
    yesPool: number;
    noPool: number;
    question: string;
}

export function AIAnalyst({ yesPool, noPool, question }: AIAnalystProps) {
    const [analyzing, setAnalyzing] = useState(true);
    const [insight, setInsight] = useState("");
    const [sentiment, setSentiment] = useState<"BULLISH" | "BEARISH" | "NEUTRAL">("NEUTRAL");

    useEffect(() => {
        // Simulate AI analysis delay
        const timer = setTimeout(() => {
            generateInsight();
            setAnalyzing(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [yesPool, noPool]);

    const generateInsight = () => {
        const total = yesPool + noPool;
        const yesRatio = yesPool / total;

        if (yesRatio > 0.6) {
            setSentiment("BULLISH");
            setInsight(`Strong crowd consensus detected. Volume analysis suggests high confidence in a YES outcome based on recent order flow.`);
        } else if (yesRatio < 0.4) {
            setSentiment("BEARISH");
            setInsight(`Market sentiment is skewing negative. Smart money appears to be hedging against this outcome.`);
        } else {
            setSentiment("NEUTRAL");
            setInsight(`Market is currently undecided. Volatility is expected as the deadline approaches. Watch for whale movements.`);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-xl border border-[#00F3FF]/30 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded bg-[#00F3FF]/10 flex items-center justify-center border border-[#00F3FF]/30">
                        <Bot className="w-6 h-6 text-[#00F3FF]" />
                    </div>
                    <div>
                        <h3 className="text-[#00F3FF] font-bold font-heading tracking-wider flex items-center gap-2">
                            AI ANALYST <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00F3FF] text-black font-bold">BETA</span>
                        </h3>
                        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#00FF9D] animate-pulse" />
                            SYSTEM ONLINE
                        </div>
                    </div>
                </div>

                <div className="min-h-[100px] font-mono text-sm">
                    {analyzing ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[#00F3FF]/70">
                                <Terminal className="w-4 h-4" />
                                <span className="animate-pulse">Analyzing market data...</span>
                            </div>
                            <div className="h-1 w-full bg-[#00F3FF]/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00F3FF] w-1/3 animate-[shimmer_1s_infinite]" />
                            </div>
                            <div className="text-xs text-slate-500">
                                &gt; Processing order book...<br />
                                &gt; Calculating sentiment vectors...<br />
                                &gt; Verifying on-chain volume...
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-4 p-3 rounded bg-white/5 border border-white/10">
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Sentiment</div>
                                <div className={`font-bold font-heading ${sentiment === "BULLISH" ? "text-[#00FF9D]" :
                                    sentiment === "BEARISH" ? "text-[#FF003C]" :
                                        "text-[#FCEE0A]"
                                    }`}>
                                    {sentiment}
                                </div>
                                <div className="flex-grow h-px bg-white/10" />
                                <Brain className="w-4 h-4 text-slate-500" />
                            </div>

                            <div className="text-slate-300 leading-relaxed border-l-2 border-[#00F3FF]/30 pl-3">
                                <span className="text-[#00F3FF] mr-2">&gt;&gt;</span>
                                {insight}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
