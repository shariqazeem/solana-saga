import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { useState, useEffect, useMemo, useCallback } from "react";
import { PROGRAM_ID, RPC_ENDPOINT } from "../config";
import idl from "../idl/prediction_markets.json";

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

export function usePredictionMarkets() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Place a bet
  const placeBet = async (marketAddress: string, amount: number, prediction: boolean): Promise<string> => {
    if (!program || !wallet) {
      throw new Error("Wallet not connected");
    }

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

      // Verify the market address matches the expected PDA
      const [expectedMarketPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), new BN(marketId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      console.log("Expected market PDA for ID", marketId, ":", expectedMarketPda.toString());
      console.log("Market PDA matches:", marketPubkey.equals(expectedMarketPda) ? "✓ YES" : "✗ NO - USING WRONG ADDRESS!");

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

      // If user doesn't have USDC account, create it
      if (!userUsdcAccount.exists) {
        const transaction = new Transaction();
        transaction.add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            userUsdcAccount.address,
            wallet.publicKey,
            USDC_MINT
          )
        );

        const signature = await (wallet as any).signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature);
      }

      // Derive user stats PDA (always needed)
      const [userStatsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_stats"), wallet.publicKey.toBuffer()],
        program.programId
      );

      console.log("User stats PDA:", userStatsPda.toString());
      console.log("=== END DEBUG ===\n");
      console.log("Note: Letting Anchor auto-derive bet PDA and vault PDA from on-chain state to avoid race conditions");

      // Place bet - let Anchor auto-derive bet and vault PDAs from on-chain market state
      // This prevents race conditions with stale total_bets_count
      const tx = await program.methods
        .placeBet(new BN(marketId), amountInSmallestUnits, prediction)
        .accounts({
          market: marketPubkey,
          // bet: auto-derived by Anchor from market.total_bets_count
          userStats: userStatsPda,
          // vault: auto-derived by Anchor from market_id
          userTokenAccount: userUsdcAccount.address,
          user: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Bet placed successfully:", tx);

      // Refresh data
      await Promise.all([fetchMarkets(), fetchUserBets()]);

      return tx;
    } catch (error: any) {
      console.error("Error placing bet:", error);
      throw new Error(error.message || "Failed to place bet");
    }
  };

  // Claim winnings
  const claimWinnings = async (betAddress: string): Promise<string> => {
    if (!program || !wallet) {
      throw new Error("Wallet not connected");
    }

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

      const tx = await program.methods
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

      console.log("Winnings claimed successfully:", tx);

      // Refresh data after a short delay
      await new Promise(r => setTimeout(r, 2000));
      await Promise.all([fetchMarkets(), fetchUserBets()]);

      return tx;
    } catch (error: any) {
      console.error("Error claiming winnings:", error);
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

  // Withdraw fees from a resolved market (ADMIN ONLY)
  const withdrawFees = async (marketAddress: string, marketId: number): Promise<string> => {
    if (!program || !wallet) {
      throw new Error("Wallet not connected");
    }

    try {
      const marketPubkey = new PublicKey(marketAddress);

      // Get admin's USDC token account
      const adminTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        wallet.publicKey
      );

      // Check if account exists, create if not
      const accountInfo = await connection.getAccountInfo(adminTokenAccount);
      if (!accountInfo) {
        const transaction = new Transaction();
        transaction.add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            adminTokenAccount,
            wallet.publicKey,
            USDC_MINT
          )
        );
        const signature = await (wallet as any).signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature);
      }

      // Derive vault PDA
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), new BN(marketId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      const tx = await program.methods
        .withdrawFees(new BN(marketId))
        .accounts({
          market: marketPubkey,
          vault: vaultPda,
          adminTokenAccount: adminTokenAccount,
          admin: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log("Fees withdrawn successfully:", tx);

      // Refresh data
      await Promise.all([fetchMarkets(), fetchUserBets()]);

      return tx;
    } catch (error: any) {
      console.error("Error withdrawing fees:", error);
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
    refetch: () => Promise.all([fetchMarkets(), fetchUserBets()]),
  };
}
