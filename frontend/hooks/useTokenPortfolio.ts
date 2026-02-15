"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { RPC_ENDPOINT } from "@/lib/solana/config";
import { getTokensByMints, type TokenInfo } from "@/lib/jupiter/jupiterTokenApi";
import { fetchTokenPrices } from "@/lib/jupiter/jupiterPriceApi";

export interface TokenHolding {
  mint: string;
  symbol: string;
  name: string;
  icon: string | null;
  balance: number;
  decimals: number;
  usdPrice: number;
  usdValue: number;
}

// Well-known token icons as fallback
const KNOWN_ICONS: Record<string, string> = {
  So11111111111111111111111111111111111111112: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
};

export function useTokenPortfolio() {
  const connection = useMemo(
    () => new Connection(RPC_ENDPOINT, { commitment: "confirmed" }),
    []
  );
  const { publicKey, connected } = useWallet();

  const [tokens, setTokens] = useState<TokenHolding[]>([]);
  const [totalValueUsd, setTotalValueUsd] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPortfolio = useCallback(async () => {
    if (!publicKey || !connected) {
      setTokens([]);
      setTotalValueUsd(0);
      return;
    }

    setLoading(true);

    try {
      // 1. Get all SPL token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
      );

      // 2. Filter accounts with balance > 0
      const holdings: { mint: string; balance: number; decimals: number }[] = [];
      for (const { account } of tokenAccounts.value) {
        const parsed = account.data.parsed?.info;
        if (!parsed) continue;
        const amount = parseFloat(parsed.tokenAmount?.uiAmountString || "0");
        if (amount > 0) {
          holdings.push({
            mint: parsed.mint,
            balance: amount,
            decimals: parsed.tokenAmount?.decimals || 0,
          });
        }
      }

      // 3. Get SOL balance
      const solLamports = await connection.getBalance(publicKey);
      const solBalance = solLamports / 1e9;

      // 4. Fetch token metadata from Jupiter Token API
      const mints = holdings.map((h) => h.mint);
      const tokenInfoMap = await getTokensByMints(mints);

      // 5. Fetch prices from Jupiter Price API
      const prices = await fetchTokenPrices();
      // Build a price map from mint -> usd price
      const priceByMint: Record<string, number> = {};
      for (const [, tp] of Object.entries(prices)) {
        priceByMint[tp.id] = tp.price;
      }

      // 6. Build portfolio entries
      const result: TokenHolding[] = [];

      // Add SOL first
      const solPrice = priceByMint["So11111111111111111111111111111111111111112"] || 0;
      if (solBalance > 0) {
        result.push({
          mint: "So11111111111111111111111111111111111111112",
          symbol: "SOL",
          name: "Solana",
          icon: KNOWN_ICONS["So11111111111111111111111111111111111111112"] || null,
          balance: solBalance,
          decimals: 9,
          usdPrice: solPrice,
          usdValue: solBalance * solPrice,
        });
      }

      // Add SPL tokens
      for (const h of holdings) {
        const info = tokenInfoMap.get(h.mint);
        const price = priceByMint[h.mint] || 0;

        result.push({
          mint: h.mint,
          symbol: info?.symbol || h.mint.slice(0, 4) + "...",
          name: info?.name || "Unknown Token",
          icon: info?.logoURI || KNOWN_ICONS[h.mint] || null,
          balance: h.balance,
          decimals: h.decimals,
          usdPrice: price,
          usdValue: h.balance * price,
        });
      }

      // Sort by USD value descending
      result.sort((a, b) => b.usdValue - a.usdValue);

      const total = result.reduce((sum, t) => sum + t.usdValue, 0);
      setTokens(result);
      setTotalValueUsd(total);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, connected]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return {
    tokens,
    totalValueUsd,
    loading,
    refetch: fetchPortfolio,
  };
}
