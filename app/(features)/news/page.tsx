"use client";

import { useState, useRef, useCallback } from "react";
import {
  PaginatedNewsList,
  NewsFilterComponent,
  CrawlerControl,
  SentimentTrendChart,
} from "@/components/news";
import { NewsFilter } from "@/types/news";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNews } from "@/hooks/use-news";
import { SentimentStats } from "@/components/news/sentiment-stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NewsPage() {
  const [filters, setFilters] = useState<NewsFilter>({});
  const { news, refetch: refetchNews } = useNews(filters);
  const newsListRefetchRef = useRef<(() => void) | null>(null);

  const handleNewsListRefetchReady = useCallback((refetch: () => void) => {
    newsListRefetchRef.current = refetch;
  }, []);

  const handleCrawlComplete = useCallback(() => {
    // Refetch news list after crawl completes
    if (newsListRefetchRef.current) {
      newsListRefetchRef.current();
    }
    // Also refetch news summaries
    refetchNews();
  }, [refetchNews]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crypto News & Sentiment</CardTitle>
          <CardDescription>
            Latest cryptocurrency news with AI-powered sentiment analysis and
            on-demand full article loading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="news" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="trends">Sentiment Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="news" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-4">
                {/* Sidebar */}
                <div className="space-y-6 lg:col-span-1">
                  <CrawlerControl onCrawlComplete={handleCrawlComplete} />
                  <NewsFilterComponent onFilterChange={setFilters} />
                  {news.length > 0 && <SentimentStats news={news} />}
                </div>

                {/* Main Content with Pagination */}
                <div className="lg:col-span-3">
                  <PaginatedNewsList 
                    filters={filters} 
                    itemsPerPage={20}
                    onRefetchReady={handleNewsListRefetchReady}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <div className="space-y-6">
                <SentimentTrendChart
                  timeframe="day"
                  sources={filters.sources}
                  tradingPairs={filters.trading_pairs}
                  chartType="area"
                  height={500}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
