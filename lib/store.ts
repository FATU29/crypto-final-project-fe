import { create } from "zustand";
import { type Timeframe } from "./exchanges";

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
