// components/news/news-filter.tsx

"use client";

import { useState } from "react";
import { NewsFilter } from "@/types/news";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TradingPairSelector } from "./trading-pair-selector";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface NewsFilterProps {
  onFilterChange: (filters: NewsFilter) => void;
}

export function NewsFilterComponent({ onFilterChange }: NewsFilterProps) {
  const [filters, setFilters] = useState<NewsFilter>({});

  // Auto-apply filters when changed
  const updateFilters = (newFilters: NewsFilter) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = 
    (filters.trading_pairs && filters.trading_pairs.length > 0) ||
    filters.sentiment !== undefined ||
    (filters.sources && filters.sources.length > 0) ||
    filters.parsing_method !== undefined ||
    filters.ai_analyzed !== undefined;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button 
            onClick={handleReset} 
            variant="ghost" 
            size="sm"
            className="h-8 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Trading Pair Filter */}
        <div>
          <Label className="mb-2 block text-sm font-medium">
            Trading Pairs
          </Label>
          <TradingPairSelector
            selectedPairs={filters.trading_pairs || []}
            onPairsChange={(pairs) =>
              updateFilters({
                ...filters,
                trading_pairs: pairs.length > 0 ? pairs : undefined,
              })
            }
          />
          <p className="mt-1 text-xs text-gray-500">
            Filter news by specific trading pairs
          </p>
        </div>

        {/* Sentiment Filter */}
        <div>
          <Label className="mb-2 block text-sm font-medium">Sentiment</Label>
          <Select
            value={filters.sentiment || "all"}
            onValueChange={(value) =>
              updateFilters({
                ...filters,
                sentiment:
                  value === "all"
                    ? undefined
                    : (value as "positive" | "negative" | "neutral"),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All sentiments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="positive">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Positive
                </span>
              </SelectItem>
              <SelectItem value="neutral">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                  Neutral
                </span>
              </SelectItem>
              <SelectItem value="negative">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  Negative
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-gray-500">
            Filter by AI sentiment analysis
          </p>
        </div>

        {/* Source Filter - Simplified */}
        <div>
          <Label className="mb-2 block text-sm font-medium">News Source</Label>
          <Select
            value={filters.sources?.[0] || "all"}
            onValueChange={(value) =>
              updateFilters({
                ...filters,
                sources: value === "all" ? undefined : [value],
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="cointelegraph">CoinTelegraph</SelectItem>
              <SelectItem value="coindesk">CoinDesk</SelectItem>
              <SelectItem value="binance">Binance News</SelectItem>
              <SelectItem value="cryptonews">CryptoNews</SelectItem>
              <SelectItem value="coinmarketcap">CoinMarketCap</SelectItem>
              <SelectItem value="bitcoincom">Bitcoin.com</SelectItem>
              <SelectItem value="theblock">The Block</SelectItem>
              <SelectItem value="decrypt">Decrypt</SelectItem>
              <SelectItem value="utoday">U.Today</SelectItem>
              <SelectItem value="cryptoslate">CryptoSlate</SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-gray-500">
            Filter by news publisher
          </p>
        </div>

        {/* Parsing Method Filter */}
        <div>
          <Label className="mb-2 block text-sm font-medium">Content Parsing</Label>
          <Select
            value={filters.parsing_method || "all"}
            onValueChange={(value) =>
              updateFilters({
                ...filters,
                parsing_method: value === "all" ? undefined : (value as "rule-based" | "ai" | "fallback"),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All parsing methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="ai">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  AI Parsed
                </span>
              </SelectItem>
              <SelectItem value="rule-based">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  Rule-based
                </span>
              </SelectItem>
              <SelectItem value="fallback">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                  Fallback
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-gray-500">
            Filter by content extraction method
          </p>
        </div>

        {/* AI Analyzed Filter */}
        <div>
          <Label className="mb-2 block text-sm font-medium">AI Analysis</Label>
          <Select
            value={filters.ai_analyzed === undefined ? "all" : filters.ai_analyzed ? "analyzed" : "not-analyzed"}
            onValueChange={(value) =>
              updateFilters({
                ...filters,
                ai_analyzed: value === "all" ? undefined : value === "analyzed",
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All articles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Articles</SelectItem>
              <SelectItem value="analyzed">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  AI Analyzed
                </span>
              </SelectItem>
              <SelectItem value="not-analyzed">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                  Not Analyzed
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-gray-500">
            Filter by AI analysis status
          </p>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-3 border-t">
            <Label className="mb-2 block text-xs font-medium text-gray-600">
              Active Filters
            </Label>
            <div className="flex flex-wrap gap-2">
              {filters.sentiment && (
                <Badge variant="secondary" className="text-xs">
                  {filters.sentiment}
                </Badge>
              )}
              {filters.sources && filters.sources.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {filters.sources[0]}
                </Badge>
              )}
              {filters.parsing_method && (
                <Badge variant="secondary" className="text-xs">
                  {filters.parsing_method === "ai" ? "🤖 AI" : filters.parsing_method}
                </Badge>
              )}
              {filters.ai_analyzed !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {filters.ai_analyzed ? "✅ Analyzed" : "⏳ Not Analyzed"}
                </Badge>
              )}
              {filters.trading_pairs && filters.trading_pairs.length > 0 && (
                filters.trading_pairs.map((pair) => (
                  <Badge key={pair} variant="secondary" className="text-xs">
                    {pair}
                  </Badge>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
