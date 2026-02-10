import { io, Socket } from "socket.io-client";

// Singleton socket connection for the prices namespace
let priceSocket: Socket | null = null;

/**
 * Get or create a socket connection to the prices namespace
 * Uses websocket-only transport for lowest latency
 */
export function getPriceSocket(): Socket {
  if (!priceSocket || priceSocket.disconnected) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
    const socketUrl =
      wsUrl.replace("ws://", "http://").replace("wss://", "https://") +
      "/prices";

    priceSocket = io(socketUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 3000,
      reconnectionAttempts: Infinity,
      // Reduce overhead
      forceNew: false,
      multiplex: true,
    });

    priceSocket.on("connect", () => {
      console.log("✅ Price socket connected:", priceSocket?.id);
    });

    priceSocket.on("disconnect", (reason) => {
      console.log("🔌 Price socket disconnected:", reason);
    });

    priceSocket.on("connect_error", (error) => {
      console.error("❌ Price socket connection error:", error.message);
    });
  }
  return priceSocket;
}

/**
 * Disconnect the price socket
 */
export function disconnectPriceSocket() {
  if (priceSocket) {
    priceSocket.disconnect();
    priceSocket = null;
  }
}

// Type definitions
export interface PriceUpdatePayload {
  symbol: string;
  price: string;
  ts: number;
}

/**
 * Subscribe to price updates for a specific symbol
 * @param symbol - Trading pair symbol (e.g., "BTCUSDT")
 * @param callback - Function to call when price updates are received
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToPriceUpdates(
  symbol: string,
  callback: (data: PriceUpdatePayload) => void,
): () => void {
  const socket = getPriceSocket();
  const upperSymbol = symbol.toUpperCase();

  // Subscribe to the symbol room
  socket.emit("subscribe", { symbol: upperSymbol });

  // Handle compact payload format { s, p, t } from optimized backend
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler = (payload: any) => {
    // Support both compact {s,p,t} and legacy {symbol,price,ts} formats
    const sym = payload.s || payload.symbol;
    const price = payload.p || payload.price;
    const ts = payload.t || payload.ts;
    if (sym && sym.toUpperCase() === upperSymbol) {
      callback({ symbol: sym, price, ts });
    }
  };

  socket.on("priceUpdate", handler);

  return () => {
    socket.off("priceUpdate", handler);
    socket.emit("unsubscribe", { symbol: upperSymbol });
  };
}

// Legacy support - keep for backward compatibility
export type TickerPayload = PriceUpdatePayload;

export function getSocket(): Socket {
  return getPriceSocket();
}

export function subscribeTicker(
  symbol: string,
  cb: (data: TickerPayload) => void,
): () => void {
  return subscribeToPriceUpdates(symbol, cb);
}
