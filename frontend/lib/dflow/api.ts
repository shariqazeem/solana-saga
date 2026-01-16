/**
 * DFlow Prediction Markets API Client
 *
 * Connects to DFlow's API to fetch Kalshi prediction markets as SPL tokens on Solana.
 * Part of Jupiter Track submission for Play Solana Hackathon.
 *
 * API Reference: https://pond.dflow.net/prediction-market-metadata-api-reference/introduction
 */

import { DFLOW_API_BASE } from "../solana/config";

// ============================================================================
// Types
// ============================================================================

export interface DFlowEvent {
  event_ticker: string;
  series_ticker: string;
  title: string;
  subtitle?: string;
  category: string;
  mutually_exclusive: boolean;
  open_time: string;
  close_time: string;
  expiration_time?: string;
  expected_expiration_time?: string;
  status: "open" | "closed" | "settled";
  markets?: DFlowMarket[];
}

export interface DFlowMarket {
  ticker: string;
  event_ticker: string;
  subtitle?: string;
  yes_sub_title?: string;
  no_sub_title?: string;
  open_time: string;
  close_time: string;
  expiration_time?: string;
  status: "open" | "closed" | "settled";
  result?: "yes" | "no" | null;
  yes_bid?: number;
  yes_ask?: number;
  no_bid?: number;
  no_ask?: number;
  last_price?: number;
  volume?: number;
  volume_24h?: number;
  open_interest?: number;
  liquidity?: number;
  // SPL Token mints for YES/NO positions
  yes_outcome_mint?: string;
  no_outcome_mint?: string;
  ledger_mint?: string;
}

export interface DFlowOrderbook {
  market_ticker: string;
  bids: Array<{ price: number; quantity: number }>;
  asks: Array<{ price: number; quantity: number }>;
}

export interface DFlowTrade {
  id: string;
  market_ticker: string;
  side: "yes" | "no";
  price: number;
  quantity: number;
  created_at: string;
}

export interface DFlowCandlestick {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Pagination response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  cursor?: string;
  has_more: boolean;
}

// ============================================================================
// API Client
// ============================================================================

class DFlowApiClient {
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 30000; // 30 seconds cache

