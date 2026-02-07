"use client";

import { useState, useCallback } from "react";
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
import { IndicatorSelector } from "@/components/charts/IndicatorSelector";
import { NewsToggle } from "@/components/charts/NewsToggle";
import { PredictionLineToggle } from "@/components/charts/PredictionLineToggle";
import { IndicatorKey } from "@/lib/utils/indicators";
import { useChartNewsMarkers } from "@/hooks/use-chart-news-markers";
import { usePredictionLine } from "@/hooks/use-prediction-line";
import { useAuth } from "@/lib/auth/AuthContext";
import PriceChart from "@/app/(features)/charts/PriceChart";

interface ChartContainerProps {
  pair: TradingPair;
  onIntervalChange?: (interval: string) => void;
}

export function ChartContainer({
  pair,
  onIntervalChange,
}: ChartContainerProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<ChartTimeframe>(
    CHART_TIMEFRAMES[3],
  ); // Default to 1H

  // Indicator state
  const [activeIndicators, setActiveIndicators] = useState<IndicatorKey[]>([]);

  // News markers state
  const [showNews, setShowNews] = useState(false);

  // AI Prediction line state
  const [showPrediction, setShowPrediction] = useState(false);
  const { user } = useAuth();
  const isVipUser = user?.accountType === "VIP";

  const { markers: newsMarkers, isLoading: newsLoading } = useChartNewsMarkers({
    symbol: pair.symbol,
    enabled: showNews,
  });

  const { predictionLine, isLoading: predictionLoading } = usePredictionLine({
    symbol: pair.symbol,
    interval: selectedTimeframe.interval,
    enabled: showPrediction && isVipUser,
  });

  const handleToggleIndicator = useCallback((key: IndicatorKey) => {
    setActiveIndicators((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const handleToggleNews = useCallback(() => {
    setShowNews((prev) => !prev);
  }, []);

  const handleTogglePrediction = useCallback(() => {
    setShowPrediction((prev) => !prev);
  }, []);

  const handleTimeframeSelect = useCallback(
    (tf: ChartTimeframe) => {
      setSelectedTimeframe(tf);
      onIntervalChange?.(tf.interval);
    },
    [onIntervalChange],
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {pair.name} ({pair.symbol}) - Live Trading Chart
              </CardTitle>
              <CardDescription>
                Real-time candlestick chart with volume data • Powered by
                Binance WebSocket
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <TimeframeSelector
              timeframes={CHART_TIMEFRAMES}
              selected={selectedTimeframe}
              onSelect={handleTimeframeSelect}
            />
            <div className="flex items-center gap-2">
              <IndicatorSelector
                activeIndicators={activeIndicators}
                onToggle={handleToggleIndicator}
              />
              <NewsToggle
                enabled={showNews}
                onToggle={handleToggleNews}
                markerCount={newsMarkers.length}
                isLoading={newsLoading}
              />
              <PredictionLineToggle
                enabled={showPrediction}
                onToggle={handleTogglePrediction}
                isLoading={predictionLoading}
                isVip={isVipUser}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <PriceChart
          key={`${pair.symbol}-${selectedTimeframe.interval}`}
          symbol={pair.symbol}
          interval={selectedTimeframe.interval}
          height={500}
          activeIndicators={activeIndicators}
          newsMarkers={showNews ? newsMarkers : []}
          predictionLine={showPrediction ? predictionLine : []}
        />
      </CardContent>
    </Card>
  );
}
