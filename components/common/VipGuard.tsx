"use client";

import { useAuth } from "@/lib/auth";
import { canAccessAiFeatures } from "@/lib/auth/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import Link from "next/link";

interface VipGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

/**
 * Component that restricts content to VIP users only
 * Shows upgrade prompt for non-VIP users
 */
export function VipGuard({
  children,
  fallback,
  showUpgradePrompt = true,
}: VipGuardProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      fallback || (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">
                  Authentication Required
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please log in to access this feature.
                </p>
              </div>
              <Button asChild>
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    );
  }

  if (!canAccessAiFeatures(user)) {
    if (!showUpgradePrompt) {
      return fallback || null;
    }

    return (
      fallback || (
        <Card className="border-yellow-500/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <CardTitle>VIP Feature</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This feature is only available to VIP members. Upgrade your
              account to unlock AI-powered analysis and insights.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">VIP Benefits Include:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>AI-powered sentiment analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Advanced causal analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Real-time AI insights</span>
                </li>
              </ul>
            </div>
            <Button
              asChild
              className="w-full bg-linear-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
            >
              <Link href="/profile">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to VIP
              </Link>
            </Button>
          </CardContent>
        </Card>
      )
    );
  }

  return <>{children}</>;
}
