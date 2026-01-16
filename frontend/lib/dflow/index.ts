/**
 * DFlow Integration Module
 *
 * Provides access to Kalshi prediction markets via DFlow's tokenization layer.
 * Part of Jupiter Track submission for Play Solana Hackathon.
 */

// API Client
export { dflowApi, DFlowApiClient } from "./api";
export type {
  DFlowEvent,
  DFlowMarket,
  DFlowOrderbook,
  DFlowTrade,
  DFlowCandlestick,
  PaginatedResponse,
} from "./api";

// Market Transformation
export {
  transformDFlowMarket,
  transformDFlowMarkets,
  fetchFeaturedMarkets,
  fetchMarketsByCategory,
  searchMarkets,
  isDFlowMarket,
  getDFlowTicker,
} from "./transform";

// Trading
export { dflowTrade, DFlowTradeClient, placeDFlowBet, claimDFlowWinnings } from "./trading";
export type {
  TradeQuote,
  TradeIntent,
  TradeResult,
  Position,
  RedemptionResult,
} from "./trading";

// React Hook
export { useDFlowMarkets } from "./useDFlowMarkets";
export type { DFlowMarketsHook } from "./useDFlowMarkets";
