// components/news/trading-pair-selector.tsx

"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TradingPairSelectorProps {
  selectedPairs: string[];
  onPairsChange: (pairs: string[]) => void;
  multiple?: boolean;
}

const POPULAR_PAIRS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "SOLUSDT",
  "DOGEUSDT",
  "DOTUSDT",
  "MATICUSDT",
  "AVAXUSDT",
  "LINKUSDT",
  "LTCUSDT",
  "XLMUSDT",
  "TRXUSDT",
  "ATOMUSDT",
  "UNIUSDT",
  "VETUSDT",
  "ICPUSDT",
  "FILUSDT",
  "NEARUSDT",
];

export function TradingPairSelector({
  selectedPairs,
  onPairsChange,
  multiple = true,
}: TradingPairSelectorProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddPair = (pair: string) => {
    if (!selectedPairs.includes(pair)) {
      if (multiple) {
        onPairsChange([...selectedPairs, pair]);
      } else {
        onPairsChange([pair]);
      }
    }
    setInputValue("");
  };

  const handleRemovePair = (pair: string) => {
    onPairsChange(selectedPairs.filter((p) => p !== pair));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const pair = inputValue.trim().toUpperCase();
      if (pair.length >= 6 && pair.endsWith("USDT")) {
        handleAddPair(pair);
      }
    }
  };

  const availablePairs = POPULAR_PAIRS.filter(
    (pair) => !selectedPairs.includes(pair)
  );

  return (
    <div className="space-y-3">
      {/* Selected Pairs */}
      {selectedPairs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPairs.map((pair) => (
            <Badge
              key={pair}
              variant="secondary"
              className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1"
            >
              {pair}
              <button
                onClick={() => handleRemovePair(pair)}
                className="ml-2 hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input/Select */}
      <div className="flex gap-2">
        <Select
          value=""
          onValueChange={(value) => {
            if (value) handleAddPair(value);
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select trading pair" />
          </SelectTrigger>
          <SelectContent>
            {availablePairs.map((pair) => (
              <SelectItem key={pair} value={pair}>
                {pair}
              </SelectItem>
            ))}
            {availablePairs.length === 0 && (
              <SelectItem value="" disabled>
                All pairs selected
              </SelectItem>
            )}
          </SelectContent>
        </Select>

     
      </div>

      {/* Quick Add Popular Pairs */}
      {selectedPairs.length === 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_PAIRS.slice(0, 5).map((pair) => (
              <Button
                key={pair}
                variant="outline"
                size="sm"
                onClick={() => handleAddPair(pair)}
                className="text-xs"
              >
                + {pair}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

