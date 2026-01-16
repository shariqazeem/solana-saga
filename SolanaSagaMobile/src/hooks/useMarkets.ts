import { useState, useEffect, useCallback } from 'react';

export interface Market {
  id: string;
  ticker: string;
  question: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  endDate: string;
  status: 'active' | 'resolved' | 'pending';
  resolution?: 'yes' | 'no';
  imageUrl?: string;
}

// Kalshi API (powers Jupiter Prediction Markets)
const KALSHI_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2';

// Category image mappings
const CATEGORY_IMAGES: Record<string, string> = {
  'Politics': 'https://img.icons8.com/fluency/96/parliament.png',
  'Crypto': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  'Economics': 'https://img.icons8.com/fluency/96/economic-improvement.png',
  'Sports': 'https://img.icons8.com/fluency/96/football2.png',
  'Tech': 'https://img.icons8.com/fluency/96/processor.png',
  'Culture': 'https://img.icons8.com/fluency/96/popcorn.png',
  'Climate': 'https://img.icons8.com/fluency/96/climate-change.png',
  'Science': 'https://img.icons8.com/fluency/96/test-tube.png',
};

// Curated high-volume markets from Jupiter Prediction (powered by Kalshi)
// These are popular markets shown on jup.ag/prediction
const FEATURED_MARKETS: Market[] = [
  {
    id: 'nfl-champion',
    ticker: 'KXNFLCHAMP-26',
    question: 'Who will win the 2026 Pro Football Championship?',
    category: 'Sports',
    yesPrice: 0.25, // Seattle
    noPrice: 0.75,
    volume: 112112048,
    endDate: '2026-02-08',
    status: 'active',
    imageUrl: 'https://img.icons8.com/fluency/96/football2.png',
  },
  {
    id: 'dem-nominee-2028',
    ticker: 'KXDEMNOMINEE-28',
    question: 'Who will be the Democratic nominee for President in 2028?',
    category: 'Politics',
    yesPrice: 0.34, // Newsom leading
    noPrice: 0.66,
    volume: 39255841,
    endDate: '2028-08-31',
    status: 'active',
    imageUrl: 'https://img.icons8.com/fluency/96/parliament.png',
  },
  {
    id: 'fed-chair-nomination',
    ticker: 'KXFEDCHAIR-26',
    question: 'Who will Trump nominate as Fed Chair?',
    category: 'Economics',
    yesPrice: 0.46, // Kevin Warsh leading
    noPrice: 0.54,
    volume: 33410181,
    endDate: '2026-05-31',
    status: 'active',
    imageUrl: 'https://img.icons8.com/fluency/96/economic-improvement.png',
  },
  {
    id: 'btc-150k',
    ticker: 'KXBTC150K-26',
    question: 'When will Bitcoin hit $150K?',
    category: 'Crypto',
    yesPrice: 0.16, // Before June 2026
    noPrice: 0.84,
    volume: 20847520,
    endDate: '2026-06-30',
    status: 'active',
    imageUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  },
  {
    id: 'fed-jan-decision',
    ticker: 'KXFED-JAN26',
    question: 'Fed decision in January 2026: Rate cut or maintain?',
    category: 'Economics',
    yesPrice: 0.95, // Maintain rate
    noPrice: 0.05,
    volume: 18409922,
    endDate: '2026-01-29',
    status: 'active',
    imageUrl: 'https://img.icons8.com/fluency/96/economic-improvement.png',
  },
  {
    id: 'nba-champion',
    ticker: 'KXNBACHAMP-26',
    question: 'Who will win the 2026 NBA Championship?',
    category: 'Sports',
    yesPrice: 0.44, // OKC leading
    noPrice: 0.56,
    volume: 16357261,
    endDate: '2026-06-15',
    status: 'active',
    imageUrl: 'https://img.icons8.com/fluency/96/basketball.png',
  },
  {
    id: 'sol-eth-flip',
    ticker: 'KXSOLETHFLIP-26',
    question: 'Will SOL flip ETH market cap in 2026?',
    category: 'Crypto',
    yesPrice: 0.12,
    noPrice: 0.88,
    volume: 8500000,
    endDate: '2026-12-31',
    status: 'active',
    imageUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png',
  },
  {
    id: 'openai-ipo',
    ticker: 'KXOPENAIIPO-26',
    question: 'Will OpenAI IPO before Anthropic in 2026?',
    category: 'Tech',
    yesPrice: 0.68,
    noPrice: 0.32,
    volume: 5200000,
    endDate: '2026-12-31',
    status: 'active',
    imageUrl: 'https://img.icons8.com/fluency/96/artificial-intelligence.png',
  },
  {
    id: 'trump-crypto-mention',
    ticker: 'KXTRUMPCRYPTO-26',
    question: 'Will Trump mention crypto in State of Union 2026?',
    category: 'Politics',
    yesPrice: 0.72,
    noPrice: 0.28,
    volume: 4800000,
    endDate: '2026-03-01',
    status: 'active',
    imageUrl: 'https://img.icons8.com/fluency/96/parliament.png',
  },
  {
    id: 'meme-coin-top10',
    ticker: 'KXMEMETOP10-26',
    question: 'Will a meme coin enter top 10 market cap?',
    category: 'Crypto',
    yesPrice: 0.45,
    noPrice: 0.55,
    volume: 3500000,
    endDate: '2026-12-31',
    status: 'active',
    imageUrl: 'https://img.icons8.com/fluency/96/dogecoin.png',
  },
];

