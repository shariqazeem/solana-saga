"use client";

import { ReactNode, useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import {
  UnifiedWalletProvider,
  UnifiedWalletButton,
} from "@jup-ag/wallet-adapter";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

interface JupiterWalletProviderProps {
  children: ReactNode;
}

/**
 * Simplified Jupiter Wallet Provider
 * Uses Jupiter's Unified Wallet Kit with Phantom and Solflare
 */
export function JupiterWalletProvider({ children }: JupiterWalletProviderProps) {
  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => {
    const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST;
    if (customRpc) {
      return customRpc;
    }
    return clusterApiUrl(network);
  }, [network]);

  const connectionConfig = useMemo(
    () => ({
      commitment: "confirmed" as const,
      confirmTransactionInitialTimeout: 60000,
    }),
    []
  );

  // Simple wallet list - Phantom and Solflare
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <UnifiedWalletProvider
        wallets={wallets}
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
            onConnect: () => console.log("[Wallet] Connected"),
            onConnecting: () => console.log("[Wallet] Connecting..."),
            onDisconnect: () => console.log("[Wallet] Disconnected"),
            onNotInstalled: () => console.log("[Wallet] Not installed"),
          },
          theme: "jupiter",
          lang: "en",
        }}
      >
        {children}
      </UnifiedWalletProvider>
    </ConnectionProvider>
  );
}

export { UnifiedWalletButton };
