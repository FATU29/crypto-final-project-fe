"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BrainCircuit } from "lucide-react";

interface PredictionLineToggleProps {
  enabled: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  isVip?: boolean;
}

export function PredictionLineToggle({
  enabled,
  onToggle,
  isLoading = false,
  isVip = false,
}: PredictionLineToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={enabled ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={onToggle}
            disabled={isLoading || !isVip}
          >
            <BrainCircuit
              className={`h-4 w-4 ${isLoading ? "animate-pulse" : ""}`}
            />
            AI Line
            {!isVip && (
              <span className="ml-1 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-500">
                VIP
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {!isVip
              ? "Upgrade to VIP to use AI prediction line"
              : enabled
                ? "Hide AI prediction line on chart"
                : "Show AI-predicted price line on chart"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
