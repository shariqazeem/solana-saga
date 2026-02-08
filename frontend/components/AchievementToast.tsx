"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ACHIEVEMENTS } from "@/lib/gameCredits";

interface AchievementToastProps {
  achievementId: string | null;
  onDismiss: () => void;
}

export function AchievementToast({ achievementId, onDismiss }: AchievementToastProps) {
  const achievement = achievementId
    ? ACHIEVEMENTS[achievementId as keyof typeof ACHIEVEMENTS]
    : null;

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[65] pointer-events-auto"
          initial={{ opacity: 0, y: -60, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={onDismiss}
          onAnimationComplete={() => {
            const timer = setTimeout(onDismiss, 4000);
            return () => clearTimeout(timer);
          }}
        >
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0a0a0f]/95 border-2 border-[#FFD700]/60 shadow-[0_0_30px_rgba(255,215,0,0.3)] backdrop-blur-md">
            <span className="text-3xl">{achievement.icon}</span>
            <div>
              <p className="text-[#FFD700] font-game text-sm font-bold">
                {achievement.name}
              </p>
              <p className="text-gray-400 text-xs">
                {achievement.description}
              </p>
            </div>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-[#FFD700]/20 text-[#FFD700] text-[10px] font-bold">
              +200 XP
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
