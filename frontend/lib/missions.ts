"use client";

/**
 * Daily Missions System for Solana Saga
 *
 * Provides recurring daily challenges that reset each day.
 * Missions track progress via localStorage keyed by date + wallet.
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
    description: "Place your first bet today",
    icon: "🎯",
    xpReward: 50,
    target: 1,
  },
  {
    id: "diversify",
    title: "Diversify",
    description: "Bet on 3 different categories",
    icon: "🌈",
    xpReward: 100,
    target: 3,
  },
  {
    id: "whale_watch",
    title: "Whale Watch",
    description: "Place a bet of $10 or more",
    icon: "🐋",
    xpReward: 75,
    target: 1,
  },
  {
    id: "streak_starter",
    title: "Streak Starter",
    description: "Reach a 3-bet streak",
    icon: "🔥",
    xpReward: 150,
    target: 3,
  },
  {
    id: "market_explorer",
    title: "Market Explorer",
    description: "View 10 markets",
    icon: "🔭",
    xpReward: 50,
    target: 10,
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
    return JSON.parse(stored);
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
 * Update mission progress. Returns true if the mission was just completed (for triggering celebrations).
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

    // Check if all missions are now complete
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
 * Set mission progress to an absolute value (for streak_starter where we set the current streak).
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
