import React from "react";
import {
  fetchOHLCV,
  type Candle,
  type Timeframe,
  symbolToDisplay,
} from "@/lib/exchanges";
import PriceChart from "./(features)/charts/PriceChart";
import NewsList, { type NewsItem } from "./(features)/news/NewsList";

export const dynamic = "force-dynamic";

const DEFAULT_SYMBOL = "BTC/USDT";
const DEFAULT_TIMEFRAME: Timeframe = "1h";

async function getCandles(): Promise<Candle[]> {
  return await fetchOHLCV({
    symbol: DEFAULT_SYMBOL,
    timeframe: DEFAULT_TIMEFRAME,
    limit: 200,
  });
}

async function getNews(): Promise<NewsItem[]> {
  // Placeholder: in production, fetch from your backend aggregator.
  return [
    {
      id: "sample-1",
      title: "Sample news item about BTC",
      link: "https://example.com",
      published: new Date().toISOString(),
      summary: "<p>Demo summary… integrate RSS and crawler later.</p>",
      source: "Demo",
    },
  ];
}

export default async function Page() {
  const [candles, news] = await Promise.all([getCandles(), getNews()]);
  const displaySymbol = symbolToDisplay(DEFAULT_SYMBOL);

  return (
    <main className="container mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Crypto Dashboard</h1>
        <div className="text-sm text-gray-500">
          Pair: {displaySymbol} · TF: {DEFAULT_TIMEFRAME}
        </div>
      </header>

      <section>
        <PriceChart
          candles={candles}
          symbol={displaySymbol}
          timeframe={DEFAULT_TIMEFRAME}
        />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Latest News</h2>
        <NewsList items={news} />
      </section>
    </main>
  );
}
