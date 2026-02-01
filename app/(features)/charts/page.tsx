"use client";

import { useState } from "react";
import Link from "next/link";
import { ChartContainer } from "@/components/pages/charts/ChartContainer";
import { MOCK_TRADING_PAIRS } from "@/lib/constants/trading";
import { PairSelector } from "@/components/charts/PairSelector";
import { AiPredictionPanel } from "@/components/charts/AiPredictionPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Activity, BarChart3, Grid3x3 } from "lucide-react";

export default function ChartsPage() {
  const [selectedPair, setSelectedPair] = useState(MOCK_TRADING_PAIRS[0]);
  const [selectedSymbol, setSelectedSymbol] = useState(
    MOCK_TRADING_PAIRS[0].symbol,
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Price Charts
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time cryptocurrency price analysis from Binance
          </p>
        </div>
        <div className="flex gap-2">
          <PairSelector
            value={selectedSymbol}
            onChange={(pair) => {
              setSelectedPair(pair);
              setSelectedSymbol(pair.symbol);
            }}
            pairs={MOCK_TRADING_PAIRS}
          />
          <Button asChild variant="outline" className="gap-2">
            <Link href="/charts/multi">
              <Grid3x3 className="h-4 w-4" />
              Multi-Chart
            </Link>
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Live Data</p>
                <p className="text-lg font-bold">WebSocket</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exchange</p>
                <p className="text-lg font-bold">Binance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timeframes</p>
                <p className="text-lg font-bold">7 Options</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart and AI Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartContainer pair={selectedPair} />
        </div>
        <div className="lg:col-span-1">
          <AiPredictionPanel symbol={selectedSymbol} />
        </div>
      </div>

      {/* Additional Info */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-3">Chart Features</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-primary rounded-full"></span>
              Real-time price updates via WebSocket
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-primary rounded-full"></span>
              Historical data from Binance API
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-primary rounded-full"></span>
              Multiple timeframes (1m to 1w)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-primary rounded-full"></span>
              Volume indicator
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-primary rounded-full"></span>
              Candlestick chart with OHLC data
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-primary rounded-full"></span>
              Responsive and interactive
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
