import { useConnection, useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Transaction, SendOptions } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { PROGRAM_ID, RPC_ENDPOINT } from "../config";
import idl from "../idl/prediction_markets.json";

// Mobile detection utilities
function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

function isPhantomInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    ua.includes("Phantom") ||
    (isMobileDevice() && typeof (window as any).phantom?.solana !== "undefined")
  );
}

// USDC Devnet mint address
export const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const USDC_DECIMALS = 6;

// Helper function to safely convert BN or number to number
function toNum(value: any): number {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (value.toNumber) return value.toNumber();
  if (value.toString) return parseInt(value.toString());
  return 0;
}

export interface Market {
  publicKey: string;
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
  // Decentralized resolution fields
  resolutionProposer: string | null;
  resolutionBond: number;
  challengeDeadline: number | null;
  isFinalized: boolean;
}

export interface Bet {
  publicKey: string;
  user: string;
  market: string;
  amount: number;
  prediction: boolean;
  tokensReceived: number;
  timestamp: number;
  claimed: boolean;
  payout: number;
}

export interface UserStats {
  publicKey: string;
  user: string;
  totalBets: number;
  totalWagered: number;
  totalWon: number;
  totalLost: number;
  winCount: number;
  lossCount: number;
  currentStreak: number;
  bestStreak: number;
  netProfit: number;
}

