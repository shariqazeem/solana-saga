"use client";

/**
 * Game Credits System for Solana Saga
 *
 * This is a PLAY MONEY system - not real cryptocurrency.
 * Players get free credits to play the prediction market game.
 *
 * Credits are stored locally but tied to wallet address for identity.
 */

const STORAGE_KEY = "solana_saga_game_data";
const STARTING_CREDITS = 1000; // Everyone starts with 1000 credits
const DAILY_BONUS = 100; // Daily login bonus
const STREAK_BONUS = 50; // Bonus per win streak level
const REFERRAL_BONUS = 200; // Bonus for referrals

export interface GameData {
  walletAddress: string;
  credits: number;
  totalWins: number;
  totalLosses: number;
  currentStreak: number;
  bestStreak: number;
  totalWagered: number;
  totalWon: number;
  totalLost: number;
  lastDailyBonus: string | null; // ISO date string
  level: number;
  xp: number;
  achievements: string[];
  bets: GameBet[];
  createdAt: string;
  updatedAt: string;
}

export interface GameBet {
  id: string;
  marketId: string;
  marketQuestion: string;
  prediction: boolean; // true = YES, false = NO
  amount: number;
  odds: number; // multiplier at time of bet
  timestamp: string;
  resolved: boolean;
  won: boolean | null;
  payout: number | null;
}

