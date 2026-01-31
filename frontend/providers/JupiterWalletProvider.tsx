"use client";

import { ReactNode, useMemo, useState, useEffect } from "react";
import { UnifiedWalletProvider, UnifiedWalletButton } from "@jup-ag/wallet-adapter";

// Hardcode the project ID to ensure it's available
const REOWN_PROJECT_ID = "28d5bd001f01f925b327ed9405773ba3";

interface JupiterWalletProviderProps {
  children: ReactNode;
}

/**
 * Jupiter Unified Wallet Kit with Jupiter Mobile Adapter
 *
 * Features:
 * - Jupiter Mobile wallet support (scan QR with Jupiter Mobile app)
 * - Built-in Wallet Standard support
 * - Built-in Mobile Wallet Adapter (MWA) support
 * - Social login (Google, X, Apple) via Reown
 */
export function JupiterWalletProvider({ children }: JupiterWalletProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [jupiterAdapter, setJupiterAdapter] = useState<any>(null);

  // Load Jupiter Mobile Adapter only on client side
  useEffect(() => {
    setMounted(true);

    // Dynamically import the Reown adapter
    import("@jup-ag/jup-mobile-adapter").then(({ createReownAdapter }) => {
      try {
        const adapter = createReownAdapter({
          metadata: {
            name: "Solana Saga",
            description: "Prediction Market Game for PSG1 - Matrix Hackathon",
            url: window.location.origin,
            icons: ["https://frontend-alpha-khaki.vercel.app/icons/icon-192x192.png"],
          },
          projectId: REOWN_PROJECT_ID,
          features: {
            analytics: false,
            socials: ["google", "x", "apple"],
            email: false,
          },
          enableWallets: true,
        });
        setJupiterAdapter(adapter);
      } catch (error) {
        console.error("[Jupiter] Failed to create Reown adapter:", error);
      }
    }).catch((error) => {
      console.error("[Jupiter] Failed to load jup-mobile-adapter:", error);
    });
  }, []);

  // Combine Jupiter Mobile adapter with auto-discovered wallets
  const wallets = useMemo(() => {
    if (jupiterAdapter && jupiterAdapter.name && jupiterAdapter.icon) {
      return [jupiterAdapter];
    }
    return [];
  }, [jupiterAdapter]);

  return (
    <UnifiedWalletProvider
      wallets={wallets}
      config={{
        autoConnect: mounted, // Only auto-connect after mounting
        env: "devnet",
        metadata: {
          name: "Solana Saga",
          description: "Prediction Market Game for PSG1 - Matrix Hackathon",
          url: typeof window !== "undefined" ? window.location.origin : "https://frontend-alpha-khaki.vercel.app",
          iconUrls: ["https://frontend-alpha-khaki.vercel.app/icons/icon-192x192.png"],
        },
        notificationCallback: {
          onConnect: (props) => {
            console.log("[Jupiter] Connected:", props.walletName);
          },
          onConnecting: (props) => {
            console.log("[Jupiter] Connecting to:", props.walletName);
          },
          onDisconnect: (props) => {
            console.log("[Jupiter] Disconnected:", props.walletName);
          },
          onNotInstalled: (props) => {
            console.log("[Jupiter] Not installed:", props.walletName);
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
