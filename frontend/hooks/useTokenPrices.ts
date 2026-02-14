"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchTokenPrices, type TokenPrice } from "@/lib/jupiter/jupiterPriceApi";

interface UseTokenPricesReturn {
  prices: Record<string, TokenPrice>;
  loading: boolean;
}

export function useTokenPrices(): UseTokenPricesReturn {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchTokenPrices();
      setPrices(data);
    } catch {
      // Keep previous prices on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [load]);

  return { prices, loading };
}
