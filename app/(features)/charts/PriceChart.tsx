"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type PriceChartProps = {
  symbol: string;
  interval: string;
  height?: number;
  onChartReady?: () => void;
};

export default function PriceChart({
  symbol,
  interval,
  height = 500,
  onChartReady,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candlestickSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeSeriesRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastPrice, setLastPrice] = useState<number | null>(null);

  // Fetch historical data from Binance
  const fetchHistoricalData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const limit = 1000;
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
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
      onChartReady?.();
    } catch (err) {
      console.error("Error fetching historical data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load chart data"
      );
      setIsLoading(false);
    }
  }, [symbol, interval, onChartReady]);

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

    // Fetch initial data
    fetchHistoricalData();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [height, fetchHistoricalData]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (isLoading || !candlestickSeriesRef.current || !volumeSeriesRef.current)
      return;

    const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
    const wsUrl = `wss://stream.binance.com:9443/ws/${streamName}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`WebSocket connected: ${streamName}`);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const kline = message.k;

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

          if (candlestickSeriesRef.current && volumeSeriesRef.current) {
            candlestickSeriesRef.current.update(candle);
            volumeSeriesRef.current.update(volume);
            setLastPrice(candle.close);
          }
        } catch (err) {
          console.error("Error processing WebSocket message:", err);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("WebSocket connection error");
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
      };

      wsRef.current = ws;

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    } catch (err) {
      console.error("Error creating WebSocket:", err);
      setError("Failed to connect to real-time data");
    }
  }, [symbol, interval, isLoading]);

  return (
    <div className="w-full space-y-2">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {lastPrice && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            {symbol} • {interval}
          </div>
          <div className="text-lg font-bold">
            $
            {lastPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      )}

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
