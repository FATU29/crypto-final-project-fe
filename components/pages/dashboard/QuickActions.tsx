"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
}

const actions: QuickAction[] = [
  {
    title: "View Charts",
    description: "Analyze price movements and trends",
    href: "/charts",
  },
  {
    title: "Check News",
    description: "Stay updated with crypto news",
    href: "/news",
  },
  {
    title: "Update Settings",
    description: "Manage your preferences",
    href: "/settings",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Button
              variant="ghost"
              className="w-full justify-between hover:bg-accent"
            >
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground">
                  {action.description}
                </div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