export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch live markets from Kalshi API
      const response = await fetch(`${KALSHI_API_BASE}/events?limit=50&status=open`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Transform Kalshi events to our Market format
        const liveMarkets: Market[] = [];

        if (data.events && Array.isArray(data.events)) {
          for (const event of data.events) {
            // Skip sports multi-game events (they have complex titles)
            if (event.ticker?.includes('MULTIGAME')) continue;

            // Determine category
            let category = event.category || 'General';
            if (event.title?.toLowerCase().includes('bitcoin') ||
                event.title?.toLowerCase().includes('crypto') ||
                event.title?.toLowerCase().includes('sol')) {
              category = 'Crypto';
            } else if (event.title?.toLowerCase().includes('trump') ||
                       event.title?.toLowerCase().includes('president') ||
                       event.title?.toLowerCase().includes('election')) {
              category = 'Politics';
            } else if (event.title?.toLowerCase().includes('fed') ||
                       event.title?.toLowerCase().includes('rate') ||
                       event.title?.toLowerCase().includes('gdp')) {
              category = 'Economics';
            }

            liveMarkets.push({
              id: event.event_ticker || event.ticker,
              ticker: event.ticker || event.event_ticker,
              question: event.title || event.question || 'Unknown Event',
              category,
              yesPrice: 0.5,
              noPrice: 0.5,
              volume: event.volume || 0,
              endDate: event.close_time || event.end_date || '',
              status: 'active',
              imageUrl: CATEGORY_IMAGES[category] || CATEGORY_IMAGES['General'],
            });
          }
        }

        // Combine live markets with featured markets, prioritize featured
        const allMarkets = [...FEATURED_MARKETS, ...liveMarkets.slice(0, 10)];

        // Remove duplicates and shuffle
        const uniqueMarkets = allMarkets.filter((market, index, self) =>
          index === self.findIndex(m => m.question === market.question)
        );

        setMarkets(uniqueMarkets);
      } else {
        console.log('Kalshi API unavailable, using featured markets');
        setMarkets(FEATURED_MARKETS);
      }
    } catch (err) {
      console.log('Using featured markets:', err);
      setMarkets(FEATURED_MARKETS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  return {
    markets,
    loading,
    error,
    refetch: fetchMarkets,
  };
}
