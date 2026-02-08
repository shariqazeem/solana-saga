import { JUP_API_BASE_URL, JUP_API_KEY } from "@/lib/solana/config";

// ============================================================
// TYPES - Match Jupiter Prediction Market OpenAPI Schema
// ============================================================

export interface JupPagination {
  start: number;
  end: number;
  total: number;
  hasNext: boolean;
}

export interface JupEventMetadata {
  eventId: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  isLive?: boolean;
}

export interface JupMarketMetadata {
  marketId: string;
  title?: string;
  subtitle?: string;
  description?: string;
  status?: string;
  result?: string;
  closeTime?: number;
  openTime?: number;
  settlementTime?: number;
  isTradable?: boolean;
  rulesPrimary?: string;
  rulesSecondary?: string;
  eventId?: string;
}

export interface JupMarketPricing {
  buyYesPriceUsd: number | null;
  buyNoPriceUsd: number | null;
  sellYesPriceUsd: number | null;
  sellNoPriceUsd: number | null;
  volume: number;
  openInterest: number;
  volume24h: number;
  liquidityDollars: number;
  notionalValueDollars: number;
}

export interface JupMarket {
  marketId: string;
  event: string;
  status: "open" | "closed" | "cancelled";
  result: "" | "pending" | "yes" | "no";
  openTime: number;
  closeTime: number;
  settlementTime: number;
  metadata?: JupMarketMetadata;
  pricing?: JupMarketPricing;
}

export interface JupEvent {
  eventId: string;
  series: string;
  winner: string;
  multipleWinners: boolean;
  isActive: boolean;
  isLive: boolean;
  isTrending: boolean;
  isRecommended: boolean;
  category: string;
  subcategory: string;
  metadata?: JupEventMetadata;
  markets?: JupMarket[];
  tvlDollars: string;
  volumeUsd: string;
  closeCondition: string;
  beginAt: string | null;
  rulesPdf: string;
}

export interface JupOrder {
  pubkey: string;
  owner: string;
  ownerPubkey: string;
  market: string;
  marketId: string;
  marketIdHash: string;
  eventId: string;
  position: string;
  status: "pending" | "filled" | "failed";
  isYes: boolean;
  isBuy: boolean;
  createdAt: number;
  updatedAt: number;
  contracts: string;
  maxFillPriceUsd: string;
  maxBuyPriceUsd: string | null;
  minSellPriceUsd: string | null;
  filledAt: number;
  filledContracts: string;
  avgFillPriceUsd: string;
  settled: boolean;
  orderId: string;
  sizeUsd: string;
  eventMetadata?: JupEventMetadata;
  marketMetadata?: JupMarketMetadata;
  externalOrderId: string;
  bump: number;
}

export interface JupCreateOrderRequest {
  ownerPubkey: string;
  marketId: string;
  isYes: boolean;
  isBuy: boolean;
  contracts: number | string;
  maxBuyPriceUsd?: number | string;
  minSellPriceUsd?: number | string;
  depositAmount?: number | string;
  depositMint?: string;
}

export interface JupCreateOrderResponse {
  transaction: string | null;
  txMeta: {
    blockhash: string;
    lastValidBlockHeight: number;
  } | null;
  externalOrderId: string | null;
  order: {
    orderPubkey: string | null;
    orderAtaPubkey: string | null;
    userPubkey: string;
    marketId: string;
    marketIdHash: string;
    positionPubkey: string;
    isBuy: boolean;
    isYes: boolean;
    contracts: string;
    newContracts: string;
    maxBuyPriceUsd: string | null;
    minSellPriceUsd: string | null;
    externalOrderId: string | null;
    orderCostUsd: string;
    newAvgPriceUsd: string;
    newSizeUsd: string;
    newPayoutUsd: string;
    estimatedProtocolFeeUsd: string;
    estimatedVenueFeeUsd: string;
    estimatedTotalFeeUsd: string;
  };
}

export interface JupOrderStatus {
  orderPubkey: string;
  status: string;
  latestEventType: string;
  latestSignature: string;
  externalOrderId: string;
  orderId: string;
  history: Array<{
    eventType: string;
    status: string;
    rawStatus: string;
    timestamp: number;
    signature: string;
    externalOrderId: string;
    orderId: string;
  }>;
}

