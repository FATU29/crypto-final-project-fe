"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LineChart } from "lucide-react";
import {
  INDICATOR_PRESETS,
  IndicatorKey,
} from "@/lib/utils/indicators";

interface IndicatorSelectorProps {
  activeIndicators: IndicatorKey[];
  onToggle: (key: IndicatorKey) => void;
}

export function IndicatorSelector({
  activeIndicators,
  onToggle,
}: IndicatorSelectorProps) {
  const maIndicators = (
    Object.entries(INDICATOR_PRESETS) as [IndicatorKey, (typeof INDICATOR_PRESETS)[IndicatorKey]][]
  ).filter(([, config]) => config.type === "MA");

  const emaIndicators = (
    Object.entries(INDICATOR_PRESETS) as [IndicatorKey, (typeof INDICATOR_PRESETS)[IndicatorKey]][]
  ).filter(([, config]) => config.type === "EMA");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <LineChart className="h-4 w-4" />
          Indicators
          {activeIndicators.length > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              {activeIndicators.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Technical Indicators</h4>

          {/* MA Section */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">
              Moving Average (MA)
            </p>
            {maIndicators.map(([key, config]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <Label htmlFor={key} className="text-sm cursor-pointer">
                    {config.label}
                  </Label>
                </div>
                <Switch
                  id={key}
                  checked={activeIndicators.includes(key)}
                  onCheckedChange={() => onToggle(key)}
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* EMA Section */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">
              Exponential Moving Average (EMA)
            </p>
            {emaIndicators.map(([key, config]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <Label htmlFor={key} className="text-sm cursor-pointer">
                    {config.label}
                  </Label>
                </div>
                <Switch
                  id={key}
                  checked={activeIndicators.includes(key)}
                  onCheckedChange={() => onToggle(key)}
                />
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
