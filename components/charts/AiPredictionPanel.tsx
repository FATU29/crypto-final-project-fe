"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  RefreshCw,
  Crown,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAiPricePrediction } from "@/hooks";
import { PricePrediction, PredictionDirection } from "@/types/ai-prediction";

interface AiPredictionPanelProps {
  symbol: string;
  className?: string;
}

function getPredictionIcon(prediction: PredictionDirection) {
  switch (prediction) {
    case "bullish":
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    case "bearish":
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    case "neutral":
      return <Minus className="h-5 w-5 text-gray-500" />;
  }
}

function getPredictionColor(prediction: PredictionDirection) {
  switch (prediction) {
    case "bullish":
      return "text-green-500";
    case "bearish":
      return "text-red-500";
    case "neutral":
      return "text-gray-500";
  }
}

function getPredictionBadgeVariant(
  prediction: PredictionDirection
): "default" | "destructive" | "secondary" {
  switch (prediction) {
    case "bullish":
      return "default";
    case "bearish":
      return "destructive";
    case "neutral":
      return "secondary";
  }
}

function getConfidenceColor(confidence: number) {
  if (confidence >= 0.7) return "text-green-500";
  if (confidence >= 0.5) return "text-yellow-500";
  return "text-orange-500";
}

function PredictionContent({ prediction }: { prediction: PricePrediction }) {
  return (
    <div className="space-y-4">
      {/* Prediction Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getPredictionIcon(prediction.prediction)}
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-2xl font-bold capitalize ${getPredictionColor(prediction.prediction)}`}
              >
                {prediction.prediction}
              </span>
              <Badge variant={getPredictionBadgeVariant(prediction.prediction)}>
                {prediction.prediction}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {prediction.symbol} Price Prediction
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getConfidenceColor(prediction.confidence)}`}>
            {(prediction.confidence * 100).toFixed(0)}%
          </div>
          <p className="text-xs text-muted-foreground">Confidence</p>
        </div>
      </div>

      {/* Sentiment Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-500/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-500">
            {prediction.sentiment_summary.bullish_signals}
          </div>
          <div className="text-xs text-muted-foreground">Bullish</div>
        </div>
        <div className="bg-red-500/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-500">
            {prediction.sentiment_summary.bearish_signals}
          </div>
          <div className="text-xs text-muted-foreground">Bearish</div>
        </div>
        <div className="bg-gray-500/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-500">
            {prediction.sentiment_summary.neutral_signals}
          </div>
          <div className="text-xs text-muted-foreground">Neutral</div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Analysis
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {prediction.reasoning}
        </p>
      </div>

      {/* Key Factors */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Key Factors</h4>
        <ul className="space-y-1">
          {prediction.key_factors.map((factor, index) => (
            <li
              key={index}
              className="text-sm text-muted-foreground flex items-start gap-2"
            >
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
        <div className="flex items-center gap-4">
          <span>
            {prediction.news_analyzed} articles analyzed
          </span>
          <span>
            Model: {prediction.model_version}
          </span>
        </div>
        <span>
          {new Date(prediction.analyzed_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export function AiPredictionPanel({ symbol, className }: AiPredictionPanelProps) {
  const {
    prediction,
    isLoading,
    error,
    isVipOnly,
    isPolling,
    nextPollIn,
    refresh,
  } = useAiPricePrediction({
    symbol,
    enabled: true,
    autoRefresh: true,
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Price Prediction
            <Badge variant="secondary" className="gap-1">
              <Crown className="h-3 w-3" />
              VIP
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {isPolling && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 animate-pulse" />
                <span>Polling...</span>
              </div>
            )}
            {!isPolling && nextPollIn > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Next update in {nextPollIn}s</span>
              </div>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={refresh}
              disabled={isLoading || isPolling}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading || isPolling ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* VIP Only Message */}
        {isVipOnly && (
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              AI-powered price predictions are available for VIP members only.
              <Button variant="link" className="px-2" asChild>
                <a href="/profile">Upgrade to VIP</a>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && !isVipOnly && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && !prediction && !isVipOnly && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="relative">
              <Sparkles className="h-12 w-12 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            </div>
            <p className="text-sm text-muted-foreground">
              AI is analyzing market sentiment...
            </p>
            <p className="text-xs text-muted-foreground">
              This may take up to 90 seconds
            </p>
          </div>
        )}

        {/* Prediction Content */}
        {prediction && !isVipOnly && <PredictionContent prediction={prediction} />}

        {/* No Prediction Yet */}
        {!isLoading && !prediction && !error && !isVipOnly && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Sparkles className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No prediction available yet
            </p>
            <Button size="sm" onClick={refresh}>
              Generate Prediction
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
