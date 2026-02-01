"use client";

import { TradingPair } from "@/types/trading";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceInfoProps {
  pair: TradingPair;
}

export function PriceInfo({ pair }: PriceInfoProps) {
  const isPositive = (pair.change24h || 0) >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Current Price</p>
        <p className="text-2xl font-bold tabular-nums">
          $
          {pair.price?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
          })}
        </p>
      </div>

      <div
        className={`flex items-start gap-2 ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="h-5 w-5 mt-1" />
        ) : (
          <TrendingDown className="h-5 w-5 mt-1" />
        )}
        <div>
          <p className="text-sm text-muted-foreground mb-1">24h Change</p>
          <p className="text-xl font-semibold tabular-nums">
            {isPositive ? "+" : ""}
            {pair.change24h?.toFixed(2)}%
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
        <p className="text-xl font-semibold tabular-nums">
          {pair.volume24h
            ? `$${(pair.volume24h / 1000000).toFixed(2)}M`
            : "N/A"}
        </p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
        <p className="text-xl font-semibold tabular-nums">
          {pair.marketCap
            ? `$${(pair.marketCap / 1000000000).toFixed(2)}B`
            : "N/A"}
        </p>
      </div>
    </div>
  );
}
