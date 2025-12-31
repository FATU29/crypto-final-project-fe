// components/news/news-list.tsx

"use client";

import { useNewsSummaries } from "@/hooks/use-news";
import { NewsCard } from "./news-card";

interface NewsListProps {
  tradingPair?: string;
  limit?: number;
}

export function NewsList({ tradingPair, limit = 20 }: NewsListProps) {
  const { summaries, loading, error } = useNewsSummaries(tradingPair, limit);

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border p-6 bg-white">
            <div className="flex gap-4">
              <div className="h-32 w-32 rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-4">
                <div className="h-5 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-5/6 rounded bg-gray-200" />
                <div className="flex gap-2 mt-3">
                  <div className="h-6 w-24 rounded bg-gray-200" />
                  <div className="h-6 w-20 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-800">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
        <p className="text-gray-600 mb-2">No news found</p>
        <p className="text-sm text-gray-500">
          Start the crawler to fetch latest news
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {summaries.map((news) => (
        <NewsCard key={news.id} news={news} />
      ))}
    </div>
  );
}
