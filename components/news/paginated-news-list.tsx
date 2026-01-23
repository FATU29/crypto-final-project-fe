// components/news/paginated-news-list.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { NewsCard } from "./news-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { NewsFilter, News } from "@/types/news";
import { NewsAPI, PaginatedResponse } from "@/lib/services/news-api";

interface PaginatedNewsListProps {
  filters?: NewsFilter;
  itemsPerPage?: number;
}

export function PaginatedNewsList({
  filters = {},
  itemsPerPage = 20,
}: PaginatedNewsListProps) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<News> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await NewsAPI.getWithFilters(page, itemsPerPage, filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch news");
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  }, [page, itemsPerPage, filters]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const refetch = useCallback(() => {
    fetchNews();
  }, [fetchNews]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border p-6 bg-white">
            <div className="flex gap-4">
              <div className="h-32 w-32 rounded-lg bg-gray-200 shrink-0" />
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
        <p className="text-sm text-red-800 font-medium mb-2">
          Error loading news
        </p>
        <p className="text-xs text-red-600">{error}</p>
        <Button onClick={refetch} variant="outline" size="sm" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
        <p className="text-gray-600 font-medium mb-2">No news found</p>
        <p className="text-sm text-gray-500 mb-4">
          {Object.keys(filters).length > 0
            ? "Try adjusting your filters or check back later for new content"
            : "News will appear here automatically from our crawler"}
        </p>
        <Button onClick={refetch} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  const { items, pagination } = data;

  return (
    <div className="space-y-6">
      {/* Controls - Only Show Refresh */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{pagination.total}</span> articles found
        </div>
        <Button
          onClick={refetch}
          variant="outline"
          size="sm"
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* News Items */}
      <div className="space-y-6">
        {items.map((news) => (
          <NewsCard key={news.id} news={news} />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(page * itemsPerPage, pagination.total)}
            </span>{" "}
            of <span className="font-medium">{pagination.total}</span> results
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.has_prev || loading}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(pagination.total_pages, 5) },
                (_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === page;

                  return (
                    <Button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      disabled={loading}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                },
              )}

              {pagination.total_pages > 5 && (
                <>
                  <span className="px-2 text-gray-400">...</span>
                  <Button
                    onClick={() => setPage(pagination.total_pages)}
                    disabled={loading}
                    variant={
                      page === pagination.total_pages ? "default" : "outline"
                    }
                    size="sm"
                    className="w-10"
                  >
                    {pagination.total_pages}
                  </Button>
                </>
              )}
            </div>

            <Button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.has_next || loading}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
