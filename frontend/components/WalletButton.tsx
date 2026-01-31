"use client";

import { UnifiedWalletButton } from '@jup-ag/wallet-adapter';
import { createElement } from 'react';

export function WalletButton() {
  // Workaround for React types mismatch between packages
  return createElement(UnifiedWalletButton as any);
}
