// components/news/sentiment-gauge.tsx

"use client";

import { useMemo } from "react";
import { SentimentAnalysis } from "@/types/news";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentGaugeProps {
  sentiment?: SentimentAnalysis;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function SentimentGauge({
  sentiment,
  size = "md",
  showLabel = true,
}: SentimentGaugeProps) {
  const { Icon, color } = useMemo(() => {
    let IconComponent: typeof TrendingUp | typeof TrendingDown | typeof Minus;
    let colorClass: string;

    if (sentiment?.score && sentiment.score > 0.3) {
      IconComponent = TrendingUp;
      colorClass = "text-green-500";
    } else if (sentiment?.score && sentiment.score < -0.3) {
      IconComponent = TrendingDown;
      colorClass = "text-red-500";
    } else {
      IconComponent = Minus;
      colorClass = "text-gray-500";
    }

    return {
      Icon: IconComponent,
      color: colorClass,
    };
  }, [sentiment?.score]);

  if (!sentiment) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-200"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Minus className="h-6 w-6 text-gray-400" />
          </div>
        </div>
        {showLabel && (
          <span className="text-sm text-gray-500">Not analyzed</span>
        )}
      </div>
    );
  }

  // Convert -1 to 1 range to 0-100% for gauge
  const percentage = ((sentiment.score + 1) / 2) * 100;
  const circumference = 2 * Math.PI * 28; // radius = 28
  const offset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className={`${sizeClasses[size]} transform -rotate-90`}>
          {/* Background circle */}
          <circle
            cx={size === "sm" ? 24 : size === "md" ? 32 : 48}
            cy={size === "sm" ? 24 : size === "md" ? 32 : 48}
            r={size === "sm" ? 20 : size === "md" ? 28 : 40}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx={size === "sm" ? 24 : size === "md" ? 32 : 48}
            cy={size === "sm" ? 24 : size === "md" ? 32 : 48}
            r={size === "sm" ? 20 : size === "md" ? 28 : 40}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={color}
            style={{
              transition: "stroke-dashoffset 0.5s ease-in-out",
            }}
          />
        </svg>
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={`${iconSizes[size]} ${color}`} />
        </div>
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700 capitalize">
            {sentiment.label}
          </span>
          <span className="text-xs text-gray-500">
            {sentiment.score > 0 ? "+" : ""}
            {(sentiment.score * 100).toFixed(0)}% •{" "}
            {(sentiment.confidence * 100).toFixed(0)}% confidence
          </span>
        </div>
      )}
    </div>
  );
}