export interface JupPosition {
  pubkey: string;
  owner: string;
  ownerPubkey: string;
  market: string;
  marketId: string;
  marketIdHash: string;
  isYes: boolean;
  contracts: string;
  totalCostUsd: string;
  sizeUsd: string;
  valueUsd: string | null;
  avgPriceUsd: string;
  markPriceUsd: string | null;
  sellPriceUsd: string | null;
  pnlUsd: string | null;
  pnlUsdPercent: number | null;
  pnlUsdAfterFees: string | null;
  pnlUsdAfterFeesPercent: number | null;
  openOrders: number;
  feesPaidUsd: string;
  realizedPnlUsd: number;
  claimed: boolean;
  claimedUsd: string;
  openedAt: number;
  updatedAt: number;
  claimableAt: number | null;
  payoutUsd: string;
  bump: number;
  eventId: string;
  eventMetadata?: JupEventMetadata;
  marketMetadata?: JupMarketMetadata;
  settlementDate: number | null;
  claimable: boolean;
}

export interface JupProfile {
  ownerPubkey: string;
  realizedPnlUsd: string;
  totalVolumeUsd: string;
  predictionsCount: string;
  correctPredictions: string;
  wrongPredictions: string;
  totalActiveContracts: string;
  totalPositionsValueUsd: string;
}

export interface JupLeaderboardEntry {
  ownerPubkey: string;
  realizedPnlUsd: string;
  totalVolumeUsd: string;
  predictionsCount: number;
  correctPredictions: number;
  wrongPredictions: number;
  winRatePct: string;
  period: string;
  periodStart: string | null;
  periodEnd: string | null;
}

export interface JupLeaderboardSummary {
  all_time: { totalVolumeUsd: string; predictionsCount: number };
  weekly: { totalVolumeUsd: string; predictionsCount: number };
  monthly: { totalVolumeUsd: string; predictionsCount: number };
}

export interface JupTrade {
  id: number;
  ownerPubkey: string;
  marketId: string;
  message: string;
  timestamp: number;
  action: "buy" | "sell";
  side: "yes" | "no";
  eventTitle: string;
  marketTitle: string;
  amountUsd: string;
  priceUsd: string;
  eventImageUrl: string;
  eventId: string;
}

export interface JupCloseOrderResponse {
  blockhash: string;
  transaction: string;
  latestBlockhash: string;
  lastValidBlockHeight: number;
  requiredSigners: string[];
  computeUnits: number;
  orderPubkey: string;
  accounts: {
    owner: string;
    authority: string;
    vault: string;
    marketId: string;
    position: string;
    order: string;
    orderAta: string;
    ownerTokenAccount: string;
    settlementMint: string;
  };
}

// ============================================================
// API ERROR
// ============================================================

export interface JupApiError {
  type: string;
  message: string;
  code?: string;
  param?: string;
  request_id: string;
  doc_url?: string;
}

class JupiterApiError extends Error {
  code?: string;
  requestId: string;

  constructor(error: JupApiError) {
    super(error.message);
    this.name = "JupiterApiError";
    this.code = error.code;
    this.requestId = error.request_id;
  }
}

// ============================================================
// API CLIENT
// ============================================================

const headers = (): HeadersInit => ({
  "Content-Type": "application/json",
  "x-api-key": JUP_API_KEY,
});

async function jupFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${JUP_API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...headers(), ...options?.headers },
  });

  if (!res.ok) {
    let errorData: JupApiError;
    try {
      errorData = await res.json();
    } catch {
      throw new Error(`Jupiter API error: ${res.status} ${res.statusText}`);
    }
    throw new JupiterApiError(errorData);
  }

  return res.json();
}

// ============================================================
// EVENTS
// ============================================================

export interface FetchEventsParams {
  provider?: "kalshi" | "polymarket";
  includeMarkets?: boolean;
  start?: number;
  end?: number;
  category?: "all" | "crypto" | "sports" | "politics" | "esports" | "culture" | "economics" | "tech";
  subcategory?: string;
  sortBy?: "volume" | "beginAt";
  sortDirection?: "asc" | "desc";
  filter?: "new" | "live" | "trending";
}

