import { create } from "zustand";

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

type PairState = {
  pair: string;
  timeframe: Timeframe;
  setPair: (pair: string) => void;
  setTimeframe: (tf: Timeframe) => void;
};

export const usePairStore = create<PairState>((set) => ({
  pair: "BTC/USDT",
  timeframe: "1h",
  setPair: (pair) => set({ pair }),
  setTimeframe: (timeframe) => set({ timeframe }),
}));
