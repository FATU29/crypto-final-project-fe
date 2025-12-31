// components/news/sentiment-badge.tsx

"use client";

import { SentimentAnalysis } from "@/types/news";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentBadgeProps {
  sentiment?: SentimentAnalysis;
  showScore?: boolean;
  showConfidence?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "detailed";
}

export function SentimentBadge({
  sentiment,
  showScore = true,
  showConfidence = false,
  size = "md",
  variant = "default",
}: SentimentBadgeProps) {
  if (!sentiment) {
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-500">
        <Minus className="h-3 w-3 mr-1" />
        Not analyzed
      </Badge>
    );
  }

  const getSentimentConfig = (label: string) => {
    switch (label) {
      case "positive":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          icon: TrendingUp,
          label: "Positive",
        };
      case "negative":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          icon: TrendingDown,
          label: "Negative",
        };
      case "neutral":
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          icon: Minus,
          label: "Neutral",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          icon: Minus,
          label: "Unknown",
        };
    }
  };

  const config = getSentimentConfig(sentiment.label);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const scorePercentage = ((sentiment.score + 1) / 2) * 100; // Convert -1 to 1 range to 0-100%

  if (variant === "detailed") {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-lg border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
      >
        <Icon className={`h-${size === "sm" ? "3" : size === "md" ? "4" : "5"} w-${size === "sm" ? "3" : size === "md" ? "4" : "5"}`} />
        <span className="font-medium">{config.label}</span>
        {showScore && (
          <span className="text-xs opacity-75">
            {sentiment.score > 0 ? "+" : ""}
            {(sentiment.score * 100).toFixed(0)}%
          </span>
        )}
        {showConfidence && (
          <span className="text-xs opacity-60">
            ({(sentiment.confidence * 100).toFixed(0)}% confidence)
          </span>
        )}
      </div>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} border`}
    >
      <Icon className={`h-${size === "sm" ? "3" : "4"} w-${size === "sm" ? "3" : "4"} mr-1`} />
      <span className="font-medium">{config.label}</span>
      {showScore && (
        <span className="ml-1 text-xs">
          ({sentiment.score > 0 ? "+" : ""}
          {(sentiment.score * 100).toFixed(0)}%)
        </span>
      )}
    </Badge>
  );
}

