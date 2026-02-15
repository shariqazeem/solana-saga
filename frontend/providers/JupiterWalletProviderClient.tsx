"use client";

import { ReactNode, useRef, useState, useEffect, useCallback, memo } from "react";
import {
  Adapter,
  UnifiedWalletProvider,
} from "@jup-ag/wallet-adapter";
import { useWrappedReownAdapter } from "@jup-ag/jup-mobile-adapter";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import {
  BaseSignerWalletAdapter,
  WalletReadyState,
  WalletName,
} from "@solana/wallet-adapter-base";
import { SMWAWalletAdapter } from "@/lib/solana/SMWAWalletAdapter";
import { isSMWABridgeAvailable } from "@/lib/solana/smwaBridge";
import { RPC_ENDPOINT } from "@/lib/solana/config";

const APP_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://frontend-alpha-khaki.vercel.app";

const REOWN_PROJECT_ID = (
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
  "28d5bd001f01f925b327ed9405773ba3"
).trim();

// Pre-compute stable objects outside component
const APP_METADATA = {
  name: "Solana Saga",
  description: "Gamified Jupiter Prediction Markets for PSG1",
  url: APP_URL,
  icons: [`${APP_URL}/icons/icon-192x192.png`],
};

const REOWN_OPTIONS = {
  appKitOptions: {
    metadata: APP_METADATA,
    projectId: REOWN_PROJECT_ID,
    features: {
      analytics: false,
      socials: false as false,
      email: false as false,
    },
    enableWallets: false,
  },
};

/**
 * Custom wallet adapter that uses deep links to open the app in a wallet's
 * in-app browser. Unlike Jupiter's built-in HardcodedWalletStandardAdapter,
 * this works on Android (not just iOS Safari).
 */
class DeepLinkWalletAdapter extends BaseSignerWalletAdapter {
  name: WalletName;
  url: string;
  icon: string;
  readyState = WalletReadyState.Loadable;
  supportedTransactionVersions = new Set(["legacy", 0]) as any;

  private _deepLink: () => string;

  constructor(config: {
    name: string;
    url: string;
    icon: string;
    deepLink: () => string;
  }) {
    super();
    this.name = config.name as WalletName;
    this.url = config.url;
    this.icon = config.icon;
    this._deepLink = config.deepLink;
  }

  get publicKey() {
    return null;
  }
  get connecting() {
    return false;
  }

  async connect(): Promise<void> {
    window.location.href = this._deepLink();
  }

  async disconnect(): Promise<void> {
    this.emit("disconnect");
  }

  async signTransaction<T>(transaction: T): Promise<T> {
    throw new Error("Not connected via deep link adapter");
  }

  async signMessage(_message: Uint8Array): Promise<Uint8Array> {
    throw new Error("Not connected via deep link adapter");
  }
}