// Initialize or get game data for a wallet
export function getGameData(walletAddress: string): GameData {
  if (typeof window === "undefined") {
    return createNewGameData(walletAddress);
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const newData = createNewGameData(walletAddress);
    saveGameData(newData);
    return newData;
  }

  const allData: Record<string, GameData> = JSON.parse(stored);

  if (!allData[walletAddress]) {
    allData[walletAddress] = createNewGameData(walletAddress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  }

  return allData[walletAddress];
}

// Create new game data for a wallet
function createNewGameData(walletAddress: string): GameData {
  return {
    walletAddress,
    credits: STARTING_CREDITS,
    totalWins: 0,
    totalLosses: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalWagered: 0,
    totalWon: 0,
    totalLost: 0,
    lastDailyBonus: null,
    level: 1,
    xp: 0,
    achievements: ["first_login"],
    bets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Save game data
export function saveGameData(data: GameData): void {
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem(STORAGE_KEY);
  const allData: Record<string, GameData> = stored ? JSON.parse(stored) : {};

  allData[data.walletAddress] = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
}

// Place a bet (deduct credits)
export function placeBet(
  walletAddress: string,
  marketId: string,
  marketQuestion: string,
  prediction: boolean,
  amount: number,
  odds: number
): { success: boolean; bet?: GameBet; error?: string } {
  const data = getGameData(walletAddress);

  if (amount <= 0) {
    return { success: false, error: "Invalid bet amount" };
  }

  if (amount > data.credits) {
    return { success: false, error: "Insufficient credits" };
  }

  // Deduct credits
  data.credits -= amount;
  data.totalWagered += amount;

  // Create bet record
  const bet: GameBet = {
    id: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    marketId,
    marketQuestion,
    prediction,
    amount,
    odds,
    timestamp: new Date().toISOString(),
    resolved: false,
    won: null,
    payout: null,
  };

  data.bets.push(bet);

  // Add XP for placing bet
  data.xp += Math.floor(amount / 10);
  updateLevel(data);

  saveGameData(data);

  return { success: true, bet };
}

// Resolve a bet (win or lose)
export function resolveBet(
  walletAddress: string,
  betId: string,
  won: boolean
): { success: boolean; payout?: number; newStreak?: number } {
  const data = getGameData(walletAddress);
  const betIndex = data.bets.findIndex((b) => b.id === betId);

  if (betIndex === -1) {
    return { success: false };
  }

  const bet = data.bets[betIndex];

  if (bet.resolved) {
    return { success: false };
  }

  bet.resolved = true;
  bet.won = won;

  if (won) {
    // Calculate payout
    const payout = Math.floor(bet.amount * bet.odds);
    bet.payout = payout;
    data.credits += payout;
    data.totalWon += payout - bet.amount; // Net profit
    data.totalWins++;
    data.currentStreak++;

    if (data.currentStreak > data.bestStreak) {
      data.bestStreak = data.currentStreak;
    }

    // Streak bonus XP
    data.xp += 50 + (data.currentStreak * 10);

    // Check achievements
    checkAchievements(data);
  } else {
    bet.payout = 0;
    data.totalLost += bet.amount;
    data.totalLosses++;
    data.currentStreak = 0;

    // Small consolation XP
    data.xp += 10;
  }

  updateLevel(data);
  saveGameData(data);

  return {
    success: true,
    payout: bet.payout || 0,
    newStreak: data.currentStreak,
  };
}

// Claim daily bonus
export function claimDailyBonus(walletAddress: string): {
  success: boolean;
  amount?: number;
  error?: string
} {
  const data = getGameData(walletAddress);
  const today = new Date().toISOString().split("T")[0];

  if (data.lastDailyBonus === today) {
    return { success: false, error: "Already claimed today" };
  }

  const bonus = DAILY_BONUS + (data.currentStreak * STREAK_BONUS);
  data.credits += bonus;
  data.lastDailyBonus = today;
  data.xp += 25;

  updateLevel(data);
  saveGameData(data);

  return { success: true, amount: bonus };
}

// Add free credits (for demo/testing)
export function addFreeCredits(walletAddress: string, amount: number = 500): void {
  const data = getGameData(walletAddress);
  data.credits += amount;
  data.xp += 10;
  saveGameData(data);
}

// Update player level based on XP
function updateLevel(data: GameData): void {
  // Simple level formula: level = floor(sqrt(xp / 100)) + 1
  const newLevel = Math.floor(Math.sqrt(data.xp / 100)) + 1;

  if (newLevel > data.level) {
    data.level = newLevel;
    // Level up bonus
    data.credits += newLevel * 50;
  }
}

// Check and award achievements
function checkAchievements(data: GameData): void {
  const newAchievements: string[] = [];

  // Win streaks
  if (data.currentStreak >= 3 && !data.achievements.includes("streak_3")) {
    newAchievements.push("streak_3");
  }
  if (data.currentStreak >= 5 && !data.achievements.includes("streak_5")) {
    newAchievements.push("streak_5");
  }
  if (data.currentStreak >= 10 && !data.achievements.includes("streak_10")) {
    newAchievements.push("streak_10");
  }

  // Total wins
  if (data.totalWins >= 10 && !data.achievements.includes("wins_10")) {
    newAchievements.push("wins_10");
  }
  if (data.totalWins >= 50 && !data.achievements.includes("wins_50")) {
    newAchievements.push("wins_50");
  }
  if (data.totalWins >= 100 && !data.achievements.includes("wins_100")) {
    newAchievements.push("wins_100");
  }

  // High roller
  if (data.totalWagered >= 1000 && !data.achievements.includes("wagered_1000")) {
    newAchievements.push("wagered_1000");
  }
  if (data.totalWagered >= 10000 && !data.achievements.includes("wagered_10000")) {
    newAchievements.push("wagered_10000");
  }

  // Profit
  if (data.totalWon >= 500 && !data.achievements.includes("profit_500")) {
    newAchievements.push("profit_500");
  }

  // Add new achievements
  for (const achievement of newAchievements) {
    data.achievements.push(achievement);
    data.credits += 100; // Achievement reward
    data.xp += 200;
  }
}

// Get leaderboard (from all local data - in production this would be a server)
export function getLeaderboard(): Array<{
  walletAddress: string;
  credits: number;
  level: number;
  totalWins: number;
  bestStreak: number;
}> {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  const allData: Record<string, GameData> = JSON.parse(stored);

  return Object.values(allData)
    .map((data) => ({
      walletAddress: data.walletAddress,
      credits: data.credits,
      level: data.level,
      totalWins: data.totalWins,
      bestStreak: data.bestStreak,
    }))
    .sort((a, b) => b.credits - a.credits)
    .slice(0, 100);
}

// Achievement definitions
export const ACHIEVEMENTS = {
  first_login: { name: "Welcome!", description: "Created your account", icon: "🎮" },
  streak_3: { name: "Hot Streak", description: "3 wins in a row", icon: "🔥" },
  streak_5: { name: "On Fire!", description: "5 wins in a row", icon: "💥" },
  streak_10: { name: "Unstoppable", description: "10 wins in a row", icon: "⚡" },
  wins_10: { name: "Getting Started", description: "10 total wins", icon: "🌟" },
  wins_50: { name: "Veteran", description: "50 total wins", icon: "🏆" },
  wins_100: { name: "Legend", description: "100 total wins", icon: "👑" },
  wagered_1000: { name: "High Roller", description: "Wagered 1,000 credits", icon: "💰" },
  wagered_10000: { name: "Whale", description: "Wagered 10,000 credits", icon: "🐋" },
  profit_500: { name: "Winner", description: "500 credits profit", icon: "💎" },
};

// Calculate XP needed for next level
export function getXpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100;
}
