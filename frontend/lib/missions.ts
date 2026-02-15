"use client";

/**
 * Daily Missions System for Solana Saga
 *
 * Provides recurring daily challenges that reset each day.
 * Each mission ties into a REAL Jupiter API interaction:
 * - first_blood: Place a bet (Jupiter Prediction API)
 * - diversify: Bet on 3 different market categories (Jupiter Prediction API)
 * - whale_watch: Place a $10+ bet (Jupiter Prediction API)
 * - streak_starter: Place 3 consecutive bets (Jupiter Prediction API)
 * - jupiter_swapper: Complete a token swap (Jupiter Swap API)
 * - claim_victory: Claim a winning payout (Jupiter Prediction API)
 */

const MISSIONS_STORAGE_KEY = "solana_saga_missions";

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  target: number;
  progress: number;
  completed: boolean;
  /** Extra tracking data (e.g. list of unique categories) */
  meta?: Record<string, any>;
}

export interface DailyMissions {
  date: string;
  wallet: string;
  missions: Mission[];
  allCompleteBonus: boolean;
}

const MISSION_TEMPLATES: Omit<Mission, "progress" | "completed">[] = [
  {
    id: "first_blood",
    title: "First Blood",
    description: "Place your first prediction today",
    icon: "🎯",
    xpReward: 50,
    target: 1,
  },
  {
    id: "diversify",
    title: "Diversify",
    description: "Predict on 3 different categories",
    icon: "🌈",
    xpReward: 100,
    target: 3,
    meta: { categories: [] },
  },
  {
    id: "whale_watch",
    title: "Whale Watch",
    description: "Place a prediction of $10 or more",
    icon: "🐋",
    xpReward: 75,
    target: 1,
  },
  {
    id: "streak_starter",
    title: "Hot Streak",
    description: "Place 3 predictions in a row",
    icon: "🔥",
    xpReward: 150,
    target: 3,
  },
  {
    id: "jupiter_swapper",
    title: "Jupiter Swap",
    description: "Swap tokens using Jupiter",
    icon: "⚡",
    xpReward: 100,
    target: 1,
  },
  {
    id: "claim_victory",
    title: "Claim Victory",
    description: "Claim a winning payout",
    icon: "🏆",
    xpReward: 200,
    target: 1,
  },
];

const ALL_COMPLETE_BONUS_XP = 500;

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function getStorageKey(wallet: string, date: string): string {
  return `${MISSIONS_STORAGE_KEY}_${wallet}_${date}`;
}

export function getMissions(wallet: string): DailyMissions {
  if (typeof window === "undefined") {
    return createFreshMissions(wallet);
  }

  const date = getTodayKey();
  const key = getStorageKey(wallet, date);
  const stored = localStorage.getItem(key);

  if (stored) {
    const parsed: DailyMissions = JSON.parse(stored);
    // Ensure new missions exist (migration from old format)
    const existingIds = new Set(parsed.missions.map((m) => m.id));
    for (const template of MISSION_TEMPLATES) {
      if (!existingIds.has(template.id)) {
        parsed.missions.push({ ...template, progress: 0, completed: false });
      }
    }
    // Remove old missions that no longer exist
    const templateIds = new Set(MISSION_TEMPLATES.map((t) => t.id));
    parsed.missions = parsed.missions.filter((m) => templateIds.has(m.id));
    return parsed;
  }

  const fresh = createFreshMissions(wallet);
  localStorage.setItem(key, JSON.stringify(fresh));
  return fresh;
}

function createFreshMissions(wallet: string): DailyMissions {
  return {
    date: getTodayKey(),
    wallet,
    missions: MISSION_TEMPLATES.map((t) => ({
      ...t,
      progress: 0,
      completed: false,
      meta: t.meta ? { ...t.meta } : undefined,
    })),
    allCompleteBonus: false,
  };
}

