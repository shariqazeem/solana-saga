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
import { PROGRAM_ID, RPC_ENDPOINT, DEMO_MARKETS } from "../config";
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
  endsIn: string;
  bettors: number;
  totalBetsCount: number;
  status: string;
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
      const marketAccounts = await readOnlyProgram.account.market.all();

      const marketsData: Market[] = marketAccounts.map((account: any) => {
        const data = account.account;

        // USDC has 6 decimals - use snake_case field names from actual IDL
        const yesPool = toNum(data.yes_pool) / Math.pow(10, USDC_DECIMALS);
        const noPool = toNum(data.no_pool) / Math.pow(10, USDC_DECIMALS);
        const totalVolume = toNum(data.total_volume) / Math.pow(10, USDC_DECIMALS);

        // Calculate prices (percentage chance of winning)
        const totalPool = yesPool + noPool;
        const yesPrice = totalPool > 0 ? Math.round((yesPool / totalPool) * 100) : 50;
        const noPrice = 100 - yesPrice;

        // Calculate time remaining - use snake_case field names
        const endTime = toNum(data.end_time);
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
          publicKey: account.publicKey.toString(),
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
          createdAt: toNum(data.created_at),
          yesPrice,
          noPrice,
          endsIn,
          bettors: toNum(data.unique_bettors),
          totalBetsCount: toNum(data.total_bets_count),
          status,
        };
      });

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
      const betAccounts = await program.account.bet.all([
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
      const marketPubkey = new PublicKey(marketAddress);
      const marketAccount = await program.account.market.fetch(marketPubkey);
      const marketId = toNum((marketAccount as any).id);
      const totalBetsCount = toNum((marketAccount as any).total_bets_count);

      // Derive the proper market PDA (must match the PDA from create_market)
      const [marketPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), new BN(marketId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      console.log("Market address from URL:", marketPubkey.toString());
      console.log("Derived market PDA:", marketPda.toString());
      console.log("Market ID:", marketId);
      console.log("Total bets count:", totalBetsCount);

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

        const signature = await wallet.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature);
      }

      // Derive PDAs using the correct market PDA
      const [betPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("bet"),
          marketPda.toBuffer(), // Use derived marketPda, not marketPubkey
          wallet.publicKey.toBuffer(),
          new BN(totalBetsCount).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const [userStatsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_stats"), wallet.publicKey.toBuffer()],
        program.programId
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), new BN(marketId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      console.log("Derived bet PDA:", betPda.toString());
      console.log("User stats PDA:", userStatsPda.toString());
      console.log("Vault PDA:", vaultPda.toString());

      // Place bet using the derived market PDA
      const tx = await program.methods
        .placeBet(new BN(marketId), amountInSmallestUnits, prediction)
        .accounts({
          market: marketPda, // Use derived marketPda
          bet: betPda,
          userStats: userStatsPda,
          vault: vaultPda,
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
      const betPubkey = new PublicKey(betAddress);
      const betAccount = await program.account.bet.fetch(betPubkey);
      const marketPubkey = (betAccount as any).market as PublicKey;
      const marketAccount = await program.account.market.fetch(marketPubkey);
      const marketId = toNum((marketAccount as any).id);

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

      // Refresh data
      await Promise.all([fetchMarkets(), fetchUserBets()]);

      return tx;
    } catch (error: any) {
      console.error("Error claiming winnings:", error);
      throw new Error(error.message || "Failed to claim winnings");
    }
  };

  // Get a single market by address
  const getMarket = useCallback(async (marketAddress: string): Promise<Market | null> => {
    if (!readOnlyProgram) return null;

    try {
      const marketPubkey = new PublicKey(marketAddress);
      const data = await readOnlyProgram.account.market.fetch(marketPubkey);

      // Use snake_case field names from actual IDL
      const yesPool = toNum((data as any).yes_pool) / Math.pow(10, USDC_DECIMALS);
      const noPool = toNum((data as any).no_pool) / Math.pow(10, USDC_DECIMALS);
      const totalVolume = toNum((data as any).total_volume) / Math.pow(10, USDC_DECIMALS);

      const totalPool = yesPool + noPool;
      const yesPrice = totalPool > 0 ? Math.round((yesPool / totalPool) * 100) : 50;
      const noPrice = 100 - yesPrice;

      const endTime = toNum((data as any).end_time);
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
        createdAt: toNum((data as any).created_at),
        yesPrice,
        noPrice,
        endsIn,
        bettors: toNum((data as any).unique_bettors),
        totalBetsCount: toNum((data as any).total_bets_count),
        status,
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
    getMarket,
    getUserUsdcAccount,
    refetch: () => Promise.all([fetchMarkets(), fetchUserBets()]),
  };
}
