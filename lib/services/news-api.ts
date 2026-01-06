// lib/services/news-api.ts

import {
  News,
  NewsSummary,
  NewsFilter,
  CrawlerStatus,
  CronJobStatus,
  NewsApiResponse,
} from "@/types/news";

const API_BASE =
  process.env.NEXT_PUBLIC_CRAWL_API || "http://localhost:9000/api/v1";

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export class NewsAPI {
  // Get all news with pagination
  static async getAll(
    page = 1,
    limit = 20,
    source?: string,
    category?: string
  ): Promise<PaginatedResponse<News>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (source) params.append("source", source);
    if (category) params.append("category", category);

    const response = await fetch(`${API_BASE}/news?${params}`);
    const data: NewsApiResponse<PaginatedResponse<News>> =
      await response.json();
    return (
      data.data || {
        items: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false,
        },
      }
    );
  }

  // Get news by ID
  static async getById(id: string): Promise<News | null> {
    const response = await fetch(`${API_BASE}/news/${id}`);
    if (!response.ok) return null;
    const data: NewsApiResponse<News> = await response.json();
    return data.data || null;
  }

  // Fetch full article details from source URL
  static async fetchArticleDetails(id: string): Promise<News | null> {
    const maxRetries = 2;
    const timeout = 45000; // 45 seconds timeout

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${API_BASE}/news/${id}/fetch-detail`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (attempt < maxRetries) {
            // Wait before retry (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (attempt + 1))
            );
            continue;
          }
          return null;
        }

        const data: NewsApiResponse<News> = await response.json();
        return data.data || null;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.error("Request timeout - article fetch took too long");
        } else {
          console.error("Failed to fetch article details:", error);
        }

        if (attempt < maxRetries) {
          // Wait before retry
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (attempt + 1))
          );
          continue;
        }
        return null;
      }
    }
    return null;
  }

  // Get summaries (optimized for UI)
  static async getSummaries(
    tradingPair?: string,
    limit = 20
  ): Promise<NewsSummary[]> {
    const params = new URLSearchParams();
    if (tradingPair) params.append("trading_pair", tradingPair);
    if (limit) params.append("limit", limit.toString());

    const response = await fetch(`${API_BASE}/news/summaries?${params}`);
    const data: NewsApiResponse<NewsSummary[]> = await response.json();
    return data.data || [];
  }

  // Get by trading pair
  static async getByTradingPair(pair: string): Promise<News[]> {
    const response = await fetch(`${API_BASE}/news/pair/${pair}`);
    const data: NewsApiResponse<News[]> = await response.json();
    return data.data || [];
  }

  // Advanced filtering
  static async getAdvanced(filters: NewsFilter): Promise<News[]> {
    const params = new URLSearchParams();

    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.sources?.length)
      params.append("sources", filters.sources.join(","));
    if (filters.categories?.length)
      params.append("categories", filters.categories.join(","));
    if (filters.trading_pairs?.length)
      params.append("trading_pairs", filters.trading_pairs.join(","));
    if (filters.sentiment) params.append("sentiment", filters.sentiment);
    if (filters.min_score)
      params.append("min_score", filters.min_score.toString());
    if (filters.ai_analyzed !== undefined)
      params.append("ai_analyzed", filters.ai_analyzed.toString());
    if (filters.language) params.append("language", filters.language);

    const response = await fetch(`${API_BASE}/news/advanced?${params}`);
    const data: NewsApiResponse<News[]> = await response.json();
    return data.data || [];
  }

  // Get news with filters and pagination
  static async getWithFilters(
    page = 1,
    limit = 20,
    filters: NewsFilter = {}
  ): Promise<PaginatedResponse<News>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    // Add filter params
    if (filters.sources?.length)
      params.append("sources", filters.sources.join(","));
    if (filters.categories?.length)
      params.append("categories", filters.categories.join(","));
    if (filters.trading_pairs?.length)
      params.append("trading_pairs", filters.trading_pairs.join(","));
    if (filters.sentiment) params.append("sentiment", filters.sentiment);
    if (filters.ai_analyzed !== undefined)
      params.append("ai_analyzed", filters.ai_analyzed.toString());
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.min_score)
      params.append("min_score", filters.min_score.toString());
    if (filters.language) params.append("language", filters.language);

    const response = await fetch(`${API_BASE}/news/filter?${params}`);
    const data: NewsApiResponse<PaginatedResponse<News>> =
      await response.json();
    return (
      data.data || {
        items: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false,
        },
      }
    );
  }

  // Start crawler
  static async startCrawler(
    source: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/crawler/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source }),
    });
    return response.json();
  }

  // Stop crawler
  static async stopCrawler(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/crawler/stop`, {
      method: "POST",
    });
    return response.json();
  }

  // Get crawler status
  static async getCrawlerStatus(): Promise<CrawlerStatus> {
    const response = await fetch(`${API_BASE}/crawler/status`);
    const data: NewsApiResponse<CrawlerStatus> = await response.json();
    return (
      data.data || {
        is_running: false,
        active_jobs: 0,
        total_crawled: 0,
        sources: [],
      }
    );
  }

  // CronJob methods
  static async getCronJobStatus(): Promise<CronJobStatus> {
    const response = await fetch(`${API_BASE}/cronjob/status`);
    const data: NewsApiResponse<CronJobStatus> = await response.json();
    if (data.success) {
      return data.data!;
    }
    throw new Error(data.message || "Failed to get cron job status");
  }

  static async startCronJob(): Promise<void> {
    const response = await fetch(`${API_BASE}/cronjob/start`, {
      method: "POST",
    });
    const data: NewsApiResponse<void> = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to start cron job");
    }
  }

  static async stopCronJob(): Promise<void> {
    const response = await fetch(`${API_BASE}/cronjob/stop`, {
      method: "POST",
    });
    const data: NewsApiResponse<void> = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to stop cron job");
    }
  }

  static async triggerCronJobNow(): Promise<void> {
    const response = await fetch(`${API_BASE}/cronjob/trigger`, {
      method: "POST",
    });
    const data: NewsApiResponse<void> = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to trigger crawl");
    }
  }

  static async setCronJobInterval(interval: string): Promise<void> {
    const response = await fetch(`${API_BASE}/cronjob/interval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval }),
    });
    const data: NewsApiResponse<void> = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to set interval");
    }
  }

  // Analyze sentiment
  static async analyzeSentiment(newsId: string) {
    const response = await fetch(`${API_BASE}/ai/sentiment/${newsId}`, {
      method: "POST",
    });
    return response.json();
  }

  // Get analyzed news
  static async getAnalyzedNews(): Promise<News[]> {
    const response = await fetch(`${API_BASE}/ai/analyzed-news`);
    const data: NewsApiResponse<News[]> = await response.json();
    return data.data || [];
  }
}
