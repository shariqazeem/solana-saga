"use client";

import dynamic from 'next/dynamic';

// Dynamically import WalletMultiButton with no SSR to avoid hydration issues
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export function WalletButton() {
  return <WalletMultiButtonDynamic />;
}
