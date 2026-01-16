import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useWalletConnect } from '../providers/WalletConnectProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RealWalletModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RealWalletModal({ visible, onClose }: RealWalletModalProps) {
  const { uri, connecting, connected, connect } = useWalletConnect();
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    // Close modal when connected
    if (connected) {
      onClose();
      setShowQR(false);
    }
  }, [connected, onClose]);

  const handleJupiterConnect = async () => {
    setShowQR(true);
    await connect();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Connect Wallet</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {!showQR ? (
            // Wallet Options List
            <>
              <Text style={styles.title}>Connect Wallet</Text>
              <Text style={styles.subtitle}>
                You need to connect a Solana wallet.
              </Text>

              {/* Recommended Wallets */}
              <Text style={styles.sectionLabel}>RECOMMENDED WALLETS</Text>

              {/* Jupiter Mobile - QR Code */}
              <TouchableOpacity
                style={styles.walletItem}
                onPress={handleJupiterConnect}
              >
                <LinearGradient
                  colors={['rgba(0, 209, 140, 0.1)', 'rgba(0, 180, 216, 0.1)']}
                  style={styles.walletItemGradient}
                >
                  <View style={styles.walletIcon}>
                    <Text style={styles.walletIconText}>J</Text>
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletName}>Jupiter Mobile</Text>
                    <Text style={styles.walletDesc}>Scan QR code with Jupiter app</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>QR</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* More Wallets */}
              <Text style={styles.sectionLabel}>MORE WALLETS</Text>

              {/* WalletConnect */}
              <TouchableOpacity
                style={styles.walletItem}
                onPress={handleJupiterConnect}
              >
                <View style={styles.walletIcon}>
                  <Text style={styles.walletIconText}>W</Text>
                </View>
                <View style={styles.walletInfo}>
                  <Text style={styles.walletName}>WalletConnect</Text>
                  <Text style={styles.walletDesc}>Connect any Solana wallet</Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.poweredBy}>
                Powered by <Text style={styles.poweredByLink}>Jupiter</Text> Unified Wallet Kit
              </Text>
            </>
          ) : (
            // QR Code View
            <>
              <View style={styles.qrContainer}>
                {/* Header */}
                <View style={styles.qrHeader}>
                  <View style={styles.qrIconContainer}>
                    <Text style={styles.qrIcon}>J</Text>
                  </View>
                  <Text style={styles.qrTitle}>
                    {connecting ? 'Connecting...' : 'Jupiter Mobile'}
                  </Text>
                </View>

                <Text style={styles.qrSubtitle}>
                  Scan this QR code with your Jupiter app
                </Text>

                {/* QR Code */}
                {uri ? (
                  <View style={styles.qrCodeWrapper}>
                    <View style={styles.qrCodeContainer}>
                      <QRCode
                        value={uri}
                        size={SCREEN_WIDTH - 120}
                        backgroundColor="white"
                        color="black"
                        quietZone={10}
                      />
                    </View>

                    {/* Instructions */}
                    <Text style={styles.qrInstructions}>
                      1. Open Jupiter Mobile app{'\n'}
                      2. Tap "Scan QR Code"{'\n'}
                      3. Approve the connection
                    </Text>

                    {connecting && (
                      <View style={styles.connectingIndicator}>
                        <ActivityIndicator size="small" color={colors.neonCyan} />
                        <Text style={styles.connectingText}>
                          Waiting for confirmation...
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.neonCyan} />
                    <Text style={styles.loadingText}>Generating QR code...</Text>
                  </View>
                )}

                {/* Cancel Button */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowQR(false);
                    onClose();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#13111C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#9D9D9D',
    fontSize: 16,
  },
  headerTitle: {
    color: '#E8E8E8',
    fontSize: 17,
    fontWeight: '600',
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E8E8E8',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9D9D9D',
    textAlign: 'center',
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#6B6B6B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  walletItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  walletItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  walletIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.neonCyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  walletIconText: {
    color: '#000',
    fontSize: 20,
    fontWeight: '700',
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E8E8E8',
    marginBottom: 2,
  },
  walletDesc: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  badge: {
    backgroundColor: 'rgba(0, 209, 140, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neonGreen,
    textTransform: 'uppercase',
  },
  poweredBy: {
    textAlign: 'center',
    fontSize: 11,
    color: '#4A4A5A',
    marginTop: 24,
  },
  poweredByLink: {
    color: colors.neonGreen,
  },
  // QR Code styles
  qrContainer: {
    alignItems: 'center',
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  qrIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.neonCyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  qrIcon: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E8E8E8',
  },
  qrSubtitle: {
    fontSize: 13,
    color: '#6B6B6B',
    textAlign: 'center',
    marginBottom: 24,
  },
  qrCodeWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  qrCodeContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  qrInstructions: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  connectingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  connectingText: {
    fontSize: 13,
    color: colors.neonCyan,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#9D9D9D',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B6B6B',
    fontSize: 14,
    marginTop: 16,
  },
});
