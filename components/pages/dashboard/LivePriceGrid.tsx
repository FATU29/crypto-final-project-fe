"use client";

import { BackendPriceTile } from "@/components/common/BackendPriceTile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp } from "lucide-react";

export function LivePriceGrid() {
  const symbols = [
    { symbol: "BTCUSDT", name: "Bitcoin" },
    { symbol: "ETHUSDT", name: "Ethereum" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Live Prices from Backend
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Real-time prices streamed from Binance via NestJS backend WebSocket
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {symbols.map((item) => (
            <BackendPriceTile
              key={item.symbol}
              symbol={item.symbol}
              name={item.name}
              enabled={true}
            />
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">
                Backend Integration Active
              </h4>
              <p className="text-xs text-muted-foreground">
                Connected to NestJS backend at{" "}
                <code className="px-1 py-0.5 bg-background rounded">
                  {process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000"}
                </code>
              </p>
              <p className="text-xs text-muted-foreground">
                Price updates are received through Socket.IO from the{" "}
                <code className="px-1 py-0.5 bg-background rounded">
                  /prices
                </code>{" "}
                namespace
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
