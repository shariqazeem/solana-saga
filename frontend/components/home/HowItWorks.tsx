"use client";

import { motion } from "framer-motion";

const steps = [
    {
        number: "01",
        title: "Browse Markets",
        description: "Explore trending predictions across crypto, sports, and global events."
    },
    {
        number: "02",
        title: "Place Your Bet",
        description: "Choose your position (YES/NO) and stake your USDC with instant execution."
    },
    {
        number: "03",
        title: "Watch & Win",
        description: "Track live odds and claim your winnings automatically upon resolution."
    }
];

export function HowItWorks() {
    return (
        <section className="py-24 px-4 bg-white/5 border-y border-white/5">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black mb-6">
                        HOW IT <span className="text-[#FF00FF]">WORKS</span>
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line */}
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00F3FF]/30 to-transparent" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="relative text-center"
                        >
                            <div className="w-24 h-24 mx-auto bg-[#02040A] border border-[#00F3FF]/30 rounded-full flex items-center justify-center mb-8 relative z-10 shadow-[0_0_30px_rgba(0,243,255,0.1)]">
                                <span className="text-3xl font-black font-numbers text-[#00F3FF]">{step.number}</span>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 font-heading">{step.title}</h3>
                            <p className="text-slate-400 max-w-xs mx-auto">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
