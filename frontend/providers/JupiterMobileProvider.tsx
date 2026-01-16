"use client";

import { ReactNode, useState, useEffect, Component, ErrorInfo } from "react";
import { SOLANA_NETWORK } from "@/lib/solana/config";

interface JupiterMobileProviderProps {
  children: ReactNode;
}

// Reown Project ID for WalletConnect QR code login
const REOWN_PROJECT_ID = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "28d5bd001f01f925b327ed9405773ba3";

// App metadata for WalletConnect - must match domain
const APP_METADATA = {
  name: "Solana Saga",
  description: "Swipe-to-Predict Gaming on Solana",
  url: "https://solanasaga.fun",
  icons: ["https://solanasaga.fun/icon.png"],
};

// AppKit options with wallet discovery disabled to prevent MWA
const APP_KIT_OPTIONS = {
  metadata: APP_METADATA,
  projectId: REOWN_PROJECT_ID,
  features: {
    analytics: false,
    socials: false,
    email: false,
  },
  enableWallets: false, // Disable wallet discovery to prevent MWA
};

// Wallet notification callbacks
const WalletNotification = {
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
};

// Error boundary to catch initialization errors
class WalletErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Jupiter] Wallet initialization error:", error.message);
    console.error("[Jupiter] Error stack:", error.stack);
    console.error("[Jupiter] Component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Inner component that uses Jupiter Mobile adapter for QR code login
function JupiterWithQRCode({
  children,
  UnifiedWalletProvider,
  jupiterAdapter,
}: {
  children: ReactNode;
  UnifiedWalletProvider: React.ComponentType<any>;
  jupiterAdapter: any;
}) {
  // ONLY use the Jupiter adapter - this shows QR code like on unified.jup.ag
  // No MWA, no other wallets - just the QR code option for PSG1
  const wallets = jupiterAdapter ? [jupiterAdapter] : [];

  console.log("[Jupiter] Using Jupiter Mobile adapter for QR code login, adapter:", jupiterAdapter?.name);

  return (
    <UnifiedWalletProvider
      wallets={wallets}
      config={{
        autoConnect: false,
        env: SOLANA_NETWORK === "mainnet-beta" ? "mainnet-beta" : "devnet",
        metadata: {
          name: "Solana Saga",
          description: "Swipe-to-Predict Gaming on Solana",
          url: "https://solanasaga.fun",
          iconUrls: ["https://solanasaga.fun/icon.png"],
        },
        notificationCallback: WalletNotification,
        walletlistExplanation: {
          href: "https://station.jup.ag/docs/additional-topics/wallet-list",
        },
        theme: "dark",
        lang: "en",
      }}
    >
      {children}
    </UnifiedWalletProvider>
  );
}

// Wrapper that loads Jupiter Mobile adapter with hook for QR code
function JupiterAdapterLoader({
  children,
  UnifiedWalletProvider,
  useWrappedReownAdapter,
}: {
  children: ReactNode;
  UnifiedWalletProvider: React.ComponentType<any>;
  useWrappedReownAdapter: (options: any) => { reownAdapter: any; jupiterAdapter: any };
}) {
  // Use the hook to get jupiterAdapter - this is what shows QR code
  const { jupiterAdapter } = useWrappedReownAdapter({
    appKitOptions: APP_KIT_OPTIONS,
  });

  console.log("[Jupiter] Got adapters from hook, jupiterAdapter:", jupiterAdapter?.name);

  return (
    <JupiterWithQRCode
      UnifiedWalletProvider={UnifiedWalletProvider}
      jupiterAdapter={jupiterAdapter}
    >
      {children}
    </JupiterWithQRCode>
  );
}

// Lazy-loaded Jupiter wallet component with Reown for QR code
function JupiterWalletInner({ children }: { children: ReactNode }) {
  const [modules, setModules] = useState<{
    UnifiedWalletProvider: React.ComponentType<any>;
    useWrappedReownAdapter: (options: any) => { reownAdapter: any; jupiterAdapter: any };
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadModules = async () => {
      try {
        console.log("[Jupiter] Loading wallet adapter and mobile adapter...");

        // Load both modules in parallel
        const [walletAdapter, mobileAdapter] = await Promise.all([
          import("@jup-ag/wallet-adapter"),
          import("@jup-ag/jup-mobile-adapter"),
        ]);

        if (cancelled) return;

        console.log("[Jupiter] Both adapters loaded successfully");
        setModules({
          UnifiedWalletProvider: walletAdapter.UnifiedWalletProvider,
          useWrappedReownAdapter: mobileAdapter.useWrappedReownAdapter,
        });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[Jupiter] Failed to load adapters:", message);
        setLoadError(message);
      }
    };

    loadModules();
    return () => { cancelled = true; };
  }, []);

  // Still loading
  if (!modules && !loadError) {
    console.log("[Jupiter] Still loading...");
    return <>{children}</>;
  }

  // Load error - render children without wallet
  if (loadError || !modules) {
    console.error("[Jupiter] Rendering without wallet due to load error:", loadError);
    return <>{children}</>;
  }

  // Use the Jupiter adapter loader which calls the hook for QR code
  return (
    <JupiterAdapterLoader
      UnifiedWalletProvider={modules.UnifiedWalletProvider}
      useWrappedReownAdapter={modules.useWrappedReownAdapter}
    >
      {children}
    </JupiterAdapterLoader>
  );
}

// Hide Mobile Wallet Adapter from Jupiter modal using MutationObserver
function useMWAHider() {
  useEffect(() => {
    const hideMWA = () => {
      // Find and hide any elements containing "Mobile Wallet Adapter" text
      const allElements = document.querySelectorAll('button, li, div[role="button"]');
      allElements.forEach((el) => {
        const text = el.textContent?.toLowerCase() || '';
        if (text.includes('mobile wallet adapter') || text.includes('mobile wallet')) {
          (el as HTMLElement).style.display = 'none';
          console.log('[Jupiter] Hidden MWA element');
        }
      });
    };

    // Run initially
    hideMWA();

    // Set up MutationObserver to catch dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          hideMWA();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);
}

/**
 * Jupiter Mobile Wallet Provider
 *
 * Uses Jupiter Wallet Kit with built-in wallet discovery
 * For Play Solana Hackathon - Jupiter Track
 */
export function JupiterMobileProvider({ children }: JupiterMobileProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Hide MWA elements when they appear
  useMWAHider();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted (avoids SSR hydration issues)
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <WalletErrorBoundary fallback={<>{children}</>}>
      <JupiterWalletInner>{children}</JupiterWalletInner>
    </WalletErrorBoundary>
  );
}

/**
 * Lazy-loaded Jupiter Wallet Button
 * Dynamically imports to avoid SSR issues and WebView crashes
 */
export function UnifiedWalletButton() {
  const [ButtonComponent, setButtonComponent] = useState<React.ComponentType<unknown> | null>(null);
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
          // Use type assertion to avoid TS inference issues with React.FC
          const Btn = mod.UnifiedWalletButton as React.ComponentType<unknown>;
          setButtonComponent(() => Btn);
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
