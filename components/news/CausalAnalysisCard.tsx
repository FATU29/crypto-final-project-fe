// components/news/CausalAnalysisCard.tsx

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from "lucide-react";
import { useCausalAnalysis } from "@/hooks/use-causal-analysis";
import { CausalAnalysisResult } from "@/types/causal-analysis";
import { useState } from "react";

import { News } from "@/types/news";

interface CausalAnalysisCardProps {
  newsArticleId?: number;
  news?: News;
  symbol: string;
  onAnalysisComplete?: (result: CausalAnalysisResult) => void;
}

export function CausalAnalysisCard({
  newsArticleId,
  news,
  symbol,
  onAnalysisComplete,
}: CausalAnalysisCardProps) {
  const { analyze, analyzeDirect, loading, error, result } =
    useCausalAnalysis();
  const [expanded, setExpanded] = useState(false);

  // Check if news has sufficient content for analysis
  const hasSufficientContent = news
    ? (news.content && news.content.length > 500) ||
      (news.summary && news.summary.length > 200)
    : true; // If using articleId, assume content exists in DB

  const handleAnalyze = async () => {
    if (!hasSufficientContent) {
      return;
    }

    let analysisResult: CausalAnalysisResult | null = null;

    if (news) {
      // Use direct analysis with news content
      // Use content if available, otherwise fallback to summary
      const contentForAnalysis =
        news.content && news.content.length > 500
          ? news.content
          : news.summary || "";

      if (!contentForAnalysis) {
        return;
      }

      analysisResult = await analyzeDirect(
        { ...news, content: contentForAnalysis },
        symbol,
        {
          hours_before: 24,
          hours_after: 24,
          prediction_horizon: "24h",
        }
      );
    } else if (newsArticleId) {
      // Use database article ID
      analysisResult = await analyze({
        news_article_id: newsArticleId,
        symbol,
        hours_before: 24,
        hours_after: 24,
        prediction_horizon: "24h",
      });
    }

    if (analysisResult && onAnalysisComplete) {
      onAnalysisComplete(analysisResult);
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "UP":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "DOWN":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case "UP":
        return "bg-green-100 text-green-800 border-green-300";
      case "DOWN":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case "STRONG":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "MODERATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "WEAK":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Causal Analysis & Trend Prediction</CardTitle>
            <CardDescription>
              Analyze the causal relationship between news and price movements
            </CardDescription>
          </div>
          {!result && (
            <Button
              onClick={handleAnalyze}
              disabled={loading || !hasSufficientContent}
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : !hasSufficientContent ? (
                "Loading content..."
              ) : (
                "Start Analysis"
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!hasSufficientContent && !result && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please wait for the full article content to load before analyzing.
              Content needs at least 500 characters for accurate analysis.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && !result && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Analyzing data...</span>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Price Context */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Price Before News</div>
                <div className="text-2xl font-bold">
                  ${result.price_before_news.toFixed(2)}
                </div>
              </div>
              {result.price_after_news && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Price After News</div>
                  <div className="text-2xl font-bold">
                    ${result.price_after_news.toFixed(2)}
                  </div>
                </div>
              )}
              {result.price_change_percent !== null && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Change</div>
                  <div
                    className={`text-2xl font-bold ${
                      result.price_change_percent >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.price_change_percent >= 0 ? "+" : ""}
                    {result.price_change_percent.toFixed(2)}%
                  </div>
                </div>
              )}
            </div>

            {/* Sentiment */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Sentiment Analysis</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{result.sentiment_label}</Badge>
                <span className="text-sm text-gray-600">
                  Score: {(result.sentiment_score * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Causal Relationship */}
            <div>
              <h3 className="text-sm font-semibold mb-2">
                Causal Relationship
              </h3>
              <div className="space-y-2">
                <Badge
                  variant="outline"
                  className={getRelationshipColor(
                    result.causal_relationship.relationship_type
                  )}
                >
                  {result.causal_relationship.relationship_type}
                </Badge>
                <div className="text-sm text-gray-700">
                  {result.causal_relationship.explanation}
                </div>
                <div className="mt-2">
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Evidence:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {result.causal_relationship.evidence_points.map(
                      (point, idx) => (
                        <li key={idx}>{point}</li>
                      )
                    )}
                  </ul>
                </div>
                <div className="text-xs text-gray-500">
                  Correlation Coefficient:{" "}
                  {result.causal_relationship.correlation_score.toFixed(3)}
                </div>
              </div>
            </div>

            {/* Trend Prediction */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Trend Prediction</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {getTrendIcon(result.trend_prediction.direction)}
                  <Badge
                    variant="outline"
                    className={getTrendColor(result.trend_prediction.direction)}
                  >
                    {result.trend_prediction.direction}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Confidence:{" "}
                    {(result.trend_prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm font-semibold mb-2">Reasoning:</div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {result.trend_prediction.reasoning}
                  </p>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    Key Factors:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.trend_prediction.key_factors.map((factor, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Expected Change: </span>
                  <span
                    className={`font-semibold ${
                      result.trend_prediction.expected_change_percent >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.trend_prediction.expected_change_percent >= 0
                      ? "+"
                      : ""}
                    {result.trend_prediction.expected_change_percent.toFixed(2)}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Price History Summary */}
            {expanded && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-2">
                  Price History (Summary)
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Before News:</div>
                    <div className="font-semibold">
                      {result.price_history_before.length} data points
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">After News:</div>
                    <div className="font-semibold">
                      {result.price_history_after.length} data points
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Collapse" : "View More Details"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
