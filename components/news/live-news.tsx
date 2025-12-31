// components/news/live-news.tsx

"use client";

import { useNewsPolling } from "@/hooks/use-news";
import { NewsList } from "./news-list";

export function LiveNews() {
  const { loading } = useNewsPolling(30000); // Refresh every 30s

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live News Feed</h2>
        {loading && <span className="text-sm text-gray-500">Updating...</span>}
      </div>
      <NewsList />
    </div>
  );
}
