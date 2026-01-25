"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useBinanceWebSocket } from "@/hooks";

export type PriceChartProps = {
  symbol: string;
  interval: string;
  height?: number;
};

export default function PriceChart({
  symbol,
  interval,
  height = 500,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candlestickSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeSeriesRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastPrice, setLastPrice] = useState<number | null>(null);

  // Use WebSocket hook
  const { isConnected: wsConnected, lastMessage } = useBinanceWebSocket({
    symbol,
    interval,
    enabled:
      !isLoading && !!candlestickSeriesRef.current && !!volumeSeriesRef.current,
    onConnect: () => {
      console.log("✅ [Chart] WebSocket connected");
      setError(null);
    },
    onDisconnect: () => {
      console.log("🔌 [Chart] WebSocket disconnected");
    },
    onError: () => {
      setError("WebSocket connection error");
    },
  });

  // Update chart when WebSocket receives new data
  useEffect(() => {
    if (
      !lastMessage ||
      !candlestickSeriesRef.current ||
      !volumeSeriesRef.current
    ) {
      return;
    }

    // Verify the message is for the current symbol
    if (lastMessage.s && lastMessage.s.toUpperCase() !== symbol.toUpperCase()) {
      console.warn(
        `⚠️ [Chart] Ignoring message for different symbol: ${lastMessage.s} (current: ${symbol})`
      );
      return;
    }

    const kline = lastMessage.k;
    if (!kline) return;

    const candle = {
      time: Math.floor(kline.t / 1000),
      open: parseFloat(kline.o),
      high: parseFloat(kline.h),
      low: parseFloat(kline.l),
      close: parseFloat(kline.c),
    };

    const volume = {
      time: Math.floor(kline.t / 1000),
      value: parseFloat(kline.v),
      color:
        parseFloat(kline.c) >= parseFloat(kline.o)
          ? "rgba(34, 197, 94, 0.5)"
          : "rgba(239, 68, 68, 0.5)",
    };

    try {
      // Try to update the chart with new data
      // If the data is older than existing data, this will throw an error
      // which we catch and ignore
      candlestickSeriesRef.current.update(candle);
      volumeSeriesRef.current.update(volume);
      setLastPrice(candle.close);
    } catch (error) {
      // Silently ignore "Cannot update oldest data" errors
      // This happens when WebSocket sends data that's already in the chart
      if (
        error instanceof Error &&
        !error.message.includes("Cannot update oldest data")
      ) {
        console.warn("Chart update error:", error.message);
      }
    }
  }, [lastMessage, symbol]);

  // Fetch historical data from Binance REST API
  useEffect(() => {
    if (!symbol || !interval) {
      setError("Missing symbol or interval");
      return;
    }

    // Reset state when symbol or interval changes
    setIsLoading(true);
    setError(null);
    setLastPrice(null);

    // Clear existing chart data
    if (candlestickSeriesRef.current && volumeSeriesRef.current) {
      candlestickSeriesRef.current.setData([]);
      volumeSeriesRef.current.setData([]);
    }

    const fetchHistoricalData = async () => {
      try {
        const limit = 1000;
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

        console.log("📊 Fetching historical data:", url);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        const candles = data.map((d: (number | string)[]) => ({
          time: Math.floor(Number(d[0]) / 1000),
          open: Number(d[1]),
          high: Number(d[2]),
          low: Number(d[3]),
          close: Number(d[4]),
        }));

        const volumes = data.map((d: (number | string)[]) => ({
          time: Math.floor(Number(d[0]) / 1000),
          value: Number(d[5]),
          color:
            Number(d[4]) >= Number(d[1])
              ? "rgba(34, 197, 94, 0.5)"
              : "rgba(239, 68, 68, 0.5)",
        }));

        if (candlestickSeriesRef.current && volumeSeriesRef.current) {
          candlestickSeriesRef.current.setData(candles);
          volumeSeriesRef.current.setData(volumes);

          if (candles.length > 0) {
            setLastPrice(candles[candles.length - 1].close);
          }
        }

        setIsLoading(false);
        console.log("✅ Historical data loaded:", candles.length, "candles");
      } catch (err) {
        console.error("❌ Error fetching historical data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load chart data"
        );
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol, interval]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chart: any = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: "transparent" },
        textColor: "#9CA3AF",
      },
      grid: {
        vertLines: { color: "rgba(42, 46, 57, 0.3)" },
        horzLines: { color: "rgba(42, 46, 57, 0.3)" },
      },
      crosshair: {
        mode: 0, // Normal mode
      },
      rightPriceScale: {
        borderColor: "rgba(42, 46, 57, 0.5)",
      },
      timeScale: {
        borderColor: "rgba(42, 46, 57, 0.5)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Use imported series definitions for v5 API
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22C55E",
      downColor: "#EF4444",
      borderUpColor: "#22C55E",
      borderDownColor: "#EF4444",
      wickUpColor: "#22C55E",
      wickDownColor: "#EF4444",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [height]);

  return (
    <div className="w-full space-y-2">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {symbol} • {interval}
          </div>
          {wsConnected ? (
            <div className="flex items-center gap-1 text-xs text-green-500">
              <Wifi className="h-3 w-3" />
              <span>Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <WifiOff className="h-3 w-3" />
              <span>Connecting...</span>
            </div>
          )}
        </div>
        {lastPrice && (
          <div className="text-lg font-bold">
            $
            {lastPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">
                Loading chart data...
              </p>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full" />
      </div>
    </div>
  );
}
