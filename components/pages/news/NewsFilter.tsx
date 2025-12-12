"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface NewsFilterProps {
  onFilterChange: (sentiment: string, source: string) => void;
  sources: string[];
  selectedSentiment: string;
  selectedSource: string;
}

export function NewsFilter({
  onFilterChange,
  sources,
  selectedSentiment,
  selectedSource,
}: NewsFilterProps) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-2">
        <Label htmlFor="sentiment-filter">Sentiment</Label>
        <Select
          value={selectedSentiment}
          onValueChange={(value) => onFilterChange(value, selectedSource)}
        >
          <SelectTrigger id="sentiment-filter" className="w-40">
            <SelectValue placeholder="All sentiments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="positive">Bullish</SelectItem>
            <SelectItem value="negative">Bearish</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="source-filter">Source</Label>
        <Select
          value={selectedSource}
          onValueChange={(value) => onFilterChange(selectedSentiment, value)}
        >
          <SelectTrigger id="source-filter" className="w-48">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map((source) => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
