"use client";

/**
 * Game Markets - Fun prediction questions for the play money game
 *
 * These markets are designed to be entertaining and resolve
 * automatically after a delay for instant gameplay.
 */

export interface GameMarket {
  id: string;
  question: string;
  category: "crypto" | "sports" | "entertainment" | "tech" | "meme" | "gaming";
  yesOdds: number;
  noOdds: number;
  difficulty: "easy" | "medium" | "hard";
  // For auto-resolution: percentage chance YES wins
  yesWinChance: number;
  resolveDelayMs: number; // How long before auto-resolve
  icon: string;
}

// Pool of fun prediction questions
const MARKET_POOL: GameMarket[] = [
  // Crypto Markets
  {
    id: "btc_100k",
    question: "Will Bitcoin stay above $100K this week?",
    category: "crypto",
    yesOdds: 1.8,
    noOdds: 2.2,
    difficulty: "medium",
    yesWinChance: 55,
    resolveDelayMs: 10000,
    icon: "₿",
  },
  {
    id: "sol_pump",
    question: "Will Solana pump 5% in the next hour?",
    category: "crypto",
    yesOdds: 2.5,
    noOdds: 1.6,
    difficulty: "hard",
    yesWinChance: 40,
    resolveDelayMs: 8000,
    icon: "◎",
  },
  {
    id: "eth_flip",
    question: "Will ETH outperform BTC today?",
    category: "crypto",
    yesOdds: 2.0,
    noOdds: 2.0,
    difficulty: "medium",
    yesWinChance: 50,
    resolveDelayMs: 12000,
    icon: "Ξ",
  },
  {
    id: "doge_moon",
    question: "Will DOGE pump 10% this week?",
    category: "crypto",
    yesOdds: 3.0,
    noOdds: 1.4,
    difficulty: "hard",
    yesWinChance: 30,
    resolveDelayMs: 10000,
    icon: "🐕",
  },
  {
    id: "nft_floor",
    question: "Will blue chip NFT floors hold this month?",
    category: "crypto",
    yesOdds: 1.6,
    noOdds: 2.4,
    difficulty: "easy",
    yesWinChance: 60,
    resolveDelayMs: 15000,
    icon: "🖼️",
  },

  // Meme Markets
  {
    id: "elon_tweet",
    question: "Will Elon tweet about crypto today?",
    category: "meme",
    yesOdds: 1.5,
    noOdds: 2.8,
    difficulty: "easy",
    yesWinChance: 65,
    resolveDelayMs: 8000,
    icon: "🐦",
  },
  {
    id: "pepe_meme",
    question: "Will PEPE break into top 20 cryptos?",
    category: "meme",
    yesOdds: 4.0,
    noOdds: 1.25,
    difficulty: "hard",
    yesWinChance: 25,
    resolveDelayMs: 12000,
    icon: "🐸",
  },
  {
    id: "wojak_day",
    question: "Is today a Wojak or Chad market day?",
    category: "meme",
    yesOdds: 2.0,
    noOdds: 2.0,
    difficulty: "medium",
    yesWinChance: 50,
    resolveDelayMs: 10000,
    icon: "😤",
  },
  {
    id: "rug_pull",
    question: "Will there be a major rug pull this week?",
    category: "meme",
    yesOdds: 1.4,
    noOdds: 3.0,
    difficulty: "easy",
    yesWinChance: 70,
    resolveDelayMs: 10000,
    icon: "🧹",
  },

  // Gaming Markets
  {
    id: "gta6_date",
    question: "Will GTA 6 get a release date announcement?",
    category: "gaming",
    yesOdds: 5.0,
    noOdds: 1.2,
    difficulty: "hard",
    yesWinChance: 20,
    resolveDelayMs: 15000,
    icon: "🎮",
  },
  {
    id: "esports_win",
    question: "Will the underdog win the next major esports final?",
    category: "gaming",
    yesOdds: 3.5,
    noOdds: 1.3,
    difficulty: "hard",
    yesWinChance: 30,
    resolveDelayMs: 10000,
    icon: "🏆",
  },
  {
    id: "steam_sale",
    question: "Will Steam have a surprise sale this month?",
    category: "gaming",
    yesOdds: 2.2,
    noOdds: 1.8,
    difficulty: "medium",
    yesWinChance: 45,
    resolveDelayMs: 12000,
    icon: "🎁",
  },
  {
    id: "ps6_reveal",
    question: "Will Sony reveal PS6 this year?",
    category: "gaming",
    yesOdds: 6.0,
    noOdds: 1.15,
    difficulty: "hard",
    yesWinChance: 15,
    resolveDelayMs: 15000,
    icon: "🎯",
  },

  // Tech Markets
  {
    id: "ai_news",
    question: "Will there be major AI news this week?",
    category: "tech",
    yesOdds: 1.3,
    noOdds: 3.5,
    difficulty: "easy",
    yesWinChance: 75,
    resolveDelayMs: 8000,
    icon: "🤖",
  },
  {
    id: "apple_launch",
    question: "Will Apple announce a new product this month?",
    category: "tech",
    yesOdds: 2.0,
    noOdds: 2.0,
    difficulty: "medium",
    yesWinChance: 50,
    resolveDelayMs: 12000,
    icon: "🍎",
  },
  {
    id: "twitter_chaos",
    question: "Will X/Twitter have another outage?",
    category: "tech",
    yesOdds: 1.6,
    noOdds: 2.4,
    difficulty: "easy",
    yesWinChance: 60,
    resolveDelayMs: 10000,
    icon: "💀",
  },
  {
    id: "zuck_meta",
    question: "Will Zuckerberg post a Metaverse update?",
    category: "tech",
    yesOdds: 1.8,
    noOdds: 2.2,
    difficulty: "medium",
    yesWinChance: 55,
    resolveDelayMs: 10000,
    icon: "👓",
  },

  // Sports Markets
  {
    id: "soccer_upset",
    question: "Will there be a major upset in football this weekend?",
    category: "sports",
    yesOdds: 2.5,
    noOdds: 1.6,
    difficulty: "medium",
    yesWinChance: 40,
    resolveDelayMs: 10000,
    icon: "⚽",
  },
  {
    id: "nba_record",
    question: "Will any NBA record be broken this season?",
    category: "sports",
    yesOdds: 2.0,
    noOdds: 2.0,
    difficulty: "medium",
    yesWinChance: 50,
    resolveDelayMs: 12000,
    icon: "🏀",
  },
  {
    id: "f1_winner",
    question: "Will the pole sitter win the next F1 race?",
    category: "sports",
    yesOdds: 1.7,
    noOdds: 2.3,
    difficulty: "medium",
    yesWinChance: 55,
    resolveDelayMs: 10000,
    icon: "🏎️",
  },

  // Entertainment Markets
  {
    id: "movie_bomb",
    question: "Will the next blockbuster flop at box office?",
    category: "entertainment",
    yesOdds: 2.8,
    noOdds: 1.5,
    difficulty: "medium",
    yesWinChance: 35,
    resolveDelayMs: 12000,
    icon: "🎬",
  },
  {
    id: "celeb_drama",
    question: "Will there be celebrity drama trending this week?",
    category: "entertainment",
    yesOdds: 1.2,
    noOdds: 4.5,
    difficulty: "easy",
    yesWinChance: 80,
    resolveDelayMs: 8000,
    icon: "🌟",
  },
  {
    id: "music_drop",
    question: "Will a surprise album drop this month?",
    category: "entertainment",
    yesOdds: 2.2,
    noOdds: 1.8,
    difficulty: "medium",
    yesWinChance: 45,
    resolveDelayMs: 10000,
    icon: "🎵",
  },
];

