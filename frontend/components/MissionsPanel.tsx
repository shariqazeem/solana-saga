"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Mission } from "@/lib/missions";

interface MissionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  missions: Mission[];
  completedCount: number;
  allComplete: boolean;
}

export function MissionsPanel({
  isOpen,
  onClose,
  missions,
  completedCount,
  allComplete,
}: MissionsPanelProps) {
  const totalMissions = missions.length;
  const progressPercent = totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[71] max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-t-3xl bg-[#0a0a14]/98 border-t-2 border-[#00F3FF]/30 shadow-[0_-4px_40px_rgba(0,243,255,0.15)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-600" />
            </div>

            <div className="px-3 sm:px-4 pb-4 sm:pb-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <h2 className="font-game text-sm sm:text-lg text-white tracking-wider">
                    DAILY MISSIONS
                  </h2>
                  <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5">
                    {allComplete
                      ? "ALL COMPLETE! +500 XP BONUS"
                      : `${completedCount}/${totalMissions} completed`}
                  </p>
                </div>

                {/* Progress ring */}
                <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="#1a1a2e"
                      strokeWidth="4"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke={allComplete ? "#FFD700" : "#00F3FF"}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${(progressPercent / 100) * 125.6} 125.6`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={`text-[10px] sm:text-xs font-bold ${
                        allComplete ? "text-[#FFD700]" : "text-[#00F3FF]"
                      }`}
                    >
                      {completedCount}/{totalMissions}
                    </span>
                  </div>
                </div>
              </div>

              {/* All-complete celebration */}
              {allComplete && (
                <motion.div
                  className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[#FFD700]/20 to-[#FF6B00]/20 border border-[#FFD700]/40 text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <p className="text-[#FFD700] font-game text-sm">
                    MISSION MASTER
                  </p>
                  <p className="text-gray-300 text-xs mt-1">
                    All daily missions complete! +500 XP bonus awarded
                  </p>
                </motion.div>
              )}

              {/* Mission cards */}
              <div className="space-y-1.5 sm:space-y-2">
                {missions.map((mission, i) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border ${
                      mission.completed
                        ? "bg-[#00FF88]/5 border-[#00FF88]/30"
                        : "bg-[#0f0f1a] border-[#1a1a3e]/60"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-base sm:text-xl ${
                        mission.completed
                          ? "bg-[#00FF88]/20"
                          : "bg-[#1a1a3e]"
                      }`}
                    >
                      {mission.completed ? "✅" : mission.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-semibold truncate ${
                            mission.completed
                              ? "text-[#00FF88] line-through"
                              : "text-white"
                          }`}
                        >
                          {mission.title}
                        </p>
                        <span
                          className={`flex-shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                            mission.completed
                              ? "bg-[#00FF88]/20 text-[#00FF88]"
                              : "bg-[#00F3FF]/15 text-[#00F3FF]"
                          }`}
                        >
                          +{mission.xpReward} XP
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {mission.description}
                      </p>

                      {/* Progress bar */}
                      {!mission.completed && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-[#1a1a3e] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#00F3FF] to-[#00FF88] transition-all duration-500"
                              style={{
                                width: `${(mission.progress / mission.target) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {mission.progress}/{mission.target}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#1a1a3e] text-gray-400 text-sm font-medium hover:bg-[#2a2a4e] transition-colors"
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
