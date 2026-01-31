"use client";

import { ReactNode } from "react";
import { JupiterWalletProvider } from "./JupiterWalletProvider";

interface SmartWalletProviderProps {
  children: ReactNode;
}

// Check at build time if Reown is configured
const REOWN_PROJECT_ID = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;
const USE_JUPITER = Boolean(REOWN_PROJECT_ID && REOWN_PROJECT_ID.length > 0);

/**
 * Smart Wallet Provider - Now always uses Jupiter Wallet Kit for hackathon.
 *
 * Jupiter Wallet Kit provides:
 * - Multi-wallet support (Phantom, Solflare, etc.)
 * - Jupiter Mobile QR login
 * - Better mobile UX
 */
export function SmartWalletProvider({ children }: SmartWalletProviderProps) {
  // Always use Jupiter provider for the hackathon
  // It supports all standard wallets plus Jupiter Mobile
  return <JupiterWalletProvider>{children}</JupiterWalletProvider>;
}