// Shuffle array using Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get a batch of random markets
export function getRandomMarkets(count: number = 10): GameMarket[] {
  const shuffled = shuffleArray(MARKET_POOL);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Get markets by category
export function getMarketsByCategory(category: GameMarket["category"]): GameMarket[] {
  return MARKET_POOL.filter(m => m.category === category);
}

// Resolve a market (determine if YES or NO won)
export function resolveMarket(market: GameMarket): boolean {
  const roll = Math.random() * 100;
  return roll < market.yesWinChance;
}

// Get category display info
export const CATEGORY_INFO: Record<GameMarket["category"], { name: string; color: string; icon: string }> = {
  crypto: { name: "Crypto", color: "#FFD700", icon: "₿" },
  sports: { name: "Sports", color: "#00FF88", icon: "⚽" },
  entertainment: { name: "Entertainment", color: "#FF00FF", icon: "🎬" },
  tech: { name: "Tech", color: "#00F3FF", icon: "💻" },
  meme: { name: "Meme", color: "#FF6B00", icon: "🐸" },
  gaming: { name: "Gaming", color: "#AA00FF", icon: "🎮" },
};

// Get difficulty multiplier for XP
export function getDifficultyXpMultiplier(difficulty: GameMarket["difficulty"]): number {
  switch (difficulty) {
    case "easy": return 1;
    case "medium": return 1.5;
    case "hard": return 2;
    default: return 1;
  }
}
