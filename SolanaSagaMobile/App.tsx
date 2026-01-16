import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SwipeableStack } from './src/components/SwipeableStack';
import { useMarkets, Market } from './src/hooks/useMarkets';
import { WalletProvider, useWallet } from './src/providers/WalletProvider';
import { JupiterWalletModal } from './src/components/JupiterWalletModal';
import { colors } from './src/theme/colors';

// Controller key codes for PSG1 / Android TV / Game controllers
const KEY_CODES = {
  DPAD_LEFT: 21,
  DPAD_RIGHT: 22,
  DPAD_UP: 19,
  DPAD_DOWN: 20,
  DPAD_CENTER: 23,
  BUTTON_A: 96,    // A button (typically confirm)
  BUTTON_B: 97,    // B button (typically back)
  BUTTON_X: 99,    // X button
  BUTTON_Y: 100,   // Y button
  BUTTON_L1: 102,  // Left shoulder
  BUTTON_R1: 103,  // Right shoulder
  BACK: 4,         // Back button
  ENTER: 66,       // Enter/Select
};

// Header component with wallet button
function Header() {
  const { connected, walletAddress, balance, connect, disconnect, showQRModal, setShowQRModal, handleWalletConnect } = useWallet();

  const handleWalletPress = () => {
    if (connected) {
      Alert.alert(
        'Wallet',
        `Address: ${walletAddress?.slice(0, 8)}...${walletAddress?.slice(-8)}\nBalance: ${balance.toFixed(4)} SOL`,
        [
          { text: 'Disconnect', onPress: disconnect, style: 'destructive' },
          { text: 'Close', style: 'cancel' },
        ]
      );
    } else {
      connect();
    }
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>SOLANA</Text>
          <Text style={styles.logoSubtext}>SAGA</Text>
        </View>

        <TouchableOpacity onPress={handleWalletPress} style={styles.walletButton}>
          <LinearGradient
            colors={connected ? [colors.neonGreen, colors.neonCyan] : ['#333', '#444']}
            style={styles.walletButtonGradient}
          >
            <Text style={styles.walletButtonText}>
              {connected
                ? `${walletAddress?.slice(0, 4)}...${walletAddress?.slice(-4)}`
                : 'Connect'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Jupiter Wallet Modal */}
      <JupiterWalletModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        onConnect={handleWalletConnect}
      />
    </>
  );
}

// Stats bar
function StatsBar() {
  const [wins] = useState(0);
  const [streak] = useState(0);

  return (
    <View style={styles.statsBar}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>PREDICTIONS</Text>
        <Text style={styles.statValue}>{wins}</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>STREAK</Text>
        <Text style={[styles.statValue, { color: colors.neonOrange }]}>
          {streak}
        </Text>
      </View>
    </View>
  );
}

// Controller input handler hook
function useControllerInput() {
  useEffect(() => {
    // Handle hardware back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Let the default behavior happen for now
      return false;
    });

    // For D-pad and game controller support on Android TV / PSG1,
    // we use a native event listener approach.
    // The actual key events are handled through React Native's
    // focus management and accessibility features.

    // Set up keyboard event listener for Android
    // Note: In React Native, we typically use focusable components
    // and handle onPress events. For gamepad D-pad, we can intercept
    // through a native module or use react-native-gamepad-support.

    // For this implementation, we expose a global function that
    // can be called from native code when controller events occur.
    (global as any).__handleControllerInput = (keyCode: number) => {
      const swipeCard = (global as any).__swipeCard;
      if (!swipeCard) return;

      switch (keyCode) {
        case KEY_CODES.DPAD_LEFT:
        case KEY_CODES.BUTTON_X:
          swipeCard('left'); // NO
          break;
        case KEY_CODES.DPAD_RIGHT:
        case KEY_CODES.BUTTON_A:
          swipeCard('right'); // YES
          break;
        case KEY_CODES.DPAD_UP:
        case KEY_CODES.BUTTON_Y:
          swipeCard('up'); // SKIP
          break;
      }
    };

    return () => {
      backHandler.remove();
      (global as any).__handleControllerInput = undefined;
    };
  }, []);
}

// Main app content
function AppContent() {
  const { markets, loading, refetch } = useMarkets();
  const { connected } = useWallet();

  // Initialize controller input handling
  useControllerInput();

  const handleSwipe = useCallback((market: Market, direction: 'left' | 'right' | 'up') => {
    if (direction === 'up') {
      console.log(`Skipped: ${market.question}`);
      return; // Just skip, no prediction
    }

    const prediction = direction === 'right' ? 'YES' : 'NO';
    console.log(`Predicted ${prediction} on: ${market.question}`);

    if (!connected) {
      Alert.alert(
        'Connect Wallet',
        'Connect your wallet to place predictions and earn rewards!',
        [{ text: 'OK' }]
      );
    }
  }, [connected]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.neonCyan} />
        <Text style={styles.loadingText}>Loading Markets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <SwipeableStack markets={markets} onSwipe={handleSwipe} />
    </View>
  );
}

// Main App
export default function App() {
  return (
    <WalletProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bgPrimary} />

        {/* Background gradient */}
        <LinearGradient
          colors={[colors.bgPrimary, '#0a0a15', colors.bgPrimary]}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <Header />

        {/* Stats */}
        <StatsBar />

        {/* Main Content */}
        <AppContent />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Jupiter | Play Solana Hackathon</Text>
        </View>
      </SafeAreaView>
    </WalletProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.neonCyan,
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.neonPink,
    marginLeft: 8,
  },
  walletButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  walletButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  walletButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
