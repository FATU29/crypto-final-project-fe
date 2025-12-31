// hooks/use-news-analysis.ts

import { useState } from "react";
import { NewsAPI } from "@/lib/services/news-api";
import { News } from "@/types/news";

export function useNewsAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeSentiment = async (newsId: string): Promise<News | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await NewsAPI.analyzeSentiment(newsId);
      if (response.success) {
        // Refetch the news to get updated sentiment
        return await NewsAPI.getById(newsId);
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzePriceImpact = async (
    newsId: string,
    tradingPairs: string[]
  ): Promise<News | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_CRAWL_API || "http://localhost:9000/api/v1"
        }/ai/price-impact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            news_id: newsId,
            trading_pairs: tradingPairs,
          }),
        }
      );

      if (response.ok) {
        return await NewsAPI.getById(newsId);
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fullAnalysis = async (
    newsId: string,
    tradingPairs?: string[]
  ): Promise<News | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_CRAWL_API || "http://localhost:9000/api/v1"
        }/ai/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            news_id: newsId,
            trading_pairs: tradingPairs || [],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.data || null;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeSentiment,
    analyzePriceImpact,
    fullAnalysis,
    loading,
    error,
  };
}
