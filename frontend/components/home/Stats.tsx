"use client";

import { motion } from "framer-motion";
import { TrendingUp, Target, Users, DollarSign } from "lucide-react";

const stats = [
    { label: "Total Volume", value: "$1.2M+", icon: TrendingUp, color: "#00F3FF" },
    { label: "Active Markets", value: "247", icon: Target, color: "#FF00FF" },
    { label: "Total Predictors", value: "12.5K", icon: Users, color: "#00FF9D" },
    { label: "Payouts Paid", value: "$850K", icon: DollarSign, color: "#FF8C00" },
];

export function Stats() {
    return (
        <section className="py-12 px-4 relative z-20 -mt-20">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-colors group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className="p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors"
                                    style={{ color: stat.color }}
                                >
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="h-px flex-grow bg-gradient-to-r from-transparent to-white/10 mx-4" />
                            </div>
                            <div className="text-3xl font-black font-numbers text-white mb-1 group-hover:scale-105 transition-transform origin-left">
                                {stat.value}
                            </div>
                            <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