// Create deep link adapters for wallets that support in-app browsing.
// When tapped, these redirect to the wallet's in-app browser where
// window.phantom.solana / window.solflare is natively available.
const DEEP_LINK_WALLETS: Adapter[] = [
  new DeepLinkWalletAdapter({
    name: "Phantom",
    url: "https://phantom.app/",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiB2aWV3Qm94PSIwIDAgMTA4IDEwOCIgZmlsbD0ibm9uZSI+CjxyZWN0IHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiByeD0iMjYiIGZpbGw9IiNBQjlGRjIiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00Ni41MjY3IDY5LjkyMjlDNDIuMDA1NCA3Ni44NTA5IDM0LjQyOTIgODUuNjE4MiAyNC4zNDggODUuNjE4MkMxOS41ODI0IDg1LjYxODIgMTUgODMuNjU2MyAxNSA3NS4xMzQyQzE1IDUzLjQzMDUgNDQuNjMyNiAxOS44MzI3IDcyLjEyNjggMTkuODMyN0M4Ny43NjggMTkuODMyNyA5NCAzMC42ODQ2IDk0IDQzLjAwNzlDOTQgNTguODI1OCA4My43MzU1IDc2LjkxMjIgNzMuNTMyMSA3Ni45MTIyQzcwLjI5MzkgNzYuOTEyMiA2OC43MDUzIDc1LjEzNDIgNjguNzA1MyA3Mi4zMTRDNjguNzA1MyA3MS41NzgzIDY4LjgyNzUgNzAuNzgxMiA2OS4wNzE5IDY5LjkyMjlDNjUuNTg5MyA3NS44Njk5IDU4Ljg2ODUgODEuMzg3OCA1Mi41NzU0IDgxLjM4NzhDNDcuOTkzIDgxLjM4NzggNDUuNjcxMyA3OC41MDYzIDQ1LjY3MTMgNzQuNDU5OEM0NS42NzEzIDcyLjk4ODQgNDUuOTc2OCA3MS40NTU2IDQ2LjUyNjcgNjkuOTIyOVpNODMuNjc2MSA0Mi41Nzk0QzgzLjY3NjEgNDYuMTcwNCA4MS41NTc1IDQ3Ljk2NTggNzkuMTg3NSA0Ny45NjU4Qzc2Ljc4MTYgNDcuOTY1OCA3NC42OTg5IDQ2LjE3MDQgNzQuNjk4OSA0Mi41Nzk0Qzc0LjY5ODkgMzguOTg4NSA3Ni43ODE2IDM3LjE5MzEgNzkuMTg3NSAzNy4xOTMxQzgxLjU1NzUgMzcuMTkzMSA4My42NzYxIDM4Ljk4ODUgODMuNjc2MSA0Mi41Nzk0Wk03MC4yMTAzIDQyLjU3OTVDNzAuMjEwMyA0Ni4xNzA0IDY4LjA5MTYgNDcuOTY1OCA2NS43MjE2IDQ3Ljk2NThDNjMuMzE1NyA0Ny45NjU4IDYxLjIzMyA0Ni4xNzA0IDYxLjIzMyA0Mi41Nzk1QzYxLjIzMyAzOC45ODg1IDYzLjMxNTcgMzcuMTkzMSA2NS43MjE2IDM3LjE5MzFDNjguMDkxNiAzNy4xOTMxIDcwLjIxMDMgMzguOTg4NSA3MC4yMTAzIDQyLjU3OTVaIiBmaWxsPSIjRkZGREY4Ii8+Cjwvc3ZnPg==",
    deepLink: () => {
      const url = encodeURIComponent(window.location.href);
      const ref = encodeURIComponent(window.location.origin);
      return `https://phantom.app/ul/browse/${url}?ref=${ref}`;
    },
  }),
  new DeepLinkWalletAdapter({
    name: "Solflare",
    url: "https://solflare.com/",
    icon: "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgNTAgNTAiIHdpZHRoPSI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGxpbmVhckdyYWRpZW50IGlkPSJhIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZmMxMGIiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmYjNmMmUiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI2LjQ3ODM1IiB4Mj0iMzQuOTEwNyIgeGxpbms6aHJlZj0iI2EiIHkxPSI3LjkyIiB5Mj0iMzMuNjU5MyIvPjxyYWRpYWxHcmFkaWVudCBpZD0iYyIgY3g9IjAiIGN5PSIwIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDQuOTkyMTg4MzIgMTIuMDYzODc5NjMgLTEyLjE4MTEzNjU1IDUuMDQwNzEwNzQgMjIuNTIwMiAyMC42MTgzKSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHI9IjEiIHhsaW5rOmhyZWY9IiNhIi8+PHBhdGggZD0ibTI1LjE3MDggNDcuOTEwNGMuNTI1IDAgLjk1MDcuNDIxLjk1MDcuOTQwM3MtLjQyNTcuOTQwMi0uOTUwNy45NDAyLS45NTA3LS40MjA5LS45NTA3LS45NDAyLjQyNTctLjk0MDMuOTUwNy0uOTQwM3ptLTEuMDMyOC00NC45MTU2NWMuNDY0Ni4wMzgzNi44Mzk4LjM5MDQuOTAyNy44NDY4MWwxLjEzMDcgOC4yMTU3NGMuMzc5OCAyLjcxNDMgMy42NTM1IDMuODkwNCA1LjY3NDMgMi4wNDU5bDExLjMyOTEtMTAuMzExNThjLjI3MzMtLjI0ODczLjY5ODktLjIzMTQ5Ljk1MDcuMDM4NTEuMjMwOS4yNDc3Mi4yMzc5LjYyNjk3LjAxNjEuODgyNzdsLTkuODc5MSAxMS4zOTU4Yy0xLjgxODcgMi4wOTQyLS40NzY4IDUuMzY0MyAyLjI5NTYgNS41OTc4bDguNzE2OC44NDAzYy40MzQxLjA0MTguNzUxNy40MjM0LjcwOTMuODUyNC0uMDM0OS4zNTM3LS4zMDc0LjYzOTUtLjY2MjguNjk0OWwtOS4xNTk0IDEuNDMwMmMtMi42NTkzLjM2MjUtMy44NjM2IDMuNTExNy0yLjEzMzkgNS41NTc2bDMuMjIgMy43OTYxYy4yNTk0LjMwNTguMjE4OC43NjE1LS4wOTA4IDEuMDE3OC0uMjYyMi4yMTcyLS42NDE5LjIyNTYtLjkxMzguMDIwM2wtMy45Njk0LTIuOTk3OGMtMi4xNDIxLTEuNjEwOS01LjIyOTctLjI0MTctNS40NTYxIDIuNDI0M2wtLjg3NDcgMTAuMzk3NmMtLjAzNjIuNDI5NS0uNDE3OC43NDg3LS44NTI1LjcxMy0uMzY5LS4wMzAzLS42NjcxLS4zMDk3LS43MTcxLS42NzIxbC0xLjM4NzEtMTAuMDQzN2MtLjM3MTctMi43MTQ0LTMuNjQ1NC0zLjg5MDQtNS42NzQzLTIuMDQ1OWwtMTIuMDUxOTUgMTAuOTc0Yy0uMjQ5NDcuMjI3MS0uNjM4MDkuMjExNC0uODY4LS4wMzUtLjIxMDk0LS4yMjYyLS4yMTczNS0uNTcyNC0uMDE0OTMtLjgwNmwxMC41MTgxOC0xMi4xMzg1YzEuODE4Ny0yLjA5NDIuNDg0OS01LjM2NDQtMi4yODc2LTUuNTk3OGwtOC43MTg3Mi0uODQwNWMtLjQzNDEzLS4wNDE4LS43NTE3Mi0uNDIzNS0uNzA5MzYtLjg1MjQuMDM0OTMtLjM1MzcuMzA3MzktLjYzOTQuNjYyNy0uNjk1bDkuMTUzMzgtMS40Mjk5YzIuNjU5NC0uMzYyNSAzLjg3MTgtMy41MTE3IDIuMTQyMS01LjU1NzZsLTIuMTkyLTIuNTg0MWMtLjMyMTctLjM3OTItLjI3MTMtLjk0NDMuMTEyNi0xLjI2MjEuMzI1My0uMjY5NC43OTYzLS4yNzk3IDEuMTMzNC0uMDI0OWwyLjY5MTggMi4wMzQ3YzIuMTQyMSAxLjYxMDkgNS4yMjk3LjI0MTcgNS40NTYxLTIuNDI0M2wuNzI0MS04LjU1OTk4Yy4wNDU3LS41NDA4LjUyNjUtLjk0MjU3IDEuMDczOS0uODk3Mzd6bS0yMy4xODczMyAyMC40Mzk2NWMuNTI1MDQgMCAuOTUwNjcuNDIxLjk1MDY3Ljk0MDNzLS40MjU2My45NDAzLS45NTA2Ny45NDAzYy0uNTI1MDQxIDAtLjk1MDY3LS40MjEtLjk1MDY3LS45NDAzcy40MjU2MjktLjk0MDMuOTUwNjctLjk0MDN6bTQ3LjY3OTczLS45NTQ3Yy41MjUgMCAuOTUwNy40MjEuOTUwNy45NDAzcy0uNDI1Ny45NDAyLS45NTA3Ljk0MDItLjk1MDctLjQyMDktLjk1MDctLjk0MDIuNDI1Ny0uOTQwMy45NTA3LS45NDAzem0tMjQuNjI5Ni0yMi40Nzk3Yy41MjUgMCAuOTUwNi40MjA5NzMuOTUwNi45NDAyNyAwIC41MTkzLS40MjU2Ljk0MDI3LS45NTA2Ljk0MDI3LS41MjUxIDAtLjk1MDctLjQyMDk3LS45NTA3LS45NDAyNyAwLS41MTkyOTcuNDI1Ni0uOTQwMjcuOTUwNy0uOTQwMjd6IiBmaWxsPSJ1cmwoI2IpIi8+PHBhdGggZD0ibTI0LjU3MSAzMi43NzkyYzQuOTU5NiAwIDguOTgwMi0zLjk3NjUgOC45ODAyLTguODgxOSAwLTQuOTA1My00LjAyMDYtOC44ODE5LTguOTgwMi04Ljg4MTlzLTguOTgwMiAzLjk3NjYtOC45ODAyIDguODgxOWMwIDQuOTA1NCA0LjAyMDYgOC44ODE5IDguOTgwMiA4Ljg4MTl6IiBmaWxsPSJ1cmwoI2MpIi8+PC9zdmc+",
    deepLink: () => {
      const url = encodeURIComponent(window.location.href);
      const ref = encodeURIComponent(window.location.origin);
      return `https://solflare.com/ul/v1/browse/${url}?ref=${ref}`;
    },
  }),
];

