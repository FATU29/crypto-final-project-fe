"use client";

import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  createSeriesMarkers,
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
import {
  calculateMA,
  calculateEMA,
  INDICATOR_PRESETS,
  IndicatorKey,
  CandleData,
} from "@/lib/utils/indicators";
import type { PredictionLinePoint } from "@/types/ai-prediction";

export type NewsMarker = {
  id: string;
  title: string;
  time: number; // unix timestamp in seconds
  sentiment?: "positive" | "negative" | "neutral";
};

export type PriceChartProps = {
  symbol: string;
  interval: string;
  height?: number;
  activeIndicators?: IndicatorKey[];
  newsMarkers?: NewsMarker[];
  predictionLine?: PredictionLinePoint[];
  onDisconnectReady?: (disconnectFn: () => void) => void;
};

const PriceChart = memo(function PriceChart({
  symbol,
  interval,
  height = 500,
  activeIndicators = [],
  newsMarkers = [],
  predictionLine = [],
  onDisconnectReady,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candlestickSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indicatorSeriesRef = useRef<Map<string, any>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersPluginRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const predictionSeriesRef = useRef<any>(null);
  const candleDataRef = useRef<CandleData[]>([]);
  const volumeDataRef = useRef<
    { time: number; value: number; color: string }[]
  >([]);
  const newsMarkersRef = useRef<NewsMarker[]>([]);

  // Lazy-load state for scrolling into the past
  const isFetchingMoreRef = useRef(false);
  const oldestTimestampRef = useRef<number | null>(null);
  const noMoreDataRef = useRef(false);
  const fetchOlderRef = useRef<() => void>(() => {});

  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
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
  const [newsTooltip, setNewsTooltip] = useState<{
    x: number;
    y: number;
    marker: NewsMarker;
  } | null>(null);

  // Keep ref in sync with prop
  useEffect(() => {
    newsMarkersRef.current = newsMarkers;
  }, [newsMarkers]);

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

  // Recalculate and apply indicator data
  const applyIndicators = useCallback(() => {
    if (!chartRef.current || !candlestickSeriesRef.current) return;

    const candles = candleDataRef.current;
    const chart = chartRef.current;

    // Remove indicators that are no longer active
    indicatorSeriesRef.current.forEach((series, key) => {
      if (!activeIndicators.includes(key as IndicatorKey)) {
        try {
          chart.removeSeries(series);
        } catch {
          // ignore
        }
        indicatorSeriesRef.current.delete(key);
      }
    });

    // Add or update active indicators
    activeIndicators.forEach((key) => {
      const config = INDICATOR_PRESETS[key];
      if (!config) return;

      const data =
        config.type === "MA"
          ? calculateMA(candles, config.period)
          : calculateEMA(candles, config.period);

      if (data.length === 0) return;

      let series = indicatorSeriesRef.current.get(key);

      if (!series) {
        series = chart.addSeries(LineSeries, {
          color: config.color,
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
          crosshairMarkerVisible: false,
          title: config.label,
        });
        indicatorSeriesRef.current.set(key, series);
      }

      series.setData(data);
    });
  }, [activeIndicators]);

  // Apply news markers to the chart
  const applyNewsMarkers = useCallback(() => {
    if (!candlestickSeriesRef.current) return;

    // Clean up old markers plugin
    if (markersPluginRef.current) {
      try {
        markersPluginRef.current.setMarkers([]);
      } catch {
        // ignore
      }
    }

    if (newsMarkers.length === 0) return;

    const markers = newsMarkers
      .map((news) => {
        const color =
          news.sentiment === "positive"
            ? "#22C55E"
            : news.sentiment === "negative"
              ? "#EF4444"
              : "#3B82F6";

        const shape =
          news.sentiment === "positive"
            ? ("arrowUp" as const)
            : news.sentiment === "negative"
              ? ("arrowDown" as const)
              : ("circle" as const);

        return {
          time: news.time,
          position: "aboveBar" as const,
          color,
          shape,
          text:
            news.title.length > 30 ? news.title.slice(0, 30) + "…" : news.title,
          id: news.id,
        };
      })
      .sort((a, b) => a.time - b.time);

    try {
      markersPluginRef.current = createSeriesMarkers(
        candlestickSeriesRef.current,
        markers,
      );
    } catch (err) {
      console.warn("Failed to set news markers:", err);
    }
  }, [newsMarkers]);

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

    const candle: CandleData = {
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
          ? "rgba(38, 166, 154, 0.5)"
          : "rgba(239, 83, 80, 0.5)",
    };

    try {
      candlestickSeriesRef.current.update(candle);
      volumeSeriesRef.current.update(volume);
      setLastPrice(candle.close);

      // Update candle data ref for indicator recalculation
      const lastIdx = candleDataRef.current.findIndex(
        (c) => c.time === candle.time,
      );
      if (lastIdx >= 0) {
        candleDataRef.current[lastIdx] = candle;
        volumeDataRef.current[lastIdx] = volume;
      } else {
        candleDataRef.current.push(candle);
        volumeDataRef.current.push(volume);
      }

      // Re-apply indicators with updated data
      if (activeIndicators.length > 0) {
        applyIndicators();
      }
    } catch (error) {
      if (
        error instanceof Error &&
        !error.message.includes("Cannot update oldest data")
      ) {
        console.warn("Chart update error:", error.message);
      }
    }
  }, [lastMessage, symbol, activeIndicators, applyIndicators]);

  // Expose disconnect function to parent component
  useEffect(() => {
    if (onDisconnectReady && disconnect) {
      onDisconnectReady(disconnect);
    }
  }, [disconnect, onDisconnectReady]);

  // Fetch historical data from backend (MongoDB cache → Binance REST fallback)
  useEffect(() => {
    if (!symbol || !interval) {
      setError("Missing symbol or interval");
      return;
    }

    // AbortController to cancel stale requests when symbol/interval changes
    const abortController = new AbortController();

    // Reset state when symbol or interval changes
    setIsLoading(true);
    setError(null);
    setLastPrice(null);
    candleDataRef.current = [];
    volumeDataRef.current = [];
    oldestTimestampRef.current = null;
    noMoreDataRef.current = false;
    isFetchingMoreRef.current = false;

    // Clear existing chart data
    if (candlestickSeriesRef.current && volumeSeriesRef.current) {
      candlestickSeriesRef.current.setData([]);
      volumeSeriesRef.current.setData([]);
    }

    const fetchHistoricalData = async () => {
      try {
        const limit = 1000;
        const backendUrl =
          process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
        const url = `${backendUrl}/binance/history?symbol=${symbol}&interval=${interval}&limit=${limit}`;

        const response = await fetch(url, {
          signal: abortController.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Check if this request was aborted (symbol/interval changed)
        if (abortController.signal.aborted) return;

        const result = await response.json();
        const klineData = result.data || [];

        // Deduplicate by time and sort chronologically
        const seenTimes = new Set<number>();
        const uniqueKlineData = klineData.filter((d: { openTime: number }) => {
          const t = Math.floor(d.openTime / 1000);
          if (seenTimes.has(t)) return false;
          seenTimes.add(t);
          return true;
        });
        uniqueKlineData.sort(
          (a: { openTime: number }, b: { openTime: number }) =>
            a.openTime - b.openTime,
        );

        const candles: CandleData[] = uniqueKlineData.map(
          (d: {
            openTime: number;
            open: string;
            high: string;
            low: string;
            close: string;
          }) => ({
            time: Math.floor(d.openTime / 1000),
            open: Number(d.open),
            high: Number(d.high),
            low: Number(d.low),
            close: Number(d.close),
          }),
        );

        const volumes = uniqueKlineData.map(
          (d: {
            openTime: number;
            open: string;
            close: string;
            volume: string;
          }) => ({
            time: Math.floor(d.openTime / 1000),
            value: Number(d.volume),
            color:
              Number(d.close) >= Number(d.open)
                ? "rgba(38, 166, 154, 0.5)"
                : "rgba(239, 83, 80, 0.5)",
          }),
        );

        // Final guard against stale response
        if (abortController.signal.aborted) return;

        if (candlestickSeriesRef.current && volumeSeriesRef.current) {
          candlestickSeriesRef.current.setData(candles);
          volumeSeriesRef.current.setData(volumes);
          candleDataRef.current = candles;
          volumeDataRef.current = volumes;

          if (candles.length > 0) {
            setLastPrice(candles[candles.length - 1].close);
            // Track the oldest timestamp for lazy-loading older data
            oldestTimestampRef.current = uniqueKlineData[0].openTime;
          }
        }

        setIsLoading(false);
      } catch (err) {
        // Ignore abort errors (expected when switching symbol/interval)
        if (err instanceof DOMException && err.name === "AbortError") return;

        console.error("❌ Error fetching historical data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load chart data",
        );
        setIsLoading(false);
      }
    };

    fetchHistoricalData();

    return () => {
      abortController.abort();
    };
  }, [symbol, interval]);

  // Lazy-load older candles when user scrolls to the left edge
  const fetchOlderCandles = useCallback(async () => {
    if (
      isFetchingMoreRef.current ||
      noMoreDataRef.current ||
      !oldestTimestampRef.current ||
      !candlestickSeriesRef.current ||
      !volumeSeriesRef.current
    ) {
      return;
    }

    isFetchingMoreRef.current = true;
    setIsFetchingMore(true);

    try {
      const batchSize = 500;
      const backendUrl =
        process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
      const endTime = oldestTimestampRef.current - 1;
      const url = `${backendUrl}/binance/history?symbol=${symbol}&interval=${interval}&limit=${batchSize}&endTime=${endTime}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const klineData = result.data || [];

      if (klineData.length === 0) {
        noMoreDataRef.current = true;
        return;
      }

      const newCandles: CandleData[] = klineData.map(
        (d: {
          openTime: number;
          open: string;
          high: string;
          low: string;
          close: string;
        }) => ({
          time: Math.floor(d.openTime / 1000),
          open: Number(d.open),
          high: Number(d.high),
          low: Number(d.low),
          close: Number(d.close),
        }),
      );

      const newVolumes = klineData.map(
        (d: {
          openTime: number;
          open: string;
          close: string;
          volume: string;
        }) => ({
          time: Math.floor(d.openTime / 1000),
          value: Number(d.volume),
          color:
            Number(d.close) >= Number(d.open)
              ? "rgba(38, 166, 154, 0.5)"
              : "rgba(239, 83, 80, 0.5)",
        }),
      );

      // Deduplicate and merge: prepend new candles before existing
      const existingTimes = new Set(candleDataRef.current.map((c) => c.time));
      const uniqueNewCandles = newCandles.filter(
        (c) => !existingTimes.has(c.time),
      );
      const uniqueNewVolumes = newVolumes.filter(
        (v: { time: number }) => !existingTimes.has(v.time),
      );

      if (uniqueNewCandles.length === 0) {
        noMoreDataRef.current = true;
        return;
      }

      // Merge arrays (new older data comes first, then existing)
      const mergedCandles = [
        ...uniqueNewCandles,
        ...candleDataRef.current,
      ].sort((a, b) => (a.time as number) - (b.time as number));
      const mergedVolumes = [
        ...uniqueNewVolumes,
        ...volumeDataRef.current,
      ].sort((a, b) => a.time - b.time);

      // Update refs
      candleDataRef.current = mergedCandles;
      volumeDataRef.current = mergedVolumes;
      oldestTimestampRef.current = klineData[0].openTime;

      // Replace all series data (lightweight-charts handles prepend via setData)
      candlestickSeriesRef.current.setData(mergedCandles);
      volumeSeriesRef.current.setData(mergedVolumes);

      // If we got fewer candles than requested, no more history
      if (klineData.length < batchSize) {
        noMoreDataRef.current = true;
      }

      // Re-apply indicators with expanded dataset
      if (activeIndicators.length > 0) {
        applyIndicators();
      }
    } catch (err) {
      console.error("❌ Error fetching older candles:", err);
    } finally {
      isFetchingMoreRef.current = false;
      setIsFetchingMore(false);
    }
  }, [symbol, interval, activeIndicators, applyIndicators]);

  // Keep ref in sync so the timeScale subscription always calls the latest version
  useEffect(() => {
    fetchOlderRef.current = fetchOlderCandles;
  }, [fetchOlderCandles]);

  // Subscribe to visible logical range changes to trigger lazy-load
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || isLoading) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onVisibleLogicalRangeChange = (logicalRange: any) => {
      if (!logicalRange) return;
      // When the user scrolls so the leftmost visible bar index < 10, fetch more
      if (logicalRange.from < 10) {
        fetchOlderRef.current();
      }
    };

    chart
      .timeScale()
      .subscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChange);

    return () => {
      try {
        chart
          .timeScale()
          .unsubscribeVisibleLogicalRangeChange(onVisibleLogicalRangeChange);
      } catch {
        // chart may have been disposed
      }
    };
  }, [isLoading, symbol, interval]);

  // Apply indicators when data loads or active indicators change
  useEffect(() => {
    if (!isLoading && candleDataRef.current.length > 0) {
      applyIndicators();
    }
  }, [isLoading, activeIndicators, applyIndicators]);

  // Apply news markers when data loads or markers change
  useEffect(() => {
    if (!isLoading && candlestickSeriesRef.current) {
      applyNewsMarkers();
    }
  }, [isLoading, newsMarkers, applyNewsMarkers]);

  // --- Prediction Line ---
  const applyPredictionLine = useCallback(() => {
    if (!chartRef.current) return;

    // Remove existing prediction series
    if (predictionSeriesRef.current) {
      try {
        chartRef.current.removeSeries(predictionSeriesRef.current);
      } catch {
        /* ignore */
      }
      predictionSeriesRef.current = null;
    }

    if (predictionLine.length === 0) return;

    const series = chartRef.current.addSeries(LineSeries, {
      color: "#F59E0B",
      lineWidth: 2,
      lineStyle: 2, // Dashed
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
      title: "AI Prediction",
    });

    series.setData(
      predictionLine.map((p) => ({ time: p.time, value: p.value })),
    );

    predictionSeriesRef.current = series;
  }, [predictionLine]);

  useEffect(() => {
    if (!isLoading && chartRef.current) {
      applyPredictionLine();
    }
  }, [isLoading, predictionLine, applyPredictionLine]);

  // Initialize chart - only once per symbol/interval
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const containerWidth = chartContainerRef.current.clientWidth || 600;
    const initialHeight = 500;

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
        mode: 0,
      },
      rightPriceScale: {
        borderColor: "rgba(42, 46, 57, 0.5)",
      },
      timeScale: {
        borderColor: "rgba(42, 46, 57, 0.5)",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 12,
        minBarSpacing: 4,
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: false,
        rightBarStaysOnScroll: false,
        shiftVisibleRangeOnNewBar: true,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26A69A",
      downColor: "#EF5350",
      borderUpColor: "#26A69A",
      borderDownColor: "#EF5350",
      wickUpColor: "#26A69A",
      wickDownColor: "#EF5350",
    });

    // Candlestick occupies top 75% of chart (like Binance)
    candlestickSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.05,
        bottom: 0.25,
      },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
    });

    // Volume occupies bottom 25% of chart
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.75,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    // Clear indicator refs on chart re-init
    indicatorSeriesRef.current.clear();
    markersPluginRef.current = null;

    // Subscribe to crosshair move for hover data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chart.subscribeCrosshairMove((param: any) => {
      if (!param.time || !param.seriesData) {
        setHoverData(null);
        setNewsTooltip(null);
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

      // Check if hovering near a news marker
      if (newsMarkersRef.current.length > 0 && param.point) {
        const hoveredTime = param.time as number;
        const matchedMarker = newsMarkersRef.current.find(
          (m) => m.time === hoveredTime,
        );
        if (matchedMarker) {
          setNewsTooltip({
            x: param.point.x,
            y: param.point.y,
            marker: matchedMarker,
          });
        } else {
          setNewsTooltip(null);
        }
      } else {
        setNewsTooltip(null);
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

    const indicatorSeries = indicatorSeriesRef.current;

    return () => {
      window.removeEventListener("resize", handleResize);
      indicatorSeries.clear();
      markersPluginRef.current = null;
      predictionSeriesRef.current = null;
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [symbol, interval]);

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

      {/* Active Indicators Legend */}
      {(activeIndicators.length > 0 || predictionLine.length > 0) && (
        <div className="flex items-center gap-3 px-2 py-1 bg-muted/20 rounded-md">
          <span className="text-xs text-muted-foreground font-medium">
            Indicators:
          </span>
          {activeIndicators.map((key) => {
            const config = INDICATOR_PRESETS[key];
            return (
              <div key={key} className="flex items-center gap-1.5 text-xs">
                <div
                  className="h-0.5 w-4 rounded"
                  style={{ backgroundColor: config.color }}
                />
                <span className="font-medium">{config.label}</span>
              </div>
            );
          })}
          {predictionLine.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <div
                className="h-0.5 w-4 rounded"
                style={{ backgroundColor: "#F59E0B", borderStyle: "dashed" }}
              />
              <span className="font-medium text-amber-500">AI Prediction</span>
            </div>
          )}
        </div>
      )}

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
        {isFetchingMore && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-md px-3 py-1.5 border border-border shadow-sm">
            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-primary"></div>
            <span className="text-xs text-muted-foreground">
              Loading older data...
            </span>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full" />

        {/* News Marker Tooltip */}
        {newsTooltip && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: Math.min(
                newsTooltip.x,
                (chartContainerRef.current?.clientWidth || 600) - 280,
              ),
              top: Math.max(newsTooltip.y - 90, 0),
            }}
          >
            <div className="bg-popover border border-border rounded-lg shadow-lg p-3 max-w-65">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${
                    newsTooltip.marker.sentiment === "positive"
                      ? "bg-green-500"
                      : newsTooltip.marker.sentiment === "negative"
                        ? "bg-red-500"
                        : "bg-blue-500"
                  }`}
                />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {newsTooltip.marker.sentiment || "neutral"} news
                </span>
              </div>
              <p className="text-xs font-medium leading-snug line-clamp-3">
                {newsTooltip.marker.title}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {new Date(newsTooltip.marker.time * 1000).toLocaleString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  },
                )}
              </p>
            </div>
          </div>
        )}
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
            {predictionLine.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <div
                  className="w-4 h-0.5 bg-amber-500 rounded"
                  style={{ borderTop: "2px dashed #F59E0B" }}
                ></div>
                <span className="text-muted-foreground">
                  Amber Dashed Line:
                </span>
                <span className="font-medium">AI Price Prediction (VIP)</span>
              </div>
            )}
            {newsMarkers.length > 0 && (
              <>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">Green Marker:</span>
                  <span className="font-medium">Positive news event</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-muted-foreground">Red Marker:</span>
                  <span className="font-medium">Negative news event</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-muted-foreground">Blue Marker:</span>
                  <span className="font-medium">Neutral news event</span>
                </div>
              </>
            )}
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
                <span className="text-muted-foreground">
                  to navigate timeline
                </span>
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
            <p className="text-xs font-medium">
              Understanding Candlestick Data:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div>
                <span className="font-semibold text-primary">O (Open):</span>
                <span className="text-muted-foreground ml-1">
                  Starting price
                </span>
              </div>
              <div>
                <span className="font-semibold text-green-500">H (High):</span>
                <span className="text-muted-foreground ml-1">
                  Highest price
                </span>
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
                <span className="font-semibold text-primary">
                  Vol (Volume):
                </span>
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
