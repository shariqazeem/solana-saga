import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Text,
} from 'react-native';
import { Audio } from 'expo-av';
import { MarketCard } from './MarketCard';
import { Market } from '../hooks/useMarkets';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD_X = SCREEN_WIDTH * 0.25;
const SWIPE_THRESHOLD_Y = SCREEN_HEIGHT * 0.15;

interface SwipeableStackProps {
  markets: Market[];
  onSwipe: (market: Market, direction: 'left' | 'right' | 'up') => void;
  onControllerAction?: (action: 'left' | 'right' | 'up') => void;
}

// Sound frequencies for different swipe actions
const SOUND_CONFIG = {
  yes: { frequency: 880, duration: 150 },    // A5 - high upbeat
  no: { frequency: 330, duration: 150 },      // E4 - lower
  skip: { frequency: 523, duration: 100 },    // C5 - neutral
};

export function SwipeableStack({ markets, onSwipe }: SwipeableStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const position = useRef(new Animated.ValueXY()).current;
  const soundRef = useRef<Audio.Sound | null>(null);

  // Initialize audio
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Play swipe sound effect
  const playSwipeSound = useCallback(async (type: 'yes' | 'no' | 'skip') => {
    try {
      // Create a simple beep sound using expo-av
      const { sound } = await Audio.Sound.createAsync(
        // Use a simple oscillator-like approach with a short audio clip
        // For now, we'll use a haptic-like approach with system sounds
        { uri: 'https://www.soundjay.com/buttons/sounds/button-09a.mp3' },
        { shouldPlay: true, volume: type === 'yes' ? 1.0 : type === 'no' ? 0.8 : 0.5 }
      );

      soundRef.current = sound;

      // Play and unload after completion
      await sound.playAsync();
      setTimeout(() => {
        sound.unloadAsync().catch(() => {});
      }, 300);
    } catch (error) {
      console.log('Sound play error (non-critical):', error);
    }
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });

        // Update swipe direction indicator
        if (gesture.dy < -60 && Math.abs(gesture.dx) < 50) {
          setSwipeDirection('up');
        } else if (gesture.dx > 50) {
          setSwipeDirection('right');
        } else if (gesture.dx < -50) {
          setSwipeDirection('left');
        } else {
          setSwipeDirection(null);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        // Swipe up - SKIP (prioritize vertical)
        if (gesture.dy < -SWIPE_THRESHOLD_Y && Math.abs(gesture.dx) < SWIPE_THRESHOLD_X) {
          swipeCard('up');
        }
        // Swipe right - YES
        else if (gesture.dx > SWIPE_THRESHOLD_X) {
          swipeCard('right');
        }
        // Swipe left - NO
        else if (gesture.dx < -SWIPE_THRESHOLD_X) {
          swipeCard('left');
        }
        // Reset position
        else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 5,
          }).start();
          setSwipeDirection(null);
        }
      },
    })
  ).current;

  const swipeCard = useCallback((direction: 'left' | 'right' | 'up') => {
    // Play sound
    if (direction === 'right') {
      playSwipeSound('yes');
    } else if (direction === 'left') {
      playSwipeSound('no');
    } else {
      playSwipeSound('skip');
    }

    // Determine exit position
    let toValue = { x: 0, y: 0 };
    if (direction === 'right') {
      toValue = { x: SCREEN_WIDTH * 1.5, y: 0 };
    } else if (direction === 'left') {
      toValue = { x: -SCREEN_WIDTH * 1.5, y: 0 };
    } else {
      toValue = { x: 0, y: -SCREEN_HEIGHT };
    }

    Animated.timing(position, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      // Trigger callback
      if (markets[currentIndex]) {
        onSwipe(markets[currentIndex], direction);
      }

      // Reset and move to next card
      position.setValue({ x: 0, y: 0 });
      setSwipeDirection(null);
      setCurrentIndex((prev) => prev + 1);
    });
  }, [currentIndex, markets, onSwipe, position, playSwipeSound]);

  // Expose swipe function for controller input
  useEffect(() => {
    // Store swipeCard in a global ref for controller access
    (global as any).__swipeCard = swipeCard;
    return () => {
      (global as any).__swipeCard = undefined;
    };
  }, [swipeCard]);

  const getCardStyle = (index: number) => {
    if (index === currentIndex) {
      const rotate = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        outputRange: ['-15deg', '0deg', '15deg'],
      });

      return {
        transform: [
          { translateX: position.x },
          { translateY: position.y },
          { rotate },
        ],
        zIndex: 10,
      };
    } else if (index === currentIndex + 1) {
      // Next card (behind)
      const scale = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        outputRange: [1, 0.95, 1],
        extrapolate: 'clamp',
      });

      return {
        transform: [{ scale }],
        zIndex: 5,
        opacity: 0.8,
      };
    }

    return {
      opacity: 0,
      zIndex: 0,
    };
  };

  if (currentIndex >= markets.length) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyText}>No more predictions available</Text>
          <Text style={styles.emptyHint}>Pull down to refresh</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Swipe direction indicators */}
      {swipeDirection === 'up' && (
        <View style={styles.skipIndicator}>
          <Text style={styles.skipText}>SKIP</Text>
        </View>
      )}

      {markets.slice(currentIndex, currentIndex + 2).map((market, i) => {
        const index = currentIndex + i;
        const isTopCard = index === currentIndex;

        return (
          <Animated.View
            key={market.id}
            style={[styles.cardContainer, getCardStyle(index)]}
            {...(isTopCard ? panResponder.panHandlers : {})}
          >
            <MarketCard
              market={market}
              swipeDirection={isTopCard ? swipeDirection : null}
            />
          </Animated.View>
        );
      })}

      {/* Controller hints */}
      <View style={styles.controllerHints}>
        <Text style={styles.hintText}>D-PAD: Left=NO | Right=YES | Up=SKIP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    width: SCREEN_WIDTH * 0.9,
    height: 400,
    backgroundColor: colors.bgSecondary,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: colors.textMuted,
  },
  skipIndicator: {
    position: 'absolute',
    top: 20,
    zIndex: 100,
    backgroundColor: colors.neonOrange,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 2,
  },
  controllerHints: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  hintText: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