function saveMissions(data: DailyMissions): void {
  if (typeof window === "undefined") return;
  const key = getStorageKey(data.wallet, data.date);
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Update mission progress. Returns true if the mission was just completed.
 */
export function updateMissionProgress(
  wallet: string,
  missionId: string,
  increment: number = 1
): { justCompleted: boolean; xpEarned: number; allJustCompleted: boolean } {
  const data = getMissions(wallet);
  const mission = data.missions.find((m) => m.id === missionId);

  if (!mission || mission.completed) {
    return { justCompleted: false, xpEarned: 0, allJustCompleted: false };
  }

  mission.progress = Math.min(mission.progress + increment, mission.target);

  let justCompleted = false;
  let xpEarned = 0;
  let allJustCompleted = false;

  if (mission.progress >= mission.target && !mission.completed) {
    mission.completed = true;
    justCompleted = true;
    xpEarned = mission.xpReward;

    const allComplete = data.missions.every((m) => m.completed);
    if (allComplete && !data.allCompleteBonus) {
      data.allCompleteBonus = true;
      allJustCompleted = true;
      xpEarned += ALL_COMPLETE_BONUS_XP;
    }
  }

  saveMissions(data);

  return { justCompleted, xpEarned, allJustCompleted };
}

/**
 * Track a unique category for the "diversify" mission.
 * Only increments progress when a NEW category is bet on.
 */
export function trackDiversifyCategory(
  wallet: string,
  category: string
): { justCompleted: boolean; xpEarned: number; allJustCompleted: boolean } {
  const data = getMissions(wallet);
  const mission = data.missions.find((m) => m.id === "diversify");

  if (!mission || mission.completed) {
    return { justCompleted: false, xpEarned: 0, allJustCompleted: false };
  }

  // Initialize meta if missing
  if (!mission.meta) mission.meta = { categories: [] };
  if (!mission.meta.categories) mission.meta.categories = [];

  const cat = category.toLowerCase();
  if (mission.meta.categories.includes(cat)) {
    // Already bet on this category today
    return { justCompleted: false, xpEarned: 0, allJustCompleted: false };
  }

  // New category!
  mission.meta.categories.push(cat);
  mission.progress = mission.meta.categories.length;

  let justCompleted = false;
  let xpEarned = 0;
  let allJustCompleted = false;

  if (mission.progress >= mission.target && !mission.completed) {
    mission.completed = true;
    justCompleted = true;
    xpEarned = mission.xpReward;

    const allComplete = data.missions.every((m) => m.completed);
    if (allComplete && !data.allCompleteBonus) {
      data.allCompleteBonus = true;
      allJustCompleted = true;
      xpEarned += ALL_COMPLETE_BONUS_XP;
    }
  }

  saveMissions(data);

  return { justCompleted, xpEarned, allJustCompleted };
}

/**
 * Set mission progress to an absolute value (for streak_starter).
 */
export function setMissionProgress(
  wallet: string,
  missionId: string,
  value: number
): { justCompleted: boolean; xpEarned: number; allJustCompleted: boolean } {
  const data = getMissions(wallet);
  const mission = data.missions.find((m) => m.id === missionId);

  if (!mission || mission.completed) {
    return { justCompleted: false, xpEarned: 0, allJustCompleted: false };
  }

  mission.progress = Math.min(value, mission.target);

  let justCompleted = false;
  let xpEarned = 0;
  let allJustCompleted = false;

  if (mission.progress >= mission.target) {
    mission.completed = true;
    justCompleted = true;
    xpEarned = mission.xpReward;

    const allComplete = data.missions.every((m) => m.completed);
    if (allComplete && !data.allCompleteBonus) {
      data.allCompleteBonus = true;
      allJustCompleted = true;
      xpEarned += ALL_COMPLETE_BONUS_XP;
    }
  }

  saveMissions(data);

  return { justCompleted, xpEarned, allJustCompleted };
}

export function getCompletedCount(wallet: string): number {
  const data = getMissions(wallet);
  return data.missions.filter((m) => m.completed).length;
}

export function getAllMissionTemplates(): typeof MISSION_TEMPLATES {
  return MISSION_TEMPLATES;
}

export { ALL_COMPLETE_BONUS_XP };
