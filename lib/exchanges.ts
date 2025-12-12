import ccxt from "ccxt";

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export type Candle = {
  time: number; // ms epoch
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

// Minimal shape to avoid depending on ccxt types
type ExchangeLike = {
  fetchOHLCV: (
    symbol: string,
    timeframe: string,
    since?: number,
    limit?: number
  ) => Promise<Array<[number, number, number, number, number, number]>>;
};

export async function fetchOHLCV({
  exchangeId = "binance",
  symbol,
  timeframe,
  since,
  limit = 500,
}: {
  exchangeId?: string;
  symbol: string; // e.g. 'BTC/USDT'
  timeframe: Timeframe;
  since?: number; // ms epoch
  limit?: number;
}): Promise<Candle[]> {
  // Dynamically construct exchange instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exchangeClass = (ccxt as any)[exchangeId] as new (opts: {
    enableRateLimit: boolean;
  }) => ExchangeLike;
  const exchange: ExchangeLike = new exchangeClass({ enableRateLimit: true });

  const tf = timeframe;
  const candles = await exchange.fetchOHLCV(symbol, tf, since, limit);

  return candles.map((c: [number, number, number, number, number, number]) => ({
    time: c[0],
    open: c[1],
    high: c[2],
    low: c[3],
    close: c[4],
    volume: c[5],
  }));
}

export function timeframeToMs(tf: Timeframe): number {
  switch (tf) {
    case "1m":
      return 60_000;
    case "5m":
      return 5 * 60_000;
    case "15m":
      return 15 * 60_000;
    case "1h":
      return 60 * 60_000;
    case "4h":
      return 4 * 60 * 60_000;
    case "1d":
      return 24 * 60 * 60_000;
    default:
      return 60_000;
  }
}

export function symbolToDisplay(symbol: string): string {
  return symbol.replace("/", ""); // 'BTC/USDT' -> 'BTCUSDT'
}
