import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  Transaction,
  VersionedTransaction,
  TransactionMessage,
  AddressLookupTableAccount,
} from "@solana/web3.js";
import { RPC_ENDPOINT } from "@/lib/solana/config";
import {
  fetchEvents,
  fetchPositions,
  fetchOrders,
  fetchProfile,
  fetchLeaderboards,
  createOrder,
  closeOrder as apiCloseOrder,
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

// USDC mint address on Solana mainnet
const USDC_MINT_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

/**
 * Convert a base64 transaction to legacy Transaction for Jupiter Mobile compat.
 * Jupiter Mobile wallet can't handle VersionedTransaction, so we:
 * 1. Detect if it's versioned or legacy
 * 2. If versioned, resolve any address lookup tables from chain
 * 3. Decompile to legacy Transaction
 * If conversion fails, returns the versioned tx as fallback.
 */
async function toLegacyTransaction(
  base64: string,
  connection: Connection,
  blockhash?: string
): Promise<Transaction | VersionedTransaction> {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  // Try versioned first, fall back to legacy
  let versioned: VersionedTransaction;
  try {
    versioned = VersionedTransaction.deserialize(bytes);
  } catch {
    // Already legacy — return directly
    console.log("[Jupiter] Transaction is already legacy");
    return Transaction.from(bytes);
  }

  // Versioned transaction — try to convert to legacy
  try {
    const msg = versioned.message;

    // Resolve address lookup tables from chain if present
    let lookupTableAccounts: AddressLookupTableAccount[] = [];
    if ("addressTableLookups" in msg && (msg as any).addressTableLookups?.length > 0) {
      const lookups = (msg as any).addressTableLookups;
      console.log(`[Jupiter] Resolving ${lookups.length} address lookup table(s)...`);
      for (const lookup of lookups) {
        const result = await connection.getAddressLookupTable(lookup.accountKey);
        if (result.value) {
          lookupTableAccounts.push(result.value);
        }
      }
    }

    // Decompile versioned message to legacy instructions
    const decompiled = TransactionMessage.decompile(msg, {
      addressLookupTableAccounts: lookupTableAccounts,
    });

    const legacyTx = new Transaction();
    legacyTx.recentBlockhash = blockhash || decompiled.recentBlockhash;
    legacyTx.feePayer = decompiled.payerKey;
    legacyTx.add(...decompiled.instructions);
    console.log("[Jupiter] Converted versioned tx to legacy for wallet compat");
    return legacyTx;
  } catch (e) {
    console.warn("[Jupiter] Could not convert to legacy, using versioned:", e);
    return versioned;
  }
}

/**
 * Sign and send a Jupiter transaction with maximum wallet compatibility.
 * Strategy: try legacy first (best mobile compat), then versioned, then sendTransaction fallback.
 */
async function signAndSendTransaction(
  base64Tx: string,
  connection: Connection,
  wallet: any,
  blockhash?: string
): Promise<string> {
  const txBuffer = Buffer.from(base64Tx, "base64");

  // Try legacy first for Jupiter Mobile compatibility
  try {
    const legacyTx = await toLegacyTransaction(base64Tx, connection, blockhash);
    const signedTx = await wallet.signTransaction(legacyTx);
    const sig = await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: true,
      preflightCommitment: "confirmed",
      maxRetries: 3,
    });
    console.log("[Jupiter] Sent via legacy sign+send:", sig);
    return sig;
  } catch (err: any) {
    if (err.message?.includes("reject")) throw err;
    console.warn("[Jupiter] Legacy sign+send failed:", err.message);
  }

  // Fallback: versioned via sendTransaction (Phantom desktop)
  try {
    const versionedTx = VersionedTransaction.deserialize(txBuffer);
    const sig = await wallet.sendTransaction(versionedTx, connection, {
      skipPreflight: true,
      maxRetries: 3,
    });
    console.log("[Jupiter] Sent via versioned sendTransaction:", sig);
    return sig;
  } catch (err: any) {
    if (err.message?.includes("reject")) throw err;
    throw new Error(err.message || "Failed to send transaction");
  }
}

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

  // Build a clear YES/NO question from event + market titles
  // Examples from Jupiter:
  //   Event: "Who will Trump nominate as Fed Chair?" Market: "Kevin Warsh"
  //   Event: "Bitcoin Price" Market: "Bitcoin Above 100000 On March 1?"
  //   Event: "MicroStrategy sells Bitcoin" Market: "Before March 2026"
  const eventTitle = event.metadata?.title || "";
  const marketTitle = market.metadata?.title || "";
  let question: string;

  if (eventTitle && marketTitle && eventTitle !== marketTitle) {
    const eventIsQuestion = eventTitle.endsWith("?");
    const marketIsQuestion = marketTitle.endsWith("?");

    if (marketIsQuestion) {
      // Market already has a clear question — use it directly
      question = marketTitle;
    } else if (eventIsQuestion) {
      // Event is the question, market is an option/answer
      // e.g. "Who will win?" + "Team A" → "Who will win? — Team A"
      question = `${eventTitle} — ${marketTitle}`;
    } else {
      // Neither is a question — combine naturally
      // e.g. "MicroStrategy sells Bitcoin" + "Before March 2026"
      question = `${eventTitle} — ${marketTitle}?`;
    }
  } else {
    const title = marketTitle || eventTitle || "Untitled Market";
    question = title.endsWith("?") ? title : `${title}?`;
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
  // Create our own reliable connection instead of useConnection()
  // which may use a different RPC or be undefined
  const connection = useMemo(
    () => new Connection(RPC_ENDPOINT, { commitment: "confirmed" }),
    []
  );
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
        // Quality filters: show tradeable markets with reasonable prices
        const MAX_MARKETS_PER_EVENT = 3;
        const marketsByEvent: Market[][] = [];
        for (const event of result.data) {
          if (!event.markets) continue;
          const eventMarkets: Market[] = [];
          const openMarkets = event.markets
            .filter((m) => {
              if (m.status !== "open") return false;
              if (!m.pricing) return false;
              // Prices must be in tradeable range (3%-97%) — avoid extremes that cause API errors
              const yesPrice = (m.pricing.buyYesPriceUsd ?? 0) / 1_000_000;
              const noPrice = (m.pricing.buyNoPriceUsd ?? 0) / 1_000_000;
              if (yesPrice <= 0.03 || yesPrice >= 0.97) return false;
              if (noPrice <= 0.03 || noPrice >= 0.97) return false;
              // Must not be expired or closing within 30 minutes
              const now = Math.floor(Date.now() / 1000);
              if (m.closeTime > 0 && m.closeTime < now + 1800) return false;
              return true;
            })
            .sort((a, b) => (b.pricing?.volume || 0) - (a.pricing?.volume || 0))
            .slice(0, MAX_MARKETS_PER_EVENT);
          for (const market of openMarkets) {
            eventMarkets.push(transformToMarket(market, event));
          }
          if (eventMarkets.length > 0) {
            marketsByEvent.push(eventMarkets);
          }
        }

        // Round-robin: pick one market from each event in turn
        const interleaved: Market[] = [];
        let maxLen = 0;
        for (const arr of marketsByEvent) {
          if (arr.length > maxLen) maxLen = arr.length;
        }
        for (let i = 0; i < maxLen; i++) {
          for (const arr of marketsByEvent) {
            if (i < arr.length) {
              interleaved.push(arr[i]);
            }
          }
        }

        setMarkets(interleaved);
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
      if (!wallet.publicKey || !wallet.sendTransaction) {
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

        // Check if market is still open for trading
        const now = Math.floor(Date.now() / 1000);
        if (market.endTime > 0 && market.endTime < now) {
          throw new Error("Market has expired. Try a different market.");
        }
        if (market.endTime > 0 && market.endTime - now < 300) {
          throw new Error("Market closes in < 5 min. Try a different market.");
        }

        const buyPrice = prediction ? market.buyYesPrice : market.buyNoPrice;
        if (!buyPrice || buyPrice <= 0) throw new Error("Market price unavailable");

        // 0. Pre-check balances
        const ownerPub = wallet.publicKey.toBase58();
        const solBal = await connection.getBalance(wallet.publicKey);
        console.log(`[Jupiter Order] SOL: ${(solBal / 1e9).toFixed(4)}, betting $${amountUsd}`);
        if (solBal < 10_000_000) {
          throw new Error(
            `Need more SOL for fees. You have ${(solBal / 1e9).toFixed(4)} SOL, need ~0.01+ SOL.`
          );
        }

        // Jupiter requires minimum $1 deposit; add small buffer for fees
        const depositUsd = Math.max(amountUsd * 1.05, 1.05);
        const depositMicro = dollarsToMicroUsd(depositUsd);

        console.log("[Jupiter Order]", {
          marketId,
          isYes: prediction,
          buyPrice,
          depositUsd,
          depositMicro,
        });

        // 1. Request unsigned transaction from Jupiter API
        const orderResponse = await createOrder({
          ownerPubkey: ownerPub,
          marketId,
          isYes: prediction,
          isBuy: true,
          depositAmount: String(depositMicro),
          depositMint: USDC_MINT_ADDRESS,
        });

        if (!orderResponse.transaction) {
          throw new Error("No transaction returned from Jupiter API");
        }

        // 2. Sign and send with wallet-compatible approach
        const signature = await signAndSendTransaction(
          orderResponse.transaction,
          connection,
          wallet,
          orderResponse.txMeta?.blockhash
        );

        console.log("[Jupiter Order] Transaction sent:", signature);

        // 4. Confirm and CHECK for on-chain errors (critical — tx can confirm but fail)
        if (orderResponse.txMeta) {
          const confirmation = await connection.confirmTransaction(
            {
              signature,
              blockhash: orderResponse.txMeta.blockhash,
              lastValidBlockHeight: orderResponse.txMeta.lastValidBlockHeight,
            },
            "confirmed"
          );
          if (confirmation.value.err) {
            console.error("[Jupiter Order] Transaction failed on-chain:", confirmation.value.err);
            throw new Error(
              `Transaction failed on-chain. You may need more SOL for fees. Check your balance and try again.`
            );
          }
        }

        console.log("[Jupiter Order] Confirmed:", signature);

        // 5. Poll order status (with delay — Jupiter docs say wait a few slots)
        if (orderResponse.order.orderPubkey) {
          setTimeout(() => pollOrderStatus(orderResponse.order.orderPubkey!), 5000);
        }

        // Refresh data in background
        Promise.all([fetchUserPositions(), fetchUserOrders(), fetchUserProfile()]).catch(
          console.error
        );

        return signature;
      } catch (err: any) {
        console.error("[Jupiter Order] Error:", err);

        // Extract the most useful error message
        const rawMsg = err?.message || err?.toString() || "Unknown error";

        if (rawMsg.includes("User rejected") || rawMsg.includes("user rejected")) {
          throw new Error("Transaction cancelled");
        }

        // Show the FULL raw error for debugging — helps diagnose on mobile
        throw new Error(`Order failed: ${rawMsg.slice(0, 300)}`);
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

        const signature = await signAndSendTransaction(
          response.transaction,
          connection,
          wallet,
          response.txMeta?.blockhash
        );

        if (response.txMeta) {
          const confirmation = await connection.confirmTransaction(
            {
              signature,
              blockhash: response.txMeta.blockhash,
              lastValidBlockHeight: response.txMeta.lastValidBlockHeight,
            },
            "confirmed"
          );
          if (confirmation.value.err) {
            throw new Error("Transaction failed on-chain. Check balance and try again.");
          }
        }

        // Refresh
        Promise.all([fetchUserPositions(), fetchUserOrders()]).catch(console.error);

        return signature;
      } catch (err: any) {
        if (err.message?.includes("reject")) {
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
      if (!wallet.publicKey || !wallet.sendTransaction) {
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

        const signature = await signAndSendTransaction(
          response.transaction,
          connection,
          wallet,
          response.txMeta?.blockhash
        );

        if (response.txMeta) {
          const confirmation = await connection.confirmTransaction(
            {
              signature,
              blockhash: response.txMeta.blockhash,
              lastValidBlockHeight: response.txMeta.lastValidBlockHeight,
            },
            "confirmed"
          );
          if (confirmation.value.err) {
            throw new Error("Transaction failed on-chain. Check balance and try again.");
          }
        }

        // Refresh
        Promise.all([fetchUserPositions(), fetchUserOrders(), fetchUserProfile()]).catch(console.error);

        return signature;
      } catch (err: any) {
        if (err.message?.includes("reject")) {
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
      // Jupiter docs: "Wait for a few slots before polling"
      const maxAttempts = 10;
      const delayMs = 5000; // 5 seconds between polls

      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, delayMs));
        try {
          const status = await fetchOrderStatus(orderPubkey);
          console.log(`[Order Poll ${i + 1}/${maxAttempts}] Status:`, status.status);

          if (status.status === "filled" || status.status === "failed") {
            // Refresh positions after order fills
            await Promise.all([fetchUserPositions(), fetchUserOrders()]);
            return;
          }
        } catch {
          // 404 expected for first few polls — continue
          if (i > 3) console.log(`[Order Poll ${i + 1}/${maxAttempts}] Not found yet...`);
        }
      }
      // Final refresh even if polling didn't find the order
      await Promise.all([fetchUserPositions(), fetchUserOrders()]).catch(() => {});
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
