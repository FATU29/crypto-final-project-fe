import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  Newspaper,
  Brain,
  BarChart3,
  ArrowRight,
  Radio,
  Database,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-linear-to-b from-background to-muted/20">
        <div className="container mx-auto text-center space-y-6 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Crypto Trading Platform
          </h1>
          <p className="text-xl text-muted-foreground">
            Advanced cryptocurrency analysis with AI-powered sentiment analysis,
            real-time charts, and multi-source news aggregation
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/features">Explore Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Core Features
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {/* Charts */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle>Real-time Charts</CardTitle>
                </div>
                <CardDescription>
                  TradingView-style price charts with WebSocket real-time
                  updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-green-500" />
                    Live WebSocket updates from Binance
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    Multiple timeframes & trading pairs
                  </li>
                  <li className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-purple-500" />
                    Historical price data analysis
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/charts">View Charts →</Link>
                </Button>
              </CardContent>
            </Card>

            {/* News */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Newspaper className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle>Multi-source News</CardTitle>
                </div>
                <CardDescription>
                  Automated crawling from multiple financial news sources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Intelligent HTML structure learning</li>
                  <li>• Adapts to website changes automatically</li>
                  <li>• Comprehensive storage with filtered display</li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/news">Browse News →</Link>
                </Button>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Brain className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle>AI Sentiment Analysis</CardTitle>
                </div>
                <CardDescription>
                  Advanced AI models for news sentiment and causal analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• AI-powered sentiment scoring</li>
                  <li>• News-price correlation analysis</li>
                  <li>• Causal reasoning: WHY prices move</li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/sentiment">View Analysis →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-blue-500">
                  Real-time
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  WebSocket Updates
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-500">
                  Multi-source
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  News Crawler
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-purple-500">
                  AI-Powered
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Sentiment Analysis
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-orange-500">
                  Scalable
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Architecture
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto text-center space-y-6 max-w-3xl">
          <h2 className="text-3xl font-bold">Ready to Start Trading?</h2>
          <p className="text-lg text-muted-foreground">
            Select your preferred trading pair and start exploring advanced
            analytics
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/settings">Configure Pairs</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
