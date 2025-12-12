import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Newspaper,
  Brain,
  Settings,
  Database,
  Radio,
  BarChart3,
  Globe,
  Lock,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NavigationSitemap } from "@/components/common/NavigationSitemap";

const features = [
  {
    category: "Trading & Charts",
    icon: TrendingUp,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    items: [
      {
        title: "Real-time Price Charts",
        description:
          "TradingView-style charts with WebSocket real-time updates from Binance",
        href: "/charts",
        tags: ["Real-time", "WebSocket", "Multi-timeframe"],
      },
      {
        title: "Multi-pair Support",
        description:
          "Track multiple cryptocurrency pairs simultaneously (BTC, ETH, etc.)",
        href: "/charts",
        tags: ["BTCUSDT", "ETHUSDT", "Scalable"],
      },
      {
        title: "Historical Data",
        description:
          "Access comprehensive historical price data via exchange APIs",
        href: "/charts",
        tags: ["API Integration", "Binance"],
      },
    ],
  },
  {
    category: "News & Data Collection",
    icon: Newspaper,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    items: [
      {
        title: "Multi-source News Crawler",
        description: "Automated crawling from multiple financial news sources",
        href: "/news",
        tags: ["Crawler", "Multi-source", "Auto-learning"],
      },
      {
        title: "Intelligent HTML Parsing",
        description:
          "Automatically learns and adapts to different website structures",
        href: "/news",
        tags: ["Structure Learning", "Adaptive"],
      },
      {
        title: "Comprehensive Storage",
        description: "Full data storage with selective display on GUI",
        href: "/news",
        tags: ["Database", "Filtered Display"],
      },
    ],
  },
  {
    category: "AI & Sentiment Analysis",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    items: [
      {
        title: "News Sentiment Analysis",
        description: "AI-powered sentiment scoring using advanced models",
        href: "/sentiment",
        tags: ["AI Models", "Sentiment Scoring"],
      },
      {
        title: "Price-News Correlation",
        description: "Align news sentiment with historical price movements",
        href: "/sentiment",
        tags: ["Correlation", "Historical Data"],
      },
      {
        title: "Causal Analysis (Advanced)",
        description: "Understand WHY prices move - causal reasoning for trends",
        href: "/sentiment",
        tags: ["Causality", "Reasoning", "Advanced"],
      },
    ],
  },
  {
    category: "Platform & Infrastructure",
    icon: Settings,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    items: [
      {
        title: "Scalable Architecture",
        description: "Built to handle multiple concurrent users efficiently",
        href: "/dashboard",
        tags: ["Scalable", "High Performance"],
      },
      {
        title: "Account Management",
        description: "Secure user authentication and profile management",
        href: "/settings",
        tags: ["Auth", "Security"],
      },
      {
        title: "Pair Selection",
        description: "Easy configuration of trading pairs and preferences",
        href: "/settings",
        tags: ["Configuration", "Customizable"],
      },
    ],
  },
];

const techHighlights = [
  {
    icon: Radio,
    label: "Real-time WebSocket",
    description: "Live price updates",
  },
  {
    icon: Database,
    label: "Multi-source Crawling",
    description: "Diverse news data",
  },
  { icon: Brain, label: "AI/ML Models", description: "Sentiment analysis" },
  { icon: BarChart3, label: "Causal Analysis", description: "Why prices move" },
  { icon: Globe, label: "Multi-exchange", description: "Binance & more" },
  { icon: Lock, label: "Secure Auth", description: "User management" },
];

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Platform Features
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive cryptocurrency analysis platform with AI-powered
            sentiment analysis, real-time charts, and multi-source news
            aggregation
          </p>
        </div>

        {/* Tech Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {techHighlights.map((tech) => {
            const Icon = tech.icon;
            return (
              <Card key={tech.label} className="text-center">
                <CardContent className="pt-6">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold text-sm">{tech.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tech.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Categories */}
        <div className="space-y-8">
          {features.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.category} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.bgColor}`}>
                    <CategoryIcon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <h2 className="text-2xl font-bold">{category.category}</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.items.map((item) => (
                    <Card
                      key={item.title}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg flex items-start justify-between">
                          <span>{item.title}</span>
                          <Zap className="h-4 w-4 text-yellow-500 shrink-0 ml-2" />
                        </CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Link href={item.href}>Explore →</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Sitemap */}
        <div className="mt-12">
          <NavigationSitemap />
        </div>

        {/* CTA Section */}
        <Card className="bg-linear-to-r from-blue-500/10 to-purple-500/10 border-2">
          <CardContent className="pt-6 text-center space-y-4">
            <h3 className="text-2xl font-bold">Ready to Start?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select your trading pair and start exploring real-time charts,
              news sentiment, and AI-powered causal analysis
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/settings">Configure Pairs</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
