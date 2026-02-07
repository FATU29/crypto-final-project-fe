"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  RefreshCw,
  Sparkles,
  Wifi,
  WifiOff,
  Target,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  useLivePrediction,
  LivePredictionTarget,
} from "@/hooks/use-live-prediction";
import { PredictionDirection } from "@/types/ai-prediction";

interface LivePricePredictionProps {
  symbol: string;
  interval: string;
  className?: string;
}

function DirectionIcon({
  direction,
  size = "md",
}: {
  direction: PredictionDirection;
  size?: "sm" | "md";
}) {
  const cls = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  switch (direction) {
    case "bullish":
      return <TrendingUp className={`${cls} text-green-500`} />;
    case "bearish":
      return <TrendingDown className={`${cls} text-red-500`} />;
    case "neutral":
      return <Minus className={`${cls} text-gray-400`} />;
  }
}

function directionColor(d: PredictionDirection) {
  return d === "bullish"
    ? "text-green-500"
    : d === "bearish"
      ? "text-red-500"
      : "text-gray-400";
}

function changeColor(v: number) {
  return v > 0 ? "text-green-500" : v < 0 ? "text-red-500" : "text-gray-400";
}

function ChangeArrow({ value }: { value: number }) {
  if (value > 0) return <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />;
  if (value < 0) return <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-gray-400" />;
}

function PriceTargetRow({ target }: { target: LivePredictionTarget }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 min-w-10">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {target.label}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold tabular-nums">
          $
          {target.predictedPrice.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
        <div className="flex items-center gap-0.5 min-w-20 justify-end">
          <ChangeArrow value={target.changePercent} />
          <span
            className={`text-xs font-semibold tabular-nums ${changeColor(target.changePercent)}`}
          >
            {target.changePercent >= 0 ? "+" : ""}
            {target.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function PulsingDot({ connected }: { connected: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      {connected && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      )}
      <span
        className={`relative inline-flex rounded-full h-2 w-2 ${
          connected ? "bg-green-500" : "bg-red-500"
        }`}
      />
    </span>
  );
}

export function LivePricePrediction({
  symbol,
  interval,
  className,
}: LivePricePredictionProps) {
  const {
    currentPrice,
    direction,
    confidence,
    reasoning,
    targets,
    isLoading,
    error,
    isVipOnly,
    isPriceConnected,
    lastUpdated,
    refresh,
  } = useLivePrediction({ symbol, interval, enabled: true });

  return (
    <Card className={`flex flex-col h-full ${className ?? ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-500" />
            <span>Live Prediction</span>
            <Badge
              variant="secondary"
              className="gap-1 text-[10px] px-1.5 py-0"
            >
              <Crown className="h-2.5 w-2.5" />
              VIP
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <PulsingDot connected={isPriceConnected} />
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={refresh}
              disabled={isLoading || isVipOnly}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 pt-0">
        {/* VIP Gate */}
        {isVipOnly && (
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Live price predictions are for VIP members only.{" "}
              <Button variant="link" className="px-1 h-auto text-xs" asChild>
                <a href="/profile">Upgrade</a>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Error */}
        {error && !isVipOnly && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {isLoading && !isVipOnly && targets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
            <p className="text-xs text-muted-foreground">
              Generating predictions…
            </p>
          </div>
        )}

        {/* Main Content */}
        {!isVipOnly && (currentPrice !== null || targets.length > 0) && (
          <>
            {/* Current Price */}
            {currentPrice !== null && (
              <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                <div className="flex items-center gap-1.5">
                  {isPriceConnected ? (
                    <Wifi className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5 text-orange-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {symbol}
                  </span>
                </div>
                <span className="text-lg font-bold tabular-nums">
                  $
                  {currentPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            {/* Direction badge */}
            {direction && confidence !== null && (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <DirectionIcon direction={direction} />
                  <span
                    className={`text-sm font-bold capitalize ${directionColor(direction)}`}
                  >
                    {direction}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold tabular-nums">
                    {(confidence * 100).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-1">
                    conf
                  </span>
                </div>
              </div>
            )}

            {/* Price Targets */}
            {targets.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 px-1">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Price Targets
                  </span>
                </div>
                <div className="space-y-1">
                  {targets.map((t, i) => (
                    <PriceTargetRow key={i} target={t} />
                  ))}
                </div>
              </div>
            )}

            {/* Reasoning (collapsed) */}
            {reasoning && (
              <div className="px-1 pt-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    AI Insight
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                  {reasoning}
                </p>
              </div>
            )}

            {/* Last updated */}
            {lastUpdated && (
              <div className="text-[10px] text-muted-foreground text-right mt-auto pt-2 border-t border-border/50">
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!isLoading &&
          !isVipOnly &&
          !error &&
          targets.length === 0 &&
          currentPrice === null && (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Target className="h-8 w-8 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                No predictions yet
              </p>
              <Button size="sm" variant="outline" onClick={refresh}>
                Generate
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
