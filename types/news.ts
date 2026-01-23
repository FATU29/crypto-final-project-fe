// types/news.ts

import { ApiResponse as BaseApiResponse } from "./auth";

export interface News {
  id: string;
  title: string;
  content: string;
  summary?: string;
  author?: string;
  source: string;
  source_url: string;
  image_url?: string;
  category?: string;
  tags?: string[];
  published_at: string;
  crawled_at: string;
  language?: string;

  // AI Analysis
  sentiment?: SentimentAnalysis;
  related_pairs?: string[];
  price_impact?: PriceImpact;
  ai_analyzed: boolean;
  analyzed_at?: string;

  // Parsing metadata
  parsing_method?: "rule-based" | "ai" | "fallback";
  parsing_confidence?: number; // 0.0 to 1.0
}

export interface SentimentAnalysis {
  score: number; // -1.0 to 1.0
  label: "positive" | "negative" | "neutral";
  confidence: number; // 0.0 to 1.0
  keywords: string[];
  reasoning: string;
}

export interface PriceImpact {
  direction: "up" | "down" | "neutral";
  magnitude: "high" | "medium" | "low";
  timeframe: "short" | "medium" | "long";
  confidence: number;
  reasoning: string;
}

export interface NewsSummary {
  id: string;
  title: string;
  summary?: string;
  source: string;
  image_url?: string;
  published_at: string;
  sentiment_label?: string;
  sentiment_score?: number;
  related_pairs?: string[];
  parsing_method?: "rule-based" | "ai" | "fallback";
  parsing_confidence?: number; // 0.0 to 1.0
}

export interface NewsFilter {
  start_date?: string;
  end_date?: string;
  sources?: string[];
  categories?: string[];
  trading_pairs?: string[];
  sentiment?: "positive" | "negative" | "neutral";
  min_score?: number;
  ai_analyzed?: boolean;
  parsing_method?: "rule-based" | "ai" | "fallback" | "all";
  language?: string;
  limit?: number;
}

export interface CrawlerStatus {
  is_running: boolean;
  active_jobs: number;
  total_crawled: number;
  last_crawl_time?: string;
  sources: string[];
}

export interface CronJobStatus {
  enabled: boolean;
  running: boolean;
  interval: string;
  last_run?: string;
  next_run?: string;
  news_count: number;
}

// Re-export ApiResponse for backward compatibility
export type NewsApiResponse<T> = BaseApiResponse<T>;
