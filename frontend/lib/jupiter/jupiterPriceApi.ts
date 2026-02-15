/**
 * Jupiter Price API v2 Client
 *
 * Fetches real-time token prices from Jupiter's price API.
 * Used to show live prices on crypto-category prediction market cards.
 */

import { JUP_API_KEY } from "@/lib/solana/config";

// Token mint addresses on Solana mainnet
const TOKEN_MINTS: Record<string, string> = {
  SOL: "So11111111111111111111111111111111111111112",
  BTC: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh", // wBTC (Portal)
  ETH: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", // wETH (Portal)
  JUP: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  WIF: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  TRUMP: "HaP8r3ksG76PhQLTqR8FYBeNiQpejcFbQmiHbg787Ut4",
  PYTH: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
  RAY: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  ORCA: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
};

// Keyword-to-token mapping for detecting tokens in market questions
const TOKEN_KEYWORDS: [RegExp, string][] = [
  [/\bSOL\b|solana/i, "SOL"],
  [/\bBTC\b|bitcoin/i, "BTC"],
  [/\bETH\b|ethereum/i, "ETH"],
  [/\bJUP\b|jupiter(?!\s+prediction|\s+mobile)/i, "JUP"],
  [/\bBONK\b/i, "BONK"],
  [/\bWIF\b|dogwifhat/i, "WIF"],
  [/\bTRUMP\b(?!\s+win|\s+lose|\s+president|\s+elect)/i, "TRUMP"],
  [/\bPYTH\b/i, "PYTH"],
  [/\bRAY\b|raydium/i, "RAY"],
  [/\bORCA\b/i, "ORCA"],
];

export interface TokenPrice {
  id: string;
  symbol: string;
  price: number;
}

interface JupPriceResponse {
  data: Record<string, {
    id: string;
    type: string;
    price: string;
  }>;
  timeTaken: number;
}

// Simple cache
let priceCache: { data: Record<string, TokenPrice>; timestamp: number } | null = null;
const CACHE_TTL_MS = 30_000; // 30 seconds

export async function fetchTokenPrices(): Promise<Record<string, TokenPrice>> {
  // Return cached if fresh
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL_MS) {
    return priceCache.data;
  }

  const mintIds = Object.values(TOKEN_MINTS).join(",");
  const url = `https://api.jup.ag/price/v2?ids=${mintIds}`;

  try {
    const res = await fetch(url, {
      headers: JUP_API_KEY ? { "x-api-key": JUP_API_KEY } : {},
    });
    if (!res.ok) return priceCache?.data ?? {};

    const json: JupPriceResponse = await res.json();
    const result: Record<string, TokenPrice> = {};

    // Map mint addresses back to symbols
    for (const [symbol, mint] of Object.entries(TOKEN_MINTS)) {
      const priceData = json.data[mint];
      if (priceData && priceData.price) {
        result[symbol] = {
          id: mint,
          symbol,
          price: parseFloat(priceData.price),
        };
      }
    }

    priceCache = { data: result, timestamp: Date.now() };
    return result;
  } catch {
    return priceCache?.data ?? {};
  }
}

/**
 * Detect which token a market question is about.
 * Returns the token symbol or null if no match.
 */
export function detectTokenFromQuestion(question: string): string | null {
  for (const [regex, symbol] of TOKEN_KEYWORDS) {
    if (regex.test(question)) {
      return symbol;
    }
  }
  return null;
}

/**
 * Format a price for display.
 * Large prices (>$1): 2 decimal places
 * Small prices (<$1): up to 6 significant digits
 */
export function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (price >= 0.01) {
    return price.toFixed(4);
  }
  return price.toFixed(6);
}
