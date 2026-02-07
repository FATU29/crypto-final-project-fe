/**
 * Technical Indicator Calculation Utilities
 * Provides MA (Moving Average) and EMA (Exponential Moving Average) calculations
 * for use with lightweight-charts LineSeries.
 */

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface LineData {
  time: number;
  value: number;
}

/**
 * Calculate Simple Moving Average (SMA/MA)
 * @param candles - Array of candle data sorted by time ascending
 * @param period - Number of periods for the average (e.g., 7, 20, 50)
 * @returns Array of { time, value } for LineSeries
 */
export function calculateMA(candles: CandleData[], period: number): LineData[] {
  if (candles.length < period) return [];

  const result: LineData[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    result.push({
      time: candles[i].time,
      value: sum / period,
    });
  }

  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * @param candles - Array of candle data sorted by time ascending
 * @param period - Number of periods for the average (e.g., 9, 12, 26)
 * @returns Array of { time, value } for LineSeries
 */
export function calculateEMA(
  candles: CandleData[],
  period: number
): LineData[] {
  if (candles.length < period) return [];

  const multiplier = 2 / (period + 1);
  const result: LineData[] = [];

  // First EMA value is the SMA of the first 'period' candles
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let ema = sum / period;

  result.push({
    time: candles[period - 1].time,
    value: ema,
  });

  // Calculate subsequent EMA values
  for (let i = period; i < candles.length; i++) {
    ema = (candles[i].close - ema) * multiplier + ema;
    result.push({
      time: candles[i].time,
      value: ema,
    });
  }

  return result;
}

/**
 * Indicator configuration presets
 */
export const INDICATOR_PRESETS = {
  MA7: { type: "MA" as const, period: 7, color: "#F59E0B", label: "MA 7" },
  MA25: { type: "MA" as const, period: 25, color: "#3B82F6", label: "MA 25" },
  MA99: { type: "MA" as const, period: 99, color: "#A855F7", label: "MA 99" },
  EMA9: { type: "EMA" as const, period: 9, color: "#F97316", label: "EMA 9" },
  EMA21: {
    type: "EMA" as const,
    period: 21,
    color: "#06B6D4",
    label: "EMA 21",
  },
  EMA55: {
    type: "EMA" as const,
    period: 55,
    color: "#EC4899",
    label: "EMA 55",
  },
} as const;

export type IndicatorKey = keyof typeof INDICATOR_PRESETS;

export interface IndicatorConfig {
  type: "MA" | "EMA";
  period: number;
  color: string;
  label: string;
}
