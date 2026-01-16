import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';

// Reown Project ID (for WalletConnect)
const REOWN_PROJECT_ID = '28d5bd001f01f925b327ed9405773ba3';

// App metadata
const APP_METADATA = {
  name: 'Solana Saga',
  description: 'Swipe-to-Predict Gaming on Solana',
  url: 'https://solanasaga.fun',
  icons: ['https://solanasaga.fun/icon.png'],
};

interface WalletContextType {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  showQRModal: boolean;
  connect: () => void;
  disconnect: () => Promise<void>;
  walletAddress: string | null;
  balance: number;
  setShowQRModal: (show: boolean) => void;
  handleWalletConnect: (address: string) => void;
}

const WalletContext = createContext<WalletContextType>({
  publicKey: null,
  connected: false,
  connecting: false,
  showQRModal: false,
  connect: () => {},
  disconnect: async () => {},
  walletAddress: null,
  balance: 0,
  setShowQRModal: () => {},
  handleWalletConnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);

  const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

  // Fetch balance when connected
  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((bal) => {
        setBalance(bal / 1e9); // Convert lamports to SOL
      }).catch((err) => {
        console.log('Balance fetch error:', err);
        // Set a demo balance for testing
        setBalance(1.5);
      });
    }
  }, [publicKey]);

  const connect = useCallback(() => {
    console.log('Opening wallet QR modal...');
    setShowQRModal(true);
  }, []);

  const handleWalletConnect = useCallback((address: string) => {
    console.log('Wallet connected:', address);
    setWalletAddress(address);
    setConnected(true);
    setShowQRModal(false);

    // Try to create PublicKey (might fail for demo addresses)
    try {
      const pk = new PublicKey(address);
      setPublicKey(pk);
    } catch (e) {
      // Demo mode - just use the address string
      console.log('Using demo wallet address');
      setBalance(1.5); // Demo balance
    }
  }, []);

  const disconnect = useCallback(async () => {
    setPublicKey(null);
    setWalletAddress(null);
    setConnected(false);
    setBalance(0);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        connected,
        connecting,
        showQRModal,
        connect,
        disconnect,
        walletAddress,
        balance,
        setShowQRModal,
        handleWalletConnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
