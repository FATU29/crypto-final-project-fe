import { useState, useEffect, useCallback, useRef } from "react";
import { NewsAPI } from "@/lib/services/news-api";
import { News } from "@/types/news";
import { NewsMarker } from "@/app/(features)/charts/PriceChart";

interface UseChartNewsMarkersOptions {
  symbol: string;
  enabled?: boolean;
  refreshInterval?: number; // in ms, default 60000 (1 min)
}

interface UseChartNewsMarkersReturn {
  markers: NewsMarker[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook to fetch news related to a trading pair and convert them
 * into chart markers for displaying news events on the price chart.
 *
 * @example
 * ```tsx
 * const { markers } = useChartNewsMarkers({
 *   symbol: 'BTCUSDT',
 *   enabled: true,
 * });
 * ```
 */
export function useChartNewsMarkers({
  symbol,
  enabled = true,
  refreshInterval = 60000,
}: UseChartNewsMarkersOptions): UseChartNewsMarkersReturn {
  const [markers, setMarkers] = useState<NewsMarker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Derive the trading pair from the symbol (e.g., "BTCUSDT" -> "BTC")
  const derivePairSearchTerms = useCallback((sym: string): string[] => {
    const upper = sym.toUpperCase();
    const terms: string[] = [upper];

    // Common base assets
    const bases = [
      "BTC",
      "ETH",
      "BNB",
      "XRP",
      "SOL",
      "ADA",
      "DOGE",
      "MATIC",
      "LTC",
      "LINK",
      "DOT",
      "AVAX",
      "UNI",
      "ATOM",
      "ETC",
      "FIL",
      "TRX",
      "NEO",
      "ALGO",
      "VET",
    ];
    for (const base of bases) {
      if (upper.startsWith(base)) {
        terms.push(base);
        break;
      }
    }

    return terms;
  }, []);

  const convertToMarkers = useCallback((newsItems: News[]): NewsMarker[] => {
    return newsItems
      .filter((news) => news.published_at)
      .map((news) => {
        const publishedTime = new Date(news.published_at).getTime();
        return {
          id: news.id,
          title: news.title,
          time: Math.floor(publishedTime / 1000),
          sentiment: news.sentiment?.label || "neutral",
        };
      })
      .sort((a, b) => a.time - b.time);
  }, []);

  const fetchNews = useCallback(async () => {
    if (!enabled || !symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      const searchTerms = derivePairSearchTerms(symbol);
      // Try fetching by trading pair first
      let newsItems: News[] = [];

      try {
        newsItems = await NewsAPI.getByTradingPair(searchTerms[0]);
      } catch {
        // If trading pair fetch fails, try with base asset
        if (searchTerms.length > 1) {
          try {
            newsItems = await NewsAPI.getByTradingPair(searchTerms[1]);
          } catch {
            // Fallback to general news
            const result = await NewsAPI.getAll(1, 50);
            newsItems = result.items || [];
          }
        }
      }

      // Use up to 200 news items to cover the chart's visible time range
      const recentNews = newsItems.slice(0, 200);
      const newMarkers = convertToMarkers(recentNews);
      setMarkers(newMarkers);
    } catch (err) {
      console.error("Failed to fetch news for chart markers:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch news");
    } finally {
      setIsLoading(false);
    }
  }, [symbol, enabled, derivePairSearchTerms, convertToMarkers]);

  // Initial fetch and refresh interval
  useEffect(() => {
    if (enabled && symbol) {
      fetchNews();

      if (refreshInterval > 0) {
        intervalRef.current = setInterval(fetchNews, refreshInterval);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [symbol, enabled, refreshInterval, fetchNews]);

  return {
    markers,
    isLoading,
    error,
    refresh: fetchNews,
  };
}
