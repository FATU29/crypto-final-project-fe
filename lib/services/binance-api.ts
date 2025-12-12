/**
 * Binance REST API Service
 * Documentation: https://binance-docs.github.io/apidocs/spot/en/#general-info
 */

const BINANCE_API_BASE = "https://api.binance.com/api/v3";

export type KlineInterval =
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "2h"
  | "4h"
  | "6h"
  | "8h"
  | "12h"
  | "1d"
  | "3d"
  | "1w"
  | "1M";

export interface BinanceKlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

export interface BinanceTicker24hr {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface BinanceSymbol {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  baseAssetPrecision: number;
  quotePrecision: number;
  quoteAssetPrecision: number;
  orderTypes: string[];
  icebergAllowed: boolean;
  ocoAllowed: boolean;
  isSpotTradingAllowed: boolean;
  isMarginTradingAllowed: boolean;
}

export interface BinanceExchangeInfo {
  timezone: string;
  serverTime: number;
  symbols: BinanceSymbol[];
}

/**
 * Fetch historical kline/candlestick data
 * @param symbol - Trading pair symbol (e.g., 'BTCUSDT')
 * @param interval - Kline interval
 * @param options - Optional parameters (limit, startTime, endTime)
 */
export async function fetchKlines(
  symbol: string,
  interval: KlineInterval,
  options?: {
    limit?: number; // Default 500, max 1000
    startTime?: number; // Timestamp in milliseconds
    endTime?: number; // Timestamp in milliseconds
  }
): Promise<BinanceKlineData[]> {
  const params = new URLSearchParams({
    symbol: symbol.toUpperCase(),
    interval,
    ...(options?.limit && { limit: options.limit.toString() }),
    ...(options?.startTime && { startTime: options.startTime.toString() }),
    ...(options?.endTime && { endTime: options.endTime.toString() }),
  });

  const response = await fetch(`${BINANCE_API_BASE}/klines?${params}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Binance API error: ${response.status} - ${errorText}`);
  }

  const data: Array<
    [
      number,
      string,
      string,
      string,
      string,
      string,
      number,
      string,
      number,
      string,
      string,
      string
    ]
  > = await response.json();

  return data.map(
    ([
      openTime,
      open,
      high,
      low,
      close,
      volume,
      closeTime,
      quoteAssetVolume,
      numberOfTrades,
      takerBuyBaseAssetVolume,
      takerBuyQuoteAssetVolume,
    ]) => ({
      openTime,
      open,
      high,
      low,
      close,
      volume,
      closeTime,
      quoteAssetVolume,
      numberOfTrades,
      takerBuyBaseAssetVolume,
      takerBuyQuoteAssetVolume,
    })
  );
}

/**
 * Fetch 24hr ticker price change statistics
 * @param symbol - Trading pair symbol (e.g., 'BTCUSDT'). If not provided, returns data for all symbols
 */
export async function fetch24hrTicker(
  symbol?: string
): Promise<BinanceTicker24hr | BinanceTicker24hr[]> {
  const params = symbol ? `?symbol=${symbol.toUpperCase()}` : "";
  const response = await fetch(`${BINANCE_API_BASE}/ticker/24hr${params}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Binance API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Fetch current average price
 * @param symbol - Trading pair symbol (e.g., 'BTCUSDT')
 */
export async function fetchAvgPrice(
  symbol: string
): Promise<{ mins: number; price: string }> {
  const response = await fetch(
    `${BINANCE_API_BASE}/avgPrice?symbol=${symbol.toUpperCase()}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Binance API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Fetch exchange information (trading rules and symbols)
 * @param symbol - Optional trading pair symbol to filter results
 */
export async function fetchExchangeInfo(
  symbol?: string
): Promise<BinanceExchangeInfo> {
  const params = symbol ? `?symbol=${symbol.toUpperCase()}` : "";
  const response = await fetch(`${BINANCE_API_BASE}/exchangeInfo${params}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Binance API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Fetch current best bid/ask prices
 * @param symbol - Trading pair symbol (e.g., 'BTCUSDT'). If not provided, returns data for all symbols
 */
export async function fetchBookTicker(symbol?: string): Promise<{
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
}> {
  const params = symbol ? `?symbol=${symbol.toUpperCase()}` : "";
  const response = await fetch(
    `${BINANCE_API_BASE}/ticker/bookTicker${params}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Binance API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Fetch latest price for a symbol
 * @param symbol - Trading pair symbol (e.g., 'BTCUSDT'). If not provided, returns data for all symbols
 */
export async function fetchPrice(
  symbol?: string
): Promise<
  { symbol: string; price: string } | Array<{ symbol: string; price: string }>
> {
  const params = symbol ? `?symbol=${symbol.toUpperCase()}` : "";
  const response = await fetch(`${BINANCE_API_BASE}/ticker/price${params}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Binance API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Test connectivity to the Binance API
 */
export async function ping(): Promise<boolean> {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/ping`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get current server time
 */
export async function getServerTime(): Promise<number> {
  const response = await fetch(`${BINANCE_API_BASE}/time`);

  if (!response.ok) {
    throw new Error("Failed to fetch server time");
  }

  const data = await response.json();
  return data.serverTime;
}
