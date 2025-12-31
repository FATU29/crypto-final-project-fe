// types/causal-analysis.ts

export interface PriceDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TrendDirection = "UP" | "DOWN" | "NEUTRAL";
export type RelationshipType = "STRONG" | "MODERATE" | "WEAK" | "NONE";
export type PredictionHorizon = "1h" | "4h" | "24h" | "7d";

export interface TrendPrediction {
  direction: TrendDirection;
  confidence: number; // 0.0 to 1.0
  expected_change_percent: number;
  reasoning: string;
  key_factors: string[];
}

export interface CausalRelationship {
  relationship_type: RelationshipType;
  correlation_score: number; // -1.0 to 1.0
  explanation: string;
  evidence_points: string[];
}

export interface CausalAnalysisResult {
  news_article_id: number;
  symbol: string;
  news_published_at: string;
  analysis_timestamp: string;
  price_before_news: number;
  price_after_news: number | null;
  price_change_percent: number | null;
  sentiment_label: string;
  sentiment_score: number;
  causal_relationship: CausalRelationship;
  trend_prediction: TrendPrediction;
  price_history_before: PriceDataPoint[];
  price_history_after: PriceDataPoint[];
  model_version: string;
  analysis_metadata: Record<string, unknown> | null;
}

export interface CausalAnalysisRequest {
  news_article_id: number;
  symbol: string;
  hours_before?: number; // 1-168, default 24
  hours_after?: number; // 1-168, default 24
  prediction_horizon?: PredictionHorizon; // default "24h"
}

export interface CausalAnalysisResponse {
  success: boolean;
  data: CausalAnalysisResult;
  message?: string;
}

