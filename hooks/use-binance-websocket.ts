import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

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
  const socketRef = useRef<Socket | null>(null);
  const prevSymbolRef = useRef<string | null>(null);
  const prevIntervalRef = useRef<string | null>(null);

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
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Connect to backend Socket.IO server
    // Socket.IO works with http:// or ws://, but http:// is preferred for initial connection
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
    // Convert ws:// to http:// for Socket.IO (it will upgrade to WebSocket automatically)
    const socketUrl = wsUrl.replace("ws://", "http://").replace("wss://", "https://") + "/prices";

    console.log("🔌 [WebSocket] Connecting to backend:", socketUrl);

    try {
      const socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on("connect", () => {
        console.log("✅ [WebSocket] Connected to backend:", socket.id);
        setIsConnected(true);
        setError(null);
        
        // Subscribe to symbol
        socket.emit("subscribe", { symbol: symbol.toUpperCase() });
        console.log("📊 [WebSocket] Subscribed to:", symbol.toUpperCase());
        
        onConnectRef.current?.();
      });

      socket.on("klineUpdate", (data: { e: string; E: number; s: string; k: { t: number; T: number; s: string; i: string; o: string; c: string; h: string; l: string; v: string; n: number; x: boolean; q: string } }) => {
        try {
          // Convert backend kline format to BinanceKlineMessage format
          // Backend sends: { e, E, s, k: { t, T, s, i, o, c, h, l, v, n, x, q, V, Q } }
          // Frontend expects: BinanceKlineMessage format
          if (data.e === "kline" && data.k && data.k.i === interval) {
            const klineMessage: BinanceKlineMessage = {
              e: data.e,
              E: data.E,
              s: data.s,
              k: {
                t: data.k.t,
                o: data.k.o,
                h: data.k.h,
                l: data.k.l,
                c: data.k.c,
                v: data.k.v,
                x: data.k.x,
              },
            };
            setLastMessage(klineMessage);
            onMessageRef.current?.(klineMessage);
          }
        } catch (err) {
          console.error("❌ [WebSocket] Error parsing kline message:", err);
        }
      });

      socket.on("connect_error", (error) => {
        console.error("❌ [WebSocket] Connection error:", error);
        setError("WebSocket connection error");
        setIsConnected(false);
        onErrorRef.current?.(error as unknown as Event);
      });

      socket.on("disconnect", (reason) => {
        console.log("🔌 [WebSocket] Disconnected:", reason);
        setIsConnected(false);
        onDisconnectRef.current?.();
      });

      socketRef.current = socket;
    } catch (err) {
      console.error("❌ [WebSocket] Connection error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
    }
  }, [symbol, interval, enabled]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log("🔌 [WebSocket] Manually disconnecting...");
      if (prevSymbolRef.current) {
        socketRef.current.emit("unsubscribe", { symbol: prevSymbolRef.current.toUpperCase() });
      }
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
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
