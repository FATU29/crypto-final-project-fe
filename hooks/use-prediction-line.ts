import { useState, useEffect, useCallback, useRef } from "react";
import {
  PredictionLinePoint,
  PredictionLineRequest,
  PredictionLineResponse,
  PredictionDirection,
} from "@/types/ai-prediction";
import { useAuth } from "@/lib/auth/AuthContext";
import { auth } from "@/lib/auth/utils";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

interface UsePredictionLineOptions {
  symbol: string;
  interval: string;
  enabled?: boolean;
}

interface UsePredictionLineReturn {
  /** The predicted price points to draw on the chart */
  predictionLine: PredictionLinePoint[];
  /** The current (anchor) price & time */
  currentPrice: number | null;
  currentTime: number | null;
  /** Predicted direction */
  direction: PredictionDirection | null;
  confidence: number | null;
  reasoning: string | null;
  /** Status flags */
  isLoading: boolean;
  error: string | null;
  isVipOnly: boolean;
  /** Manual refresh */
  refresh: () => Promise<void>;
}

export function usePredictionLine({
  symbol,
  interval,
  enabled = true,
}: UsePredictionLineOptions): UsePredictionLineReturn {
  const { user } = useAuth();
  const isVipUser = user?.accountType === "VIP";

  const [predictionLine, setPredictionLine] = useState<PredictionLinePoint[]>(
    [],
  );
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [direction, setDirection] = useState<PredictionDirection | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchPredictionLine = useCallback(async () => {
    if (!isVipUser) {
      setError("VIP account required for AI prediction line");
      return;
    }
    if (!symbol || !interval) {
      setError("Symbol and interval are required");
      return;
    }

    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      const token = auth.getToken();
      if (!token) {
        throw new Error("Please login to access AI predictions");
      }

      const body: PredictionLineRequest = {
        symbol: symbol.toUpperCase(),
        interval,
        periods: 24,
        news_limit: 10,
      };

      const response = await fetch(`${GATEWAY_URL}/api/v1/ai/prediction-line`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("VIP account required for AI prediction line");
        }
        if (response.status === 401) {
          throw new Error("Please login to access AI predictions");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: PredictionLineResponse = await response.json();

      if (data.success && data.prediction_line) {
        // Prepend the anchor point (current price) so the line starts from the last real candle
        const anchor: PredictionLinePoint = {
          time: data.current_time,
          value: data.current_price,
        };
        setPredictionLine([anchor, ...data.prediction_line]);
        setCurrentPrice(data.current_price);
        setCurrentTime(data.current_time);
        setDirection(data.direction);
        setConfidence(data.confidence);
        setReasoning(data.reasoning);
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") return;
        setError(err.message);
      } else {
        setError("Failed to fetch prediction line");
      }
    } finally {
      setIsLoading(false);
    }
  }, [symbol, interval, isVipUser]);

  const refresh = useCallback(async () => {
    setPredictionLine([]);
    await fetchPredictionLine();
  }, [fetchPredictionLine]);

  // Fetch when symbol/interval changes (and enabled)
  useEffect(() => {
    if (!enabled || !isVipUser || !symbol || !interval) {
      setPredictionLine([]);
      return;
    }

    fetchPredictionLine();

    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, interval, enabled, isVipUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  return {
    predictionLine,
    currentPrice,
    currentTime,
    direction,
    confidence,
    reasoning,
    isLoading,
    error,
    isVipOnly: !isVipUser,
    refresh,
  };
}
