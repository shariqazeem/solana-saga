"use client";

import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import { clusterApiUrl, Connection } from "@solana/web3.js";
import { useMemo, useCallback, ReactNode } from "react";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * Wallet Provider with full Mobile Wallet Adapter (MWA) compatibility.
 *
 * Key configurations for mobile compatibility:
 * 1. Uses environment variable or devnet RPC endpoint
 * 2. Includes Phantom and Solflare adapters explicitly
 * 3. Handles wallet errors gracefully to prevent white screen issues
 * 4. Connection config optimized for mobile (confirmTransactionInitialTimeout)
 */
export function WalletProvider({ children }: WalletProviderProps) {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // Use custom RPC endpoint if provided, otherwise use public devnet
  const endpoint = useMemo(() => {
    const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST;
    if (customRpc) {
      return customRpc;
    }
    return clusterApiUrl(network);
  }, [network]);

  // Connection config optimized for mobile wallet adapter
  // Higher timeout helps prevent issues during deep link flows
  const connectionConfig = useMemo(
    () => ({
      commitment: "confirmed" as const,
      confirmTransactionInitialTimeout: 60000, // 60 seconds for mobile deep links
      disableRetryOnRateLimit: false,
    }),
    []
  );

  // Initialize wallet adapters
  // Note: Standard wallets like Phantom and Solflare register automatically
  // via the Wallet Standard, but we include them explicitly for reliability
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  // Error handler for wallet operations
  // This prevents unhandled errors from causing white screen crashes
  const onError = useCallback((error: WalletError) => {
    console.error("[Wallet Error]", error.name, error.message);

    // Don't show alert for user rejection (normal flow)
    if (error.name === "WalletSignTransactionError") {
      // User rejected or signing failed
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

    // For unexpected errors, log but don't crash
    console.error("[Wallet] Unexpected error:", error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <SolanaWalletProvider
        wallets={wallets}
        autoConnect
        onError={onError}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
