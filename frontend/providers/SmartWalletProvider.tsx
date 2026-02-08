"use client";

import { ReactNode } from "react";
import { JupiterWalletProvider } from "./JupiterWalletProvider";

interface SmartWalletProviderProps {
  children: ReactNode;
}

/**
 * Wallet Provider - Always uses Jupiter Wallet Kit.
 * Supports Jupiter Mobile QR login + standard wallets (Phantom, Solflare, etc.)
 */
export function SmartWalletProvider({ children }: SmartWalletProviderProps) {
  return <JupiterWalletProvider>{children}</JupiterWalletProvider>;
}
