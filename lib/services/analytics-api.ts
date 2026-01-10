// lib/services/analytics-api.ts

import { apiClient } from "@/lib/api/client";

// IMPORTANT: All analytics API calls MUST go through Gateway for VIP authentication
// Analytics endpoints require VIP account access

export interface SentimentTrend {
  time: string;
  positive: number;
  negative: number;
  neutral: number;
  avg_score: number;
  total: number;
}

export interface SentimentTrendRequest {
  timeframe?: "hour" | "day" | "week" | "month";
  start_date?: string;
  end_date?: string;
  sources?: string[];
  trading_pairs?: string[];
}

export interface SentimentByPair {
  trading_pair: string;
  total_news: number;
  positive: number;
  negative: number;
  neutral: number;
  avg_score: number;
  avg_confidence: number;
}

export const AnalyticsAPI = {
  /**
   * Get sentiment trends over time
   * Requires VIP account access via Gateway authentication
   */
  getSentimentTrends: async (
    params?: SentimentTrendRequest
  ): Promise<SentimentTrend[]> => {
    const queryParams = new URLSearchParams();

    if (params?.timeframe) {
      queryParams.append("timeframe", params.timeframe);
    }
    if (params?.start_date) {
      queryParams.append("start_date", params.start_date);
    }
    if (params?.end_date) {
      queryParams.append("end_date", params.end_date);
    }
    if (params?.sources && params.sources.length > 0) {
      queryParams.append("sources", params.sources.join(","));
    }
    if (params?.trading_pairs && params.trading_pairs.length > 0) {
      queryParams.append("trading_pairs", params.trading_pairs.join(","));
    }

    const response = await apiClient.get<{
      status: string;
      data: SentimentTrend[];
    }>(`/api/v1/analytics/sentiment/trends?${queryParams.toString()}`);

    if (response.status === "success") {
      return response.data;
    }

    throw new Error("Failed to fetch sentiment trends");
  },

  /**
   * Get sentiment breakdown by trading pair
   * Requires VIP account access via Gateway authentication
   */
  getSentimentByPair: async (pair: string): Promise<SentimentByPair> => {
    const response = await apiClient.get<{
      status: string;
      data: SentimentByPair;
    }>(`/api/v1/analytics/sentiment/pair/${pair}`);

    if (response.status === "success") {
      return response.data;
    }

    throw new Error("Failed to fetch sentiment by pair");
  },
};
