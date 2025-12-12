import { SentimentCard } from "@/components/pages";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SentimentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI Sentiment Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced AI-powered analysis of news and price correlations
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="news-sentiment">News Sentiment</TabsTrigger>
            <TabsTrigger value="price-correlation">
              Price Correlation
            </TabsTrigger>
            <TabsTrigger value="causal-analysis">Causal Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <SentimentCard
                title="Overall Market Sentiment"
                score={0.68}
                description="Based on 1,234 news articles analyzed in the last 24h"
              />
              <SentimentCard
                title="BTC Sentiment"
                score={0.75}
                description="Bitcoin showing strong positive sentiment"
              />
              <SentimentCard
                title="ETH Sentiment"
                score={0.42}
                description="Ethereum showing neutral to positive sentiment"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Trend (24h)</CardTitle>
                <CardDescription>
                  How market sentiment has changed over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-75 flex items-center justify-center text-muted-foreground">
                  Sentiment trend chart will be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news-sentiment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>News Sentiment Analysis</CardTitle>
                <CardDescription>
                  AI-powered sentiment analysis of cryptocurrency news from
                  multiple sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Analysis includes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>
                      Multi-source news aggregation (CoinDesk, CoinTelegraph,
                      Bloomberg, etc.)
                    </li>
                    <li>Automatic structure learning for HTML parsing</li>
                    <li>Real-time sentiment scoring using AI models</li>
                    <li>Historical sentiment tracking and trends</li>
                  </ul>
                  <div className="h-100 flex items-center justify-center text-muted-foreground border rounded-lg">
                    Detailed news sentiment analysis will be displayed here
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="price-correlation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>News-Price Correlation</CardTitle>
                <CardDescription>
                  Alignment of news sentiment with historical price movements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This analysis combines:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>
                      Historical price data from Binance and other exchanges
                    </li>
                    <li>Time-aligned news sentiment scores</li>
                    <li>Correlation patterns and strength indicators</li>
                    <li>Predictive insights based on sentiment shifts</li>
                  </ul>
                  <div className="h-100 flex items-center justify-center text-muted-foreground border rounded-lg">
                    Price correlation analysis chart will be displayed here
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="causal-analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Causal Analysis (Advanced)</CardTitle>
                <CardDescription>
                  Understanding the why behind price movements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Recent Insights</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                        <div>
                          <p className="font-medium">
                            Price UP 5.2% (Last 24h)
                          </p>
                          <p className="text-muted-foreground">
                            Reason: Strong positive news sentiment (+0.78) from
                            SEC approval rumors and institutional buying
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5" />
                        <div>
                          <p className="font-medium">
                            Price DOWN 3.1% (2 days ago)
                          </p>
                          <p className="text-muted-foreground">
                            Reason: Negative sentiment (-0.62) due to regulatory
                            concerns in major markets
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-75 flex items-center justify-center text-muted-foreground border rounded-lg">
                    Causal relationship visualization will be displayed here
                  </div>

                  <p className="text-xs text-muted-foreground">
                    * Causal analysis uses advanced AI models to identify
                    potential cause-effect relationships between news events and
                    price movements
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
