/**
 * Jupiter Token API v2 Client
 *
 * Searches token metadata and fetches token info by mint addresses.
 * Used for the portfolio feature and token selection in swap.
 */

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  daily_volume?: number;
}

const TOKEN_API_BASE = "https://api.jup.ag/tokens/v2";

/**
 * Search for tokens by symbol or mint address.
 */
export async function searchTokens(query: string): Promise<TokenInfo[]> {
  if (!query || query.length < 1) return [];

  try {
    const res = await fetch(`${TOKEN_API_BASE}/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    // API returns array directly
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Get token info for a list of mint addresses.
 * Uses the token search endpoint to look up each mint.
 */
export async function getTokensByMints(mints: string[]): Promise<Map<string, TokenInfo>> {
  const result = new Map<string, TokenInfo>();
  if (mints.length === 0) return result;

  // Batch lookup: fetch all mints in parallel (capped at 20 to avoid spam)
  const batch = mints.slice(0, 20);
  const promises = batch.map(async (mint) => {
    try {
      const tokens = await searchTokens(mint);
      const match = tokens.find(
        (t) => t.address.toLowerCase() === mint.toLowerCase()
      );
      if (match) result.set(mint, match);
    } catch {
      // Skip failed lookups
    }
  });

  await Promise.allSettled(promises);
  return result;
}
