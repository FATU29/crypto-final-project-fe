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

// ============================================
// Prediction Line (Chart Overlay) Types
// ============================================

export interface PredictionLinePoint {
  time: number; // unix timestamp in seconds
  value: number; // predicted price
}

export interface PredictionLineRequest {
  symbol: string;
  interval: string; // 1m, 5m, 15m, 1h, 4h, 1d, 1w
  periods?: number; // 4-100, default 24
  news_limit?: number; // 1-50, default 10
}

export interface PredictionLineResponse {
  success: boolean;
  symbol: string;
  interval: string;
  current_price: number;
  current_time: number;
  prediction_line: PredictionLinePoint[];
  direction: PredictionDirection;
  confidence: number;
  reasoning: string;
  news_analyzed: number;
  model_version: string;
  generated_at: string; // ISO 8601
}
