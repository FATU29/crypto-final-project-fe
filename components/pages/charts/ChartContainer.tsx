"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartTimeframe, TradingPair } from "@/types/trading";
import { CHART_TIMEFRAMES } from "@/lib/constants/trading";
import { TimeframeSelector } from "./TimeframeSelector";
import PriceChart from "@/app/(features)/charts/PriceChart";

interface ChartContainerProps {
  pair: TradingPair;
}

export function ChartContainer({ pair }: ChartContainerProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<ChartTimeframe>(
    CHART_TIMEFRAMES[3]
  ); // Default to 1H

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{pair.name} Price Chart</CardTitle>
            <CardDescription>Real-time price data from Binance</CardDescription>
          </div>
          <TimeframeSelector
            timeframes={CHART_TIMEFRAMES}
            selected={selectedTimeframe}
            onSelect={setSelectedTimeframe}
          />
        </div>
      </CardHeader>
      <CardContent>
        <PriceChart
          symbol={pair.symbol}
          interval={selectedTimeframe.interval}
          height={500}
        />
      </CardContent>
    </Card>
  );
}
