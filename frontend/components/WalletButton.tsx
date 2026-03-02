"use client";

import { UnifiedWalletButton } from '@jup-ag/wallet-adapter';
import { createElement } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { isSMWABridgeAvailable } from '@/lib/solana/smwaBridge';

export function WalletButton() {
  const { connected } = useWallet();

  // On Android with SMWA bridge: never show Jupiter's picker (it auto-detects
  // the broken standard MWA adapter). Instead, dispatch a custom event that
  // page.tsx listens for to open our safe direct-connect modal.
  if (isSMWABridgeAvailable()) {
    if (connected) {
      return createElement('button', {
        className: 'px-3 py-1.5 rounded-lg bg-[#00FF88]/20 border border-[#00FF88]/40 text-[#00FF88] text-xs font-bold',
        children: 'CONNECTED',
        disabled: true,
      });
    }
    return createElement('button', {
      className: 'px-3 py-1.5 rounded-lg bg-[#00F3FF]/20 border border-[#00F3FF]/40 text-[#00F3FF] text-xs font-bold hover:bg-[#00F3FF]/30 transition-colors',
      onClick: () => window.dispatchEvent(new CustomEvent('solana-saga:show-wallet-modal')),
      children: 'CONNECT',
    });
  }

  // Desktop/browser: use Jupiter's UnifiedWalletButton as normal
  return createElement(UnifiedWalletButton as any, {
    buttonClassName: "jupiter-wallet-btn",
    overrideContent: undefined,
  });
}
