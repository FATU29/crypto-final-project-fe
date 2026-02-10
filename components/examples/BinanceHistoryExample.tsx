"use client";

import { useState } from "react";
import { useBinanceHistory } from "@/hooks/use-binance-history";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Example component demonstrating how to use the Binance history API
 * This fetches historical candlestick data from Binance via the backend
 */
export function BinanceHistoryExample() {
  const { data, loading, error, fetchData } = useBinanceHistory();
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState<
    "1m" | "5m" | "15m" | "1h" | "4h" | "1d"
  >("1h");
  const [limit, setLimit] = useState(100);

  const handleFetch = async () => {
    await fetchData({
      symbol,
      interval,
      limit,
    });
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Binance Historical Data Example</CardTitle>
        <CardDescription>
          Fetch historical candlestick data from Binance API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="symbol" className="text-sm font-medium">
              Symbol
            </label>
            <input
              id="symbol"
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="px-3 py-2 border rounded-md"
              placeholder="BTCUSDT"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="interval" className="text-sm font-medium">
              Interval
            </label>
            <select
              id="interval"
              value={interval}
              onChange={(e) =>
                setInterval(
                  e.target.value as "1m" | "5m" | "15m" | "1h" | "4h" | "1d",
                )
              }
              className="px-3 py-2 border rounded-md"
            >
              <option value="1m">1 minute</option>
              <option value="5m">5 minutes</option>
              <option value="15m">15 minutes</option>
              <option value="1h">1 hour</option>
              <option value="4h">4 hours</option>
              <option value="1d">1 day</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="limit" className="text-sm font-medium">
              Limit
            </label>
            <input
              id="limit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              min={1}
              max={1000}
              className="px-3 py-2 border rounded-md w-24"
            />
          </div>

          <div className="flex items-end">
            <Button onClick={handleFetch} disabled={loading}>
              {loading ? "Loading..." : "Fetch Data"}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            <p className="font-medium">Error:</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        {/* Data Display */}
        {data && data.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                Successfully fetched {data.length} candles for {symbol}
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-500 uppercase">First Price</p>
                <p className="text-lg font-semibold">
                  ${parseFloat(data[0].open).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-500 uppercase">Last Price</p>
                <p className="text-lg font-semibold">
                  ${parseFloat(data[data.length - 1].close).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-500 uppercase">High</p>
                <p className="text-lg font-semibold">
                  $
                  {Math.max(
                    ...data.map((d) => parseFloat(d.high)),
                  ).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-500 uppercase">Low</p>
                <p className="text-lg font-semibold">
                  $
                  {Math.min(
                    ...data.map((d) => parseFloat(d.low)),
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Recent Candles Table */}
            <div className="border rounded-md overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Time</th>
                      <th className="px-4 py-2 text-right">Open</th>
                      <th className="px-4 py-2 text-right">High</th>
                      <th className="px-4 py-2 text-right">Low</th>
                      <th className="px-4 py-2 text-right">Close</th>
                      <th className="px-4 py-2 text-right">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 20).map((candle, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">
                          {new Date(candle.openTime).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {parseFloat(candle.open).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right text-green-600">
                          {parseFloat(candle.high).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right text-red-600">
                          {parseFloat(candle.low).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          {parseFloat(candle.close).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-600">
                          {parseFloat(candle.volume).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.length > 20 && (
                <div className="p-2 bg-gray-50 text-center text-sm text-gray-500">
                  Showing 20 of {data.length} candles
                </div>
              )}
            </div>

            {/* Candlestick Data Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Use{" "}
                <code className="px-1 py-0.5 bg-blue-100 rounded">
                  candlestickData
                </code>{" "}
                from the hook to get numeric values ready for chart libraries
                like Lightweight Charts or Chart.js.
              </p>
            </div>
          </div>
        )}

        {/* Usage Example */}
        <details className="border rounded-md p-4">
          <summary className="cursor-pointer font-medium">
            View Code Example
          </summary>
          <pre className="mt-4 p-4 bg-gray-900 text-gray-100 rounded-md overflow-x-auto text-xs">
            {`import { useBinanceHistory } from '@/hooks';

export function MyComponent() {
  const { data, candlestickData, loading, error, fetchData } = useBinanceHistory();

  const loadData = async () => {
    await fetchData({
      symbol: 'BTCUSDT',
      interval: '1h',
      limit: 100
    });
  };

  return (
    <div>
      <button onClick={loadData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      {data && data.map((candle) => (
        <div key={candle.openTime}>
          {candle.close} at {new Date(candle.openTime).toLocaleString()}
        </div>
      ))}
    </div>
  );
}`}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}