export async function fetchEvents(
  params: FetchEventsParams = {}
): Promise<{ data: JupEvent[]; pagination: JupPagination }> {
  const searchParams = new URLSearchParams();

  if (params.provider) searchParams.set("provider", params.provider);
  if (params.includeMarkets) searchParams.set("includeMarkets", "true");
  if (params.start !== undefined) searchParams.set("start", String(params.start));
  if (params.end !== undefined) searchParams.set("end", String(params.end));
  if (params.category) searchParams.set("category", params.category);
  if (params.subcategory) searchParams.set("subcategory", params.subcategory);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortDirection) searchParams.set("sortDirection", params.sortDirection);
  if (params.filter) searchParams.set("filter", params.filter);

  const qs = searchParams.toString();
  return jupFetch(`/events${qs ? `?${qs}` : ""}`);
}

export async function searchEvents(
  query: string,
  limit?: number,
  provider?: "kalshi" | "polymarket"
): Promise<{ data: JupEvent[] }> {
  const searchParams = new URLSearchParams({ query });
  if (limit) searchParams.set("limit", String(limit));
  if (provider) searchParams.set("provider", provider);

  return jupFetch(`/events/search?${searchParams}`);
}

export async function fetchEvent(
  eventId: string,
  includeMarkets?: boolean
): Promise<JupEvent> {
  const qs = includeMarkets ? "?includeMarkets=true" : "";
  return jupFetch(`/events/${encodeURIComponent(eventId)}${qs}`);
}

export async function fetchSuggestedEvents(
  pubkey: string,
  provider?: "kalshi" | "polymarket"
): Promise<{ data: JupEvent[] }> {
  const qs = provider ? `?provider=${provider}` : "";
  return jupFetch(`/events/suggested/${encodeURIComponent(pubkey)}${qs}`);
}

// ============================================================
// MARKETS
// ============================================================

export async function fetchEventMarkets(
  eventId: string,
  start?: number,
  end?: number
): Promise<{ data: JupMarket[]; pagination: JupPagination }> {
  const searchParams = new URLSearchParams();
  if (start !== undefined) searchParams.set("start", String(start));
  if (end !== undefined) searchParams.set("end", String(end));

  const qs = searchParams.toString();
  return jupFetch(`/events/${encodeURIComponent(eventId)}/markets${qs ? `?${qs}` : ""}`);
}

export async function fetchMarket(marketId: string): Promise<JupMarket> {
  return jupFetch(`/markets/${encodeURIComponent(marketId)}`);
}

// ============================================================
// ORDERS
// ============================================================

export async function fetchOrders(
  ownerPubkey?: string,
  start?: number,
  end?: number
): Promise<{ data: JupOrder[]; pagination: JupPagination }> {
  const searchParams = new URLSearchParams();
  if (ownerPubkey) searchParams.set("ownerPubkey", ownerPubkey);
  if (start !== undefined) searchParams.set("start", String(start));
  if (end !== undefined) searchParams.set("end", String(end));

  const qs = searchParams.toString();
  return jupFetch(`/orders${qs ? `?${qs}` : ""}`);
}

export async function fetchOrder(orderPubkey: string): Promise<JupOrder> {
  return jupFetch(`/orders/${encodeURIComponent(orderPubkey)}`);
}

export async function fetchOrderStatus(orderPubkey: string): Promise<JupOrderStatus> {
  return jupFetch(`/orders/status/${encodeURIComponent(orderPubkey)}`);
}