export function usePredictionMarkets() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const walletAdapter = useWallet(); // For mobile-compatible signing
  const [markets, setMarkets] = useState<Market[]>([]);
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track pending transactions to prevent duplicate submissions on mobile
  const pendingTxRef = useRef<Set<string>>(new Set());

  /**
   * Sends a transaction with proper mobile wallet adapter handling.
   *
   * CRITICAL FIX for "Signature verification failed, missing signature":
   *
   * On Mobile Wallet Adapter (deep link flow):
   * - DO NOT set recentBlockhash/feePayer before calling sendTransaction
   * - The wallet adapter's sendTransaction() handles this internally
   * - Setting these beforehand can cause signature verification to fail
   *
   * On Desktop/In-App Browser:
   * - We MUST set recentBlockhash/feePayer before signTransaction
   * - Then send the raw signed transaction ourselves
   */
  const sendMobileCompatibleTransaction = useCallback(
    async (transaction: Transaction, txId?: string): Promise<string> => {
      if (!walletAdapter.publicKey) {
        throw new Error("Wallet not connected");
      }

      // Prevent duplicate transaction submissions (mobile re-render protection)
      if (txId && pendingTxRef.current.has(txId)) {
        console.log("[TX] Duplicate transaction blocked:", txId);
        throw new Error("Transaction already pending");
      }

      if (txId) {
        pendingTxRef.current.add(txId);
      }

      try {
        const isMobile = isMobileDevice();
        const isInApp = isPhantomInAppBrowser();

        console.log(`[TX] Environment: mobile=${isMobile}, inAppBrowser=${isInApp}`);
        console.log(`[TX] Wallet publicKey: ${walletAdapter.publicKey.toString()}`);

        let signature: string;
        let blockhash: string;
        let lastValidBlockHeight: number;

        if (isMobile && !isInApp) {
          // MOBILE WALLET ADAPTER FLOW (Deep Link)
          // CRITICAL: Do NOT set blockhash/feePayer - let sendTransaction handle it
          // The wallet adapter will set these when it processes the transaction
          console.log("[TX] Using mobile wallet adapter flow - letting wallet handle blockhash/feePayer");

          // Ensure feePayer is set to the connected wallet (required for instruction building)
          // but sendTransaction will refresh the blockhash
          transaction.feePayer = walletAdapter.publicKey;

          signature = await walletAdapter.sendTransaction(transaction, connection, {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          });

          console.log("[TX] Mobile transaction sent:", signature);

          // Get blockhash for confirmation (we need it for confirmTransaction)
          const latestBlockhash = await connection.getLatestBlockhash("confirmed");
          blockhash = latestBlockhash.blockhash;
          lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

        } else {
          // DESKTOP / IN-APP BROWSER FLOW
          // Here we MUST set blockhash and feePayer before signing
          console.log("[TX] Using desktop/in-app browser flow");

          if (!walletAdapter.signTransaction) {
            throw new Error("Wallet does not support signTransaction");
          }

          const latestBlockhash = await connection.getLatestBlockhash("confirmed");
          blockhash = latestBlockhash.blockhash;
          lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

          transaction.recentBlockhash = blockhash;
          transaction.feePayer = walletAdapter.publicKey;
          transaction.lastValidBlockHeight = lastValidBlockHeight;

          const signedTx = await walletAdapter.signTransaction(transaction);
          signature = await connection.sendRawTransaction(signedTx.serialize(), {
            skipPreflight: false,
            preflightCommitment: "confirmed",
            maxRetries: 3,
          });

          console.log("[TX] Desktop transaction sent:", signature);
        }

        // Confirm the transaction with timeout protection
        console.log("[TX] Confirming transaction...");

        const confirmPromise = connection.confirmTransaction(
          {
            signature,
            blockhash,
            lastValidBlockHeight,
          },
          "confirmed"
        );

        // Add timeout for mobile contexts where app might lose focus
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Confirmation timeout")), 60000);
        });

        try {
          const confirmation = await Promise.race([confirmPromise, timeoutPromise]);
          if (confirmation.value?.err) {
            throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
          }
        } catch (confirmError: any) {
          // On mobile, the transaction might have succeeded even if confirmation times out
          if (confirmError.message === "Confirmation timeout") {
            console.log("[TX] Confirmation timed out, checking status...");
            const status = await connection.getSignatureStatus(signature);
            if (status.value?.confirmationStatus === "confirmed" ||
                status.value?.confirmationStatus === "finalized") {
              console.log("[TX] Transaction confirmed despite timeout");
              return signature;
            }
          }
          throw confirmError;
        }

        console.log("[TX] Transaction confirmed:", signature);
        return signature;
      } finally {
        if (txId) {
          pendingTxRef.current.delete(txId);
        }
      }
    },
    [connection, walletAdapter]
  );

  // Read-only program for fetching data (doesn't require wallet)
  const readOnlyProgram = useMemo(() => {
    try {
      const provider = new AnchorProvider(
        connection,
        {} as any, // Dummy wallet for read-only operations
        { commitment: "confirmed" }
      );
      return new Program(idl as Idl, provider);
    } catch (error) {
      console.error("Error initializing read-only program:", error);
      return null;
    }
  }, [connection]);

  // Full program for write operations (requires wallet)
  const program = useMemo(() => {
    if (!wallet) return null;

    try {
      const provider = new AnchorProvider(
        connection,
        wallet,
        { commitment: "confirmed", preflightCommitment: "confirmed" }
      );

      // For Anchor v0.32+, create Program with provider and IDL
      // The programId is taken from idl.address
      return new Program(idl as Idl, provider);
    } catch (error) {
      console.error("Error initializing program:", error);
      return null;
    }
  }, [connection, wallet]);

  // Fetch all markets
  const fetchMarkets = useCallback(async () => {
    if (!readOnlyProgram) return;

    try {
      setLoading(true);
      setError(null);

      console.log("Fetching markets for program:", readOnlyProgram.programId.toString());

      // Use Anchor's built-in account fetching which handles discriminators properly
      const marketAccounts = await (readOnlyProgram as any).account.market.all();
      console.log(`Found ${marketAccounts.length} market accounts`);

      const marketsData: Market[] = marketAccounts.map((account: any) => {
        const data = account.account;
        const pubkey = account.publicKey;

        console.log(`Processing market: ${pubkey.toString()}`);

        // DEBUG: Log actual field names from IDL
        if (pubkey.toString() === 'HXrmpkc8xHcpba3zYDuHDvbZLgZwFdCg5myhyen9DUET') {
          console.log('Available fields:', Object.keys(data));
        }

        // USDC has 6 decimals - IDL uses camelCase field names
        const yesPool = toNum(data.yesPool) / Math.pow(10, USDC_DECIMALS);
        const noPool = toNum(data.noPool) / Math.pow(10, USDC_DECIMALS);
        const totalVolume = toNum(data.totalVolume) / Math.pow(10, USDC_DECIMALS);

        // Calculate prices (percentage chance of winning)
        const totalPool = yesPool + noPool;
        const yesPrice = totalPool > 0 ? Math.round((yesPool / totalPool) * 100) : 50;
        const noPrice = 100 - yesPrice;

        // Calculate payout multipliers: Multiplier = TotalPool / SidePool
        // This shows what you'd win for betting on each side
        const yesMultiplier = yesPool > 0 ? (totalPool / yesPool).toFixed(2) + "x" : "2.00x";
        const noMultiplier = noPool > 0 ? (totalPool / noPool).toFixed(2) + "x" : "2.00x";

        // Calculate time remaining - IDL uses camelCase field names!
        const endTime = toNum(data.endTime);
        const now = Math.floor(Date.now() / 1000);
        const secondsLeft = endTime - now;
        const daysLeft = Math.floor(secondsLeft / (24 * 60 * 60));
        const hoursLeft = Math.floor(secondsLeft / (60 * 60));

        let endsIn = "";
        if (secondsLeft < 0) endsIn = "Ended";
        else if (daysLeft > 0) endsIn = `${daysLeft} day${daysLeft > 1 ? "s" : ""}`;
        else if (hoursLeft > 0) endsIn = `${hoursLeft} hour${hoursLeft > 1 ? "s" : ""}`;
        else endsIn = "Soon";

        let status = "Active";
        if (data.status && typeof data.status === 'object') {
          if ('active' in data.status) status = "Active";
          else if ('resolved' in data.status) status = "Resolved";
          else if ('cancelled' in data.status) status = "Cancelled";
        }

        return {
          publicKey: pubkey.toString(),
          id: toNum(data.id),
          question: data.question,
          description: data.description,
          category: data.category,
          creator: data.creator.toString(),
          yesPool,
          noPool,
          totalVolume,
          isResolved: status === "Resolved",
          outcome: data.outcome !== null && data.outcome !== undefined ? data.outcome : null,
          endTime,
          createdAt: toNum(data.createdAt),
          yesPrice,
          noPrice,
          yesMultiplier,
          noMultiplier,
          endsIn,
          bettors: toNum(data.uniqueBettors),
          totalBetsCount: toNum(data.totalBetsCount),
          status,
          // Decentralized resolution fields
          resolutionProposer: data.resolutionProposer ? data.resolutionProposer.toString() : null,
          resolutionBond: toNum(data.resolutionBond) / Math.pow(10, USDC_DECIMALS),
          challengeDeadline: data.challengeDeadline ? toNum(data.challengeDeadline) : null,
          isFinalized: data.isFinalized || false,
        };
      });

      console.log(`Loaded ${marketsData.length} markets`);
      setMarkets(marketsData);
    } catch (error: any) {
      console.error("Error fetching markets:", error);
      setError(error.message || "Failed to fetch markets");
    } finally {
      setLoading(false);
    }
  }, [readOnlyProgram]);

  // Fetch user bets
  const fetchUserBets = useCallback(async () => {
    if (!program || !wallet) return;

    try {
      const betAccounts = await (program as any).account.bet.all([
        {
          memcmp: {
            offset: 8 + 32, // Discriminator (8) + market pubkey (32)
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);

      const betsData: Bet[] = betAccounts.map((account: any) => {
        const data = account.account;

        return {
          publicKey: account.publicKey.toString(),
          user: data.user.toString(),
          market: data.market.toString(),
          amount: toNum(data.amount) / Math.pow(10, USDC_DECIMALS),
          prediction: data.prediction,
          tokensReceived: toNum(data.tokens_received) / Math.pow(10, USDC_DECIMALS),
          timestamp: toNum(data.timestamp),
          claimed: data.claimed,
          payout: toNum(data.payout) / Math.pow(10, USDC_DECIMALS),
        };
      });

      setUserBets(betsData);
    } catch (error: any) {
      console.error("Error fetching user bets:", error);
    }
  }, [program, wallet]);

  // Get or create user's USDC token account
  const getUserUsdcAccount = async () => {
    if (!wallet) throw new Error("Wallet not connected");

    const userTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      wallet.publicKey
    );

    // Check if account exists
    const accountInfo = await connection.getAccountInfo(userTokenAccount);

    return {
      address: userTokenAccount,
      exists: accountInfo !== null,
    };
  };

  // Place a bet - Mobile Wallet Adapter Compatible
  const placeBet = async (marketAddress: string, amount: number, prediction: boolean): Promise<string> => {
    if (!program || !wallet || !walletAdapter.publicKey) {
      throw new Error("Wallet not connected");
    }

    // Create unique transaction ID for duplicate prevention
    const txId = `bet-${marketAddress}-${Date.now()}`;

    try {
      // marketPubkey is already the market PDA (from .env addresses)
      const marketPubkey = new PublicKey(marketAddress);

      // Fetch fresh market data to get latest total_bets_count
      const marketAccount = await (program as any).account.market.fetch(marketPubkey, "confirmed");
      const marketId = toNum((marketAccount as any).id);
      const totalBetsCount = toNum((marketAccount as any).total_bets_count);

      console.log("=== PLACE BET DEBUG ===");
      console.log("Market address:", marketPubkey.toString());
      console.log("Market ID:", marketId);
      console.log("Total bets count (current):", totalBetsCount);
      console.log("User wallet:", wallet.publicKey.toString());
      console.log("Program ID:", program.programId.toString());
      console.log("Mobile device:", isMobileDevice());
      console.log("In-app browser:", isPhantomInAppBrowser());

      // Verify the market address matches the expected PDA
      const [expectedMarketPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), new BN(marketId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      console.log("Expected market PDA for ID", marketId, ":", expectedMarketPda.toString());
      console.log("Market PDA matches:", marketPubkey.equals(expectedMarketPda) ? "YES" : "NO - USING WRONG ADDRESS!");

      // Convert amount to USDC smallest units (6 decimals)
      const amountInSmallestUnits = new BN(amount * Math.pow(10, USDC_DECIMALS));

      // Validate amount
      if (amountInSmallestUnits.lt(new BN(1_000_000))) {
        throw new Error("Minimum bet is 1 USDC");
      }
      if (amountInSmallestUnits.gt(new BN(10_000_000_000))) {
        throw new Error("Maximum bet is 10,000 USDC");
      }

      // Get user's USDC token account
      const userUsdcAccount = await getUserUsdcAccount();

      // If user doesn't have USDC account, create it using mobile-compatible method
      if (!userUsdcAccount.exists) {
        console.log("[PlaceBet] Creating USDC token account...");
        const ataTransaction = new Transaction();
        ataTransaction.add(
          createAssociatedTokenAccountInstruction(
            walletAdapter.publicKey,
            userUsdcAccount.address,
            walletAdapter.publicKey,
            USDC_MINT
          )
        );

        // Use mobile-compatible transaction sending
        await sendMobileCompatibleTransaction(ataTransaction, `ata-${txId}`);
        console.log("[PlaceBet] USDC token account created");
      }

      // Derive user stats PDA (always needed)
      const [userStatsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_stats"), wallet.publicKey.toBuffer()],
        program.programId
      );

      console.log("User stats PDA:", userStatsPda.toString());
      console.log("=== END DEBUG ===\n");

      // MOBILE WALLET ADAPTER FIX:
      // Use our mobile-compatible sender for ALL mobile contexts
      // This ensures proper handling of blockhash/feePayer
      const isMobile = isMobileDevice();

      let signature: string;

      if (isMobile) {
        // ALL MOBILE CONTEXTS - Use mobile-compatible transaction flow
        // This works for both deep link AND in-app browser
        console.log("[PlaceBet] Using mobile-compatible transaction flow");

        // Build the transaction using Anchor's transaction() method
        // IMPORTANT: Use walletAdapter.publicKey for consistency
        const betTx = await program.methods
          .placeBet(new BN(marketId), amountInSmallestUnits, prediction)
          .accounts({
            market: marketPubkey,
            userStats: userStatsPda,
            userTokenAccount: userUsdcAccount.address,
            user: walletAdapter.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .transaction();

        // Send using our mobile-compatible method
        signature = await sendMobileCompatibleTransaction(betTx, txId);
      } else {
        // DESKTOP FLOW - Use Anchor's RPC (handles signing internally)
        console.log("[PlaceBet] Using standard Anchor RPC flow");

        signature = await program.methods
          .placeBet(new BN(marketId), amountInSmallestUnits, prediction)
          .accounts({
            market: marketPubkey,
            userStats: userStatsPda,
            userTokenAccount: userUsdcAccount.address,
            user: wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
      }

      console.log("Bet placed successfully:", signature);

      // Refresh data (non-blocking to prevent UI issues on mobile)
      Promise.all([fetchMarkets(), fetchUserBets()]).catch(console.error);

      return signature;
    } catch (error: any) {
      console.error("Error placing bet:", error);

      // Provide user-friendly error messages
      if (error.message?.includes("User rejected")) {
        throw new Error("Transaction was cancelled");
      }
      if (error.message?.includes("insufficient funds")) {
        throw new Error("Insufficient USDC balance");
      }
      if (error.message?.includes("already pending")) {
        throw new Error("Please wait for the previous transaction to complete");
      }

      throw new Error(error.message || "Failed to place bet");
    }
  };

  // Claim winnings - Mobile Wallet Adapter Compatible
  const claimWinnings = async (betAddress: string): Promise<string> => {
    if (!program || !wallet || !walletAdapter.publicKey) {
      throw new Error("Wallet not connected");
    }

    const txId = `claim-${betAddress}-${Date.now()}`;

    try {
      // Check SOL balance first (transaction fees ~0.00001 SOL)
      const solBalance = await connection.getBalance(wallet.publicKey);
      const MIN_SOL_FOR_TX = 10000; // ~0.00001 SOL

      if (solBalance < MIN_SOL_FOR_TX) {
        throw new Error(
          `Insufficient SOL for transaction fees. You need ~0.00001 SOL. ` +
          `Current balance: ${(solBalance / 1e9).toFixed(6)} SOL. ` +
          `Please add some SOL to your wallet.`
        );
      }

      const betPubkey = new PublicKey(betAddress);
      const betAccount = await (program as any).account.bet.fetch(betPubkey);

      // Check if bet is already claimed
      if ((betAccount as any).claimed) {
        throw new Error("This bet has already been claimed!");
      }

      const marketPubkey = (betAccount as any).market as PublicKey;
      const marketAccount = await (program as any).account.market.fetch(marketPubkey);
      const marketId = toNum((marketAccount as any).id);

      // Verify market is resolved
      const marketStatus = (marketAccount as any).status;
      if (!marketStatus || !('resolved' in marketStatus)) {
        throw new Error("Market is not resolved yet. Wait for resolution.");
      }

      // Verify user won
      const outcome = (marketAccount as any).outcome;
      const userPrediction = (betAccount as any).prediction;
      if (outcome !== userPrediction) {
        throw new Error("You did not win this bet. Cannot claim.");
      }

      // Get user's USDC token account
      const userUsdcAccount = await getUserUsdcAccount();

      const [userStatsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_stats"), wallet.publicKey.toBuffer()],
        program.programId
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), new BN(marketId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      const isMobile = isMobileDevice();

      let signature: string;

      if (isMobile) {
        // ALL MOBILE CONTEXTS - Use mobile-compatible transaction flow
        console.log("[ClaimWinnings] Using mobile-compatible transaction flow");

        const claimTx = await program.methods
          .claimWinnings(new BN(marketId))
          .accounts({
            market: marketPubkey,
            bet: betPubkey,
            userStats: userStatsPda,
            vault: vaultPda,
            userTokenAccount: userUsdcAccount.address,
            user: walletAdapter.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .transaction();

        signature = await sendMobileCompatibleTransaction(claimTx, txId);
      } else {
        // DESKTOP FLOW
        console.log("[ClaimWinnings] Using standard Anchor RPC flow");

        signature = await program.methods
          .claimWinnings(new BN(marketId))
          .accounts({
            market: marketPubkey,
            bet: betPubkey,
            userStats: userStatsPda,
            vault: vaultPda,
            userTokenAccount: userUsdcAccount.address,
            user: wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
      }

      console.log("Winnings claimed successfully:", signature);

      // Refresh data (non-blocking for mobile)
      setTimeout(() => {
        Promise.all([fetchMarkets(), fetchUserBets()]).catch(console.error);
      }, 2000);

      return signature;
    } catch (error: any) {
      console.error("Error claiming winnings:", error);

      if (error.message?.includes("User rejected")) {
        throw new Error("Transaction was cancelled");
      }
      if (error.message?.includes("already pending")) {
        throw new Error("Please wait for the previous transaction to complete");
      }

      throw new Error(error.message || "Failed to claim winnings");
    }
  };

  // Resolve market (CREATOR-ONLY - instant resolution, NO BONDS)
  const resolveMarket = async (marketAddress: string, outcome: boolean): Promise<string> => {
    if (!program || !wallet) {
      throw new Error("Wallet not connected");
    }

    try {
      const marketPubkey = new PublicKey(marketAddress);
      const marketAccount = await (program as any).account.market.fetch(marketPubkey);
      const marketId = toNum((marketAccount as any).id);

      // Check if caller is the market creator
      const creatorPubkey = (marketAccount as any).creator as PublicKey;
      if (!wallet.publicKey.equals(creatorPubkey)) {
        throw new Error("Only the market creator can resolve this market");
      }

      const tx = await program.methods
        .resolveMarket(new BN(marketId), outcome)
        .accounts({
          market: marketPubkey,
          creator: wallet.publicKey,
        })
        .rpc();

      console.log("Market resolved instantly:", tx);

      // Refresh data
      await Promise.all([fetchMarkets(), fetchUserBets()]);

      return tx;
    } catch (error: any) {
      console.error("Error resolving market:", error);
      throw new Error(error.message || "Failed to resolve market");
    }
  };

  // Withdraw fees from a resolved market (ADMIN ONLY) - Mobile Wallet Adapter Compatible
  const withdrawFees = async (marketAddress: string, marketId: number): Promise<string> => {
    if (!program || !wallet || !walletAdapter.publicKey) {
      throw new Error("Wallet not connected");
    }

    const txId = `withdraw-${marketAddress}-${Date.now()}`;

    try {
      const marketPubkey = new PublicKey(marketAddress);

      // Get admin's USDC token account
      const adminTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        wallet.publicKey
      );

      // Check if account exists, create if not using mobile-compatible method
      const accountInfo = await connection.getAccountInfo(adminTokenAccount);
      if (!accountInfo) {
        console.log("[WithdrawFees] Creating admin USDC token account...");
        const ataTransaction = new Transaction();
        ataTransaction.add(
          createAssociatedTokenAccountInstruction(
            walletAdapter.publicKey,
            adminTokenAccount,
            walletAdapter.publicKey,
            USDC_MINT
          )
        );
        await sendMobileCompatibleTransaction(ataTransaction, `ata-${txId}`);
        console.log("[WithdrawFees] Admin USDC token account created");
      }

      // Derive vault PDA
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), new BN(marketId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      const isMobile = isMobileDevice();

      let signature: string;

      if (isMobile) {
        // ALL MOBILE CONTEXTS - Use mobile-compatible transaction flow
        console.log("[WithdrawFees] Using mobile-compatible transaction flow");

        const withdrawTx = await program.methods
          .withdrawFees(new BN(marketId))
          .accounts({
            market: marketPubkey,
            vault: vaultPda,
            adminTokenAccount: adminTokenAccount,
            admin: walletAdapter.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .transaction();

        signature = await sendMobileCompatibleTransaction(withdrawTx, txId);
      } else {
        // DESKTOP FLOW
        console.log("[WithdrawFees] Using standard Anchor RPC flow");

        signature = await program.methods
          .withdrawFees(new BN(marketId))
          .accounts({
            market: marketPubkey,
            vault: vaultPda,
            adminTokenAccount: adminTokenAccount,
            admin: wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
      }

      console.log("Fees withdrawn successfully:", signature);

      // Refresh data (non-blocking for mobile)
      Promise.all([fetchMarkets(), fetchUserBets()]).catch(console.error);

      return signature;
    } catch (error: any) {
      console.error("Error withdrawing fees:", error);

      if (error.message?.includes("User rejected")) {
        throw new Error("Transaction was cancelled");
      }

      throw new Error(error.message || "Failed to withdraw fees");
    }
  };

  // Get a single market by address
  const getMarket = useCallback(async (marketAddress: string): Promise<Market | null> => {
    if (!readOnlyProgram) return null;

    try {
      const marketPubkey = new PublicKey(marketAddress);
      // Use "confirmed" commitment to get latest data
      const data = await (readOnlyProgram as any).account.market.fetch(marketPubkey, "confirmed");

      // IDL uses camelCase field names
      const yesPool = toNum((data as any).yesPool) / Math.pow(10, USDC_DECIMALS);
      const noPool = toNum((data as any).noPool) / Math.pow(10, USDC_DECIMALS);
      const totalVolume = toNum((data as any).totalVolume) / Math.pow(10, USDC_DECIMALS);

      const totalPool = yesPool + noPool;
      const yesPrice = totalPool > 0 ? Math.round((yesPool / totalPool) * 100) : 50;
      const noPrice = 100 - yesPrice;

      // Calculate payout multipliers
      const yesMultiplier = yesPool > 0 ? (totalPool / yesPool).toFixed(2) + "x" : "2.00x";
      const noMultiplier = noPool > 0 ? (totalPool / noPool).toFixed(2) + "x" : "2.00x";

      // IDL uses camelCase field names!
      const endTime = toNum((data as any).endTime);
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = endTime - now;
      const daysLeft = Math.floor(secondsLeft / (24 * 60 * 60));
      const hoursLeft = Math.floor(secondsLeft / (60 * 60));

      let endsIn = "";
      if (secondsLeft < 0) endsIn = "Ended";
      else if (daysLeft > 0) endsIn = `${daysLeft} day${daysLeft > 1 ? "s" : ""}`;
      else if (hoursLeft > 0) endsIn = `${hoursLeft} hour${hoursLeft > 1 ? "s" : ""}`;
      else endsIn = "Soon";

      let status = "Active";
      if ((data as any).status && typeof (data as any).status === 'object') {
        if ('active' in (data as any).status) status = "Active";
        else if ('resolved' in (data as any).status) status = "Resolved";
        else if ('cancelled' in (data as any).status) status = "Cancelled";
      }

      return {
        publicKey: marketAddress,
        id: toNum((data as any).id),
        question: (data as any).question,
        description: (data as any).description,
        category: (data as any).category,
        creator: (data as any).creator.toString(),
        yesPool,
        noPool,
        totalVolume,
        isResolved: status === "Resolved",
        outcome: (data as any).outcome !== null && (data as any).outcome !== undefined ? (data as any).outcome : null,
        endTime,
        createdAt: toNum((data as any).createdAt),
        yesPrice,
        noPrice,
        yesMultiplier,
        noMultiplier,
        endsIn,
        bettors: toNum((data as any).uniqueBettors),
        totalBetsCount: toNum((data as any).totalBetsCount),
        status,
        // Decentralized resolution fields
        resolutionProposer: (data as any).resolutionProposer ? (data as any).resolutionProposer.toString() : null,
        resolutionBond: toNum((data as any).resolutionBond) / Math.pow(10, USDC_DECIMALS),
        challengeDeadline: (data as any).challengeDeadline ? toNum((data as any).challengeDeadline) : null,
        isFinalized: (data as any).isFinalized || false,
      };
    } catch (error: any) {
      console.error("Error fetching market:", error);
      return null;
    }
  }, [readOnlyProgram]);

  useEffect(() => {
    if (readOnlyProgram) {
      fetchMarkets();
    }
    if (program && wallet) {
      fetchUserBets();
    }
  }, [readOnlyProgram, program, wallet, fetchMarkets, fetchUserBets]);

  // Fetch all user stats for leaderboard
  const fetchAllUserStats = useCallback(async (): Promise<UserStats[]> => {
    if (!readOnlyProgram) return [];

    try {
      const userStatsAccounts = await (readOnlyProgram as any).account.userStats.all();

      const stats: UserStats[] = userStatsAccounts.map((account: any) => {
        const data = account.account;

        return {
          publicKey: account.publicKey.toString(),
          user: data.user.toString(),
          totalBets: toNum(data.totalBets),
          totalWagered: toNum(data.totalWagered) / Math.pow(10, USDC_DECIMALS),
          totalWon: toNum(data.totalWon) / Math.pow(10, USDC_DECIMALS),
          totalLost: toNum(data.totalLost) / Math.pow(10, USDC_DECIMALS),
          winCount: toNum(data.winCount),
          lossCount: toNum(data.lossCount),
          currentStreak: toNum(data.currentStreak),
          bestStreak: toNum(data.bestStreak),
          netProfit: toNum(data.netProfit) / Math.pow(10, USDC_DECIMALS),
        };
      });

      // Sort by net profit (highest first)
      return stats.sort((a, b) => b.netProfit - a.netProfit);
    } catch (error: any) {
      console.error("Error fetching user stats:", error);
      return [];
    }
  }, [readOnlyProgram]);

  return {
    markets,
    userBets,
    loading,
    error,
    placeBet,
    claimWinnings,
    resolveMarket,
    withdrawFees,
    getMarket,
    getUserUsdcAccount,
    fetchAllUserStats,
    refetch: () => Promise.all([fetchMarkets(), fetchUserBets()]),
  };
}
