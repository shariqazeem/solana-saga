"use client";

import { ReactNode, useMemo, useEffect, useState } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { SOLANA_NETWORK } from "@/lib/solana/config";

interface UnifiedJupiterProviderProps {
  children: ReactNode;
}

/**
 * Unified Jupiter Wallet Provider
 *
 * Provides the EXACT experience as unified.jup.ag with:
 * - All standard wallets (Phantom, Solflare, Backpack, etc.)
 * - Jupiter Mobile with QR code login
 * - Wallet Standard support (auto-detects installed wallets)
 *
 * For Play Solana Hackathon - Jupiter Track
 */
export function UnifiedJupiterProvider({ children }: UnifiedJupiterProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [modules, setModules] = useState<{
    UnifiedWalletProvider: any;
    useWrappedReownAdapter: any;
  } | null>(null);

  // Network configuration
  const network = SOLANA_NETWORK === "mainnet-beta"
    ? WalletAdapterNetwork.Mainnet
    : WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => {
    const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST;
    if (customRpc) return customRpc;
    return clusterApiUrl(network);
  }, [network]);

  // Reown project ID for Jupiter Mobile WalletConnect
  const reownProjectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "28d5bd001f01f925b327ed9405773ba3";

  // Load Jupiter modules dynamically to avoid SSR issues
  useEffect(() => {
    setMounted(true);

    let cancelled = false;

    const loadModules = async () => {
      try {
        console.log("[Jupiter] Loading wallet adapters...");

        const [walletAdapter, mobileAdapter] = await Promise.all([
          import("@jup-ag/wallet-adapter"),
          import("@jup-ag/jup-mobile-adapter"),
        ]);

        if (cancelled) return;

        console.log("[Jupiter] Modules loaded successfully");
        setModules({
          UnifiedWalletProvider: walletAdapter.UnifiedWalletProvider,
          useWrappedReownAdapter: mobileAdapter.useWrappedReownAdapter,
        });
      } catch (err) {
        console.error("[Jupiter] Failed to load modules:", err);
      }
    };

    loadModules();
    return () => { cancelled = true; };
  }, []);

  // Don't render until mounted to avoid SSR hydration issues
  if (!mounted || !modules) {
    return <>{children}</>;
  }

  return (
    <JupiterWalletInner
      endpoint={endpoint}
      network={network}
      reownProjectId={reownProjectId}
      modules={modules}
    >
      {children}
    </JupiterWalletInner>
  );
}

// Inner component that uses the loaded modules
function JupiterWalletInner({
  children,
  endpoint,
  network,
  reownProjectId,
  modules,
}: {
  children: ReactNode;
  endpoint: string;
  network: WalletAdapterNetwork;
  reownProjectId: string;
  modules: {
    UnifiedWalletProvider: any;
    useWrappedReownAdapter: any;
  };
}) {
  const { UnifiedWalletProvider, useWrappedReownAdapter } = modules;

  // Initialize Jupiter Mobile adapter with Reown (WalletConnect)
  // This adapter enables mobile wallet connections through WalletConnect protocol
  const { jupiterAdapter } = useWrappedReownAdapter({
    appKitOptions: {
      metadata: {
        name: "Solana Saga PSG1",
        description: "Swipe-to-Predict Gaming on Solana - Powered by Jupiter",
        url: typeof window !== 'undefined' ? window.location.origin : "https://solanasaga.fun",
        icons: ["https://solanasaga.fun/icon.png"],
      },
      projectId: reownProjectId,
      features: {
        analytics: false,
        socials: false,
        email: false,
      },
      // Disable built-in wallet list - UnifiedWalletProvider handles wallet discovery
      enableWallets: false,
    },
  });

  // Configure wallet adapters for the UnifiedWalletProvider
  // This memoized array includes the Jupiter Mobile Adapter and filters out any invalid adapters
  // The filter ensures each adapter has required properties (name and icon) before being used
  const wallets: any[] = useMemo(() => {
    return [
      jupiterAdapter, // Jupiter Mobile Adapter with WalletConnect integration
    ].filter((item) => item && item.name && item.icon) as any[];
  }, [jupiterAdapter]);

  console.log("[Jupiter] Wallet adapters configured:", wallets.length, "adapter(s)");

  // Notification callbacks
  const notificationCallback = useMemo(() => ({
    onConnect: (props: { publicKey?: string; shortAddress?: string; walletName?: string }) => {
      console.log(`[Jupiter] Connected: ${props.walletName} (${props.shortAddress})`);
    },
    onConnecting: (props: { walletName?: string }) => {
      console.log(`[Jupiter] Connecting to ${props.walletName}...`);
    },
    onDisconnect: (props: { walletName?: string }) => {
      console.log(`[Jupiter] Disconnected from ${props.walletName}`);
    },
    onNotInstalled: (props: { walletName?: string }) => {
      console.log(`[Jupiter] ${props.walletName} is not installed`);
    },
  }), []);

  return (
    <UnifiedWalletProvider
      wallets={wallets}
      config={{
        autoConnect: false,
        env: network === WalletAdapterNetwork.Mainnet ? "mainnet-beta" : "devnet",
        metadata: {
          name: "Solana Saga PSG1",
          description: "Swipe-to-Predict Gaming on Solana - Powered by Jupiter",
          url: typeof window !== 'undefined' ? window.location.origin : "https://solanasaga.fun",
          iconUrls: ["https://solanasaga.fun/icon.png"],
        },
        notificationCallback: notificationCallback,
        walletlistExplanation: {
          href: "https://dev.jup.ag/tool-kits/wallet-kit",
        },
        theme: "dark",
        lang: "en",
      }}
    >
      {children}
    </UnifiedWalletProvider>
  );
}

/**
 * Lazy-loaded Jupiter Wallet Button
 * Re-export for convenience
 */
export function UnifiedWalletButton() {
  const [ButtonComponent, setButtonComponent] = useState<React.ComponentType<any> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;
    const loadButton = async () => {
      try {
        const mod = await import("@jup-ag/wallet-adapter");
        if (!cancelled && mod.UnifiedWalletButton) {
          setButtonComponent(() => mod.UnifiedWalletButton as React.ComponentType<any>);
        }
      } catch (err) {
        console.error("[Jupiter] Failed to load wallet button:", err);
      }
    };
    loadButton();
    return () => { cancelled = true; };
  }, [mounted]);

  if (!mounted || !ButtonComponent) {
    return (
      <button className="px-4 py-2 bg-gray-700 text-white rounded-lg opacity-50">
        Loading Wallet...
      </button>
    );
  }

  return <ButtonComponent />;
}