export async function createOrder(
  request: JupCreateOrderRequest
): Promise<JupCreateOrderResponse> {
  return jupFetch("/orders", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function closeOrder(
  orderPubkey: string,
  ownerPubkey: string
): Promise<JupCloseOrderResponse> {
  return jupFetch("/orders", {
    method: "DELETE",
    body: JSON.stringify({ orderPubkey, ownerPubkey }),
  });
}

export async function closeAllOrders(
  ownerPubkey: string,
  statuses?: ("pending" | "filled" | "failed")[]
): Promise<{ data: JupCloseOrderResponse[] }> {
  return jupFetch("/orders/close-all", {
    method: "DELETE",
    body: JSON.stringify({ ownerPubkey, statuses }),
  });
}

// ============================================================
// POSITIONS
// ============================================================

export async function fetchPositions(
  ownerPubkey?: string,
  marketId?: string,
  isYes?: boolean,
  start?: number,
  end?: number
): Promise<{ data: JupPosition[]; pagination: JupPagination }> {
  const searchParams = new URLSearchParams();
  if (ownerPubkey) searchParams.set("ownerPubkey", ownerPubkey);
  if (marketId) searchParams.set("marketId", marketId);
  if (isYes !== undefined) searchParams.set("isYes", String(isYes));
  if (start !== undefined) searchParams.set("start", String(start));
  if (end !== undefined) searchParams.set("end", String(end));

  const qs = searchParams.toString();
  return jupFetch(`/positions${qs ? `?${qs}` : ""}`);
}

export async function closePosition(
  positionPubkey: string,
  ownerPubkey: string,
  minSellPriceUsd: number | string
): Promise<JupCreateOrderResponse> {
  return jupFetch(`/positions/${encodeURIComponent(positionPubkey)}`, {
    method: "DELETE",
    body: JSON.stringify({ ownerPubkey, minSellPriceUsd }),
  });
}

export async function closeAllPositions(
  ownerPubkey: string,
  minSellPriceSlippageBps: number
): Promise<{ data: (JupCreateOrderResponse | { transaction: string; txMeta: { blockhash: string; lastValidBlockHeight: number }; position: any })[] }> {
  return jupFetch("/positions", {
    method: "DELETE",
    body: JSON.stringify({ ownerPubkey, minSellPriceSlippageBps }),
  });
}

// ============================================================
// PROFILE & SOCIAL
// ============================================================

export async function fetchProfile(ownerPubkey: string): Promise<JupProfile> {
  return jupFetch(`/profiles/${encodeURIComponent(ownerPubkey)}`);
}

export async function fetchPnlHistory(
  ownerPubkey: string,
  interval?: "24h" | "1w" | "1m",
  count?: number
): Promise<{ ownerPubkey: string; history: Array<{ timestamp: number; realizedPnlUsd: string }> }> {
  const searchParams = new URLSearchParams();
  if (interval) searchParams.set("interval", interval);
  if (count) searchParams.set("count", String(count));

  const qs = searchParams.toString();
  return jupFetch(`/profiles/${encodeURIComponent(ownerPubkey)}/pnl-history${qs ? `?${qs}` : ""}`);
}

export async function fetchLeaderboards(
  period?: "all_time" | "weekly" | "monthly",
  metric?: "pnl" | "volume" | "win_rate",
  limit?: number
): Promise<{ data: JupLeaderboardEntry[]; summary: JupLeaderboardSummary }> {
  const searchParams = new URLSearchParams();
  if (period) searchParams.set("period", period);
  if (metric) searchParams.set("metric", metric);
  if (limit) searchParams.set("limit", String(limit));

  const qs = searchParams.toString();
  return jupFetch(`/leaderboards${qs ? `?${qs}` : ""}`);
}

// ============================================================
// TRADES
// ============================================================

export async function fetchTrades(): Promise<{ data: JupTrade[] }> {
  return jupFetch("/trades");
}

// ============================================================
// HELPERS
// ============================================================

/** Convert micro USD string to display dollars */
export function microUsdToDollars(microUsd: string | number): number {
  const val = typeof microUsd === "string" ? parseInt(microUsd, 10) : microUsd;
  return val / 1_000_000;
}

/** Convert dollars to micro USD */
export function dollarsToMicroUsd(dollars: number): number {
  return Math.round(dollars * 1_000_000);
}

/** Convert a price (0-1) to micro USD */
export function priceToMicroUsd(price: number): number {
  return Math.round(price * 1_000_000);
}

/** Calculate time remaining string from unix timestamp */
export function calculateEndsIn(closeTime: number): string {
  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = closeTime - now;

  if (secondsLeft < 0) return "Ended";

  const days = Math.floor(secondsLeft / 86400);
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor(secondsLeft / 60);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return "Soon";
}
