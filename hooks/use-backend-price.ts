import { useEffect, useState, useRef } from "react";
import { subscribeToPriceUpdates, PriceUpdatePayload } from "@/lib/socket";

export interface UseBackendPriceOptions {
  symbol: string;
  enabled?: boolean;
  onUpdate?: (data: PriceUpdatePayload) => void;
}

export interface UseBackendPriceReturn {
  price: string | null;
  timestamp: number | null;
  isConnected: boolean;
  lastUpdate: PriceUpdatePayload | null;
}

/**
 * Hook to subscribe to real-time price updates from the NestJS backend
 * Connects to the backend WebSocket server which streams from Binance
 *
 * @example
 * ```tsx
 * const { price, isConnected } = useBackendPrice({
 *   symbol: 'BTCUSDT',
 *   onUpdate: (data) => console.log('New price:', data.price)
 * });
 * ```
 */
export function useBackendPrice({
  symbol,
  enabled = true,
  onUpdate,
}: UseBackendPriceOptions): UseBackendPriceReturn {
  const [price, setPrice] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<PriceUpdatePayload | null>(null);

  const onUpdateRef = useRef(onUpdate);
  const isConnected = enabled && !!symbol;

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!enabled || !symbol) {
      return;
    }

    const unsubscribe = subscribeToPriceUpdates(symbol, (data) => {
      setPrice(data.price);
      setTimestamp(data.ts);
      setLastUpdate(data);

      if (onUpdateRef.current) {
        onUpdateRef.current(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [symbol, enabled]);

  return {
    price,
    timestamp,
    isConnected,
    lastUpdate,
  };
}
