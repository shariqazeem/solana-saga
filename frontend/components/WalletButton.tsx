"use client";

import { UnifiedWalletButton } from '@jup-ag/wallet-adapter';
import { createElement } from 'react';

export function WalletButton() {
  // Jupiter's UnifiedWalletButton handles both QR code (desktop)
  // and deep link (mobile/PSG1) wallet connections
  return createElement(UnifiedWalletButton as any, {
    buttonClassName: "jupiter-wallet-btn",
    overrideContent: undefined,
  });
}
