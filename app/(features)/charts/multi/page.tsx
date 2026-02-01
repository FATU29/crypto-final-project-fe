"use client";

import { useState, useRef, useCallback, useEffect, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Settings2, X } from "lucide-react";
import { TradingPair, ChartTimeframe } from "@/types/trading";
import { MOCK_TRADING_PAIRS, CHART_TIMEFRAMES } from "@/lib/constants/trading";
import PriceChart from "@/app/(features)/charts/PriceChart";

interface ChartConfig {
  id: string;
  pair: TradingPair;
  timeframe: ChartTimeframe;
}

export default function MultiChartPage() {
  const [charts, setCharts] = useState<ChartConfig[]>([
    {
      id: "1",
      pair: MOCK_TRADING_PAIRS[0], // BTC
      timeframe: CHART_TIMEFRAMES[3], // 1H
    },
  ]);

  const [editingChart, setEditingChart] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const chartDisconnectCallbacksRef = useRef<Map<string, () => void>>(
    new Map(),
  );

  const addChart = () => {
    if (charts.length >= 4) return;

    const newChart: ChartConfig = {
      id: Date.now().toString(),
      pair: MOCK_TRADING_PAIRS[0],
      timeframe: CHART_TIMEFRAMES[3],
    };
    setCharts([...charts, newChart]);
  };

  const removeChart = useCallback((id: string) => {
    // Call disconnect callback if exists
    const disconnectFn = chartDisconnectCallbacksRef.current.get(id);
    if (disconnectFn) {
      console.log(`🔌 Disconnecting chart ${id}`);
      disconnectFn();
      chartDisconnectCallbacksRef.current.delete(id);
    }
    setCharts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const registerChartDisconnect = useCallback(
    (id: string, disconnectFn: () => void) => {
      chartDisconnectCallbacksRef.current.set(id, disconnectFn);
    },
    [],
  );

  const updateChart = useCallback(
    (id: string, pair: TradingPair, timeframe: ChartTimeframe) => {
      setCharts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, pair, timeframe } : c)),
      );
      setEditingChart(null);
      setIsConfigOpen(false);
    },
    [],
  );

  const getGridClass = () => {
    switch (charts.length) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 lg:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-2";
      default:
        return "grid-cols-1";
    }
  };

  const getChartHeight = useCallback((index: number, total: number) => {
    // Keep height stable per position, not dependent on total count
    return total === 1 ? 500 : 350;
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Multi-Chart View</h1>
          <p className="text-muted-foreground mt-2">
            Monitor up to 4 trading pairs simultaneously
          </p>
        </div>
        <Button
          onClick={addChart}
          disabled={charts.length >= 4}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Chart ({charts.length}/4)
        </Button>
      </div>

      {/* Charts Grid */}
      {charts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="p-4 bg-muted rounded-full">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">No Charts Added</p>
              <p className="text-sm text-muted-foreground">
                Click &quot;Add Chart&quot; to start monitoring trading pairs
              </p>
            </div>
            <Button onClick={addChart} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Chart
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-4 ${getGridClass()}`}>
          {charts.map((chart, index) => (
            <Card key={chart.id} className="relative w-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {chart.pair.symbol} - {chart.timeframe.label}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Dialog
                      open={isConfigOpen && editingChart === chart.id}
                      onOpenChange={(open) => {
                        setIsConfigOpen(open);
                        if (open) {
                          setEditingChart(chart.id);
                        } else {
                          setEditingChart(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configure Chart</DialogTitle>
                          <DialogDescription>
                            Select trading pair and timeframe
                          </DialogDescription>
                        </DialogHeader>
                        <ChartConfigForm
                          chart={chart}
                          onSave={(pair, timeframe) =>
                            updateChart(chart.id, pair, timeframe)
                          }
                          onCancel={() => {
                            setEditingChart(null);
                            setIsConfigOpen(false);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => removeChart(chart.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {chart.pair.name}
                </p>
              </CardHeader>
              <CardContent className="overflow-hidden w-full">
                <ChartWrapper
                  chartId={chart.id}
                  symbol={chart.pair.symbol}
                  interval={chart.timeframe.interval}
                  height={getChartHeight(index, charts.length)}
                  onRegisterDisconnect={registerChartDisconnect}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

interface ChartConfigFormProps {
  chart: ChartConfig;
  onSave: (pair: TradingPair, timeframe: ChartTimeframe) => void;
  onCancel: () => void;
}

interface ChartWrapperProps {
  chartId: string;
  symbol: string;
  interval: string;
  height: number;
  onRegisterDisconnect: (id: string, disconnectFn: () => void) => void;
}

const ChartWrapper = memo(
  function ChartWrapper({
    chartId,
    symbol,
    interval,
    height,
    onRegisterDisconnect,
  }: ChartWrapperProps) {
    const disconnectRef = useRef<(() => void) | null>(null);

    // Register disconnect callback when component mounts or when disconnect function changes
    useEffect(() => {
      if (disconnectRef.current) {
        onRegisterDisconnect(chartId, disconnectRef.current);
      }
    }, [chartId, onRegisterDisconnect]);

    const handleDisconnectRegister = useCallback(
      (disconnectFn: () => void) => {
        disconnectRef.current = disconnectFn;
        onRegisterDisconnect(chartId, disconnectFn);
      },
      [chartId, onRegisterDisconnect],
    );

    return (
      <div className="w-full min-w-0">
        <PriceChart
          symbol={symbol}
          interval={interval}
          height={height}
          onDisconnectReady={handleDisconnectRegister}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if these props actually change
    return (
      prevProps.chartId === nextProps.chartId &&
      prevProps.symbol === nextProps.symbol &&
      prevProps.interval === nextProps.interval &&
      prevProps.height === nextProps.height
    );
  },
);

function ChartConfigForm({ chart, onSave, onCancel }: ChartConfigFormProps) {
  const [selectedPair, setSelectedPair] = useState(chart.pair);
  const [selectedTimeframe, setSelectedTimeframe] = useState(chart.timeframe);

  return (
    <div className="space-y-6">
      {/* Trading Pair Selection */}
      <div className="space-y-2">
        <Label htmlFor="pair">Trading Pair</Label>
        <Select
          value={selectedPair.symbol}
          onValueChange={(value) => {
            const pair = MOCK_TRADING_PAIRS.find((p) => p.symbol === value);
            if (pair) setSelectedPair(pair);
          }}
        >
          <SelectTrigger id="pair">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {MOCK_TRADING_PAIRS.map((pair) => (
              <SelectItem key={pair.symbol} value={pair.symbol}>
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{pair.symbol}</span>
                  <span className="text-xs text-muted-foreground ml-4">
                    {pair.name}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeframe Selection */}
      <div className="space-y-2">
        <Label htmlFor="timeframe">Timeframe</Label>
        <Select
          value={selectedTimeframe.value}
          onValueChange={(value) => {
            const timeframe = CHART_TIMEFRAMES.find((t) => t.value === value);
            if (timeframe) setSelectedTimeframe(timeframe);
          }}
        >
          <SelectTrigger id="timeframe">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHART_TIMEFRAMES.map((tf) => (
              <SelectItem key={tf.value} value={tf.value}>
                {tf.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(selectedPair, selectedTimeframe)}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