const WALLET_CONFIG = {
  autoConnect: false,
  env: "mainnet-beta" as const,
  metadata: {
    name: "Solana Saga",
    description: "Gamified Jupiter Prediction Markets for PSG1",
    url: APP_URL,
    iconUrls: [`${APP_URL}/icons/icon-192x192.png`],
  },
  notificationCallback: {
    onConnect: (props: any) => {
      console.log("[Jupiter] Connected:", props.walletName);
    },
    onConnecting: (props: any) => {
      console.log("[Jupiter] Connecting:", props.walletName);
    },
    onDisconnect: (props: any) => {
      console.log("[Jupiter] Disconnected:", props.walletName);
    },
    onNotInstalled: (props: any) => {
      console.log("[Jupiter] Not installed:", props.walletName);
    },
  },
  walletlistExplanation: {
    href: "https://dev.jup.ag/tool-kits/wallet-kit",
  },
  walletPrecedence: ["Jupiter Mobile" as WalletName],
  theme: "dark" as const,
  lang: "en" as const,
};

/**
 * Inner component that initializes the Reown adapter.
 * This component may re-render many times due to the adapter's internal state,
 * but it renders nothing visible - just captures the adapter reference.
 */
function ReownAdapterInitializer({ onReady }: { onReady: (adapter: Adapter) => void }) {
  const { jupiterAdapter } = useWrappedReownAdapter(REOWN_OPTIONS);
  const readyRef = useRef(false);

  useEffect(() => {
    if (jupiterAdapter && jupiterAdapter.name && jupiterAdapter.icon && !readyRef.current) {
      readyRef.current = true;
      onReady(jupiterAdapter);
    }
  }, [jupiterAdapter, onReady]);

  return null;
}

