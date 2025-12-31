// lib/services/analytics-api.ts

import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_CRAWL_API || "http://localhost:9000/api/v1";

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

    const response = await axios.get<{
      status: string;
      data: SentimentTrend[];
    }>(`${API_BASE_URL}/analytics/sentiment/trends?${queryParams.toString()}`);

    if (response.data.status === "success") {
      return response.data.data;
    }

    throw new Error("Failed to fetch sentiment trends");
  },

  /**
   * Get sentiment breakdown by trading pair
   */
  getSentimentByPair: async (pair: string): Promise<SentimentByPair> => {
    const response = await axios.get<{
      status: string;
      data: SentimentByPair;
    }>(`${API_BASE_URL}/analytics/sentiment/pair/${pair}`);

    if (response.data.status === "success") {
      return response.data.data;
    }

    throw new Error("Failed to fetch sentiment by pair");
  },
};

