"use client";

import { useCallback } from "react";

/**
 * Compatibility hook for showing wallet modal.
 * Works with both Jupiter UnifiedWalletProvider and standard Solana wallet adapter.
 *
 * Jupiter's provider doesn't have useWalletModal, so we need this workaround.
 */
export function useWalletModalCompat() {
  const setVisible = useCallback((visible: boolean) => {
    if (!visible) return;

    // Try Jupiter's unified wallet button first
    const jupiterButton = document.querySelector(
      '[class*="unified-wallet-button"], [class*="UnifiedWalletButton"], button[class*="wallet"]'
    ) as HTMLButtonElement;

    if (jupiterButton) {
      jupiterButton.click();
      return;
    }

    // Fallback: Try standard wallet adapter button
    const walletButton = document.querySelector(
      '.wallet-adapter-button, [class*="wallet-adapter-button"]'
    ) as HTMLButtonElement;

    if (walletButton) {
      walletButton.click();
      return;
    }

    // Last resort: dispatch custom event that our provider can listen to
    window.dispatchEvent(new CustomEvent('solana-saga:show-wallet-modal'));

    console.log('[Wallet] Modal trigger requested');
  }, []);

  return { setVisible };
}
