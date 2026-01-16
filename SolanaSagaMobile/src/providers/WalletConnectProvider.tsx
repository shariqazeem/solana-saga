import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import UniversalProvider from '@walletconnect/universal-provider';
import { WalletConnectModal } from '@walletconnect/modal-react-native';

// Reown Project ID (for WalletConnect)
const REOWN_PROJECT_ID = '28d5bd001f01f925b327ed9405773ba3';

// App metadata
const APP_METADATA = {
  name: 'Solana Saga PSG1',
  description: 'Swipe-to-Predict Gaming on Solana - Powered by Jupiter',
  url: 'https://solanasaga.fun',
  icons: ['https://solanasaga.fun/icon.png'],
};

interface WalletContextType {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  walletAddress: string | null;
  balance: number;
  uri: string | null;
}

const WalletContext = createContext<WalletContextType>({
  publicKey: null,
  connected: false,
  connecting: false,
  connect: async () => {},
  disconnect: async () => {},
  walletAddress: null,
  balance: 0,
  uri: null,
});

export const useWalletConnect = () => useContext(WalletContext);

interface WalletConnectProviderProps {
  children: ReactNode;
}

export function WalletConnectProvider({ children }: WalletConnectProviderProps) {
  const [provider, setProvider] = useState<UniversalProvider | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState(0);
  const [uri, setUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

  // Initialize WalletConnect provider
  useEffect(() => {
    const initProvider = async () => {
      try {
        const universalProvider = await UniversalProvider.init({
          projectId: REOWN_PROJECT_ID,
          metadata: APP_METADATA,
          relayUrl: 'wss://relay.walletconnect.com',
        });

        setProvider(universalProvider);

        // Listen for display_uri event (QR code URI)
        universalProvider.on('display_uri', (uri: string) => {
          console.log('[WalletConnect] QR URI:', uri);
          setUri(uri);
          setModalVisible(true);
        });

        // Listen for session_ping
        universalProvider.on('session_ping', (args: any) => {
          console.log('[WalletConnect] Ping:', args);
        });

        // Listen for session_event
        universalProvider.on('session_event', (args: any) => {
          console.log('[WalletConnect] Event:', args);
        });

        // Listen for session_update
        universalProvider.on('session_update', ({ topic, params }: any) => {
          console.log('[WalletConnect] Update:', topic, params);
        });

        // Listen for session_delete
        universalProvider.on('session_delete', () => {
          console.log('[WalletConnect] Session deleted');
          handleDisconnect();
        });

        // Check for existing session
        if (universalProvider.session) {
          console.log('[WalletConnect] Existing session found');
          handleSessionConnected(universalProvider);
        }
      } catch (err) {
        console.error('[WalletConnect] Init error:', err);
      }
    };

    initProvider();
  }, []);

  const handleSessionConnected = (prov: UniversalProvider) => {
    try {
      const accounts = prov.session?.namespaces?.solana?.accounts || [];
      if (accounts.length > 0) {
        // Format: "solana:mainnet:PUBLIC_KEY"
        const address = accounts[0].split(':')[2];
        setWalletAddress(address);
        setConnected(true);
        setModalVisible(false);
        setConnecting(false);

        try {
          const pk = new PublicKey(address);
          setPublicKey(pk);

          // Fetch balance
          connection.getBalance(pk).then((bal) => {
            setBalance(bal / 1e9);
          }).catch(() => {
            setBalance(1.5); // Demo balance
          });
        } catch (e) {
          console.log('[WalletConnect] Invalid public key, using demo mode');
          setBalance(1.5);
        }
      }
    } catch (err) {
      console.error('[WalletConnect] Session connect error:', err);
    }
  };

  const handleDisconnect = () => {
    setPublicKey(null);
    setWalletAddress(null);
    setConnected(false);
    setBalance(0);
    setUri(null);
  };

  const connect = useCallback(async () => {
    if (!provider) {
      console.error('[WalletConnect] Provider not initialized');
      return;
    }

    try {
      setConnecting(true);

      // Connect to Solana mainnet
      const session = await provider.connect({
        namespaces: {
          solana: {
            methods: [
              'solana_signTransaction',
              'solana_signMessage',
            ],
            chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'], // Solana mainnet
            events: [],
            rpcMap: {
              '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'https://api.mainnet-beta.solana.com',
            },
          },
        },
      });

      console.log('[WalletConnect] Connected:', session);
      handleSessionConnected(provider);
    } catch (err: any) {
      console.error('[WalletConnect] Connect error:', err);
      setConnecting(false);
      setModalVisible(false);

      // User rejected or error
      if (err.message?.includes('User rejected')) {
        console.log('[WalletConnect] User rejected connection');
      }
    }
  }, [provider]);

  const disconnect = useCallback(async () => {
    if (!provider || !provider.session) return;

    try {
      await provider.disconnect();
      handleDisconnect();
    } catch (err) {
      console.error('[WalletConnect] Disconnect error:', err);
      handleDisconnect(); // Force disconnect on error
    }
  }, [provider]);

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        connected,
        connecting,
        connect,
        disconnect,
        walletAddress,
        balance,
        uri,
      }}
    >
      {children}

      {/* WalletConnect Modal */}
      <WalletConnectModal
        projectId={REOWN_PROJECT_ID}
        providerMetadata={APP_METADATA}
        visible={modalVisible && !!uri}
        onClose={() => setModalVisible(false)}
        uri={uri || ''}
      />
    </WalletContext.Provider>
  );
}
