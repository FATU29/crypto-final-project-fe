import type {
  HistoricalDataQuery,
  HistoricalDataResponse,
  CandlestickData,
} from '@/types/binance-history';

const API_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

/**
 * Fetch historical kline/candlestick data from backend
 * The backend proxies the request to Binance API
 */
export async function fetchHistoricalKlines(
  query: HistoricalDataQuery
): Promise<HistoricalDataResponse> {
  const params = new URLSearchParams({
    symbol: query.symbol.toUpperCase(),
    interval: query.interval,
  });

  if (query.startTime) {
    params.append('startTime', query.startTime.toString());
  }

  if (query.endTime) {
    params.append('endTime', query.endTime.toString());
  }

  if (query.limit) {
    params.append('limit', query.limit.toString());
  }

  const url = `${API_BASE_URL}/binance/history?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch historical data: ${response.statusText} - ${errorText}`
    );
  }

  const data: HistoricalDataResponse = await response.json();
  return data;
}

/**
 * Convert historical klines to candlestick data format
 * Useful for chart libraries that expect numeric values
 */
export function convertToCandlestickData(
  response: HistoricalDataResponse
): CandlestickData[] {
  return response.data.map((kline) => ({
    time: kline.openTime,
    open: parseFloat(kline.open),
    high: parseFloat(kline.high),
    low: parseFloat(kline.low),
    close: parseFloat(kline.close),
    volume: parseFloat(kline.volume),
  }));
}

/**
 * Fetch historical data with automatic conversion to candlestick format
 */
export async function fetchCandlestickData(
  query: HistoricalDataQuery
): Promise<CandlestickData[]> {
  const response = await fetchHistoricalKlines(query);
  return convertToCandlestickData(response);
}
