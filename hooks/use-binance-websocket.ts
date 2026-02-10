import { useEffect, useRef, useState, useCallback } from "react";
import { getPriceSocket } from "@/lib/socket";

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
 * Custom hook for real-time kline (candlestick) data via shared Socket.IO connection.
 * Reuses the singleton price socket to avoid multiple connections.
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
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<BinanceKlineMessage | null>(
    null,
  );

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

  useEffect(() => {
    if (!enabled || !symbol || !interval) {
      return;
    }

    const socket = getPriceSocket();
    const upperSymbol = symbol.toUpperCase();

    // Track connection state
    const onConnect = () => {
      setIsConnected(true);
      setError(null);
      socket.emit("subscribe", { symbol: upperSymbol });
      onConnectRef.current?.();
    };

    const onDisconnect = () => {
      setIsConnected(false);
      onDisconnectRef.current?.();
    };

    const onConnectError = (err: Error) => {
      setError(err.message);
      setIsConnected(false);
      onErrorRef.current?.(err as unknown as Event);
    };

    // Handle kline updates — filter by interval
    const onKlineUpdate = (data: Record<string, unknown>) => {
      const k = data.k as Record<string, unknown> | undefined;
      if (data.e !== "kline" || !k || k.i !== interval) return;

      const klineMessage: BinanceKlineMessage = {
        e: data.e as string,
        E: data.E as number,
        s: data.s as string,
        k: {
          t: k.t as number,
          o: k.o as string,
          h: k.h as string,
          l: k.l as string,
          c: k.c as string,
          v: k.v as string,
          x: k.x as boolean,
        },
      };
      setLastMessage(klineMessage);
      onMessageRef.current?.(klineMessage);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("klineUpdate", onKlineUpdate);

    // If socket is already connected, trigger the connect handler
    // (which sets state inside a callback, not synchronously in the effect)
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.emit("unsubscribe", { symbol: upperSymbol });
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("klineUpdate", onKlineUpdate);
      setLastMessage(null);
    };
  }, [symbol, interval, enabled]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    const socket = getPriceSocket();
    socket.disconnect();
    setTimeout(() => socket.connect(), 100);
  }, []);

  return {
    isConnected,
    error,
    lastMessage,
    reconnect,
    disconnect,
  };
}
