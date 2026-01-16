"use client";

import { ReactNode } from "react";
import { FEATURES } from "@/lib/solana/config";
import { WalletProvider as LegacyWalletProvider } from "./WalletProvider";
import { UnifiedJupiterProvider } from "./UnifiedJupiterProvider";
import { TransactionStateProvider } from "./TransactionStateProvider";

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Unified App Provider
 *
 * Wraps the application with appropriate providers based on configuration:
 * - Jupiter Unified Wallet (for hackathon/production with ALL wallets + QR code)
 * - Legacy Wallet (for devnet development)
 * - Transaction State (always)
 */
export function AppProvider({ children }: AppProviderProps) {
  const WalletProviderComponent = FEATURES.USE_JUPITER_WALLET
    ? UnifiedJupiterProvider
    : LegacyWalletProvider;

  return (
    <WalletProviderComponent>
      <TransactionStateProvider>
        {children}
      </TransactionStateProvider>
    </WalletProviderComponent>
  );
}
