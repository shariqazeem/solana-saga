import { useState, useEffect, useCallback, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import {
  fetchEvents,
  fetchPositions,
  fetchOrders,
  fetchProfile,
  fetchLeaderboards,
  createOrder,
  closePosition as apiClosePosition,
  claimPayout as apiClaimPayout,
  fetchOrderStatus,
  type JupEvent,
  type JupMarket,
  type JupPosition,
  type JupOrder,
  type JupProfile,
  type JupLeaderboardEntry,
  type JupLeaderboardSummary,
  type FetchEventsParams,
  calculateEndsIn,
  microUsdToDollars,
  dollarsToMicroUsd,
  priceToMicroUsd,
} from "@/lib/jupiter/jupiterPredictionApi";

// ============================================================
// Market interface compatible with existing UI components
// ============================================================

export interface Market {
  publicKey: string; // marketId
  id: number;
  question: string;
  description: string;
  category: string;
  creator: string;
  yesPool: number;
  noPool: number;
  totalVolume: number;
  isResolved: boolean;
  outcome: boolean | null;
  endTime: number;
  createdAt: number;
  yesPrice: number;
  noPrice: number;
  yesMultiplier: string;
  noMultiplier: string;
  endsIn: string;
  bettors: number;
  totalBetsCount: number;
  status: string;
  // Jupiter-specific enrichments
  eventId: string;
  eventTitle: string;
  eventImage: string;
  isLive: boolean;
  isTrending: boolean;
  volume24h: number;
  openInterest: number;
  liquidityDollars: number;
  buyYesPrice: number;
  buyNoPrice: number;
  // Keep old fields for compatibility
  resolutionProposer: null;
  resolutionBond: number;
  challengeDeadline: null;
  isFinalized: boolean;
}

// ============================================================
// Transform Jupiter API data to Market interface
// ============================================================

function transformToMarket(market: JupMarket, event: JupEvent): Market {
  // API returns prices in micro USD (e.g. 290000 = $0.29)
  const rawBuyYes = market.pricing?.buyYesPriceUsd ?? 500000;
  const rawBuyNo = market.pricing?.buyNoPriceUsd ?? 500000;
  const buyYes = rawBuyYes / 1_000_000; // Convert micro USD to dollars
  const buyNo = rawBuyNo / 1_000_000;
  const yesPercent = Math.round(buyYes * 100);
  const noPercent = Math.round(buyNo * 100);

  // Multiplier = 1 / price (what you get per $1 bet if you win $1 per contract)
  const yesMultiplier = buyYes > 0 ? (1 / buyYes).toFixed(2) : "2.00";
  const noMultiplier = buyNo > 0 ? (1 / buyNo).toFixed(2) : "2.00";

  // Volume is also in micro USD
  const volumeDollars = microUsdToDollars(market.pricing?.volume || 0);

  // Build a readable question: combine event title + market title
  // e.g. Event: "Who will Trump nominate as Fed Chair?" + Market: "Kevin Warsh"
  // → "Who will Trump nominate as Fed Chair? — Kevin Warsh"
  const eventTitle = event.metadata?.title || "";
  const marketTitle = market.metadata?.title || "";
  let question: string;
  if (eventTitle && marketTitle && eventTitle !== marketTitle) {
    question = `${eventTitle} — ${marketTitle}`;
  } else {
    question = marketTitle || eventTitle || "Untitled Market";
  }

  return {
    publicKey: market.marketId,
    id: 0,
    question,
    description: market.metadata?.description || market.metadata?.subtitle || "",
    category: event.category || "other",
    creator: "",
    yesPool: 0,
    noPool: 0,
    totalVolume: volumeDollars,
    isResolved: market.status === "closed",
    outcome:
      market.result === "yes" ? true : market.result === "no" ? false : null,
    endTime: market.closeTime,
    createdAt: market.openTime,
    yesPrice: yesPercent,
    noPrice: noPercent,
    yesMultiplier: `${yesMultiplier}x`,
    noMultiplier: `${noMultiplier}x`,
    endsIn: calculateEndsIn(market.closeTime),
    bettors: 0,
    totalBetsCount: 0,
    status:
      market.status === "open"
        ? "Active"
        : market.status === "closed"
        ? "Resolved"
        : "Cancelled",
    // Jupiter enrichments
    eventId: event.eventId,
    eventTitle: event.metadata?.title || "",
    eventImage: event.metadata?.imageUrl || "",
    isLive: event.isLive,
    isTrending: event.isTrending,
    volume24h: microUsdToDollars(market.pricing?.volume24h || 0),
    openInterest: microUsdToDollars(market.pricing?.openInterest || 0),
    liquidityDollars: microUsdToDollars(market.pricing?.liquidityDollars || 0),
    buyYesPrice: buyYes,
    buyNoPrice: buyNo,
    // Compat
    resolutionProposer: null,
    resolutionBond: 0,
    challengeDeadline: null,
    isFinalized: false,
  };
}

// ============================================================
// HOOK
// ============================================================

export type EventCategory = "all" | "crypto" | "sports" | "politics" | "esports" | "culture" | "economics" | "tech";

export function useJupiterPrediction() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [markets, setMarkets] = useState<Market[]>([]);
  const [events, setEvents] = useState<JupEvent[]>([]);
  const [positions, setPositions] = useState<JupPosition[]>([]);
  const [orders, setOrders] = useState<JupOrder[]>([]);
  const [profile, setProfile] = useState<JupProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<EventCategory>("all");

  // Prevent duplicate order submissions
  const pendingOrderRef = useRef<Set<string>>(new Set());

  // --------------------------------------------------------
  // Fetch events and flatten into markets
  // --------------------------------------------------------
  // Track if initial load has completed
  const initialLoadDoneRef = useRef(false);

  const fetchMarkets = useCallback(
    async (params?: FetchEventsParams) => {
      try {
        // Only show loading spinner on initial load, not auto-refresh
        if (!initialLoadDoneRef.current) {
          setLoading(true);
        }
        setError(null);

        const effectiveParams: FetchEventsParams = {
          includeMarkets: true,
          sortBy: "volume",
          sortDirection: "desc",
          end: 50,
          ...params,
          category: (params?.category || category) === "all" ? undefined : (params?.category || category) as any,
        };

        const result = await fetchEvents(effectiveParams);
        setEvents(result.data);

        // Flatten: each event has multiple markets, create Market for each
        const allMarkets: Market[] = [];
        for (const event of result.data) {
          if (!event.markets) continue;
          for (const market of event.markets) {
            if (market.status === "open") {
              allMarkets.push(transformToMarket(market, event));
            }
          }
        }

        setMarkets(allMarkets);
        initialLoadDoneRef.current = true;
      } catch (err: any) {
        console.error("Error fetching Jupiter events:", err);
        setError(err.message || "Failed to fetch markets");
      } finally {
        setLoading(false);
      }
    },
    [category]
  );

  // --------------------------------------------------------
  // Fetch user positions
  // --------------------------------------------------------
  const fetchUserPositions = useCallback(async () => {
    if (!wallet.publicKey) return;

    try {
      const result = await fetchPositions(wallet.publicKey.toBase58());
      setPositions(result.data);
    } catch (err: any) {
      console.error("Error fetching positions:", err);
    }
  }, [wallet.publicKey]);

  // --------------------------------------------------------
  // Fetch user orders
  // --------------------------------------------------------
  const fetchUserOrders = useCallback(async () => {
    if (!wallet.publicKey) return;

    try {
      const result = await fetchOrders(wallet.publicKey.toBase58());
      setOrders(result.data);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
    }
  }, [wallet.publicKey]);

  // --------------------------------------------------------
  // Fetch user profile
  // --------------------------------------------------------
  const fetchUserProfile = useCallback(async () => {
    if (!wallet.publicKey) return;

    try {
      const result = await fetchProfile(wallet.publicKey.toBase58());
      setProfile(result);
    } catch (err: any) {
      // Profile might not exist yet for new users
      if (!err.message?.includes("not found")) {
        console.error("Error fetching profile:", err);
      }
    }
  }, [wallet.publicKey]);

  // --------------------------------------------------------
  // Place a bet (create order + sign + submit)
  // --------------------------------------------------------
  const placeBet = useCallback(
    async (
      marketId: string,
      prediction: boolean,
      amountUsd: number
    ): Promise<string> => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected");
      }

      const orderId = `${marketId}-${Date.now()}`;
      if (pendingOrderRef.current.has(orderId)) {
        throw new Error("Order already pending");
      }
      pendingOrderRef.current.add(orderId);

      try {
        // Find the market to get current pricing
        const market = markets.find((m) => m.publicKey === marketId);
        if (!market) throw new Error("Market not found");

        const buyPrice = prediction ? market.buyYesPrice : market.buyNoPrice;
        if (!buyPrice || buyPrice <= 0) throw new Error("Market price unavailable");

        // Calculate contracts: how many $1 contracts can we buy at this price
        const contracts = Math.floor(amountUsd / buyPrice);
        if (contracts < 1) throw new Error("Amount too small for even 1 contract");

        // maxBuyPriceUsd in micro USD - add 5% slippage for volatile markets
        const maxBuyPriceMicro = priceToMicroUsd(Math.min(buyPrice * 1.05, 0.99));

        console.log("[Jupiter Order]", {
          marketId,
          isYes: prediction,
          contracts,
          buyPrice,
          maxBuyPriceMicro,
          amountUsd,
        });

        // 1. Request unsigned transaction from Jupiter API
        const orderResponse = await createOrder({
          ownerPubkey: wallet.publicKey.toBase58(),
          marketId,
          isYes: prediction,
          isBuy: true,
          contracts,
          maxBuyPriceUsd: maxBuyPriceMicro,
        });

        if (!orderResponse.transaction) {
          throw new Error("No transaction returned from Jupiter API");
        }

        // 2. Deserialize the base64 transaction
        const txBuffer = Buffer.from(orderResponse.transaction, "base64");
        const transaction = VersionedTransaction.deserialize(txBuffer);

        // 3. Sign with wallet
        const signedTx = await wallet.signTransaction(transaction);

        // 4. Send to Solana
        const signature = await connection.sendRawTransaction(
          signedTx.serialize(),
          {
            skipPreflight: false,
            preflightCommitment: "confirmed",
            maxRetries: 3,
          }
        );

        console.log("[Jupiter Order] Transaction sent:", signature);

        // 5. Confirm
        if (orderResponse.txMeta) {
          await connection.confirmTransaction(
            {
              signature,
              blockhash: orderResponse.txMeta.blockhash,
              lastValidBlockHeight: orderResponse.txMeta.lastValidBlockHeight,
            },
            "confirmed"
          );
        }

        console.log("[Jupiter Order] Confirmed:", signature);

        // 6. Poll order status until filled (non-blocking)
        if (orderResponse.order.orderPubkey) {
          pollOrderStatus(orderResponse.order.orderPubkey);
        }

        // Refresh data in background
        Promise.all([fetchUserPositions(), fetchUserOrders(), fetchUserProfile()]).catch(
          console.error
        );

        return signature;
      } catch (err: any) {
        console.error("[Jupiter Order] Error:", err);

        if (err.message?.includes("User rejected")) {
          throw new Error("Transaction cancelled");
        }
        if (err.message?.includes("insufficient")) {
          throw new Error("Insufficient balance");
        }

        throw new Error(err.message || "Failed to place order");
      } finally {
        pendingOrderRef.current.delete(orderId);
      }
    },
    [wallet, connection, markets, fetchUserPositions, fetchUserOrders, fetchUserProfile]
  );

  // --------------------------------------------------------
  // Sell / close position
  // --------------------------------------------------------
  const sellPosition = useCallback(
    async (positionPubkey: string): Promise<string> => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected");
      }

      try {
        // Use min sell price of $0.01 (10000 micro USD) to ensure execution
        const response = await apiClosePosition(
          positionPubkey,
          wallet.publicKey.toBase58(),
          10000
        );

        if (!response.transaction) {
          throw new Error("No transaction returned");
        }

        const txBuffer = Buffer.from(response.transaction, "base64");
        const transaction = VersionedTransaction.deserialize(txBuffer);
        const signedTx = await wallet.signTransaction(transaction);

        const signature = await connection.sendRawTransaction(
          signedTx.serialize(),
          { skipPreflight: false, preflightCommitment: "confirmed" }
        );

        if (response.txMeta) {
          await connection.confirmTransaction(
            {
              signature,
              blockhash: response.txMeta.blockhash,
              lastValidBlockHeight: response.txMeta.lastValidBlockHeight,
            },
            "confirmed"
          );
        }

        // Refresh
        Promise.all([fetchUserPositions(), fetchUserOrders()]).catch(console.error);

        return signature;
      } catch (err: any) {
        if (err.message?.includes("User rejected")) {
          throw new Error("Transaction cancelled");
        }
        throw new Error(err.message || "Failed to sell position");
      }
    },
    [wallet, connection, fetchUserPositions, fetchUserOrders]
  );

  // --------------------------------------------------------
  // Claim payout for a resolved position
  // --------------------------------------------------------
  const claimPosition = useCallback(
    async (positionPubkey: string): Promise<string> => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected");
      }

      try {
        const response = await apiClaimPayout(
          positionPubkey,
          wallet.publicKey.toBase58()
        );

        if (!response.transaction) {
          throw new Error("No transaction returned");
        }

        const txBuffer = Buffer.from(response.transaction, "base64");
        const transaction = VersionedTransaction.deserialize(txBuffer);
        const signedTx = await wallet.signTransaction(transaction);

        const signature = await connection.sendRawTransaction(
          signedTx.serialize(),
          { skipPreflight: false, preflightCommitment: "confirmed" }
        );

        if (response.txMeta) {
          await connection.confirmTransaction(
            {
              signature,
              blockhash: response.txMeta.blockhash,
              lastValidBlockHeight: response.txMeta.lastValidBlockHeight,
            },
            "confirmed"
          );
        }

        // Refresh
        Promise.all([fetchUserPositions(), fetchUserOrders(), fetchUserProfile()]).catch(console.error);

        return signature;
      } catch (err: any) {
        if (err.message?.includes("User rejected")) {
          throw new Error("Transaction cancelled");
        }
        throw new Error(err.message || "Failed to claim payout");
      }
    },
    [wallet, connection, fetchUserPositions, fetchUserOrders, fetchUserProfile]
  );

  // --------------------------------------------------------
  // Poll order status
  // --------------------------------------------------------
  const pollOrderStatus = useCallback(
    async (orderPubkey: string) => {
      const maxAttempts = 30;
      const delayMs = 2000;

      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, delayMs));
        try {
          const status = await fetchOrderStatus(orderPubkey);
          console.log(`[Order Poll ${i + 1}] Status:`, status.status);

          if (status.status === "filled" || status.status === "failed") {
            // Refresh positions after order fills
            await Promise.all([fetchUserPositions(), fetchUserOrders()]);
            return;
          }
        } catch {
          // Continue polling
        }
      }
    },
    [fetchUserPositions, fetchUserOrders]
  );

  // --------------------------------------------------------
  // Fetch leaderboards wrapper
  // --------------------------------------------------------
  const getLeaderboards = useCallback(
    async (
      period?: "all_time" | "weekly" | "monthly",
      metric?: "pnl" | "volume" | "win_rate",
      limit?: number
    ): Promise<{ data: JupLeaderboardEntry[]; summary: JupLeaderboardSummary }> => {
      return fetchLeaderboards(period, metric, limit);
    },
    []
  );

  // --------------------------------------------------------
  // Refetch all data
  // --------------------------------------------------------
  const refetch = useCallback(async () => {
    await Promise.all([
      fetchMarkets(),
      ...(wallet.publicKey
        ? [fetchUserPositions(), fetchUserOrders(), fetchUserProfile()]
        : []),
    ]);
  }, [fetchMarkets, fetchUserPositions, fetchUserOrders, fetchUserProfile, wallet.publicKey]);

  // --------------------------------------------------------
  // Change category and refetch
  // --------------------------------------------------------
  const changeCategory = useCallback(
    (newCategory: EventCategory) => {
      setCategory(newCategory);
    },
    []
  );

  // --------------------------------------------------------
  // Auto-fetch on mount, when category changes, and periodic refresh
  // --------------------------------------------------------
  useEffect(() => {
    // Reset initial load when category changes
    initialLoadDoneRef.current = false;
    fetchMarkets();
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  // Periodic refresh - separate effect to avoid re-creating interval
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarkets();
    }, 30_000);

    return () => clearInterval(interval);
  }, [fetchMarkets]);

  useEffect(() => {
    if (wallet.publicKey) {
      fetchUserPositions();
      fetchUserOrders();
      fetchUserProfile();

      // Refresh user data every 15 seconds when wallet connected
      const interval = setInterval(() => {
        fetchUserPositions();
        fetchUserOrders();
      }, 15_000);

      return () => clearInterval(interval);
    }
  }, [wallet.publicKey, fetchUserPositions, fetchUserOrders, fetchUserProfile]);

  // --------------------------------------------------------
  // User stats derived from profile
  // --------------------------------------------------------
  const userStats = {
    totalBets: profile ? parseInt(profile.predictionsCount) : 0,
    totalWins: profile ? parseInt(profile.correctPredictions) : 0,
    totalWagered: profile ? microUsdToDollars(profile.totalVolumeUsd) : 0,
    winStreak: 0,
  };

  return {
    // Data
    markets,
    events,
    positions,
    orders,
    profile,
    userStats,
    category,

    // State
    loading,
    error,

    // Actions
    placeBet,
    sellPosition,
    claimPosition,
    refetch,
    fetchMarkets,
    changeCategory,
    getLeaderboards,

    // Compat - return userBets as orders for backward compat
    userBets: orders,
  };
}
