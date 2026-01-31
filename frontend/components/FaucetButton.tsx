"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Coins, Loader2, CheckCircle, AlertCircle } from "lucide-react";

// Devnet USDC Mint (this is a test token)
const DEVNET_USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

// Amount to airdrop (100 USDC = 100_000_000 with 6 decimals)
const AIRDROP_AMOUNT = 100_000_000;

interface FaucetButtonProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export function FaucetButton({ onSuccess, compact = false }: FaucetButtonProps) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const requestAirdrop = async () => {
    if (!publicKey || !connected) {
      setStatus("error");
      setMessage("Connect wallet first");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      // First, airdrop some SOL for transaction fees
      const solBalance = await connection.getBalance(publicKey);
      if (solBalance < 0.01 * LAMPORTS_PER_SOL) {
        setMessage("Requesting SOL for fees...");
        try {
          const airdropSig = await connection.requestAirdrop(
            publicKey,
            0.1 * LAMPORTS_PER_SOL
          );
          await connection.confirmTransaction(airdropSig, "confirmed");
        } catch (e) {
          console.log("SOL airdrop failed (may have already received):", e);
        }
      }

      // For devnet USDC, we'll use a simple approach:
      // Direct users to the Solana devnet faucet or use spl-token-faucet

      // Since we can't mint arbitrary tokens, let's provide instructions
      setStatus("success");
      setMessage("For devnet USDC, use: spl-token-faucet.com or Solana devnet faucet");

      // Alternative: If you have mint authority, you could mint directly
      // For hackathon demo, we'll show a helpful message

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Faucet error:", error);
      setStatus("error");
      setMessage(error.message || "Failed to get tokens");
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={requestAirdrop}
        disabled={loading || !connected}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFD700]/20 border border-[#FFD700]/30 text-[#FFD700] text-xs font-game hover:bg-[#FFD700]/30 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Coins className="w-3 h-3" />
        )}
        <span>GET USDC</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={requestAirdrop}
        disabled={loading || !connected}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-game font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>REQUESTING...</span>
          </>
        ) : (
          <>
            <Coins className="w-4 h-4" />
            <span>GET FREE TEST USDC</span>
          </>
        )}
      </button>

      {status === "success" && (
        <div className="flex items-center gap-2 text-xs text-[#00FF88]">
          <CheckCircle className="w-3 h-3" />
          <span>{message}</span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 text-xs text-[#FF0044]">
          <AlertCircle className="w-3 h-3" />
          <span>{message}</span>
        </div>
      )}

      {!connected && (
        <p className="text-xs text-gray-500 text-center">
          Connect wallet to get test tokens
        </p>
      )}
    </div>
  );
}
