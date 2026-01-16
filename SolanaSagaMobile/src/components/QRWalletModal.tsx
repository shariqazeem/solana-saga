import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QRWalletModalProps {
  visible: boolean;
  onClose: () => void;
  onConnect: (publicKey: string) => void;
}

export function QRWalletModal({ visible, onClose, onConnect }: QRWalletModalProps) {
  const [wcUri, setWcUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWalletConnectUri = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      // Generate a WalletConnect-compatible URI for Solana
      // Format: wc:{topic}@2?relay-protocol=irn&symKey={symKey}
      const topic = generateRandomHex(32);
      const symKey = generateRandomHex(32);

      const uri = `wc:${topic}@2?relay-protocol=irn&symKey=${symKey}`;
      setWcUri(uri);

      console.log('[QR] Generated WalletConnect URI');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(message);
      console.error('[QR] Error:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible && !wcUri) {
      generateWalletConnectUri();
    }
  }, [visible, wcUri, generateWalletConnectUri]);

  const handleRetry = () => {
    setWcUri(null);
    generateWalletConnectUri();
  };

  // For demo purposes - simulate connection after showing QR
  const handleSimulateConnect = () => {
    // Demo public key (in real app, this would come from WalletConnect session)
    const demoPublicKey = 'DemoPublicKey123456789abcdefghijklmnopqrstuvwxyz';
    onConnect(demoPublicKey);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Connect Wallet</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
          </View>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.neonCyan} />
                <Text style={styles.loadingText}>Generating QR...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : wcUri ? (
              <View style={styles.qrWrapper}>
                <QRCode
                  value={wcUri}
                  size={SCREEN_WIDTH * 0.5}
                  backgroundColor="#ffffff"
                  color="#000000"
                />
              </View>
            ) : null}
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              Scan with your mobile wallet
            </Text>
            <Text style={styles.subText}>
              Phantom, Solflare, or WalletConnect compatible
            </Text>
          </View>

          {/* Demo connect button (for testing) */}
          <TouchableOpacity onPress={handleSimulateConnect} style={styles.demoButton}>
            <Text style={styles.demoButtonText}>Demo Connect</Text>
          </TouchableOpacity>

          {/* Powered by */}
          <View style={styles.poweredBy}>
            <Text style={styles.poweredByText}>
              Powered by <Text style={styles.jupiterText}>Jupiter</Text> x <Text style={styles.wcText}>WalletConnect</Text>
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Helper function to generate random hex string
function generateRandomHex(length: number): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length * 2; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modal: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
    backgroundColor: colors.bgSecondary,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.neonCyan + '40',
    shadowColor: colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SCREEN_WIDTH * 0.55,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.neonCyan + '30',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neonCyan + '50',
  },
  retryText: {
    color: colors.neonCyan,
    fontWeight: '600',
  },
  qrWrapper: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
  },
  instructions: {
    alignItems: 'center',
    marginTop: 20,
  },
  instructionText: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: 4,
  },
  subText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  demoButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  demoButtonText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  poweredBy: {
    marginTop: 20,
    alignItems: 'center',
  },
  poweredByText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  jupiterText: {
    color: colors.neonCyan,
    fontWeight: '600',
  },
  wcText: {
    color: '#9f7aea',
    fontWeight: '600',
  },
});
