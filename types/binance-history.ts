// Historical kline data from backend
export interface HistoricalKline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteVolume: string;
  trades: number;
  takerBuyBaseVolume: string;
  takerBuyQuoteVolume: string;
}

// API response from backend
export interface HistoricalDataResponse {
  success: boolean;
  symbol: string;
  interval: string;
  count: number;
  data: HistoricalKline[];
}

// Query parameters for fetching historical data
export interface HistoricalDataQuery {
  symbol: string;
  interval: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';
  startTime?: number;
  endTime?: number;
  limit?: number;
}

// Formatted candlestick data for chart libraries
export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
