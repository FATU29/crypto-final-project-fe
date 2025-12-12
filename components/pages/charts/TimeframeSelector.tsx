"use client";

import { Button } from "@/components/ui/button";
import { ChartTimeframe } from "@/types/trading";

interface TimeframeSelectorProps {
  timeframes: ChartTimeframe[];
  selected: ChartTimeframe;
  onSelect: (timeframe: ChartTimeframe) => void;
}

export function TimeframeSelector({
  timeframes,
  selected,
  onSelect,
}: TimeframeSelectorProps) {
  return (
    <div className="flex gap-1">
      {timeframes.map((timeframe) => (
        <Button
          key={timeframe.value}
          variant={selected.value === timeframe.value ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(timeframe)}
          className="min-w-12"
        >
          {timeframe.label}
        </Button>
      ))}
    </div>
  );
}
