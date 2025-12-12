"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewsArticle } from "@/types/trading";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Image from "next/image";

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const score = article.sentimentScore || 0;

  const getSentimentIcon = () => {
    if (score > 0.2) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (score < -0.2) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getSentimentColor = () => {
    if (score > 0.2) return "text-green-500";
    if (score < -0.2) return "text-red-500";
    return "text-gray-500";
  };

  const getSentimentBadge = () => {
    if (article.sentiment === "positive") {
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Bullish
        </Badge>
      );
    } else if (article.sentiment === "negative") {
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          Bearish
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-gray-500 text-gray-500">
        Neutral
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getSentimentIcon()}
              {getSentimentBadge()}
              <span className="text-xs text-muted-foreground">
                {article.source}
              </span>
            </div>
            <CardTitle className="line-clamp-2">{article.title}</CardTitle>
            <CardDescription className="mt-2">
              {article.summary}
            </CardDescription>
          </div>
          {article.imageUrl && (
            <div className="relative w-24 h-24 shrink-0 rounded-md overflow-hidden">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${getSentimentColor()}`}>
              {score > 0 ? "+" : ""}
              {(score * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(article.publishedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
