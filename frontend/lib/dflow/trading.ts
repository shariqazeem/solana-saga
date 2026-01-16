/**
 * DFlow Trading Service
 *
 * Handles trading operations for Kalshi prediction markets via DFlow's
 * Concurrent Liquidity Programs (CLPs) on Solana.
 *
 * Trading Flow:
 * 1. User defines intent (buy YES/NO at limit price)
 * 2. LPs fill orders at or better than limit
 * 3. Protocol mints SPL tokens representing position
 * 4. On market resolution, winning tokens redeem for USDC
 */

import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { DFLOW_API_BASE, RPC_ENDPOINT, USDC_MINT, USDC_DECIMALS } from "../solana/config";

// ============================================================================
// Types
// ============================================================================

export interface TradeQuote {
  market_ticker: string;
  side: "yes" | "no";
  quantity: number;
  price: number;
  total_cost: number;
  fee: number;
  slippage: number;
  expires_at: string;
}

export interface TradeIntent {
  market_ticker: string;
  side: "yes" | "no";
  quantity: number;
  limit_price: number;
  user_wallet: string;
}

export interface TradeResult {
  signature: string;
  market_ticker: string;
  side: "yes" | "no";
  quantity: number;
  price: number;
  tokens_received: string; // Mint address of received tokens
  status: "pending" | "filled" | "partial" | "failed";
}

export interface Position {
  market_ticker: string;
  side: "yes" | "no";
  quantity: number;
  average_price: number;
  current_value: number;
  pnl: number;
  token_account: string;
}

export interface RedemptionResult {
  signature: string;
  market_ticker: string;
  amount_redeemed: number;
  payout: number;
}

// ============================================================================
// DFlow Trade API Client
// ============================================================================

class DFlowTradeClient {
  private baseUrl: string;
  private connection: Connection;

