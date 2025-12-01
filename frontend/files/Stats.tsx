"use client";

import { motion, useInView } from "framer-motion";
import { TrendingUp, Target, Users, DollarSign, Zap, Trophy } from "lucide-react";
import { useRef, useState, useEffect } from "react";

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!startOnView || !isInView) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setValue(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, isInView, startOnView]);

  return { value, ref };
}

const stats = [
  { 
    label: "Total Volume", 
    value: 1200000, 
    prefix: "$",
    suffix: "+",
    icon: TrendingUp, 
    color: "#00f0ff",
    description: "Traded this month"
  },
  { 
    label: "Active Markets", 
    value: 247, 
    icon: Target, 
    color: "#ff00aa",
    description: "Live right now"
  },
  { 
    label: "Total Players", 
    value: 12543, 
    icon: Users, 
    color: "#00ff88",
    description: "And growing"
  },
  { 
    label: "Paid Out", 
    value: 850000, 
    prefix: "$",
    icon: DollarSign, 
    color: "#ffd700",
    description: "To winners"
  },
];

export function Stats() {
  return (
    <section className="py-16 px-4 relative z-20 -mt-20">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00f0ff]/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const { value, ref } = useAnimatedCounter(stat.value, 2000);
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      {/* Glow Effect */}
      <motion.div
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${stat.color}30, transparent)`,
          filter: "blur(15px)",
        }}
      />
      
      {/* Card */}
      <div className="relative game-card p-6 h-full">
        {/* Icon */}
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
              border: `1px solid ${stat.color}30`,
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Icon className="w-6 h-6" style={{ color: stat.color }} />
          </motion.div>
          
          {/* Pulse Indicator */}
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: stat.color }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Zap className="w-4 h-4 text-gray-500" />
          </div>
        </div>

        {/* Value */}
        <motion.div
          className="text-4xl font-numbers font-black text-white mb-1"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
        >
          {stat.prefix || ""}
          {value.toLocaleString()}
          {stat.suffix || ""}
        </motion.div>

        {/* Label */}
        <div className="font-game text-sm tracking-wider mb-1" style={{ color: stat.color }}>
          {stat.label}
        </div>

        {/* Description */}
        <div className="text-xs text-gray-500">
          {stat.description}
        </div>

        {/* Bottom Accent Line */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 rounded-b-xl"
          style={{ background: stat.color }}
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.5 }}
        />
      </div>
    </motion.div>
  );
}
