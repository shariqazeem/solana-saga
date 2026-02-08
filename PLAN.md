# Solana Saga - Jupiter Prediction Market Integration Plan

## Overview
Transform the app from custom Anchor program to Jupiter's real Prediction Market API while fixing the Jupiter Mobile wallet adapter QR code login.

## PHASE 1: Environment & Config (2 files)

### 1.1 Update `.env.example` and create `.env.local`
- Add `NEXT_PUBLIC_JUP_PREDICTION_API_KEY` for the Jupiter API key
- Change `NEXT_PUBLIC_SOLANA_NETWORK` to `mainnet-beta` (Jupiter Prediction is mainnet)
- Add `NEXT_PUBLIC_JUP_API_BASE_URL=https://api.jup.ag/prediction/v1`
- Keep REOWN_PROJECT_ID as-is

### 1.2 Update `lib/solana/config.ts`
- Add Jupiter API base URL and API key constants
- Switch default network to mainnet-beta

## PHASE 2: Jupiter Prediction API Service Layer (1 new file)

### 2.1 Create `lib/jupiter/jupiterPredictionApi.ts`
Type-safe API client covering all endpoints:

**Types** (matching Jupiter's OpenAPI schema exactly):
- `JupEvent`, `JupEventMetadata` - Event data
- `JupMarket`, `JupMarketMetadata`, `JupMarketPricing` - Market data
- `JupOrder`, `JupCreateOrderRequest`, `JupCreateOrderResponse` - Order flow
- `JupPosition` - Position tracking
- `JupProfile` - User profile stats
- `JupLeaderboardEntry` - Rankings
- `JupPagination` - Pagination

**API Functions** (all use `x-api-key` header):
- `fetchEvents(params)` → GET /events
- `searchEvents(query)` → GET /events/search
- `fetchEvent(eventId)` → GET /events/{eventId}
- `fetchEventMarkets(eventId)` → GET /events/{eventId}/markets
- `fetchMarket(marketId)` → GET /markets/{marketId}
- `createOrder(request)` → POST /orders (returns unsigned base64 tx)
- `closeOrder(orderPubkey, ownerPubkey)` → DELETE /orders
- `fetchOrders(ownerPubkey)` → GET /orders
- `fetchOrderStatus(orderPubkey)` → GET /orders/status/{orderPubkey}
- `fetchPositions(ownerPubkey)` → GET /positions
- `closePosition(positionPubkey, ownerPubkey, minSellPriceUsd)` → DELETE /positions/{positionPubkey}
- `fetchProfile(ownerPubkey)` → GET /profiles/{ownerPubkey}
- `fetchLeaderboards(period, metric, limit)` → GET /leaderboards
- `fetchTrades()` → GET /trades

## PHASE 3: New Hook - `useJupiterPrediction` (1 new file)

### 3.1 Create `hooks/useJupiterPrediction.ts`
This replaces `usePredictionMarkets` with a hook that:

**Returns the same interface** so UI components need minimal changes:
```ts
{
  markets: Market[],        // Adapted from Jupiter events/markets
  userBets: JupOrder[],     // From GET /orders?ownerPubkey=
  positions: JupPosition[], // From GET /positions?ownerPubkey=
  profile: JupProfile,      // From GET /profiles/{pubkey}
  loading, error,
  placeBet(marketId, isYes, amount),  // POST /orders + sign tx
  sellPosition(positionPubkey),       // DELETE /positions/{pubkey}
  refetch(),
  fetchLeaderboards(),
}
```

**Market adapter** - transforms Jupiter API data to existing Market interface:
```ts
// Jupiter Market → App Market interface
{
  publicKey: market.marketId,     // Use marketId as key
  id: 0,                          // Not needed for API
  question: market.metadata.title,
  description: market.metadata.description,
  category: event.category,
  creator: "",                     // Not applicable
  yesPool: 0,                     // Not in API (use pricing)
  noPool: 0,
  totalVolume: market.pricing.volume,
  isResolved: market.status === "closed",
  outcome: market.result === "yes" ? true : market.result === "no" ? false : null,
  endTime: market.closeTime,
  yesPrice: Math.round((market.pricing.buyYesPriceUsd || 0.5) * 100),
  noPrice: Math.round((market.pricing.buyNoPriceUsd || 0.5) * 100),
  yesMultiplier: `${(1 / (market.pricing.buyYesPriceUsd || 0.5)).toFixed(2)}x`,
  noMultiplier: `${(1 / (market.pricing.buyNoPriceUsd || 0.5)).toFixed(2)}x`,
  endsIn: calculateEndsIn(market.closeTime),
  bettors: 0,                     // Not in basic market data
  totalBetsCount: 0,
  status: market.status === "open" ? "Active" : "Resolved",
  // Event metadata for enriched UI
  eventTitle: event.metadata?.title,
  eventImage: event.metadata?.imageUrl,
  eventId: event.eventId,
  isLive: event.isLive,
  isTrending: event.isTrending,
  volume24h: market.pricing.volume24h,
  openInterest: market.pricing.openInterest,
  liquidityDollars: market.pricing.liquidityDollars,
}
```

**Order flow** (the critical part):
1. User picks YES/NO on a market
2. Calculate contracts from USD amount: `contracts = Math.floor(amount / buyPrice)`
3. POST /orders with `{ ownerPubkey, marketId, isYes, isBuy: true, contracts, maxBuyPriceUsd (in micro USD) }`
4. API returns `{ transaction: "base64...", txMeta: { blockhash, lastValidBlockHeight }, order: {...} }`
5. Deserialize the base64 transaction using `VersionedTransaction.deserialize()`
6. Sign with wallet adapter: `wallet.signTransaction(tx)`
7. Send raw transaction to Solana: `connection.sendRawTransaction()`
8. Confirm and poll order status: GET /orders/status/{orderPubkey}

**Important pricing note**: Jupiter uses **micro USD** (1 USD = 1,000,000 micro USD). Prices range from 10000 ($0.01) to 999999 ($0.99).

## PHASE 4: Fix Jupiter Mobile Wallet Adapter (2 files)

### 4.1 Update `providers/JupiterWalletProvider.tsx`
- Switch `env` from `"devnet"` to `"mainnet-beta"` (Jupiter Prediction is mainnet)
- Keep `enableWallets: true` but ensure QR code still shows
- Update metadata URLs to match production deployment

### 4.2 Update `providers/SmartWalletProvider.tsx`
- Remove the unused REOWN_PROJECT_ID check (it's hardcoded in JupiterWalletProvider anyway)
- Simplify to just wrap JupiterWalletProvider

## PHASE 5: Update UI Pages (4 files)

### 5.1 Update `app/page.tsx` (Main Arena)
- Import from `useJupiterPrediction` instead of `usePredictionMarkets`
- Replace `usdcBalance` checks with SOL balance (mainnet uses USDC/JupUSD via Jupiter)
- Update the hero section to mention Jupiter Prediction Markets
- Keep all gamification (streaks, confetti, sound effects)
- Add category filter tabs (crypto, sports, politics, esports, culture, economics, tech)
- Show event images from Jupiter API on cards
- Update "DEVNET" badge to "POWERED BY JUPITER"

### 5.2 Update `components/SwipeableMarketStack.tsx`
- Update Market type import
- Show event image as card background (from `event.metadata.imageUrl`)
- Show live/trending badges
- Display real liquidity and 24h volume
- Show pricing as YES: $0.XX / NO: $0.XX format
- Keep all gamepad/PSG1 controls unchanged

### 5.3 Update `app/my-bets/page.tsx` → Positions Page
- Show Jupiter positions instead of on-chain bets
- Display PnL (unrealized/realized) from position data
- Add "Sell Position" button using close position API
- Show order status (pending/filled/failed)

### 5.4 Update `app/leaderboard/page.tsx`
- Fetch from Jupiter's `/leaderboards` endpoint
- Show real PnL, volume, win rate
- Support period switching (all_time, weekly, monthly)
- Display global Jupiter prediction market rankings

### 5.5 Remove `app/admin/page.tsx`
- No longer needed - markets come from Jupiter API, not custom creation
- Replace with a "Browse Events" page or redirect to main

## PHASE 6: Remove Old Anchor Dependencies (cleanup)

### 6.1 Files to keep but stop importing:
- `lib/solana/hooks/usePredictionMarkets.ts` - keep as backup, no longer imported
- `lib/solana/idl/prediction_markets.json` - keep as backup
- `lib/gameMarkets.ts` - keep for game mode (/game route)
- `lib/gameCredits.ts` - keep for game mode

### 6.2 Update `app/game/page.tsx`
- Keep the free-play game mode as-is (uses local game credits, not real money)
- This gives users a way to try the app without risking real funds

## Key Implementation Details

### API Key Security
The API key goes in `NEXT_PUBLIC_JUP_PREDICTION_API_KEY` - it's a public API key meant for client-side use (Jupiter's API is designed this way, similar to how Polymarket works). The `x-api-key` header is passed with every request.

### Transaction Signing Flow (Most Critical)
```
POST /orders → base64 transaction
  ↓
Buffer.from(base64, 'base64')
  ↓
VersionedTransaction.deserialize(buffer)
  ↓
wallet.signTransaction(tx)
  ↓
connection.sendRawTransaction(tx.serialize())
  ↓
connection.confirmTransaction(signature)
  ↓
Poll GET /orders/status/{orderPubkey} until filled
```

### Micro USD Conversion
- API uses micro USD: 1 USD = 1,000,000
- Price $0.65 = 650000 micro USD
- To buy $10 of YES at $0.65: contracts = floor(10 / 0.65) = 15 contracts
- maxBuyPriceUsd = 650000 (micro USD)
- depositAmount = 10000000 (10 USDC in 6 decimals)

### Network Change
- Switching from devnet to mainnet-beta
- This means real USDC, not devnet USDC
- Users need real SOL for gas and real USDC for trading

## File Change Summary

| File | Action | Description |
|------|--------|-------------|
| `frontend/.env.example` | EDIT | Add JUP API key, change to mainnet |
| `frontend/.env.local` | CREATE | Actual env with API key |
| `frontend/lib/solana/config.ts` | EDIT | Add Jupiter config |
| `frontend/lib/jupiter/jupiterPredictionApi.ts` | CREATE | Full API client |
| `frontend/hooks/useJupiterPrediction.ts` | CREATE | Main hook replacing Anchor |
| `frontend/providers/JupiterWalletProvider.tsx` | EDIT | Fix QR + mainnet |
| `frontend/providers/SmartWalletProvider.tsx` | EDIT | Simplify |
| `frontend/app/page.tsx` | EDIT | Use new hook + Jupiter UI |
| `frontend/components/SwipeableMarketStack.tsx` | EDIT | Jupiter market data |
| `frontend/app/my-bets/page.tsx` | EDIT | Show positions |
| `frontend/app/leaderboard/page.tsx` | EDIT | Jupiter leaderboards |
| `frontend/app/markets/page.tsx` | EDIT | Browse Jupiter events |
| `frontend/app/admin/page.tsx` | DELETE/REPLACE | No longer needed |

## Implementation Order
1. Phase 1 (Config) → Phase 2 (API Client) → Phase 3 (Hook) → Phase 4 (Wallet Fix) → Phase 5 (UI) → Phase 6 (Cleanup)
2. After each phase, test that the app still builds with `npm run build`
3. Final test: connect wallet, browse events, place order, check position
