/**
 * Binance WebSocket Service
 * Manages WebSocket connections to Binance Streams
 * Documentation: https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams
 */

export type KlineInterval =
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "4h"
  | "1d"
  | "1w"
  | "1M";

export interface BinanceKline {
  t: number; // Kline start time
  T: number; // Kline close time
  s: string; // Symbol
  i: string; // Interval
  o: string; // Open price
  c: string; // Close price
  h: string; // High price
  l: string; // Low price
  v: string; // Base asset volume
  q: string; // Quote asset volume
  n: number; // Number of trades
  x: boolean; // Is this kline closed?
}

export interface BinanceKlineMessage {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  k: BinanceKline; // Kline data
}

export interface BinanceTicker {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  p: string; // Price change
  P: string; // Price change percent
  c: string; // Last price
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
}

export type WebSocketCallback<T> = (data: T) => void;

export class BinanceWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isManualClose = false;

  constructor(
    private streamName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private onMessage: WebSocketCallback<any>,
    private onError?: (error: Event) => void,
    private onConnect?: () => void,
    private onDisconnect?: () => void
  ) {}

  connect(): void {
    this.isManualClose = false;
    const wsUrl = `wss://stream.binance.com:9443/ws/${this.streamName}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log(`✅ WebSocket connected: ${this.streamName}`);
        this.reconnectAttempts = 0;
        this.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.onError?.(error);
      };

      this.ws.onclose = () => {
        console.log(`🔌 WebSocket disconnected: ${this.streamName}`);
        this.onDisconnect?.();

        if (
          !this.isManualClose &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.reconnect();
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      this.reconnect();
    }
  }

  private reconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(
      `🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    this.isManualClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getReadyState(): number | undefined {
    return this.ws?.readyState;
  }
}

/**
 * Create a kline (candlestick) stream
 * @param symbol - Trading pair symbol (e.g., 'btcusdt')
 * @param interval - Kline interval
 * @param onMessage - Callback function for kline updates
 * @param options - Optional callbacks for connection events
 */
export function createKlineStream(
  symbol: string,
  interval: KlineInterval,
  onMessage: WebSocketCallback<BinanceKlineMessage>,
  options?: {
    onError?: (error: Event) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
  }
): BinanceWebSocketService {
  const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
  return new BinanceWebSocketService(
    streamName,
    onMessage,
    options?.onError,
    options?.onConnect,
    options?.onDisconnect
  );
}

/**
 * Create a ticker stream for 24hr price statistics
 * @param symbol - Trading pair symbol (e.g., 'btcusdt')
 * @param onMessage - Callback function for ticker updates
 * @param options - Optional callbacks for connection events
 */
export function createTickerStream(
  symbol: string,
  onMessage: WebSocketCallback<BinanceTicker>,
  options?: {
    onError?: (error: Event) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
  }
): BinanceWebSocketService {
  const streamName = `${symbol.toLowerCase()}@ticker`;
  return new BinanceWebSocketService(
    streamName,
    onMessage,
    options?.onError,
    options?.onConnect,
    options?.onDisconnect
  );
}

/**
 * Create a combined stream with multiple streams
 * @param streams - Array of stream names (e.g., ['btcusdt@kline_1m', 'ethusdt@kline_1h'])
 * @param onMessage - Callback function for stream updates
 * @param options - Optional callbacks for connection events
 */
export function createCombinedStream(
  streams: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMessage: WebSocketCallback<any>,
  options?: {
    onError?: (error: Event) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
  }
): BinanceWebSocketService {
  const streamName = streams.join("/");
  return new BinanceWebSocketService(
    streamName,
    onMessage,
    options?.onError,
    options?.onConnect,
    options?.onDisconnect
  );
}
