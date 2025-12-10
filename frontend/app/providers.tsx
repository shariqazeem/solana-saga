'use client';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { ReactNode, useMemo, useCallback } from 'react';
import { RPC_ENDPOINT, SOLANA_NETWORK } from '@/lib/solana/config';

// Import Solana wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

export function Providers({ children }: { children: ReactNode }) {
  // Use endpoint from environment config
  const endpoint = useMemo(() => RPC_ENDPOINT, []);

  // Get network for wallet adapters - no longer needed for standard wallets
  const network = SOLANA_NETWORK === "devnet" ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;

  // Use empty wallets array - let wallet-standard detect installed wallets automatically
  // This avoids conflicts with manually created adapters
  const wallets = useMemo(() => [], []);

  // Handle wallet errors gracefully - don't show error overlay for connection issues
  const onError = useCallback((error: WalletError) => {
    // Log for debugging but don't throw to avoid error overlay
    console.warn('Wallet error:', error.name, error.message);

    // Don't re-throw - this prevents the error overlay from appearing
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={true}
        onError={onError}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}