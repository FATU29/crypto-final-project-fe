import { io, Socket } from "socket.io-client";

// Store multiple socket instances for different namespaces
let priceSocket: Socket | null = null;

/**
 * Get or create a socket connection to the prices namespace
 * Connects to the backend NestJS server
 */
export function getPriceSocket(): Socket {
  if (!priceSocket) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000";
    console.log("🔌 Connecting to price socket:", `${wsUrl}/prices`);

    priceSocket = io(`${wsUrl}/prices`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    priceSocket.on("connect", () => {
      console.log("✅ Price socket connected:", priceSocket?.id);
    });

    priceSocket.on("disconnect", (reason) => {
      console.log("🔌 Price socket disconnected:", reason);
    });

    priceSocket.on("connect_error", (error) => {
      console.error("❌ Price socket connection error:", error);
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
  callback: (data: PriceUpdatePayload) => void
): () => void {
  const socket = getPriceSocket();

  // Subscribe to the symbol
  socket.emit("subscribe", { symbol: symbol.toUpperCase() });
  console.log("📊 Subscribed to price updates:", symbol);

  // Listen for price updates
  const handler = (payload: PriceUpdatePayload) => {
    if (payload.symbol.toUpperCase() === symbol.toUpperCase()) {
      callback(payload);
    }
  };

  socket.on("priceUpdate", handler);

  // Return cleanup function
  return () => {
    socket.off("priceUpdate", handler);
    socket.emit("unsubscribe", { symbol: symbol.toUpperCase() });
    console.log("🔌 Unsubscribed from price updates:", symbol);
  };
}

// Legacy support - keep for backward compatibility
export type TickerPayload = PriceUpdatePayload;

export function getSocket(): Socket {
  return getPriceSocket();
}

export function subscribeTicker(
  symbol: string,
  cb: (data: TickerPayload) => void
): () => void {
  return subscribeToPriceUpdates(symbol, cb);
}
