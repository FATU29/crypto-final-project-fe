"use client";

import { useState } from "react";
import { NewsArticle } from "@/types/trading";
import { NewsCard } from "./NewsCard";
import { NewsFilter } from "./NewsFilter";

interface NewsFeedProps {
  articles: NewsArticle[];
}

export function NewsFeed({ articles }: NewsFeedProps) {
  const [filteredArticles, setFilteredArticles] = useState(articles);
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");

  const handleFilterChange = (sentiment: string, source: string) => {
    setSelectedSentiment(sentiment);
    setSelectedSource(source);

    let filtered = articles;

    if (sentiment !== "all") {
      filtered = filtered.filter((article) => article.sentiment === sentiment);
    }

    if (source !== "all") {
      filtered = filtered.filter((article) => article.source === source);
    }

    setFilteredArticles(filtered);
  };

  const sources = Array.from(new Set(articles.map((a) => a.source)));

  return (
    <div className="space-y-6">
      <NewsFilter
        onFilterChange={handleFilterChange}
        sources={sources}
        selectedSentiment={selectedSentiment}
        selectedSource={selectedSource}
      />

      <div className="space-y-4">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No articles found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
