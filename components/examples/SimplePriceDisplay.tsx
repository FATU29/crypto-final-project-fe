/**
 * Example Component: Simple Bitcoin Price Display
 *
 * Copy and paste this into any page to quickly display live Bitcoin price
 * Location: /fe/components/examples/SimplePriceDisplay.tsx
 */

"use client";

import { useBackendPrice } from "@/hooks";

export function SimplePriceDisplay() {
  const { price, isConnected } = useBackendPrice({
    symbol: "BTCUSDT",
  });

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Bitcoin Price</h3>
      <p className="text-3xl font-bold">
        ${price ? parseFloat(price).toFixed(2) : "Loading..."}
      </p>
      <p className="text-sm text-muted-foreground">
        {isConnected ? "🟢 Live" : "🔴 Disconnected"}
      </p>
    </div>
  );
}

/**
 * Example Component: Multi-Symbol Price Card
 *
 * Display multiple cryptocurrency prices in a card layout
 */

export function MultiSymbolPriceCard() {
  const btc = useBackendPrice({ symbol: "BTCUSDT" });
  const eth = useBackendPrice({ symbol: "ETHUSDT" });
  const bnb = useBackendPrice({ symbol: "BNBUSDT" });

  const coins = [
    { name: "Bitcoin", symbol: "BTC", data: btc },
    { name: "Ethereum", symbol: "ETH", data: eth },
    { name: "BNB", symbol: "BNB", data: bnb },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {coins.map((coin) => (
        <div key={coin.symbol} className="p-4 border rounded-lg">
          <h4 className="font-semibold">{coin.name}</h4>
          <p className="text-2xl font-bold">
            ${coin.data.price ? parseFloat(coin.data.price).toFixed(2) : "---"}
          </p>
          <p className="text-xs text-muted-foreground">
            {coin.data.isConnected ? "🟢 Live" : "🔴 Offline"}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * Example Component: Price with Update Callback
 *
 * Track price changes and display statistics
 */

import { useState } from "react";
import { PriceUpdatePayload } from "@/lib/socket";

export function PriceWithStats() {
  const [updateCount, setUpdateCount] = useState(0);
  const [highestPrice, setHighestPrice] = useState<number>(0);

  const { price, isConnected, timestamp } = useBackendPrice({
    symbol: "BTCUSDT",
    onUpdate: (data: PriceUpdatePayload) => {
      setUpdateCount((prev) => prev + 1);
      const currentPrice = parseFloat(data.price);
      if (currentPrice > highestPrice) {
        setHighestPrice(currentPrice);
      }
    },
  });

  return (
    <div className="p-4 border rounded-lg space-y-2">
      <h3 className="text-lg font-semibold">Bitcoin Statistics</h3>

      <div>
        <p className="text-sm text-muted-foreground">Current Price</p>
        <p className="text-2xl font-bold">
          ${price ? parseFloat(price).toFixed(2) : "---"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Highest</p>
          <p className="font-semibold">${highestPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Updates</p>
          <p className="font-semibold">{updateCount}</p>
        </div>
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          Status: {isConnected ? "🟢 Live" : "🔴 Disconnected"}
        </p>
        {timestamp && (
          <p className="text-xs text-muted-foreground">
            Last update: {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Example Component: Conditional Connection
 *
 * Enable/disable connection based on user preference
 */

export function ConditionalPriceDisplay() {
  const [enabled, setEnabled] = useState(false);

  const { price, isConnected } = useBackendPrice({
    symbol: "BTCUSDT",
    enabled, // Only connect when enabled
  });

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Bitcoin Price</h3>
        <button
          onClick={() => setEnabled(!enabled)}
          className="px-3 py-1 text-sm border rounded"
        >
          {enabled ? "Disconnect" : "Connect"}
        </button>
      </div>

      <div>
        <p className="text-3xl font-bold">
          {enabled
            ? price
              ? `$${parseFloat(price).toFixed(2)}`
              : "Loading..."
            : "Not connected"}
        </p>
        <p className="text-sm text-muted-foreground">
          {enabled
            ? isConnected
              ? "🟢 Live updates"
              : "🟡 Connecting..."
            : "🔴 Disconnected"}
        </p>
      </div>
    </div>
  );
}

/**
 * Usage in a page:
 *
 * import { SimplePriceDisplay } from '@/components/examples/SimplePriceDisplay';
 *
 * export default function MyPage() {
 *   return (
 *     <div>
 *       <h1>My Trading Dashboard</h1>
 *       <SimplePriceDisplay />
 *     </div>
 *   );
 * }
 */
