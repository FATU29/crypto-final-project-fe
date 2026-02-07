"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Newspaper } from "lucide-react";

interface NewsToggleProps {
  enabled: boolean;
  onToggle: () => void;
  markerCount?: number;
  isLoading?: boolean;
}

export function NewsToggle({
  enabled,
  onToggle,
  markerCount = 0,
  isLoading = false,
}: NewsToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={enabled ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={onToggle}
            disabled={isLoading}
          >
            <Newspaper className={`h-4 w-4 ${isLoading ? "animate-pulse" : ""}`} />
            News
            {enabled && markerCount > 0 && (
              <span className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-bold">
                {markerCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {enabled
              ? "Hide news events on chart"
              : "Show news events as markers on chart"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
