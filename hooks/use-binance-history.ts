import { useState, useCallback, useEffect } from "react";
import {
  fetchHistoricalKlines,
  convertToCandlestickData,
} from "@/lib/api/binance-history";
import type {
  HistoricalDataQuery,
  HistoricalKline,
  CandlestickData,
} from "@/types/binance-history";

interface UseBinanceHistoryOptions {
  autoFetch?: boolean; // Automatically fetch on mount
  onSuccess?: (data: HistoricalKline[]) => void;
  onError?: (error: Error) => void;
}

interface UseBinanceHistoryReturn {
  data: HistoricalKline[] | null;
  candlestickData: CandlestickData[] | null;
  loading: boolean;
  error: Error | null;
  fetchData: (query: HistoricalDataQuery) => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook to fetch and manage historical kline data from Binance
 *
 * @example
 * ```tsx
 * const { data, candlestickData, loading, error, fetchData } = useBinanceHistory();
 *
 * // Fetch data
 * useEffect(() => {
 *   fetchData({
 *     symbol: 'BTCUSDT',
 *     interval: '1h',
 *     limit: 100
 *   });
 * }, []);
 * ```
 */
export function useBinanceHistory(
  options: UseBinanceHistoryOptions = {},
): UseBinanceHistoryReturn {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<HistoricalKline[] | null>(null);
  const [candlestickData, setCandlestickData] = useState<
    CandlestickData[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastQuery, setLastQuery] = useState<HistoricalDataQuery | null>(null);

  const fetchData = useCallback(
    async (query: HistoricalDataQuery) => {
      setLoading(true);
      setError(null);
      setLastQuery(query);

      try {
        const response = await fetchHistoricalKlines(query);
        const candles = convertToCandlestickData(response);

        setData(response.data);
        setCandlestickData(candles);

        if (onSuccess) {
          onSuccess(response.data);
        }
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to fetch historical data");
        setError(error);

        if (onError) {
          onError(error);
        }
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError],
  );

  const refetch = useCallback(async () => {
    if (lastQuery) {
      await fetchData(lastQuery);
    }
  }, [lastQuery, fetchData]);

  const reset = useCallback(() => {
    setData(null);
    setCandlestickData(null);
    setError(null);
    setLastQuery(null);
  }, []);

  return {
    data,
    candlestickData,
    loading,
    error,
    fetchData,
    refetch,
    reset,
  };
}

/**
 * Hook with automatic fetching on mount
 *
 * @example
 * ```tsx
 * const { data, loading } = useAutoFetchHistory({
 *   symbol: 'BTCUSDT',
 *   interval: '1h',
 *   limit: 100
 * });
 * ```
 */
export function useAutoFetchHistory(
  query: HistoricalDataQuery,
): UseBinanceHistoryReturn {
  const hook = useBinanceHistory();
  const { fetchData } = hook;

  useEffect(() => {
    fetchData(query);
  }, [fetchData, query]);

  return hook;
}
