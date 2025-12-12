"use client";

import { TradingPair } from "@/types/trading";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceInfoProps {
  pair: TradingPair;
}

export function PriceInfo({ pair }: PriceInfoProps) {
  const isPositive = (pair.change24h || 0) >= 0;

  return (
    <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-lg">
      <div>
        <p className="text-sm text-muted-foreground">Current Price</p>
        <p className="text-2xl font-bold">
          $
          {pair.price?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      <div
        className={`flex items-center gap-2 ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="h-5 w-5" />
        ) : (
          <TrendingDown className="h-5 w-5" />
        )}
        <div>
          <p className="text-sm text-muted-foreground">24h Change</p>
          <p className="text-xl font-semibold">
            {isPositive ? "+" : ""}
            {pair.change24h?.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}
