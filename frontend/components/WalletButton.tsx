"use client";

import dynamic from 'next/dynamic';
import { FEATURES } from '@/lib/solana/config';

// Jupiter Unified Wallet Button (for Jupiter Track)
// This renders Jupiter's official wallet modal with all wallet options
// including Phantom, Solflare, Jupiter Mobile, etc.
const JupiterWalletButton = dynamic(
  async () => (await import('@jup-ag/wallet-adapter')).UnifiedWalletButton,
  { ssr: false, loading: () => <button className="px-4 py-2 bg-gray-700 text-white rounded-lg opacity-50">Loading...</button> }
);

// Standard Solana Wallet Button (fallback)
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export function WalletButton() {
  // Use Jupiter's built-in UnifiedWalletButton
  // It handles mobile, desktop, and all wallet types automatically
  if (FEATURES.USE_JUPITER_WALLET) {
    return <JupiterWalletButton />;
  }

  return <WalletMultiButtonDynamic />;
}
