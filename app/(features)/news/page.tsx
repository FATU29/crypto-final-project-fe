"use client";

import { useState } from "react";
import {
  PaginatedNewsList,
  NewsFilterComponent,
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
  const { news } = useNews(filters);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crypto News & Sentiment Analysis</CardTitle>
          <CardDescription>
            Real-time cryptocurrency news with AI-powered sentiment analysis
            from multiple trusted sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="news" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="news">News Feed</TabsTrigger>
              <TabsTrigger value="trends">Sentiment Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="news" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-4">
                {/* Sidebar - Filters & Stats */}
                <div className="space-y-6 lg:col-span-1">
                  <NewsFilterComponent onFilterChange={setFilters} />
                  {news.length > 0 && <SentimentStats news={news} />}
                </div>

                {/* Main Content - News List with Pagination */}
                <div className="lg:col-span-3">
                  <PaginatedNewsList filters={filters} itemsPerPage={20} />
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