/**
 * Memoized provider wrapper that only re-renders when wallets change.
 */
const StableWalletProvider = memo(function StableWalletProvider({
  wallets,
  children,
}: {
  wallets: Adapter[];
  children: ReactNode;
}) {
  return (
    <UnifiedWalletProvider wallets={wallets} config={WALLET_CONFIG}>
      {children}
    </UnifiedWalletProvider>
  );
});

function getInitialWallets(): Adapter[] {
  if (typeof window !== "undefined" && isSMWABridgeAvailable()) {
    // In Android wrapper: only show the native SMWA adapter (works via MWA)
    // Deep link and Reown adapters don't work in WebView
    return [new SMWAWalletAdapter()];
  }
  return DEEP_LINK_WALLETS;
}

export default function JupiterWalletProviderClient({ children }: Props) {
  const smwaBridge = typeof window !== "undefined" && isSMWABridgeAvailable();
  const [wallets, setWallets] = useState<Adapter[]>(getInitialWallets);

  const handleAdapterReady = useCallback((adapter: Adapter) => {
    setWallets((prev) => [...prev, adapter]);
  }, []);

  return (
    <ConnectionProvider
      endpoint={RPC_ENDPOINT}
      config={{ commitment: "confirmed", confirmTransactionInitialTimeout: 60000 }}
    >
      {!smwaBridge && <ReownAdapterInitializer onReady={handleAdapterReady} />}
      <StableWalletProvider wallets={wallets}>
        {children}
      </StableWalletProvider>
    </ConnectionProvider>
  );
}

interface Props {
  children: ReactNode;
}
