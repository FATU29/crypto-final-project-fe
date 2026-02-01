export type PredictionDirection = "bullish" | "bearish" | "neutral";

export interface SentimentSummary {
  overall_sentiment: "positive" | "negative" | "mixed" | "neutral";
  bullish_signals: number;
  bearish_signals: number;
  neutral_signals: number;
  sentiment_score: number; // -1.0 to 1.0
}

export interface PricePrediction {
  symbol: string;
  prediction: PredictionDirection;
  confidence: number; // 0.0 to 1.0
  sentiment_summary: SentimentSummary;
  reasoning: string;
  key_factors: string[];
  news_analyzed: number;
  analyzed_at: string; // ISO 8601 datetime
  model_version: string;
}

export interface LongPollingPredictionResponse {
  success: boolean;
  has_new_data: boolean;
  prediction: PricePrediction | null;
  cache_hit: boolean;
  next_poll_after: number; // seconds
}

export interface LongPollingPredictionRequest {
  symbol: string;
  last_prediction_time?: string; // ISO 8601 datetime
  timeout?: number; // 30-50 seconds (must be < Gateway timeout of 60s)
}
