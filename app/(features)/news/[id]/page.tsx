"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NewsAPI } from "@/lib/services/news-api";
import { useFetchArticleDetail } from "@/hooks/use-news";
import { News } from "@/types/news";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CausalAnalysisCard } from "@/components/news/CausalAnalysisCard";
import sanitizeHtml from "sanitize-html";

dayjs.extend(relativeTime);

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchDetail, loading: fetchingDetail } = useFetchArticleDetail();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const id = params.id as string;
        const data = await NewsAPI.getById(id);
        setNews(data);

        // Auto-fetch full article detail immediately if content is missing or too short
        if (
          data &&
          (!data.content || data.content.length < 500) &&
          data.source_url
        ) {
          // Auto fetch detail immediately with better error handling
          try {
            const fullArticle = await fetchDetail(data.id);
            if (fullArticle) {
              setNews(fullArticle);
            } else {
              console.warn(
                "Failed to fetch full article, showing summary only"
              );
            }
          } catch (fetchErr) {
            console.error("Error fetching article detail:", fetchErr);
            // Continue with partial data instead of failing completely
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load news");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [params.id, fetchDetail]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Skeleton className="h-8 w-20 mb-6" />
        <div className="space-y-6">
          {/* Title skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>

          {/* Meta info skeleton */}
          <div className="flex gap-3">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>

          {/* Image skeleton */}
          <Skeleton className="h-96 w-full rounded-lg" />

          {/* Summary skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
          </div>

          {/* Content skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error || "News not found"}</p>
        </div>
      </div>
    );
  }

  const hasFullContent = news.content && news.content.length > 500;
  const canAnalyze = hasFullContent && !fetchingDetail;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <article className="space-y-6">
        {/* Header */}
        <div>
          <h1
            className="text-4xl font-bold mb-4"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(news.title, {
                allowedTags: ["b", "strong", "em", "i", "u", "span"],
                allowedAttributes: {},
              }),
            }}
          />

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
            {/* Source */}
            <Badge variant="outline">{news.source}</Badge>

            {/* Author */}
            {news.author && <span>By {news.author}</span>}

            {/* Date */}
            <span>{dayjs(news.published_at).format("MMMM D, YYYY")}</span>
            <span className="text-gray-400">
              ({dayjs(news.published_at).fromNow()})
            </span>
          </div>
        </div>

        {/* Fetching Detail Banner */}
        {fetchingDetail && (
          <div className="sticky top-4 z-10 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-sm text-blue-800 font-medium">
                Fetching full article content from source... This may take up to
                30 seconds.
              </p>
            </div>
          </div>
        )}

        {/* Image */}
        {news.image_url && (
          <div className="relative h-96 w-full overflow-hidden rounded-lg">
            <Image
              src={news.image_url}
              alt={news.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Summary */}
        {news.summary && (
          <div
            className="rounded-lg bg-gray-50 p-4 prose prose-lg max-w-none"
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
                  "ul",
                  "ol",
                  "li",
                  "span",
                  "div",
                ],
                allowedAttributes: {
                  a: ["href", "target", "rel"],
                },
              }),
            }}
          />
        )}

        {/* Causal Analysis - Only show if we have full content */}
        {news.related_pairs && news.related_pairs.length > 0 && canAnalyze && (
          <div className="mt-6">
            <CausalAnalysisCard
              news={news}
              symbol={news.related_pairs[0].toUpperCase()}
              onAnalysisComplete={(result) => {
                console.log("Causal analysis completed:", result);
              }}
            />
          </div>
        )}

        {/* Causal Analysis - Show message if content not ready */}
        {news.related_pairs && news.related_pairs.length > 0 && !canAnalyze && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              {fetchingDetail
                ? "Loading full content for causal analysis..."
                : "Please load full content to use causal analysis"}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="prose max-w-none">
          {fetchingDetail && !news.content ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : news.content ? (
            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(news.content, {
                  allowedTags: [
                    "p",
                    "br",
                    "strong",
                    "em",
                    "b",
                    "i",
                    "u",
                    "a",
                    "ul",
                    "ol",
                    "li",
                    "h1",
                    "h2",
                    "h3",
                    "h4",
                    "h5",
                    "h6",
                    "blockquote",
                    "pre",
                    "code",
                    "img",
                    "figure",
                    "figcaption",
                    "div",
                    "span",
                    "hr",
                  ],
                  allowedAttributes: {
                    a: ["href", "target", "rel"],
                    img: ["src", "alt", "width", "height", "class"],
                    figure: ["class"],
                    div: ["class"],
                    span: ["class"],
                  },
                }),
              }}
            />
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500">
                Article content is being loaded...
              </p>
            </div>
          )}
        </div>

        {/* Tags */}
        {news.tags && news.tags.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Tags:</p>
            <div className="flex flex-wrap gap-2">
              {news.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Source Link */}
        <div className="pt-4 border-t">
          <a
            href={news.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Read original article on {news.source} →
          </a>
        </div>
      </article>
    </div>
  );
}