  constructor(baseUrl: string = DFLOW_API_BASE) {
    this.baseUrl = baseUrl;
    this.connection = new Connection(RPC_ENDPOINT, "confirmed");
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[DFlow Trade] ${options?.method || "GET"}: ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DFlow Trade API error ${response.status}: ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  // ============================================================================
  // Quote & Trading
  // ============================================================================

  /**
   * Get a quote for buying YES/NO tokens
   */
  async getQuote(
    marketTicker: string,
    side: "yes" | "no",
    amountUSDC: number
  ): Promise<TradeQuote> {
    const quantity = Math.floor(amountUSDC * 100); // Convert to contracts (cents)

    return this.fetch<TradeQuote>("/api/v1/quote", {
      method: "POST",
      body: JSON.stringify({
        market_ticker: marketTicker,
        side,
        quantity,
        type: "market",
      }),
    });
  }

  /**
   * Get swap transaction for buying prediction tokens
   * Uses DFlow's swap infrastructure similar to Jupiter
   */
  async getSwapTransaction(
    marketTicker: string,
    side: "yes" | "no",
    amountUSDC: number,
    userWallet: string,
    slippageBps = 50 // 0.5% default slippage
  ): Promise<{ transaction: string; quote: TradeQuote }> {
    const quantity = Math.floor(amountUSDC * Math.pow(10, USDC_DECIMALS));

    const response = await this.fetch<{
      transaction: string;
      quote: TradeQuote;
    }>("/api/v1/swap", {
      method: "POST",
      body: JSON.stringify({
        market_ticker: marketTicker,
        side,
        input_mint: USDC_MINT.toString(),
        amount: quantity,
        user_wallet: userWallet,
        slippage_bps: slippageBps,
      }),
    });

    return response;
  }

  /**
   * Submit a trade intent (declarative swap)
   * DFlow's CLP system handles execution asynchronously
   */
  async submitIntent(intent: TradeIntent): Promise<{
    intent_id: string;
    transaction: string;
    expires_at: string;
  }> {
    return this.fetch("/api/v1/submit-intent", {
      method: "POST",
      body: JSON.stringify({
        market_ticker: intent.market_ticker,
        side: intent.side,
        quantity: Math.floor(intent.quantity * 100),
        limit_price: Math.floor(intent.limit_price * 100),
        user_wallet: intent.user_wallet,
      }),
    });
  }

  /**
   * Get order/intent status
   */
  async getOrderStatus(intentId: string): Promise<{
    intent_id: string;
    status: "pending" | "filled" | "partial" | "expired" | "cancelled";
    filled_quantity: number;
    average_price: number;
    transactions: string[];
  }> {
    return this.fetch(`/api/v1/order-status/${intentId}`);
  }

  // ============================================================================
  // Positions & Portfolio
  // ============================================================================

  /**
   * Get user's prediction market positions
   */
  async getPositions(userWallet: string): Promise<Position[]> {
    return this.fetch<Position[]>(`/api/v1/positions/${userWallet}`);
  }

  /**
   * Get position for a specific market
   */
  async getPosition(
    userWallet: string,
    marketTicker: string
  ): Promise<Position | null> {
    try {
      return await this.fetch<Position>(
        `/api/v1/position/${userWallet}/${marketTicker}`
      );
    } catch {
      return null;
    }
  }

  // ============================================================================
  // Redemption
  // ============================================================================

  /**
   * Get redemption transaction for settled markets
   */
  async getRedemptionTransaction(
    marketTicker: string,
    userWallet: string
  ): Promise<{ transaction: string; expected_payout: number }> {
    return this.fetch("/api/v1/redeem", {
      method: "POST",
      body: JSON.stringify({
        market_ticker: marketTicker,
        user_wallet: userWallet,
      }),
    });
  }

  // ============================================================================
  // Sell/Exit Position
  // ============================================================================

  /**
   * Get transaction to sell position back to USDC
   */
  async getSellTransaction(
    marketTicker: string,
    side: "yes" | "no",
    quantity: number,
    userWallet: string
  ): Promise<{ transaction: string; expected_proceeds: number }> {
    return this.fetch("/api/v1/sell", {
      method: "POST",
      body: JSON.stringify({
        market_ticker: marketTicker,
        side,
        quantity: Math.floor(quantity * 100),
        user_wallet: userWallet,
      }),
    });
  }

  // ============================================================================
  // Transaction Helpers
  // ============================================================================

  /**
   * Deserialize transaction from base64
   */
  deserializeTransaction(
    base64Tx: string
  ): Transaction | VersionedTransaction {
    const buffer = Buffer.from(base64Tx, "base64");

    try {
      // Try versioned transaction first
      return VersionedTransaction.deserialize(buffer);
    } catch {
      // Fall back to legacy transaction
      return Transaction.from(buffer);
    }
  }

  /**
   * Send and confirm a signed transaction
   */
  async sendTransaction(
    signedTx: Transaction | VersionedTransaction
  ): Promise<string> {
    const serialized =
      signedTx instanceof VersionedTransaction
        ? signedTx.serialize()
        : signedTx.serialize();

    const signature = await this.connection.sendRawTransaction(serialized, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
      maxRetries: 3,
    });

    // Wait for confirmation
    const latestBlockhash = await this.connection.getLatestBlockhash();
    await this.connection.confirmTransaction(
      {
        signature,
        ...latestBlockhash,
      },
      "confirmed"
    );

    return signature;
  }
}

// Export singleton
export const dflowTrade = new DFlowTradeClient();

// Export class for custom instances
export { DFlowTradeClient };

// ============================================================================
// High-Level Trading Functions
// ============================================================================

/**
 * Execute a prediction market bet via DFlow
 *
 * @param marketTicker - DFlow market ticker
 * @param prediction - true for YES, false for NO
 * @param amountUSDC - Amount to bet in USDC
 * @param wallet - Wallet adapter with sign capability
 * @param connection - Solana connection
 */