  constructor(baseUrl: string = DFLOW_API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data as T;
    }

    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[DFlow API] Fetching: ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DFlow API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data as T;
  }

  // ============================================================================
  // Events API
  // ============================================================================

  /**
   * Get all events with pagination
   */
  async getEvents(params?: {
    status?: "open" | "closed" | "settled";
    series_ticker?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<DFlowEvent>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.series_ticker) searchParams.set("series_ticker", params.series_ticker);
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.fetch<PaginatedResponse<DFlowEvent>>(
      `/api/v1/events${query ? `?${query}` : ""}`
    );
  }

  /**
   * Get a single event by ticker
   */
  async getEvent(eventTicker: string, includeMarkets = true): Promise<DFlowEvent> {
    return this.fetch<DFlowEvent>(
      `/api/v1/event/${eventTicker}${includeMarkets ? "?with_markets=true" : ""}`
    );
  }

  // ============================================================================
  // Markets API
  // ============================================================================

  /**
   * Get all markets with pagination
   */
  async getMarkets(params?: {
    status?: "open" | "closed" | "settled";
    event_ticker?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<DFlowMarket>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.event_ticker) searchParams.set("event_ticker", params.event_ticker);
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.fetch<PaginatedResponse<DFlowMarket>>(
      `/api/v1/markets${query ? `?${query}` : ""}`
    );
  }

  /**
   * Get a single market by ticker
   */
  async getMarket(marketTicker: string): Promise<DFlowMarket> {
    return this.fetch<DFlowMarket>(`/api/v1/market/${marketTicker}`);
  }

  /**
   * Get market by mint address (YES or NO outcome mint)
   */
  async getMarketByMint(mintAddress: string): Promise<DFlowMarket> {
    return this.fetch<DFlowMarket>(`/api/v1/market/by-mint/${mintAddress}`);
  }

  /**
   * Batch lookup markets (max 100)
   */
  async getMarketsBatch(tickers: string[]): Promise<DFlowMarket[]> {
    if (tickers.length > 100) {
      throw new Error("Maximum 100 markets per batch request");
    }

    return this.fetch<DFlowMarket[]>("/api/v1/markets/batch", {
      method: "POST",
      body: JSON.stringify({ tickers }),
    });
  }

  /**
   * Get all outcome mints (YES/NO SPL token addresses)
   */
  async getOutcomeMints(params?: {
    since?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<{ market_ticker: string; yes_mint: string; no_mint: string }>> {
    const searchParams = new URLSearchParams();
    if (params?.since) searchParams.set("since", params.since);
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.fetch(`/api/v1/outcome_mints${query ? `?${query}` : ""}`);
  }

  // ============================================================================
  // Orderbook API
  // ============================================================================

  /**
   * Get orderbook for a market
   */
  async getOrderbook(marketTicker: string): Promise<DFlowOrderbook> {
    return this.fetch<DFlowOrderbook>(`/api/v1/orderbook/${marketTicker}`);
  }

  /**
   * Get orderbook by mint address
   */
  async getOrderbookByMint(mintAddress: string): Promise<DFlowOrderbook> {
    return this.fetch<DFlowOrderbook>(`/api/v1/orderbook/by-mint/${mintAddress}`);
  }

  // ============================================================================
  // Trades API
  // ============================================================================

  /**
   * Get trades for all markets
   */
  async getTrades(params?: {
    market_ticker?: string;
    min_ts?: string;
    max_ts?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<DFlowTrade>> {
    const searchParams = new URLSearchParams();
    if (params?.market_ticker) searchParams.set("market_ticker", params.market_ticker);
    if (params?.min_ts) searchParams.set("min_ts", params.min_ts);
    if (params?.max_ts) searchParams.set("max_ts", params.max_ts);
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.fetch<PaginatedResponse<DFlowTrade>>(
      `/api/v1/trades${query ? `?${query}` : ""}`
    );
  }

  // ============================================================================
  // Candlesticks API
  // ============================================================================

  /**
   * Get candlesticks for a market
   */
  async getCandlesticks(
    marketTicker: string,
    params?: { interval?: string; limit?: number }
  ): Promise<DFlowCandlestick[]> {
    const searchParams = new URLSearchParams();
    if (params?.interval) searchParams.set("interval", params.interval);
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.fetch<DFlowCandlestick[]>(
      `/api/v1/market/${marketTicker}/candlesticks${query ? `?${query}` : ""}`
    );
  }

  // ============================================================================
  // Series API
  // ============================================================================

  /**
   * Get all series (market categories/groups)
   */
  async getSeries(): Promise<Array<{ ticker: string; title: string; frequency?: string }>> {
    return this.fetch("/api/v1/series");
  }

  // ============================================================================
  // Tags & Categories API
  // ============================================================================

  /**
   * Get all tags organized by categories
   */
  async getTagsByCategories(): Promise<Record<string, string[]>> {
    return this.fetch("/api/v1/tags_by_categories");
  }

  // ============================================================================
  // Search API
  // ============================================================================

  /**
   * Search for events and markets
   */
  async search(query: string): Promise<{
    events: DFlowEvent[];
    markets: DFlowMarket[];
  }> {
    return this.fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get featured/trending markets (custom logic)
   */
  async getFeaturedMarkets(limit = 20): Promise<DFlowMarket[]> {
    const response = await this.getMarkets({ status: "open", limit });

    // Sort by volume and liquidity for "featured" effect
    return response.data
      .filter(m => m.volume && m.volume > 0)
      .sort((a, b) => (b.volume_24h || 0) - (a.volume_24h || 0))
      .slice(0, limit);
  }

  /**
   * Get markets by category
   */
  async getMarketsByCategory(category: string, limit = 20): Promise<DFlowMarket[]> {
    const events = await this.getEvents({ status: "open" });
    const categoryEvents = events.data.filter(
      e => e.category.toLowerCase() === category.toLowerCase()
    );

    const markets: DFlowMarket[] = [];
    for (const event of categoryEvents.slice(0, 10)) {
      if (event.markets) {
        markets.push(...event.markets);
      } else {
        const fullEvent = await this.getEvent(event.event_ticker);
        if (fullEvent.markets) {
          markets.push(...fullEvent.markets);
        }
      }
      if (markets.length >= limit) break;
    }

    return markets.slice(0, limit);
  }
}

// Export singleton instance
export const dflowApi = new DFlowApiClient();

// Export class for custom instances
export { DFlowApiClient };
