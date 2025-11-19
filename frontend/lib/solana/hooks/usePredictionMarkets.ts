import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState, useEffect, useMemo } from "react";
import { PROGRAM_ID, RPC_ENDPOINT } from "../config";
import idl from "../../../prediction-markets-contracts/target/idl/prediction_markets.json";

export interface Market {
  publicKey: string;
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
}

export interface Bet {
  user: string;
  market: string;
  amount: number;
  prediction: boolean;
  tokensReceived: number;
  timestamp: number;
  claimed: boolean;
}

export function usePredictionMarkets() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);

  const program = useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: "confirmed" }
    );

    return new Program(idl as Idl, PROGRAM_ID, provider);
  }, [connection, wallet]);

  // Fetch all markets
  const fetchMarkets = async () => {
    if (!program) return;

    try {
      setLoading(true);
      const marketAccounts = await program.account.market.all();

      const marketsData: Market[] = marketAccounts.map((account: any) => {
        const data = account.account;
        const yesPool = data.yesPool.toNumber() / LAMPORTS_PER_SOL;
        const noPool = data.noPool.toNumber() / LAMPORTS_PER_SOL;
        const totalVolume = yesPool + noPool;

        // Calculate prices (percentage of winning)
        const yesPrice = totalVolume > 0 ? Math.round((yesPool / totalVolume) * 100) : 50;
        const noPrice = 100 - yesPrice;

        // Calculate time remaining
        const endTime = data.endTime.toNumber();
        const now = Math.floor(Date.now() / 1000);
        const secondsLeft = endTime - now;
        const daysLeft = Math.floor(secondsLeft / (24 * 60 * 60));
        const hoursLeft = Math.floor(secondsLeft / (60 * 60));

        let endsIn = "";
        if (daysLeft > 0) endsIn = `${daysLeft} day${daysLeft > 1 ? "s" : ""}`;
        else if (hoursLeft > 0) endsIn = `${hoursLeft} hour${hoursLeft > 1 ? "s" : ""}`;
        else endsIn = "Soon";

        return {
          publicKey: account.publicKey.toString(),
          question: data.question,
          description: data.description,
          category: data.category,
          creator: data.creator.toString(),
          yesPool,
          noPool,
          totalVolume,
          isResolved: data.isResolved,
          outcome: data.isResolved ? data.outcome : null,
          endTime,
          createdAt: data.createdAt.toNumber(),
          yesPrice,
          noPrice,
          endsIn,
          bettors: 0, // Would need to count bet accounts
        };
      });

      setMarkets(marketsData);
    } catch (error) {
      console.error("Error fetching markets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user bets
  const fetchUserBets = async () => {
    if (!program || !wallet) return;

    try {
      const betAccounts = await program.account.bet.all([
        {
          memcmp: {
            offset: 8, // Discriminator
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);

      const betsData: Bet[] = betAccounts.map((account: any) => {
        const data = account.account;
        return {
          user: data.user.toString(),
          market: data.market.toString(),
          amount: data.amount.toNumber() / LAMPORTS_PER_SOL,
          prediction: data.prediction,
          tokensReceived: data.tokensReceived.toNumber() / LAMPORTS_PER_SOL,
          timestamp: data.timestamp.toNumber(),
          claimed: data.claimed,
        };
      });

      setUserBets(betsData);
    } catch (error) {
      console.error("Error fetching user bets:", error);
    }
  };

  // Place a bet
  const placeBet = async (marketAddress: string, amount: number, prediction: boolean) => {
    if (!program || !wallet) {
      throw new Error("Wallet not connected");
    }

    try {
      const marketPubkey = new PublicKey(marketAddress);
      const betKeypair = new PublicKey(Math.random().toString()); // Generate new bet account

      const amountLamports = new BN(amount * LAMPORTS_PER_SOL);

      const tx = await program.methods
        .placeBet(amountLamports, prediction)
        .accounts({
          market: marketPubkey,
          bet: betKeypair,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Bet placed successfully:", tx);

      // Refresh data
      await Promise.all([fetchMarkets(), fetchUserBets()]);

      return tx;
    } catch (error) {
      console.error("Error placing bet:", error);
      throw error;
    }
  };

  // Claim winnings
  const claimWinnings = async (betAddress: string) => {
    if (!program || !wallet) {
      throw new Error("Wallet not connected");
    }

    try {
      const betPubkey = new PublicKey(betAddress);
      const betAccount = await program.account.bet.fetch(betPubkey);
      const marketPubkey = betAccount.market as PublicKey;

      const tx = await program.methods
        .claimWinnings()
        .accounts({
          market: marketPubkey,
          bet: betPubkey,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Winnings claimed successfully:", tx);

      // Refresh data
      await Promise.all([fetchMarkets(), fetchUserBets()]);

      return tx;
    } catch (error) {
      console.error("Error claiming winnings:", error);
      throw error;
    }
  };

  // Resolve market (admin only)
  const resolveMarket = async (marketAddress: string, outcome: boolean) => {
    if (!program || !wallet) {
      throw new Error("Wallet not connected");
    }

    try {
      const marketPubkey = new PublicKey(marketAddress);

      const tx = await program.methods
        .resolveMarket(outcome)
        .accounts({
          market: marketPubkey,
          creator: wallet.publicKey,
        })
        .rpc();

      console.log("Market resolved successfully:", tx);

      // Refresh markets
      await fetchMarkets();

      return tx;
    } catch (error) {
      console.error("Error resolving market:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (program) {
      fetchMarkets();
      if (wallet) {
        fetchUserBets();
      }
    }
  }, [program, wallet]);

  return {
    markets,
    userBets,
    loading,
    placeBet,
    claimWinnings,
    resolveMarket,
    refetch: () => Promise.all([fetchMarkets(), fetchUserBets()]),
  };
}
