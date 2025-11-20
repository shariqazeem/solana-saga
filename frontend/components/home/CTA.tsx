"use client";

import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import Link from "next/link";

export function CTA() {
    return (
        <section className="py-32 px-4 relative overflow-hidden">
            <div className="max-w-5xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="glass-card p-12 md:p-20 rounded-3xl border border-[#00F3FF]/30 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00F3FF]/10 via-transparent to-[#FF00FF]/10" />

                    <Rocket className="w-20 h-20 mx-auto mb-8 text-[#00F3FF] animate-float" />

                    <h2 className="text-5xl md:text-7xl font-black mb-8 font-heading">
                        READY TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] to-[#FF00FF]">DOMINATE?</span>
                    </h2>

                    <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto">
                        Join 12,500+ predictors making real money on Solana Saga.
                        The future belongs to those who predict it.
                    </p>

                    <Link href="/markets">
                        <button className="btn-primary px-12 py-6 text-2xl rounded-full shadow-[0_0_30px_rgba(0,243,255,0.3)] hover:shadow-[0_0_50px_rgba(0,243,255,0.5)]">
                            Start Winning Now
                        </button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
