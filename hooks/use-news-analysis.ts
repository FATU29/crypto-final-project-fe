// hooks/use-news-analysis.ts

import { useState } from "react";
import { NewsAPI } from "@/lib/services/news-api";
import { News } from "@/types/news";
import { config } from "@/config";
import {
  handleFetchError,
  formatNetworkError,
  formatErrorMessage,
} from "@/lib/utils/error-handler";

// IMPORTANT: All AI API calls MUST go through Gateway for VIP authentication
const GATEWAY_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(config.auth.tokenKey);
};

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
      const errorMessage = formatNetworkError(err);
      setError(errorMessage);
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
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if token exists (required for VIP AI features)
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${GATEWAY_API_BASE}/api/v1/ai/price-impact`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            news_id: newsId,
            trading_pairs: tradingPairs,
          }),
        }
      );

      if (!response.ok) {
        await handleFetchError(response, "Price impact analysis");
      }

      if (response.ok) {
        return await NewsAPI.getById(newsId);
      }
      return null;
    } catch (err) {
      const errorMessage = formatNetworkError(err);
      setError(errorMessage);
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
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if token exists (required for VIP AI features)
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${GATEWAY_API_BASE}/api/v1/ai/analyze`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          news_id: newsId,
          trading_pairs: tradingPairs || [],
        }),
      });

      if (!response.ok) {
        await handleFetchError(response, "News analysis");
      }

      if (response.ok) {
        const data = await response.json();
        return data.data || null;
      }
      return null;
    } catch (err) {
      const errorMessage = formatNetworkError(err);
      setError(errorMessage);
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
