// hooks/use-sentiment-trends.ts

import { useState, useEffect, useMemo } from "react";
import { AnalyticsAPI, SentimentTrend, SentimentTrendRequest } from "@/lib/services/analytics-api";

export function useSentimentTrends(params?: SentimentTrendRequest) {
  const [trends, setTrends] = useState<SentimentTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize sources and trading_pairs strings to avoid complex expressions in dependencies
  const sourcesKey = useMemo(
    () => params?.sources?.join(",") || "",
    [params?.sources]
  );

  const tradingPairsKey = useMemo(
    () => params?.trading_pairs?.join(",") || "",
    [params?.trading_pairs]
  );

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await AnalyticsAPI.getSentimentTrends(params);
        setTrends(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch trends");
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [
    params?.timeframe,
    params?.start_date,
    params?.end_date,
    sourcesKey,
    tradingPairsKey,
  ]);

  return { trends, loading, error };
}

