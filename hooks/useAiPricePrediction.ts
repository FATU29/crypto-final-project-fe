import { useState, useEffect, useCallback, useRef } from "react";
import {
  LongPollingPredictionRequest,
  LongPollingPredictionResponse,
  PricePrediction,
} from "@/types/ai-prediction";
import { useAuth } from "@/lib/auth/AuthContext";
import { auth } from "@/lib/auth/utils";

const DEFAULT_TIMEOUT = 50; // seconds (must be < Gateway timeout of 60s)
const MIN_POLL_INTERVAL = 5; // minimum seconds between polls
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

  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
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

  // Fetch prediction from API
  const fetchPrediction = useCallback(
    async (lastPredictionTime?: string): Promise<void> => {
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

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        setIsLoading(true);
        setError(null);
        setIsPolling(true);

        const requestBody: LongPollingPredictionRequest = {
          symbol: symbol.toUpperCase(),
          timeout: DEFAULT_TIMEOUT,
        };

        if (lastPredictionTime) {
          requestBody.last_prediction_time = lastPredictionTime;
        }

        // Get token from localStorage
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

          // Schedule next poll if auto-refresh enabled
          if (autoRefresh && enabled) {
            const nextPollDelay = Math.max(
              data.next_poll_after * 1000,
              MIN_POLL_INTERVAL * 1000
            );

            // Start countdown
            let secondsLeft = data.next_poll_after;
            setNextPollIn(secondsLeft);

            countdownIntervalRef.current = setInterval(() => {
              secondsLeft--;
              setNextPollIn(Math.max(0, secondsLeft));

              if (secondsLeft <= 0 && countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
              }
            }, 1000);

            // Schedule next poll
            pollingTimeoutRef.current = setTimeout(() => {
              fetchPrediction(data.prediction?.analyzed_at);
            }, nextPollDelay);
          }
        } else if (!data.has_new_data && prediction) {
          // No new data, keep existing prediction
          setError(null);

          // Schedule next poll
          if (autoRefresh && enabled) {
            const nextPollDelay = Math.max(
              data.next_poll_after * 1000,
              MIN_POLL_INTERVAL * 1000
            );

            let secondsLeft = data.next_poll_after;
            setNextPollIn(secondsLeft);

            countdownIntervalRef.current = setInterval(() => {
              secondsLeft--;
              setNextPollIn(Math.max(0, secondsLeft));

              if (secondsLeft <= 0 && countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
              }
            }, 1000);

            pollingTimeoutRef.current = setTimeout(() => {
              fetchPrediction(prediction.analyzed_at);
            }, nextPollDelay);
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            // Request was cancelled, ignore
            return;
          }
          setError(err.message);
        } else {
          setError("Failed to fetch prediction");
        }
        console.error("Error fetching AI prediction:", err);
      } finally {
        setIsLoading(false);
        setIsPolling(false);
      }
    },
    [symbol, isVipUser, autoRefresh, enabled, prediction]
  );

  // Manual refresh
  const refresh = useCallback(async () => {
    cleanup();
    await fetchPrediction();
  }, [cleanup, fetchPrediction]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (!enabled || !isVipUser || !symbol) {
      return;
    }

    fetchPrediction();

    return () => {
      cleanup();
    };
  }, [symbol, enabled, isVipUser]); // Only re-fetch when these change

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
