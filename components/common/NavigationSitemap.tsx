import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard,
  TrendingUp,
  Newspaper,
  Brain,
  Settings,
  Home,
  FileText,
} from "lucide-react";

export function NavigationSitemap() {
  const pages = [
    {
      name: "Home",
      path: "/",
      icon: Home,
      description: "Landing page & platform overview",
      color: "text-gray-500",
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      description: "Personalized overview & quick actions",
      color: "text-blue-500",
    },
    {
      name: "Charts",
      path: "/charts",
      icon: TrendingUp,
      description: "Real-time price charts (TradingView-style)",
      color: "text-green-500",
    },
    {
      name: "News",
      path: "/news",
      icon: Newspaper,
      description: "Multi-source news with sentiment",
      color: "text-orange-500",
    },
    {
      name: "AI Analysis",
      path: "/sentiment",
      icon: Brain,
      description: "Sentiment & causal analysis",
      color: "text-purple-500",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
      description: "Pair selection & account",
      color: "text-gray-500",
    },
    {
      name: "Features",
      path: "/features",
      icon: FileText,
      description: "Platform features showcase",
      color: "text-indigo-500",
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Navigation Sitemap</h3>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <Card key={page.path} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 ${page.color} mt-0.5`} />
                  <div className="flex-1">
                    <div className="font-medium">{page.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {page.path}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {page.description}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
