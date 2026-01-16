"use client";

import { ReactNode, useMemo, useCallback, useState } from "react";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import {
  UnifiedWalletProvider,
  UnifiedWalletButton,
} from "@jup-ag/wallet-adapter";

// Import wallet adapter CSS for fallback
import "@solana/wallet-adapter-react-ui/styles.css";

interface JupiterWalletProviderProps {
  children: ReactNode;
}

/**
 * Jupiter Unified Wallet Provider
 *
 * Features:
 * - Jupiter Mobile Wallet support with QR code login
 * - 20+ wallet adapters via unified interface
 * - Wallet Standard compatibility
 * - Mobile-first responsive design
 * - Jupiter theme integration
 *
 * For Play Solana Hackathon - Jupiter Track
 */
export function JupiterWalletProvider({ children }: JupiterWalletProviderProps) {
  // Network configuration - mainnet for real Kalshi markets
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta"
    ? WalletAdapterNetwork.Mainnet
    : WalletAdapterNetwork.Devnet;

  // RPC endpoint - use custom or public
  const endpoint = useMemo(() => {
    const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST;
    if (customRpc) {
      return customRpc;
    }
    return clusterApiUrl(network);
  }, [network]);

  // Connection config optimized for mobile wallet adapter
  const connectionConfig = useMemo(
    () => ({
      commitment: "confirmed" as const,
      confirmTransactionInitialTimeout: 60000, // 60 seconds for mobile deep links
      disableRetryOnRateLimit: false,
    }),
    []
  );

  // Error handler for wallet operations
  const onError = useCallback((error: WalletError) => {
    console.error("[Jupiter Wallet Error]", error.name, error.message);

    // Don't show alert for user rejection (normal flow)
    if (error.name === "WalletSignTransactionError") {
      console.log("[Wallet] Transaction signing cancelled or failed");
      return;
    }

    if (error.name === "WalletConnectionError") {
      console.log("[Wallet] Connection error - wallet may be locked or unavailable");
      return;
    }

    if (error.name === "WalletDisconnectedError") {
      console.log("[Wallet] Wallet disconnected");
      return;
    }

    console.error("[Wallet] Unexpected error:", error);
  }, []);

  // Notification handler for Jupiter Wallet Kit
  const notificationCallback = useMemo(() => ({
    onConnect: (props: { publicKey: string; shortAddress: string; walletName: string }) => {
      console.log(`[Jupiter] Connected: ${props.walletName} (${props.shortAddress})`);
    },
    onConnecting: (props: { publicKey: string; shortAddress: string; walletName: string }) => {
      console.log(`[Jupiter] Connecting: ${props.walletName}...`);
    },
    onDisconnect: (props: { publicKey: string; shortAddress: string; walletName: string }) => {
      console.log(`[Jupiter] Disconnected: ${props.walletName}`);
    },
    onNotInstalled: (props: { publicKey: string; shortAddress: string; walletName: string }) => {
      console.log(`[Jupiter] Wallet not installed: ${props.walletName}`);
    },
  }), []);

  return (
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <UnifiedWalletProvider
        wallets={[]}
        config={{
          autoConnect: true,
          env: network === WalletAdapterNetwork.Mainnet ? "mainnet-beta" : "devnet",
          metadata: {
            name: "Solana Saga",
            description: "Swipe-to-Predict Gaming on Solana - Powered by Jupiter & Kalshi",
            url: "https://solanasaga.fun",
            iconUrls: ["https://solanasaga.fun/icon.png"],
          },
          notificationCallback: notificationCallback,
          walletlistExplanation: {
            href: "https://docs.solanasaga.fun/wallets",
          },
          theme: "jupiter", // Jupiter's native theme
          lang: "en",
          walletAttachments: {
            "Jupiter": {
              attachment: (
                <div className="text-[10px] px-2 py-0.5 rounded bg-[#00F3FF]/20 text-[#00F3FF] font-bold">
                  RECOMMENDED
                </div>
              ),
            },
          },
        }}
      >
        {children}
      </UnifiedWalletProvider>
    </ConnectionProvider>
  );
}

// Re-export the unified wallet button for easy access
export { UnifiedWalletButton };
