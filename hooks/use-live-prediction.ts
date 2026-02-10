"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { auth } from "@/lib/auth/utils";
import { getPriceSocket } from "@/lib/socket";
import {
  PredictionDirection,
  PredictionLinePoint,
} from "@/types/ai-prediction";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
const REFRESH_INTERVAL = 60_000; // re-fetch prediction every 60s

export interface LivePredictionTarget {
  label: string;
  time: number;
  predictedPrice: number;
  changePercent: number;
  changeAbsolute: number;
}

export interface UseLivePredictionReturn {
  /** Current realtime price from Binance */
  currentPrice: number | null;
  /** Direction of the AI prediction */
  direction: PredictionDirection | null;
  /** AI confidence 0–1 */
  confidence: number | null;
  /** AI reasoning text */
  reasoning: string | null;
  /** Predicted price targets at different time horizons */
  targets: LivePredictionTarget[];
  /** Raw prediction line points */
  predictionLine: PredictionLinePoint[];
  /** Whether prediction is loading */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** VIP-only flag */
  isVipOnly: boolean;
  /** Whether realtime price stream is connected */
  isPriceConnected: boolean;
  /** Last updated timestamp */
  lastUpdated: Date | null;
  /** Manual refresh */
  refresh: () => Promise<void>;
}

export interface UseLivePredictionOptions {
  symbol: string;
  interval: string;
  enabled?: boolean;
}

/**
 * Hook that combines AI prediction line with realtime Binance price
 * to provide live predicted price targets for the chart overlay.
 * VIP-only feature.
 */
export function useLivePrediction({
  symbol,
  interval,
  enabled = true,
}: UseLivePredictionOptions): UseLivePredictionReturn {
  const { user } = useAuth();
  const isVipUser = user?.accountType === "VIP";

  // AI prediction state
  const [predictionLine, setPredictionLine] = useState<PredictionLinePoint[]>(
    [],
  );
  const [direction, setDirection] = useState<PredictionDirection | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Realtime price state
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isPriceConnected, setIsPriceConnected] = useState(false);

  // Refs
  const abortRef = useRef<AbortController | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const basePriceRef = useRef<number | null>(null); // price when prediction was generated

  // ---------- Fetch AI Prediction Line ----------
  const fetchPrediction = useCallback(async () => {
    if (!isVipUser || !symbol || !interval) return;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      const token = auth.getToken();
      if (!token) throw new Error("Please login to access AI predictions");

      const response = await fetch(`${GATEWAY_URL}/api/v1/ai/prediction-line`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          interval,
          periods: 24,
          news_limit: 10,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 403) throw new Error("VIP account required");
        if (response.status === 401) throw new Error("Please login first");
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.prediction_line) {
        const anchor: PredictionLinePoint = {
          time: data.current_time,
          value: data.current_price,
        };
        setPredictionLine([anchor, ...data.prediction_line]);
        setDirection(data.direction);
        setConfidence(data.confidence);
        setReasoning(data.reasoning);
        basePriceRef.current = data.current_price;
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error ? err.message : "Failed to fetch prediction",
      );
    } finally {
      setIsLoading(false);
    }
  }, [symbol, interval, isVipUser]);

  // ---------- Connect to Chart Backend via Socket.IO for realtime price ----------
  const connectPrice = useCallback(() => {
    if (!symbol || !enabled) return () => {};

    const socket = getPriceSocket();
    const upperSymbol = symbol.toUpperCase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePriceUpdate = (payload: any) => {
      const sym = payload.s || payload.symbol;
      const price = payload.p || payload.price;
      if (sym && sym.toUpperCase() === upperSymbol && price) {
        setCurrentPrice(parseFloat(price));
      }
    };

    const handleConnect = () => {
      setIsPriceConnected(true);
      socket.emit("subscribe", { symbol: upperSymbol });
    };

    const handleDisconnect = () => {
      setIsPriceConnected(false);
    };

    socket.on("priceUpdate", handlePriceUpdate);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // If already connected, subscribe immediately
    if (socket.connected) {
      setIsPriceConnected(true);
      socket.emit("subscribe", { symbol: upperSymbol });
    }

    return () => {
      socket.off("priceUpdate", handlePriceUpdate);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.emit("unsubscribe", { symbol: upperSymbol });
    };
  }, [symbol, enabled]);

  // ---------- Compute targets from prediction line + live price ----------
  const targets = useMemo<LivePredictionTarget[]>(() => {
    if (predictionLine.length < 2 || currentPrice === null) return [];

    const basePrice = basePriceRef.current ?? currentPrice;
    // The price has drifted since prediction was generated
    const drift = currentPrice - basePrice;

    // Pick key time horizons from the prediction line
    const points = predictionLine.slice(1); // skip anchor
    if (points.length === 0) return [];

    // Select up to 4 evenly-spaced points
    const indices: number[] = [];
    const step = Math.max(1, Math.floor(points.length / 4));
    for (let i = step - 1; i < points.length; i += step) {
      indices.push(i);
    }
    // Always include the last point
    if (indices[indices.length - 1] !== points.length - 1) {
      indices.push(points.length - 1);
    }

    const intervalMs = getIntervalMs(interval);

    return indices.map((idx) => {
      const point = points[idx];
      // Adjust predicted price by drift so it stays relative to current price
      const adjustedPrice = point.value + drift;
      const changeAbsolute = adjustedPrice - currentPrice;
      const changePercent =
        currentPrice > 0 ? (changeAbsolute / currentPrice) * 100 : 0;

      // Human-readable time label
      const periodsAhead = idx + 1;
      const msAhead = periodsAhead * intervalMs;
      const label = formatTimeAhead(msAhead);

      return {
        label,
        time: point.time,
        predictedPrice: adjustedPrice,
        changePercent,
        changeAbsolute,
      };
    });
  }, [predictionLine, currentPrice, interval]);

  // ---------- Effects ----------

  // Fetch prediction on mount and periodically
  useEffect(() => {
    if (!enabled || !isVipUser || !symbol || !interval) return;

    fetchPrediction();

    refreshTimerRef.current = setInterval(fetchPrediction, REFRESH_INTERVAL);

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, interval, enabled, isVipUser]);

  // Connect to Chart Backend price stream via Socket.IO
  useEffect(() => {
    if (!enabled || !symbol) return;

    const cleanup = connectPrice();
    return cleanup;
  }, [symbol, enabled, connectPrice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, []);

  const refresh = useCallback(async () => {
    setPredictionLine([]);
    setDirection(null);
    setConfidence(null);
    setReasoning(null);
    await fetchPrediction();
  }, [fetchPrediction]);

  return {
    currentPrice,
    direction,
    confidence,
    reasoning,
    targets,
    predictionLine,
    isLoading,
    error,
    isVipOnly: !isVipUser,
    isPriceConnected,
    lastUpdated,
    refresh,
  };
}

// ---------- Helpers ----------

function getIntervalMs(interval: string): number {
  const map: Record<string, number> = {
    "1m": 60_000,
    "3m": 180_000,
    "5m": 300_000,
    "15m": 900_000,
    "30m": 1_800_000,
    "1h": 3_600_000,
    "2h": 7_200_000,
    "4h": 14_400_000,
    "6h": 21_600_000,
    "8h": 28_800_000,
    "12h": 43_200_000,
    "1d": 86_400_000,
    "3d": 259_200_000,
    "1w": 604_800_000,
  };
  return map[interval] || 3_600_000;
}

function formatTimeAhead(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
