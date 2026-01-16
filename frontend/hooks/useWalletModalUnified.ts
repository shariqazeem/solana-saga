"use client";

import { useCallback, useState, useEffect } from "react";
import { FEATURES } from "@/lib/solana/config";

/**
 * Unified wallet modal hook that works with both Jupiter and standard Solana wallet adapter
 */
export function useWalletModalUnified() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const setVisible = useCallback((visible: boolean) => {
    if (!visible || !isReady) return;

    if (FEATURES.USE_JUPITER_WALLET) {
      // For Jupiter, find and click the wallet button
      // Try multiple selectors
      const selectors = [
        '[class*="unified-wallet-button"]',
        '[class*="UnifiedWalletButton"]',
        'button[class*="wallet"]',
      ];

      for (const selector of selectors) {
        const btn = document.querySelector(selector) as HTMLButtonElement;
        if (btn) {
          btn.click();
          return;
        }
      }

      // Fallback: find button by text content
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        const text = btn.textContent?.toLowerCase() || '';
        if (text.includes('connect') || text.includes('select wallet') || text.includes('loading wallet')) {
          btn.click();
          return;
        }
      }

      console.warn("[WalletModal] Could not find Jupiter wallet button");
    } else {
      // For standard wallet adapter, this won't work without the proper context
      console.warn("[WalletModal] Standard wallet modal requires WalletModalProvider");
    }
  }, [isReady]);

  return { setVisible };
}
