import { useEffect, useRef, useState, useCallback } from "react";

export interface BinanceKlineData {
  t: number; // Kline start time
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  c: string; // Close price
  v: string; // Volume
  x: boolean; // Is kline closed?
}

export interface BinanceKlineMessage {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  k: BinanceKlineData;
}

export interface UseBinanceWebSocketOptions {
  symbol: string;
  interval: string;
  enabled?: boolean;
  onMessage?: (data: BinanceKlineMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export interface UseBinanceWebSocketReturn {
  isConnected: boolean;
  error: string | null;
  lastMessage: BinanceKlineMessage | null;
  reconnect: () => void;
  disconnect: () => void;
}

/**
 * Custom hook for Binance WebSocket connection
 * Handles kline (candlestick) real-time data
 *
 * @example
 * ```tsx
 * const { isConnected, lastMessage } = useBinanceWebSocket({
 *   symbol: 'BTCUSDT',
 *   interval: '1h',
 *   onMessage: (data) => console.log(data),
 * });
 * ```
 */
export function useBinanceWebSocket({
  symbol,
  interval,
  enabled = true,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseBinanceWebSocketOptions): UseBinanceWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const connectFnRef = useRef<(() => void) | null>(null);
  const prevSymbolRef = useRef<string | null>(null);
  const prevIntervalRef = useRef<string | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<BinanceKlineMessage | null>(
    null
  );

  // Store callbacks in refs to avoid dependency issues
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
  }, [onMessage, onConnect, onDisconnect, onError]);

  const connect = useCallback(() => {
    if (!enabled || !symbol || !interval) {
      return;
    }

    // Reset state when symbol or interval changes (before connecting)
    const symbolChanged = prevSymbolRef.current !== null && prevSymbolRef.current !== symbol;
    const intervalChanged = prevIntervalRef.current !== null && prevIntervalRef.current !== interval;
    
    if (symbolChanged || intervalChanged) {
      setLastMessage(null);
      setError(null);
      setIsConnected(false);
    }
    
    // Update refs
    prevSymbolRef.current = symbol;
    prevIntervalRef.current = interval;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
    const wsUrl = `wss://stream.binance.com:9443/ws/${streamName}`;

    console.log("🔌 [WebSocket] Connecting to:", wsUrl);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("✅ [WebSocket] Connected:", streamName);
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onConnectRef.current?.();
      };

      ws.onmessage = (event) => {
        try {
          const data: BinanceKlineMessage = JSON.parse(event.data);
          setLastMessage(data);
          onMessageRef.current?.(data);
        } catch (err) {
          console.error("❌ [WebSocket] Error parsing message:", err);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ [WebSocket] Error:", error);
        setError("WebSocket connection error");
        onErrorRef.current?.(error);
      };

      ws.onclose = (event) => {
        console.log("🔌 [WebSocket] Disconnected:", event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;
        onDisconnectRef.current?.();

        // Auto-reconnect if not a normal closure
        if (
          enabled &&
          event.code !== 1000 &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          console.log(
            `🔄 [WebSocket] Reconnecting in ${reconnectDelay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connectFnRef.current?.();
          }, reconnectDelay);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("❌ [WebSocket] Connection error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
    }
  }, [symbol, interval, enabled]);

  // Store connect function in ref
  useEffect(() => {
    connectFnRef.current = connect;
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      console.log("🔌 [WebSocket] Manually disconnecting...");
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(() => connect(), 100);
  }, [connect, disconnect]);

  // Connect when enabled and params change
  useEffect(() => {
    if (enabled && symbol && interval) {
      // Delay connection to avoid setState in effect
      const timer = setTimeout(() => connect(), 0);
      return () => {
        clearTimeout(timer);
        disconnect();
      };
    } else {
      // If disabled, ensure we disconnect
      // eslint-disable-next-line react-hooks/set-state-in-effect
      disconnect();
    }
  }, [symbol, interval, enabled, connect, disconnect]);

  return {
    isConnected,
    error,
    lastMessage,
    reconnect,
    disconnect,
  };
}
