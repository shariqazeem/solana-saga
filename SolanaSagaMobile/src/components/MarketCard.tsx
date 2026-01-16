import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { Market } from '../hooks/useMarkets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

interface MarketCardProps {
  market: Market;
  swipeDirection?: 'left' | 'right' | 'up' | null;
}

export function MarketCard({ market, swipeDirection }: MarketCardProps) {
  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = Math.round(market.noPrice * 100);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'crypto':
        return colors.neonCyan;
      case 'meme':
        return colors.neonOrange;
      case 'politics':
        return colors.neonPurple;
      case 'sports':
        return colors.neonGreen;
      case 'economics':
        return colors.neonYellow;
      case 'tech':
        return colors.neonPink;
      case 'culture':
        return '#ff6b9d';
      case 'climate':
        return '#4ecdc4';
      default:
        return colors.neonPink;
    }
  };

  return (
    <View style={styles.card}>
      {/* Swipe Indicators */}
      {swipeDirection === 'right' && (
        <View style={[styles.swipeIndicator, styles.yesIndicator]}>
          <Text style={styles.swipeText}>YES</Text>
        </View>
      )}
      {swipeDirection === 'left' && (
        <View style={[styles.swipeIndicator, styles.noIndicator]}>
          <Text style={styles.swipeText}>NO</Text>
        </View>
      )}

      {/* Category Badge */}
      <View style={[styles.categoryBadge, { borderColor: getCategoryColor(market.category) }]}>
        <Text style={[styles.categoryText, { color: getCategoryColor(market.category) }]}>
          {market.category}
        </Text>
      </View>

      {/* Market Image */}
      {market.imageUrl && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: market.imageUrl }} style={styles.marketImage} />
        </View>
      )}

      {/* Question */}
      <Text style={styles.question}>{market.question}</Text>

      {/* Odds Display */}
      <View style={styles.oddsContainer}>
        <View style={styles.oddsSide}>
          <Text style={[styles.oddsLabel, { color: colors.neonGreen }]}>YES</Text>
          <Text style={[styles.oddsValue, { color: colors.neonGreen }]}>{yesPercent}%</Text>
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={styles.oddsSide}>
          <Text style={[styles.oddsLabel, { color: colors.neonRed }]}>NO</Text>
          <Text style={[styles.oddsValue, { color: colors.neonRed }]}>{noPercent}%</Text>
        </View>
      </View>

      {/* Odds Bar */}
      <View style={styles.oddsBar}>
        <LinearGradient
          colors={[colors.neonGreen, '#00aa55']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.oddsBarFill, { width: `${yesPercent}%` }]}
        />
      </View>

      {/* Volume */}
      <View style={styles.volumeContainer}>
        <Text style={styles.volumeLabel}>Volume</Text>
        <Text style={styles.volumeValue}>
          ${market.volume.toLocaleString()}
        </Text>
      </View>

      {/* Swipe Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Right = YES | Left = NO | Up = SKIP
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.bgSecondary,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  swipeIndicator: {
    position: 'absolute',
    top: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    zIndex: 100,
  },
  yesIndicator: {
    left: 20,
    backgroundColor: colors.neonGreen,
  },
  noIndicator: {
    right: 20,
    backgroundColor: colors.neonRed,
  },
  swipeText: {
    fontWeight: '800',
    fontSize: 18,
    color: '#000',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 243, 255, 0.1)',
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  marketImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.glassBorder,
  },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 30,
  },
  oddsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  oddsSide: {
    flex: 1,
    alignItems: 'center',
  },
  oddsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  oddsValue: {
    fontSize: 42,
    fontWeight: '800',
  },
  vsContainer: {
    paddingHorizontal: 16,
  },
  vsText: {
    color: colors.neonYellow,
    fontSize: 16,
    fontWeight: '800',
  },
  oddsBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  oddsBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  volumeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  volumeLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  volumeValue: {
    color: colors.neonCyan,
    fontSize: 18,
    fontWeight: '700',
  },
  instructions: {
    marginTop: 16,
    alignItems: 'center',
  },
  instructionText: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
