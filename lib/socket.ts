import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // TODO: replace with your backend URL
    socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000", {
      transports: ["websocket"],
    });
  }
  return socket;
}

export type TickerPayload = { symbol: string; price: number; ts: number };

export function subscribeTicker(
  symbol: string,
  cb: (data: TickerPayload) => void
) {
  const s = getSocket();
  s.emit("subscribe", { channel: "ticker", symbol });
  const handler = (payload: TickerPayload) => {
    if (payload?.symbol === symbol) cb(payload);
  };
  s.on("ticker", handler);
  return () => s.off("ticker", handler);
}
