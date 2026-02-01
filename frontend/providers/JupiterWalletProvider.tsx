"use client";

import { ReactNode, useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { UnifiedWalletProvider, UnifiedWalletButton } from "@jup-ag/wallet-adapter";
import { useWrappedReownAdapter } from "@jup-ag/jup-mobile-adapter";

// Hardcode the project ID to ensure it's available
const REOWN_PROJECT_ID = "28d5bd001f01f925b327ed9405773ba3";

interface JupiterWalletProviderProps {
  children: ReactNode;
}

/**
 * Inner provider that uses the Jupiter Mobile Adapter hook
 */
function JupiterWalletProviderInner({ children }: JupiterWalletProviderProps) {
  // Jupiter Mobile Adapter with Reown integration
  const { jupiterAdapter } = useWrappedReownAdapter({
    appKitOptions: {
      metadata: {
        name: "Solana Saga",
        description: "Prediction Market Game for PSG1 - Matrix Hackathon",
        url: typeof window !== "undefined" ? window.location.origin : "https://frontend-alpha-khaki.vercel.app",
        icons: ["https://frontend-alpha-khaki.vercel.app/icons/icon-192x192.png"],
      },
      projectId: REOWN_PROJECT_ID,
      features: {
        analytics: false,
        socials: ["google", "x", "apple"],
        email: false,
      },
      enableWallets: true,
    },
  });

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
        autoConnect: true,
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

/**
 * Fallback provider without Jupiter Mobile (for SSR)
 */
function FallbackWalletProvider({ children }: JupiterWalletProviderProps) {
  return (
    <UnifiedWalletProvider
      wallets={[]}
      config={{
        autoConnect: false,
        env: "devnet",
        metadata: {
          name: "Solana Saga",
          description: "Prediction Market Game for PSG1 - Matrix Hackathon",
          url: "https://frontend-alpha-khaki.vercel.app",
          iconUrls: ["https://frontend-alpha-khaki.vercel.app/icons/icon-192x192.png"],
        },
        theme: "jupiter",
        lang: "en",
      }}
    >
      {children}
    </UnifiedWalletProvider>
  );
}

/**
 * Main export - dynamically loaded to avoid SSR issues
 */
export function JupiterWalletProvider({ children }: JupiterWalletProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use fallback during SSR, full provider after mount
  if (!mounted) {
    return <FallbackWalletProvider>{children}</FallbackWalletProvider>;
  }

  return <JupiterWalletProviderInner>{children}</JupiterWalletProviderInner>;
}

export { UnifiedWalletButton };
