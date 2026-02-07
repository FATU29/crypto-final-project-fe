import { useState, useEffect, useCallback, useRef } from "react";
import {
  LongPollingPredictionRequest,
  LongPollingPredictionResponse,
  PricePrediction,
} from "@/types/ai-prediction";
import { useAuth } from "@/lib/auth/AuthContext";
import { auth } from "@/lib/auth/utils";

const POLL_INTERVAL = 30; // seconds between polls
const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

interface UseAiPricePredictionOptions {
  symbol: string;
  enabled?: boolean;
  autoRefresh?: boolean;
}

interface UseAiPricePredictionReturn {
  prediction: PricePrediction | null;
  isLoading: boolean;
  error: string | null;
  isVipOnly: boolean;
  isPolling: boolean;
  nextPollIn: number;
  refresh: () => Promise<void>;
}

export function useAiPricePrediction({
  symbol,
  enabled = true,
  autoRefresh = true,
}: UseAiPricePredictionOptions): UseAiPricePredictionReturn {
  const { user } = useAuth();
  const isVipUser = user?.accountType === "VIP";

  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [nextPollIn, setNextPollIn] = useState(0);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastPredictionTimeRef = useRef<string | undefined>(undefined);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Fetch prediction from API (fast DB-only call)
  const fetchPrediction = useCallback(async (): Promise<void> => {
    if (!isVipUser) {
      setError("VIP account required for AI predictions");
      return;
    }

    if (!symbol) {
      setError("Symbol is required");
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);
      setIsPolling(true);

      const requestBody: LongPollingPredictionRequest = {
        symbol: symbol.toUpperCase(),
        timeout: 10,
      };

      if (lastPredictionTimeRef.current) {
        requestBody.last_prediction_time = lastPredictionTimeRef.current;
      }

      const token = auth.getToken();
      if (!token) {
        throw new Error("Please login to access AI predictions");
      }

      const response = await fetch(
        `${GATEWAY_URL}/api/v1/ai/predict-price-poll`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("VIP account required for AI predictions");
        }
        if (response.status === 401) {
          throw new Error("Please login to access AI predictions");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: LongPollingPredictionResponse = await response.json();

      if (data.success && data.prediction) {
        setPrediction(data.prediction);
        setError(null);

        if (data.has_new_data && data.prediction?.analyzed_at) {
          lastPredictionTimeRef.current = data.prediction.analyzed_at;
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") return;
        setError(err.message);
      } else {
        setError("Failed to fetch prediction");
      }
      console.error("Error fetching AI prediction:", err);
    } finally {
      setIsLoading(false);
      setIsPolling(false);
    }
  }, [symbol, isVipUser]);

  // Manual refresh
  const refresh = useCallback(async () => {
    lastPredictionTimeRef.current = undefined;
    await fetchPrediction();
  }, [fetchPrediction]);

  // Initial fetch + auto-refresh interval
  useEffect(() => {
    if (!enabled || !isVipUser || !symbol) return;

    // Initial fetch
    fetchPrediction();

    if (!autoRefresh) return;

    // Simple interval polling every 30s
    pollIntervalRef.current = setInterval(() => {
      fetchPrediction();
    }, POLL_INTERVAL * 1000);

    // Countdown timer for UI
    let secondsLeft = POLL_INTERVAL;
    setNextPollIn(secondsLeft);
    countdownIntervalRef.current = setInterval(() => {
      secondsLeft--;
      if (secondsLeft <= 0) secondsLeft = POLL_INTERVAL;
      setNextPollIn(secondsLeft);
    }, 1000);

    return () => {
      cleanup();
    };
  }, [symbol, enabled, isVipUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    prediction,
    isLoading,
    error,
    isVipOnly: !isVipUser,
    isPolling,
    nextPollIn,
    refresh,
  };
}
