'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { TradingPair } from '@/types';
import { MOCK_TRADING_PAIRS } from '@/lib/constants/trading';

interface PairSelectorProps {
  value?: string;
  onChange?: (pair: TradingPair) => void;
  pairs?: TradingPair[];
}

export function PairSelector({ 
  value, 
  onChange,
  pairs = MOCK_TRADING_PAIRS 
}: PairSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(value || pairs[0]?.symbol);

  const selectedPair = pairs.find((pair) => pair.symbol === selectedSymbol);

  const handleSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    setOpen(false);
    const pair = pairs.find((p) => p.symbol === symbol);
    if (pair && onChange) {
      onChange(pair);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-70 justify-between"
        >
          {selectedPair ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{selectedPair.symbol}</span>
                <span className="text-xs text-muted-foreground">
                  {selectedPair.name}
                </span>
              </div>
              {selectedPair.price && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">${selectedPair.price.toLocaleString()}</span>
                  {selectedPair.change24h !== undefined && (
                    <span
                      className={cn(
                        'text-xs flex items-center gap-1',
                        selectedPair.change24h >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      )}
                    >
                      {selectedPair.change24h >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(selectedPair.change24h)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            'Select pair...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-70 p-0">
        <Command>
          <CommandInput placeholder="Search pair..." />
          <CommandList>
            <CommandEmpty>No pair found.</CommandEmpty>
            <CommandGroup>
              {pairs.map((pair) => (
                <CommandItem
                  key={pair.symbol}
                  value={pair.symbol}
                  onSelect={() => handleSelect(pair.symbol)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedSymbol === pair.symbol ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium">{pair.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {pair.name}
                      </span>
                    </div>
                    {pair.price && (
                      <div className="flex flex-col items-end">
                        <span className="text-sm">${pair.price.toLocaleString()}</span>
                        {pair.change24h !== undefined && (
                          <span
                            className={cn(
                              'text-xs',
                              pair.change24h >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            )}
                          >
                            {pair.change24h >= 0 ? '+' : ''}
                            {pair.change24h}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
