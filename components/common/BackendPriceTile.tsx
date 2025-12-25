"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useBackendPrice } from "@/hooks";

interface BackendPriceTileProps {
  symbol: string;
  name?: string;
  enabled?: boolean;
}

export function BackendPriceTile({
  symbol,
  name,
  enabled = true,
}: BackendPriceTileProps) {
  const prevPriceRef = useRef<number | null>(null);
  const [priceChange, setPriceChange] = useState<"up" | "down" | "neutral">(
    "neutral"
  );

  const handlePriceUpdate = useCallback((data: { price: string }) => {
    const current = parseFloat(data.price);

    if (prevPriceRef.current !== null) {
      if (current > prevPriceRef.current) {
        setPriceChange("up");
        setTimeout(() => setPriceChange("neutral"), 500);
      } else if (current < prevPriceRef.current) {
        setPriceChange("down");
        setTimeout(() => setPriceChange("neutral"), 500);
      }
    }

    prevPriceRef.current = current;
  }, []);

  const { price, isConnected, lastUpdate } = useBackendPrice({
    symbol,
    enabled,
    onUpdate: handlePriceUpdate,
  });

  const formattedPrice = price
    ? parseFloat(price).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      })
    : "---";

  const priceColor =
    priceChange === "up"
      ? "text-green-500"
      : priceChange === "down"
      ? "text-red-500"
      : "text-foreground";

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {name || symbol}
          </CardTitle>
          {isConnected ? (
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3 text-green-500 animate-pulse" />
              <span className="text-xs">Live</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3 text-gray-400" />
              <span className="text-xs">Offline</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div
            className={`text-2xl font-bold transition-colors duration-200 ${priceColor} flex items-center gap-2`}
          >
            ${formattedPrice}
            {priceChange === "up" && (
              <TrendingUp className="h-5 w-5 text-green-500" />
            )}
            {priceChange === "down" && (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
          </div>
          {lastUpdate && (
            <div className="text-xs text-muted-foreground">
              Updated: {new Date(lastUpdate.ts).toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>

      {/* Visual flash effect on price change */}
      {priceChange !== "neutral" && (
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
            priceChange === "up" ? "bg-green-500/5" : "bg-red-500/5"
          }`}
        />
      )}
    </Card>
  );
}
