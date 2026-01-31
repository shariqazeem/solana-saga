"use client";

import { ReactNode, useMemo, useCallback } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import {
  UnifiedWalletProvider,
  UnifiedWalletButton,
  Adapter,
} from "@jup-ag/wallet-adapter";
import { useWrappedReownAdapter } from "@jup-ag/jup-mobile-adapter";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

interface JupiterWalletProviderProps {
  children: ReactNode;
}

/**
 * Jupiter Wallet Provider with Jupiter Mobile Adapter support.
 *
 * This provider uses Jupiter's Unified Wallet Kit which provides:
 * - Jupiter Mobile QR code login (scan with Jupiter Mobile app)
 * - Support for 20+ wallet adapters
 * - Mobile-friendly wallet connector
 * - Wallet notifications system
 *
 * For Jupiter Mobile Adapter to work, you need a Reown project ID.
 * Get one at: https://dashboard.reown.com/
 */
export function JupiterWalletProvider({ children }: JupiterWalletProviderProps) {
  const network = WalletAdapterNetwork.Devnet;

  // Use custom RPC endpoint if provided
  const endpoint = useMemo(() => {
    const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST;
    if (customRpc) {
      return customRpc;
    }
    return clusterApiUrl(network);
  }, [network]);

  // Connection config optimized for mobile
  const connectionConfig = useMemo(
    () => ({
      commitment: "confirmed" as const,
      confirmTransactionInitialTimeout: 60000,
    }),
    []
  );

  // Jupiter Mobile Adapter with Reown (WalletConnect) integration
  // NOTE: You need to get a project ID from https://dashboard.reown.com/
  const { jupiterAdapter } = useWrappedReownAdapter({
    appKitOptions: {
      metadata: {
        name: "Solana Saga",
        description: "The Tinder of Prediction Markets - Swipe to predict on Solana",
        url: typeof window !== "undefined" ? window.location.origin : "https://solana-saga.vercel.app",
        icons: ["https://solana-saga.vercel.app/icons/icon-192x192.png"],
      },
      // Get your project ID from https://dashboard.reown.com/
      projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "",
      features: {
        analytics: false,
        socials: ["google", "x", "apple"],
        email: false,
      },
      enableWallets: false, // We manage wallets ourselves
    },
  });

  // Combine Jupiter Mobile Adapter with standard wallets
  const wallets: Adapter[] = useMemo(() => {
    const adapters: Adapter[] = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ];

    // Add Jupiter Mobile Adapter if configured
    if (jupiterAdapter && jupiterAdapter.name && jupiterAdapter.icon) {
      adapters.unshift(jupiterAdapter as Adapter);
    }

    return adapters.filter((item) => item && item.name && item.icon);
  }, [jupiterAdapter, network]);

  // Wallet notification callback
  const notificationCallback = useCallback((notification: { type: string; message: string }) => {
    console.log("[Jupiter Wallet]", notification.type, notification.message);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <UnifiedWalletProvider
        wallets={wallets}
        config={{
          autoConnect: true,
          env: "devnet",
          metadata: {
            name: "Solana Saga",
            description: "The Tinder of Prediction Markets - Swipe to predict on Solana",
            url: typeof window !== "undefined" ? window.location.origin : "https://solana-saga.vercel.app",
            iconUrls: ["https://solana-saga.vercel.app/icons/icon-192x192.png"],
          },
          notificationCallback: {
            onConnect: () => console.log("[Jupiter] Wallet connected"),
            onConnecting: () => console.log("[Jupiter] Connecting..."),
            onDisconnect: () => console.log("[Jupiter] Wallet disconnected"),
            onNotInstalled: () => console.log("[Jupiter] Wallet not installed"),
          },
          walletlistExplanation: {
            href: "https://dev.jup.ag/tool-kits/wallet-kit",
          },
          // Jupiter theme for branding
          theme: "jupiter",
          lang: "en",
        }}
      >
        {children}
      </UnifiedWalletProvider>
    </ConnectionProvider>
  );
}

// Re-export the UnifiedWalletButton for convenience
export { UnifiedWalletButton };