export async function placeDFlowBet(
  marketTicker: string,
  prediction: boolean,
  amountUSDC: number,
  wallet: {
    publicKey: PublicKey;
    signTransaction?: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
    sendTransaction?: (tx: Transaction, connection: Connection) => Promise<string>;
  },
  connection: Connection
): Promise<TradeResult> {
  const side = prediction ? "yes" : "no";

  console.log(`[DFlow] Placing bet: ${side} on ${marketTicker} for $${amountUSDC}`);

  try {
    // Step 1: Get swap transaction from DFlow
    const { transaction: txBase64, quote } = await dflowTrade.getSwapTransaction(
      marketTicker,
      side,
      amountUSDC,
      wallet.publicKey.toString()
    );

    console.log(`[DFlow] Quote received: ${quote.quantity} contracts at ${quote.price}c`);

    // Step 2: Deserialize and sign transaction
    const tx = dflowTrade.deserializeTransaction(txBase64);

    let signature: string;

    if (tx instanceof VersionedTransaction) {
      if (!wallet.signTransaction) {
        throw new Error("Wallet does not support signTransaction for versioned transactions");
      }
      const signedTx = await wallet.signTransaction(tx);
      signature = await dflowTrade.sendTransaction(signedTx);
    } else {
      // Legacy transaction
      if (wallet.sendTransaction) {
        // Use wallet's sendTransaction for mobile compatibility
        signature = await wallet.sendTransaction(tx, connection);
      } else if (wallet.signTransaction) {
        const signedTx = await wallet.signTransaction(tx);
        signature = await dflowTrade.sendTransaction(signedTx);
      } else {
        throw new Error("Wallet does not support transaction signing");
      }
    }

    console.log(`[DFlow] Bet placed successfully: ${signature}`);

    return {
      signature,
      market_ticker: marketTicker,
      side,
      quantity: quote.quantity,
      price: quote.price,
      tokens_received: side === "yes" ? quote.market_ticker + "_YES" : quote.market_ticker + "_NO",
      status: "filled",
    };
  } catch (error: any) {
    console.error(`[DFlow] Bet failed:`, error);

    // Handle user rejection
    if (error.message?.includes("User rejected") || error.message?.includes("cancelled")) {
      throw new Error("Transaction was cancelled");
    }

    throw error;
  }
}

/**
 * Claim winnings from a settled market
 */
export async function claimDFlowWinnings(
  marketTicker: string,
  wallet: {
    publicKey: PublicKey;
    signTransaction?: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
    sendTransaction?: (tx: Transaction, connection: Connection) => Promise<string>;
  },
  connection: Connection
): Promise<RedemptionResult> {
  console.log(`[DFlow] Claiming winnings for ${marketTicker}`);

  try {
    const { transaction: txBase64, expected_payout } =
      await dflowTrade.getRedemptionTransaction(
        marketTicker,
        wallet.publicKey.toString()
      );

    const tx = dflowTrade.deserializeTransaction(txBase64);

    let signature: string;

    if (tx instanceof VersionedTransaction) {
      if (!wallet.signTransaction) {
        throw new Error("Wallet does not support signTransaction");
      }
      const signedTx = await wallet.signTransaction(tx);
      signature = await dflowTrade.sendTransaction(signedTx);
    } else {
      if (wallet.sendTransaction) {
        signature = await wallet.sendTransaction(tx, connection);
      } else if (wallet.signTransaction) {
        const signedTx = await wallet.signTransaction(tx);
        signature = await dflowTrade.sendTransaction(signedTx);
      } else {
        throw new Error("Wallet does not support transaction signing");
      }
    }

    console.log(`[DFlow] Winnings claimed: ${signature}`);

    return {
      signature,
      market_ticker: marketTicker,
      amount_redeemed: expected_payout,
      payout: expected_payout,
    };
  } catch (error: any) {
    console.error(`[DFlow] Claim failed:`, error);
    throw error;
  }
}
