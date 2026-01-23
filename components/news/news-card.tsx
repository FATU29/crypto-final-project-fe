// components/news/news-card.tsx

"use client";

import { NewsSummary } from "@/types/news";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { SentimentBadge } from "./sentiment-badge";
import sanitizeHtml from "sanitize-html";

dayjs.extend(relativeTime);

interface NewsCardProps {
  news: NewsSummary;
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <Link href={`/news/${news.id}`} className="block mb-4">
      <div className="group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-blue-400 hover:shadow-lg">
        <div className="flex gap-4">
          {/* Image */}
          {news.image_url && (
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={news.image_url}
                alt={news.title}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(news.title, {
                  allowedTags: ["b", "strong", "em", "i", "u", "span"],
                  allowedAttributes: {},
                }),
              }}
            />

            {/* Summary */}
            {news.summary && (
              <div
                className="mb-3 line-clamp-3 text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(news.summary, {
                    allowedTags: [
                      "p",
                      "br",
                      "strong",
                      "em",
                      "b",
                      "i",
                      "u",
                      "a",
                      "span",
                    ],
                    allowedAttributes: {
                      a: ["href", "target", "rel"],
                    },
                  }),
                }}
              />
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Source */}
              <span className="rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-medium">
                {news.source}
              </span>

              {/* Parsing Method Badge */}
              {"parsing_method" in news && news.parsing_method === "ai" && (
                <span
                  className="rounded bg-purple-50 border border-purple-200 px-2 py-1 text-xs font-medium text-purple-700"
                  title={`AI Parsed (Confidence: ${((news.parsing_confidence || 0) * 100).toFixed(0)}%)`}
                >
                  🤖 AI
                </span>
              )}

              {/* Sentiment */}
              {news.sentiment_label && (
                <SentimentBadge
                  sentiment={{
                    label: news.sentiment_label as
                      | "positive"
                      | "negative"
                      | "neutral",
                    score: news.sentiment_score || 0,
                    confidence: 0.8,
                    keywords: [],
                    reasoning: "",
                  }}
                  showScore={true}
                  size="sm"
                />
              )}

              {/* Trading Pairs */}
              {news.related_pairs?.map((pair) => (
                <span
                  key={pair}
                  className="rounded bg-blue-50 border border-blue-200 px-2 py-1 text-xs font-medium text-blue-700"
                >
                  {pair}
                </span>
              ))}

              {/* Time */}
              <span className="ml-auto text-xs text-gray-500">
                {dayjs(news.published_at).fromNow()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
