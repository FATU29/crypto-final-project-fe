"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sentiment } from "@/types/trading";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
// Simple progress fallback (avoid dependency on missing shadcn progress)

interface SentimentCardProps {
  sentiment: Sentiment;
  title?: string;
}

export function SentimentCard({
  sentiment,
  title = "Market Sentiment",
}: SentimentCardProps) {
  const getIcon = () => {
    if (sentiment.label === "positive") {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else if (sentiment.label === "negative") {
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    }
    return <Minus className="h-5 w-5 text-gray-500" />;
  };

  const getColor = () => {
    if (sentiment.label === "positive") return "text-green-500";
    if (sentiment.label === "negative") return "text-red-500";
    return "text-gray-500";
  };

  const getProgressColor = () => {
    if (sentiment.label === "positive") return "bg-green-500";
    if (sentiment.label === "negative") return "bg-red-500";
    return "bg-gray-500";
  };

  // Convert score from -1 to 1 range to 0 to 100 for progress bar
  const progressValue = ((sentiment.score + 1) / 2) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {getIcon()}
        </div>
        <CardDescription>AI-powered sentiment analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Sentiment Score</span>
            <span className={`text-2xl font-bold ${getColor()}`}>
              {sentiment.score > 0 ? "+" : ""}
              {(sentiment.score * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-2 rounded-full ${getProgressColor()}`}
              style={{ width: `${Math.max(0, Math.min(100, progressValue))}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Confidence</span>
          <span className="text-sm font-semibold">
            {(sentiment.confidence * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Label</span>
          <span className={`text-sm font-semibold capitalize ${getColor()}`}>
            {sentiment.label}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
