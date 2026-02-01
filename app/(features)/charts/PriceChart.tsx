"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Wifi,
  WifiOff,
  Info,
  MousePointer2,
  ZoomIn,
  Move,
} from "lucide-react";
import { useBinanceWebSocket } from "@/hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type PriceChartProps = {
  symbol: string;
  interval: string;
  height?: number;
  onDisconnectReady?: (disconnectFn: () => void) => void;
};

const PriceChart = memo(function PriceChart({
  symbol,
  interval,
  height = 500,
  onDisconnectReady,
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
  const [hoverData, setHoverData] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  } | null>(null);

  // Use WebSocket hook
  const {
    isConnected: wsConnected,
    lastMessage,
    disconnect,
  } = useBinanceWebSocket({
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
        `⚠️ [Chart] Ignoring message for different symbol: ${lastMessage.s} (current: ${symbol})`,
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

  // Expose disconnect function to parent component
  useEffect(() => {
    if (onDisconnectReady && disconnect) {
      onDisconnectReady(disconnect);
    }
  }, [disconnect, onDisconnectReady]);

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
          err instanceof Error ? err.message : "Failed to load chart data",
        );
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol, interval]);

  // Initialize chart - only once per symbol/interval
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const containerWidth = chartContainerRef.current.clientWidth || 600;
    const initialHeight = 500; // Use fixed initial height

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chart: any = createChart(chartContainerRef.current, {
      width: containerWidth,
      height: initialHeight,
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

    // Subscribe to crosshair move for hover data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chart.subscribeCrosshairMove((param: any) => {
      if (!param.time || !param.seriesData) {
        setHoverData(null);
        return;
      }

      const candleData = param.seriesData.get(candlestickSeries);
      const volumeData = param.seriesData.get(volumeSeries);

      if (candleData) {
        const date = new Date(param.time * 1000);
        setHoverData({
          time: date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          volume: volumeData?.value || 0,
        });
      }
    });

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
  }, [symbol, interval]); // Only re-initialize when symbol or interval changes

  // Handle height changes separately without re-initializing the chart
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({ height });
    }
  }, [height]);

  return (
    <div className="w-full space-y-2">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between px-2 py-1 bg-muted/30 rounded-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">{symbol}</div>
            <div className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
              {interval}
            </div>
          </div>
          {wsConnected ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-500">
              <Wifi className="h-3.5 w-3.5" />
              <span>Live Updates</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-orange-500">
              <WifiOff className="h-3.5 w-3.5" />
              <span>Connecting...</span>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Binance Market Data
          </div>
        </div>
        {lastPrice && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Last Price:</span>
            <div className="text-lg font-bold tabular-nums">
              $
              {lastPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hover Data Panel */}
      {hoverData && (
        <div className="px-2 py-2 bg-muted/50 rounded-md border border-border">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-medium">Time:</span>
              <span>{hoverData.time}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">O:</span>
                <span className="font-mono font-medium">
                  ${hoverData.open.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">H:</span>
                <span className="font-mono font-medium text-green-500">
                  ${hoverData.high.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">L:</span>
                <span className="font-mono font-medium text-red-500">
                  ${hoverData.low.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">C:</span>
                <span
                  className={`font-mono font-medium ${
                    hoverData.close >= hoverData.open
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  ${hoverData.close.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">Vol:</span>
                <span className="font-mono font-medium">
                  {hoverData.volume >= 1000000
                    ? `${(hoverData.volume / 1000000).toFixed(2)}M`
                    : hoverData.volume >= 1000
                      ? `${(hoverData.volume / 1000).toFixed(2)}K`
                      : hoverData.volume.toFixed(2)}
                </span>
              </div>
            </div>
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

      {/* Chart Legend & Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {/* Legend */}
        <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Chart Legend</h4>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-muted-foreground">Green Candle:</span>
              <span className="font-medium">Price increased (Bullish)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-muted-foreground">Red Candle:</span>
              <span className="font-medium">Price decreased (Bearish)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-6 bg-green-500/50 rounded-sm"></div>
              <span className="text-muted-foreground">Volume Bars:</span>
              <span className="font-medium">Trading volume (bottom)</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer2 className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">How to Use</h4>
          </div>
          <div className="space-y-1.5">
            <TooltipProvider>
              <div className="flex items-center gap-2 text-xs">
                <Move className="h-3 w-3 text-muted-foreground" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-medium cursor-help underline decoration-dotted">
                      Hover over candles
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View detailed OHLCV data for each time period</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-muted-foreground">to see details</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <ZoomIn className="h-3 w-3 text-muted-foreground" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-medium cursor-help underline decoration-dotted">
                      Scroll to zoom
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Use mouse wheel to zoom in/out on the chart</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-muted-foreground">in/out on chart</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <MousePointer2 className="h-3 w-3 text-muted-foreground" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-medium cursor-help underline decoration-dotted">
                      Click & drag
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click and drag to pan across time periods</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-muted-foreground">to navigate timeline</span>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* OHLCV Explanation */}
      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 mt-3">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-medium">Understanding Candlestick Data:</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div>
                <span className="font-semibold text-primary">O (Open):</span>
                <span className="text-muted-foreground ml-1">Starting price</span>
              </div>
              <div>
                <span className="font-semibold text-green-500">H (High):</span>
                <span className="text-muted-foreground ml-1">Highest price</span>
              </div>
              <div>
                <span className="font-semibold text-red-500">L (Low):</span>
                <span className="text-muted-foreground ml-1">Lowest price</span>
              </div>
              <div>
                <span className="font-semibold text-primary">C (Close):</span>
                <span className="text-muted-foreground ml-1">Ending price</span>
              </div>
              <div>
                <span className="font-semibold text-primary">Vol (Volume):</span>
                <span className="text-muted-foreground ml-1">Trade amount</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PriceChart;
