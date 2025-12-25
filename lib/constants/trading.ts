import type { TradingPair } from "@/types";

export const MOCK_TRADING_PAIRS: TradingPair[] = [
  {
    symbol: "BTCUSDT",
    baseAsset: "BTC",
    quoteAsset: "USDT",
    name: "Bitcoin",
    price: 43250.5,
    change24h: 2.34,
  },
  {
    symbol: "ETHUSDT",
    baseAsset: "ETH",
    quoteAsset: "USDT",
    name: "Ethereum",
    price: 2280.75,
    change24h: -1.23,
  },
];

export const CHART_TIMEFRAMES = [
  { value: "1m", label: "1m", interval: "1m" },
  { value: "5m", label: "5m", interval: "5m" },
  { value: "15m", label: "15m", interval: "15m" },
  { value: "1h", label: "1H", interval: "1h" },
  { value: "4h", label: "4H", interval: "4h" },
  { value: "1d", label: "1D", interval: "1d" },
  { value: "1w", label: "1W", interval: "1w" },
];
