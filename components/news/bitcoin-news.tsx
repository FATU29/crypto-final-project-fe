// components/news/bitcoin-news.tsx

"use client";

import { useNewsByPair } from "@/hooks/use-news";
import { NewsCard } from "./news-card";

export function BitcoinNews() {
  const { news, loading, error } = useNewsByPair("BTCUSDT");

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Latest Bitcoin News</h3>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4">
              <div className="h-4 w-3/4 rounded bg-gray-200 mb-2" />
              <div className="h-3 w-full rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Latest Bitcoin News</h3>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">Error loading news: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Latest Bitcoin News</h3>
      {news.length === 0 ? (
        <p className="text-gray-500 text-sm">No Bitcoin news available</p>
      ) : (
        <div className="space-y-3">
          {news.slice(0, 5).map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      )}
    </div>
  );
}
