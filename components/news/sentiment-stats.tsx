// components/news/sentiment-stats.tsx

"use client";

import { News } from "@/types/news";
import { SentimentGauge } from "./sentiment-gauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SentimentStatsProps {
  news: News[];
}

export function SentimentStats({ news }: SentimentStatsProps) {
  const analyzedNews = news.filter((n) => n.ai_analyzed && n.sentiment);
  
  if (analyzedNews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sentiment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No analyzed news yet</p>
        </CardContent>
      </Card>
    );
  }

  const positive = analyzedNews.filter(
    (n) => n.sentiment?.label === "positive"
  ).length;
  const negative = analyzedNews.filter(
    (n) => n.sentiment?.label === "negative"
  ).length;
  const neutral = analyzedNews.filter(
    (n) => n.sentiment?.label === "neutral"
  ).length;

  const avgScore =
    analyzedNews.reduce((sum, n) => sum + (n.sentiment?.score || 0), 0) /
    analyzedNews.length;

  const avgConfidence =
    analyzedNews.reduce(
      (sum, n) => sum + (n.sentiment?.confidence || 0),
      0
    ) / analyzedNews.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Sentiment Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Gauge */}
        <div className="flex items-center justify-center py-4">
          <SentimentGauge
            sentiment={{
              label: avgScore > 0.3 ? "positive" : avgScore < -0.3 ? "negative" : "neutral",
              score: avgScore,
              confidence: avgConfidence,
              keywords: [],
              reasoning: "",
            }}
            size="lg"
            showLabel={true}
          />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="text-2xl font-bold text-green-700">{positive}</div>
            <div className="text-xs text-green-600">Positive</div>
            <div className="text-xs text-green-500 mt-1">
              {((positive / analyzedNews.length) * 100).toFixed(0)}%
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-2xl font-bold text-gray-700">{neutral}</div>
            <div className="text-xs text-gray-600">Neutral</div>
            <div className="text-xs text-gray-500 mt-1">
              {((neutral / analyzedNews.length) * 100).toFixed(0)}%
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="text-2xl font-bold text-red-700">{negative}</div>
            <div className="text-xs text-red-600">Negative</div>
            <div className="text-xs text-red-500 mt-1">
              {((negative / analyzedNews.length) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="pt-3 border-t space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Analyzed:</span>
            <span className="font-medium">{analyzedNews.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Avg Score:</span>
            <span className="font-medium">
              {avgScore > 0 ? "+" : ""}
              {(avgScore * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Avg Confidence:</span>
            <span className="font-medium">
              {(avgConfidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

