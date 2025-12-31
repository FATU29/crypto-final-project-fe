// hooks/use-news.ts

import { useState, useEffect, useCallback } from "react";
import { News, NewsSummary, NewsFilter } from "@/types/news";
import { NewsAPI, PaginatedResponse } from "@/lib/services/news-api";

// Hook for paginated news list
export function usePaginatedNews(
  page = 1,
  limit = 20,
  source?: string,
  category?: string
) {
  const [data, setData] = useState<PaginatedResponse<News> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await NewsAPI.getAll(page, limit, source, category);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch news");
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, source, category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { data, loading, error, refetch: fetchNews };
}

// Hook for fetching article details on demand
export function useFetchArticleDetail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async (id: string): Promise<News | null> => {
    try {
      setLoading(true);
      setError(null);
      const article = await NewsAPI.fetchArticleDetails(id);
      return article;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch article details"
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchDetail, loading, error };
}

// Hook for fetching news with filters
export function useNews(filters?: NewsFilter) {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await NewsAPI.getAdvanced(filters || {});
      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch news");
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { news, loading, error, refetch: fetchNews };
}

// Hook for fetching summaries (optimized for UI)
export function useNewsSummaries(tradingPair?: string, limit = 20) {
  const [summaries, setSummaries] = useState<NewsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummaries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await NewsAPI.getSummaries(tradingPair, limit);
      setSummaries(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch summaries"
      );
    } finally {
      setLoading(false);
    }
  }, [tradingPair, limit]);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  return { summaries, loading, error, refetch: fetchSummaries };
}

// Hook for fetching by trading pair
export function useNewsByPair(tradingPair: string) {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await NewsAPI.getByTradingPair(tradingPair);
        setNews(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };

    if (tradingPair) {
      fetchNews();
    }
  }, [tradingPair]);

  return { news, loading, error };
}

// Hook with auto-refresh
export function useNewsPolling(interval = 30000, filters?: NewsFilter) {
  const { news, loading, error, refetch } = useNews(filters);

  useEffect(() => {
    const timer = setInterval(() => {
      refetch();
    }, interval);

    return () => clearInterval(timer);
  }, [interval, refetch]);

  return { news, loading, error, refetch };
}
