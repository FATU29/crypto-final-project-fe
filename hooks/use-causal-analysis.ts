// hooks/use-causal-analysis.ts

import { useState } from "react";
import {
  CausalAnalysisRequest,
  CausalAnalysisResponse,
  CausalAnalysisResult,
} from "@/types/causal-analysis";
import { News } from "@/types/news";
import { config } from "@/config";
import {
  handleFetchError,
  formatNetworkError,
  formatErrorMessage,
} from "@/lib/utils/error-handler";

// IMPORTANT: All AI API calls MUST go through Gateway for VIP authentication
// Gateway URL handles authentication and VIP authorization
const GATEWAY_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(config.auth.tokenKey);
};

export function useCausalAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CausalAnalysisResult | null>(null);

  const analyze = async (request: CausalAnalysisRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if token exists
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${GATEWAY_API_BASE}/api/v1/causal/analyze/causal`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            news_article_id: request.news_article_id,
            symbol: request.symbol,
            hours_before: request.hours_before || 24,
            hours_after: request.hours_after || 24,
            prediction_horizon: request.prediction_horizon || "24h",
          }),
        }
      );

      if (!response.ok) {
        await handleFetchError(response, "Causal analysis");
      }

      const data: CausalAnalysisResponse = await response.json();
      if (data.success && data.data) {
        setResult(data.data);
        return data.data;
      } else {
        throw new Error(data.message || "Analysis failed");
      }
    } catch (err) {
      // Format error message for better UX
      const errorMessage = formatNetworkError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzeByArticleId = async (
    articleId: number,
    symbol: string,
    options?: {
      hours_before?: number;
      hours_after?: number;
      prediction_horizon?: "1h" | "4h" | "24h" | "7d";
    }
  ) => {
    return analyze({
      news_article_id: articleId,
      symbol,
      hours_before: options?.hours_before,
      hours_after: options?.hours_after,
      prediction_horizon: options?.prediction_horizon,
    });
  };

  const analyzeDirect = async (
    news: News,
    symbol: string,
    options?: {
      hours_before?: number;
      hours_after?: number;
      prediction_horizon?: "1h" | "4h" | "24h" | "7d";
    }
  ) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if token exists
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${GATEWAY_API_BASE}/api/v1/causal/analyze/direct`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            title: news.title,
            content: news.content || news.summary || "",
            published_at: news.published_at,
            symbol: symbol.toUpperCase(),
            hours_before: options?.hours_before || 24,
            hours_after: options?.hours_after || 24,
            prediction_horizon: options?.prediction_horizon || "24h",
          }),
        }
      );

      if (!response.ok) {
        await handleFetchError(response, "Causal analysis");
      }

      const data: CausalAnalysisResponse = await response.json();
      if (data.success && data.data) {
        setResult(data.data);
        return data.data;
      } else {
        throw new Error(data.message || "Analysis failed");
      }
    } catch (err) {
      // Format error message for better UX
      const errorMessage = formatNetworkError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyze,
    analyzeByArticleId,
    analyzeDirect,
    loading,
    error,
    result,
    clearError: () => setError(null),
    clearResult: () => setResult(null),
  };
}
