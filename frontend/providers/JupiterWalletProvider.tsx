"use client";

import { ReactNode } from "react";
import { UnifiedWalletProvider, UnifiedWalletButton } from "@jup-ag/wallet-adapter";

interface JupiterWalletProviderProps {
  children: ReactNode;
}

/**
 * Jupiter Unified Wallet Kit Provider
 *
 * Features:
 * - Built-in Wallet Standard support (auto-discovers installed wallets)
 * - Built-in Mobile Wallet Adapter (MWA) support
 * - Mobile responsive
 * - Theming support
 *
 * Pass empty wallets array to use auto-discovery via Wallet Standard + MWA
 */
export function JupiterWalletProvider({ children }: JupiterWalletProviderProps) {
  return (
    <UnifiedWalletProvider
      wallets={[]} // Empty array - uses Wallet Standard + MWA auto-discovery
      config={{
        autoConnect: true,
        env: "devnet",
        metadata: {
          name: "Solana Saga",
          description: "Prediction Market Game for PSG1",
          url: typeof window !== "undefined" ? window.location.origin : "https://frontend-alpha-khaki.vercel.app",
          iconUrls: ["https://frontend-alpha-khaki.vercel.app/icons/icon-192x192.png"],
        },
        notificationCallback: {
          onConnect: (props) => {
            console.log("[Wallet] Connected:", props.walletName);
          },
          onConnecting: (props) => {
            console.log("[Wallet] Connecting to:", props.walletName);
          },
          onDisconnect: (props) => {
            console.log("[Wallet] Disconnected:", props.walletName);
          },
          onNotInstalled: (props) => {
            console.log("[Wallet] Not installed:", props.walletName);
          },
        },
        walletlistExplanation: {
          href: "https://station.jup.ag/docs/additional-topics/wallet-list",
        },
        theme: "jupiter",
        lang: "en",
      }}
    >
      {children}
    </UnifiedWalletProvider>
  );
}

export { UnifiedWalletButton };
