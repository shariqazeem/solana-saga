/**
 * DFlow Market Transformer
 *
 * Transforms DFlow/Kalshi prediction markets into Solana Saga's Market format.
 * This maintains compatibility with the existing Tinder-style swipe UI.
 */

import { DFlowMarket, DFlowEvent, dflowApi } from "./api";
import { Market } from "../solana/hooks/usePredictionMarkets";

// Category mapping from Kalshi categories to Solana Saga categories
const CATEGORY_MAP: Record<string, string> = {
  politics: "politics",
  elections: "politics",
  economics: "crypto",
  finance: "crypto",
  crypto: "crypto",
  cryptocurrency: "crypto",
  sports: "sports",
  entertainment: "meme",
  culture: "meme",
  science: "crypto",
  weather: "meme",
  tech: "crypto",
  technology: "crypto",
  default: "crypto",
};

/**
 * Map Kalshi category to Solana Saga category
 */
function mapCategory(kalshiCategory: string): string {
  const normalized = kalshiCategory.toLowerCase();
  return CATEGORY_MAP[normalized] || CATEGORY_MAP.default;
}

/**
 * Calculate time remaining string
 */
function calculateEndsIn(closeTime: string): string {
  const endDate = new Date(closeTime);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();

  if (diffMs < 0) return "Ended";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? "s" : ""}`;
  return "Soon";
}

/**
 * Transform a DFlow market to Solana Saga Market format
 */
export function transformDFlowMarket(
  market: DFlowMarket,
  event?: DFlowEvent
): Market {
  // Yes/No prices from bid/ask (Kalshi uses cents, 0-100)
  const yesPrice = market.yes_bid ?? market.last_price ?? 50;
  const noPrice = 100 - yesPrice;

  // Calculate multipliers based on odds
  // If yes price is 40 cents, multiplier is 100/40 = 2.5x
  const yesMultiplier = yesPrice > 0 ? (100 / yesPrice).toFixed(2) + "x" : "2.00x";
  const noMultiplier = noPrice > 0 ? (100 / noPrice).toFixed(2) + "x" : "2.00x";

  // Volume in USDC (Kalshi reports in cents, convert to dollars)
  const totalVolume = (market.volume || 0) / 100;

  // Estimate pools from volume and odds
  const yesPool = totalVolume * (yesPrice / 100);
  const noPool = totalVolume * (noPrice / 100);

  // Status mapping
  const isResolved = market.status === "settled";
  let outcome: boolean | null = null;
  if (market.result === "yes") outcome = true;
  if (market.result === "no") outcome = false;

  // Build the question - use event title + market subtitle if available
  let question = event?.title || market.ticker;
  if (market.subtitle && market.subtitle !== question) {
    question = `${event?.title || ""} ${market.subtitle}`.trim();
  }
  if (market.yes_sub_title) {
    question = market.yes_sub_title;
  }

  // Get category from event or derive from ticker
  const category = event?.category
    ? mapCategory(event.category)
    : deriveCategory(market.ticker);

  return {
    // Use market ticker as publicKey (for DFlow markets)
    publicKey: `dflow:${market.ticker}`,
    id: hashTicker(market.ticker), // Generate numeric ID from ticker
    question,
    description: event?.subtitle || `Trade on ${market.ticker}`,
    category,
    creator: "kalshi", // DFlow/Kalshi as creator
    yesPool,
    noPool,
    totalVolume,
    isResolved,
    outcome,
    endTime: Math.floor(new Date(market.close_time).getTime() / 1000),
    createdAt: Math.floor(new Date(market.open_time).getTime() / 1000),
    yesPrice: Math.round(yesPrice),
    noPrice: Math.round(noPrice),
    yesMultiplier,
    noMultiplier,
    endsIn: calculateEndsIn(market.close_time),
    bettors: market.open_interest || 0,
    totalBetsCount: Math.floor((market.volume || 0) / 50), // Estimate from volume
    status: market.status === "open" ? "Active" : market.status === "settled" ? "Resolved" : "Cancelled",
    // DFlow-specific fields (for trading)
    resolutionProposer: null,
    resolutionBond: 0,
    challengeDeadline: null,
    isFinalized: isResolved,
    // Extended fields for DFlow integration
    dflowTicker: market.ticker,
    dflowEventTicker: market.event_ticker,
    yesMint: market.yes_outcome_mint,
    noMint: market.no_outcome_mint,
    ledgerMint: market.ledger_mint,
  } as Market & {
    dflowTicker: string;
    dflowEventTicker: string;
    yesMint?: string;
    noMint?: string;
    ledgerMint?: string;
  };
}

/**
 * Generate a numeric hash from ticker string
 */
function hashTicker(ticker: string): number {
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) {
    const char = ticker.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Derive category from market ticker
 */
function deriveCategory(ticker: string): string {
  const lowerTicker = ticker.toLowerCase();

  if (lowerTicker.includes("btc") || lowerTicker.includes("eth") || lowerTicker.includes("sol") || lowerTicker.includes("crypto")) {
    return "crypto";
  }
  if (lowerTicker.includes("trump") || lowerTicker.includes("biden") || lowerTicker.includes("election") || lowerTicker.includes("vote")) {
    return "politics";
  }
  if (lowerTicker.includes("nfl") || lowerTicker.includes("nba") || lowerTicker.includes("mlb") || lowerTicker.includes("sport")) {
    return "sports";
  }
  if (lowerTicker.includes("meme") || lowerTicker.includes("doge") || lowerTicker.includes("pepe")) {
    return "meme";
  }

  return "crypto"; // Default
}

/**
 * Transform multiple DFlow markets
 */
export function transformDFlowMarkets(
  markets: DFlowMarket[],
  events?: Map<string, DFlowEvent>
): Market[] {
  return markets.map(market => {
    const event = events?.get(market.event_ticker);
    return transformDFlowMarket(market, event);
  });
}

/**
 * Fetch and transform featured markets
 */
export async function fetchFeaturedMarkets(limit = 20): Promise<Market[]> {
  try {
    const markets = await dflowApi.getFeaturedMarkets(limit);

    // Fetch events for better metadata
    const eventTickers = [...new Set(markets.map(m => m.event_ticker))];
    const eventsMap = new Map<string, DFlowEvent>();

    await Promise.all(
      eventTickers.slice(0, 10).map(async ticker => {
        try {
          const event = await dflowApi.getEvent(ticker, false);
          eventsMap.set(ticker, event);
        } catch (e) {
          console.warn(`[DFlow] Failed to fetch event ${ticker}:`, e);
        }
      })
    );

    return transformDFlowMarkets(markets, eventsMap);
  } catch (error) {
    console.error("[DFlow] Error fetching featured markets:", error);
    return [];
  }
}

/**
 * Fetch markets by category
 */
export async function fetchMarketsByCategory(
  category: string,
  limit = 20
): Promise<Market[]> {
  try {
    const markets = await dflowApi.getMarketsByCategory(category, limit);
    return transformDFlowMarkets(markets);
  } catch (error) {
    console.error(`[DFlow] Error fetching ${category} markets:`, error);
    return [];
  }
}

/**
 * Search markets
 */
export async function searchMarkets(query: string): Promise<Market[]> {
  try {
    const result = await dflowApi.search(query);

    // Build events map
    const eventsMap = new Map<string, DFlowEvent>();
    result.events.forEach(event => {
      eventsMap.set(event.event_ticker, event);
    });

    return transformDFlowMarkets(result.markets, eventsMap);
  } catch (error) {
    console.error("[DFlow] Error searching markets:", error);
    return [];
  }
}

/**
 * Check if a market is a DFlow market
 */
export function isDFlowMarket(market: Market): boolean {
  return market.publicKey.startsWith("dflow:");
}

/**
 * Get DFlow ticker from market
 */
export function getDFlowTicker(market: Market): string | null {
  if (!isDFlowMarket(market)) return null;
  return market.publicKey.replace("dflow:", "");
}
