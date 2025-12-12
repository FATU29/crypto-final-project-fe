export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  name: string;
  price?: number;
  change24h?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  url: string;
  publishedAt: Date;
  imageUrl?: string;
  sentiment?: "positive" | "negative" | "neutral";
  sentimentScore?: number;
  tags: string[];
}

export interface Sentiment {
  score: number; // -1 to 1
  label: "positive" | "negative" | "neutral";
  confidence: number; // 0 to 1
}

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartTimeframe {
  value: string;
  label: string;
  interval: string;
}

export interface AIAnalysis {
  summary: string;
  sentiment: Sentiment;
  keyPoints: string[];
  prediction?: "bullish" | "bearish" | "neutral";
  confidence: number;
  reasoning?: string;
}
