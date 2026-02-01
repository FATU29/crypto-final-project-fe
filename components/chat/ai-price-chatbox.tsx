"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Sparkles,
  Crown,
  Lock,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";
import { canAccessAiFeatures } from "@/lib/auth/permissions";

interface SentimentSummary {
  overall_sentiment: string;
  bullish_signals: number;
  bearish_signals: number;
  neutral_signals: number;
  sentiment_score: number;
}

interface PredictionResult {
  symbol: string;
  prediction: "bullish" | "bearish" | "neutral";
  confidence: number;
  sentiment_summary: SentimentSummary;
  reasoning: string;
  key_factors: string[];
  news_analyzed: number;
  analyzed_at: string;
  model_version: string;
}

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  published_at: string;
  sentiment: {
    label: string;
    score: number;
    confidence: number;
  };
}

interface PredictionResponse {
  success: boolean;
  prediction: PredictionResult;
  news_articles: NewsArticle[];
}

// Popular trading pairs
const TRADING_PAIRS = [
  { value: "BTCUSDT", label: "BTC/USDT", name: "Bitcoin" },
  { value: "ETHUSDT", label: "ETH/USDT", name: "Ethereum" },
  { value: "BNBUSDT", label: "BNB/USDT", name: "Binance Coin" },
  { value: "XRPUSDT", label: "XRP/USDT", name: "Ripple" },
  { value: "SOLUSDT", label: "SOL/USDT", name: "Solana" },
  { value: "ADAUSDT", label: "ADA/USDT", name: "Cardano" },
  { value: "DOGEUSDT", label: "DOGE/USDT", name: "Dogecoin" },
  { value: "MATICUSDT", label: "MATIC/USDT", name: "Polygon" },
  { value: "DOTUSDT", label: "DOT/USDT", name: "Polkadot" },
  { value: "AVAXUSDT", label: "AVAX/USDT", name: "Avalanche" },
];

export default function AIPriceChatbox() {
  const { user } = useAuth();
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);

  const isVip = canAccessAiFeatures(user);

  const getPredictionIcon = (pred: string) => {
    switch (pred) {
      case "bullish":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "bearish":
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getPredictionColor = (pred: string) => {
    switch (pred) {
      case "bullish":
        return "text-green-500 bg-green-50 border-green-200";
      case "bearish":
        return "text-red-500 bg-red-50 border-red-200";
      default:
        return "text-yellow-500 bg-yellow-50 border-yellow-200";
    }
  };

  const handlePredict = async () => {
    if (!symbol.trim()) {
      setError("Please enter a trading symbol");
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);
    setNewsArticles([]);

    try {
      const response = await fetch("/api/ai/predict-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          limit: 5,
          accountType: user?.accountType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get prediction");
      }

      const data: PredictionResponse = await response.json();
      setPrediction(data.prediction);
      setNewsArticles(data.news_articles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Price Prediction
            {isVip && (
              <Badge className="ml-2 bg-linear-to-r from-yellow-500 to-amber-500">
                <Crown className="w-3 h-3 mr-1" />
                VIP
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Get AI-powered price predictions based on the latest news sentiment
            analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* VIP Warning for non-VIP users */}
          {!isVip && (
            <Alert className="mb-4 border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
              <Crown className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900 dark:text-yellow-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium mb-1">VIP Feature</p>
                    <p className="text-sm">
                      AI Price Prediction is only available for VIP members.
                      Upgrade your account to unlock AI analysis and advanced
                      insights.
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="bg-linear-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 shrink-0"
                  >
                    <Link href="/profile">
                      <Crown className="h-3 w-3 mr-1" />
                      Upgrade to VIP
                    </Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 mb-4">
            <Select
              value={symbol}
              onValueChange={setSymbol}
              disabled={loading || !isVip}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select trading pair" />
              </SelectTrigger>
              <SelectContent>
                {TRADING_PAIRS.map((pair) => (
                  <SelectItem key={pair.value} value={pair.value}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{pair.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {pair.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handlePredict}
              disabled={loading || !isVip}
              className="gap-2"
              title={!isVip ? "Chỉ dành cho thành viên VIP" : ""}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : !isVip ? (
                <>
                  <Lock className="w-4 h-4" />
                  Predict
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Predict
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {prediction && (
            <div className="space-y-4">
              {/* Main Prediction */}
              <Card
                className={`border-2 ${getPredictionColor(prediction.prediction)}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getPredictionIcon(prediction.prediction)}
                      <div>
                        <h3 className="text-xl font-bold uppercase">
                          {prediction.prediction}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {prediction.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {(prediction.confidence * 100).toFixed(0)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Confidence
                      </p>
                    </div>
                  </div>

                  {/* Sentiment Summary */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <Badge
                      variant="outline"
                      className="justify-center py-2 bg-green-50"
                    >
                      <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                      {prediction.sentiment_summary.bullish_signals} Bullish
                    </Badge>
                    <Badge
                      variant="outline"
                      className="justify-center py-2 bg-red-50"
                    >
                      <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                      {prediction.sentiment_summary.bearish_signals} Bearish
                    </Badge>
                    <Badge
                      variant="outline"
                      className="justify-center py-2 bg-gray-50"
                    >
                      <Minus className="w-3 h-3 mr-1" />
                      {prediction.sentiment_summary.neutral_signals} Neutral
                    </Badge>
                  </div>

                  {/* Reasoning */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Analysis:</h4>
                    <p className="text-sm text-muted-foreground">
                      {prediction.reasoning}
                    </p>
                  </div>

                  {/* Key Factors */}
                  <div>
                    <h4 className="font-semibold mb-2">Key Factors:</h4>
                    <ul className="space-y-1">
                      {prediction.key_factors.map((factor, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-primary">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 pt-4 border-t flex justify-between text-xs text-muted-foreground">
                    <span>{prediction.news_analyzed} articles analyzed</span>
                    <span>
                      {new Date(prediction.analyzed_at).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* News Articles */}
              {newsArticles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Analyzed News Articles
                    </CardTitle>
                    <CardDescription>
                      {newsArticles.length} recent articles used for prediction
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {newsArticles.slice(0, 5).map((article) => (
                        <Link
                          key={article.id}
                          href={`/news/${article.id}`}
                          className="block border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h5 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                              {article.title}
                            </h5>
                            <Badge
                              variant="outline"
                              className={
                                article.sentiment.label === "positive"
                                  ? "bg-green-50 text-green-700"
                                  : article.sentiment.label === "negative"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-gray-50"
                              }
                            >
                              {article.sentiment.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {article.summary}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{article.source}</span>
                            <span>
                              {new Date(
                                article.published_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
