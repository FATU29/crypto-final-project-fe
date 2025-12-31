// components/news/news-filter.tsx

"use client";

import { useState } from "react";
import { NewsFilter } from "@/types/news";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TradingPairSelector } from "./trading-pair-selector";
import { Switch } from "@/components/ui/switch";

interface NewsFilterProps {
  onFilterChange: (filters: NewsFilter) => void;
}

export function NewsFilterComponent({ onFilterChange }: NewsFilterProps) {
  const [filters, setFilters] = useState<NewsFilter>({});
  const [autoApply, setAutoApply] = useState(true);

  const handleApply = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  // Auto-apply when autoApply is enabled
  const updateFilters = (newFilters: NewsFilter) => {
    setFilters(newFilters);
    if (autoApply) {
      onFilterChange(newFilters);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-4 text-lg font-semibold">Filters</h3>

      <div className="space-y-4">
        {/* Trading Pair */}
        <div>
          <Label className="mb-1 block text-sm font-medium">
            Trading Pairs
          </Label>
          <TradingPairSelector
            selectedPairs={filters.trading_pairs || []}
            onPairsChange={(pairs) =>
              updateFilters({
                ...filters,
                trading_pairs: pairs,
              })
            }
          />
        </div>

        {/* Sentiment */}
        <div>
          <Label className="mb-1 block text-sm font-medium">Sentiment</Label>
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
              <SelectValue placeholder="Select sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* AI Analyzed */}
        <div>
          <Label className="mb-1 block text-sm font-medium">AI Analyzed</Label>
          <Select
            value={filters.ai_analyzed?.toString() || "all"}
            onValueChange={(value) =>
              updateFilters({
                ...filters,
                ai_analyzed: value === "all" ? undefined : value === "true",
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Analyzed</SelectItem>
              <SelectItem value="false">Not analyzed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Source */}
        <div>
          <Label className="mb-1 block text-sm font-medium">Source</Label>
          <Input
            type="text"
            placeholder="cointelegraph, coindesk"
            value={filters.sources?.join(",") || ""}
            onChange={(e) =>
              updateFilters({
                ...filters,
                sources: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>

        {/* Auto-apply toggle */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Switch
            id="auto-apply"
            checked={autoApply}
            onCheckedChange={setAutoApply}
          />
          <Label htmlFor="auto-apply" className="text-sm text-gray-600">
            Auto-apply filters
          </Label>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {!autoApply && (
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          )}
          <Button
            onClick={handleReset}
            variant="outline"
            className={autoApply ? "w-full" : ""}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
