"use client";

import { useCallback } from "react";
import { isSMWABridgeAvailable } from "@/lib/solana/smwaBridge";

/**
 * Compatibility hook for showing wallet modal.
 * Works with both Jupiter UnifiedWalletProvider and standard Solana wallet adapter.
 *
 * On PSG1 (SMWA bridge available), dispatches a custom event so page.tsx can open
 * our direct connect modal instead of Jupiter's broken wallet picker.
 */
export function useWalletModalCompat() {
  const setVisible = useCallback((visible: boolean) => {
    if (!visible) return;

    // On PSG1/Android with SMWA bridge, bypass Jupiter's picker entirely
    if (isSMWABridgeAvailable()) {
      window.dispatchEvent(new CustomEvent('solana-saga:show-wallet-modal'));
      return;
    }

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
