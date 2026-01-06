# VIP Feature Integration Examples

This document provides practical code examples for integrating VIP-only features in your components.

## Example 1: News Detail Page with VIP Guard

**File:** `fe/app/(features)/news/[id]/page.tsx`

Wrap CausalAnalysisCard and sentiment analysis with VipGuard:

```tsx
import { VipGuard } from "@/components/common/VipGuard";
import { CausalAnalysisCard } from "@/components/news/CausalAnalysisCard";

export default function NewsDetailPage() {
  // ... existing code ...

  return (
    <div>
      {/* Regular news content - visible to all users */}
      <article>
        <h1>{news.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: news.content }} />
      </article>

      {/* VIP-only AI Analysis section */}
      <VipGuard>
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">AI Analysis (VIP Only)</h2>
          <CausalAnalysisCard newsId={news.id} />
          <SentimentAnalysisCard newsId={news.id} />
        </div>
      </VipGuard>
    </div>
  );
}
```

## Example 2: News List with Conditional Features

**File:** `fe/components/news/news-card.tsx`

Show sentiment badge only for VIP users:

```tsx
import { useAuth, isVipUser } from "@/lib/auth";
import { SentimentBadge } from "./sentiment-badge";
import { Crown } from "lucide-react";

export function NewsCard({ article }) {
  const { user } = useAuth();
  const showSentiment = isVipUser(user);

  return (
    <div className="news-card">
      <h3>{article.title}</h3>
      <p>{article.summary}</p>

      {/* Only show sentiment for VIP users */}
      {showSentiment && article.sentiment && (
        <SentimentBadge sentiment={article.sentiment} />
      )}

      {/* Show upgrade hint for non-VIP users */}
      {!showSentiment && (
        <div className="text-xs text-muted-foreground">
          <Crown className="h-3 w-3 inline mr-1" />
          Upgrade to VIP to see AI sentiment
        </div>
      )}
    </div>
  );
}
```

## Example 3: Protected API Calls

Only call sentiment/causal analysis APIs if user is VIP. This saves API calls and prevents unauthorized access:

```tsx
import { useAuth, canAccessAiFeatures } from "@/lib/auth";
import { useEffect, useState } from "react";

export function NewsAnalysis({ newsId }) {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    // Only fetch AI analysis if user has access
    if (canAccessAiFeatures(user)) {
      fetchAnalysis(newsId).then(setAnalysis);
    }
  }, [newsId, user]);

  // Use VipGuard to protect the entire component
  return (
    <VipGuard>
      {analysis ? (
        <div>
          <h3>AI Analysis</h3>
          <p>Sentiment: {analysis.sentiment}</p>
          <p>Score: {analysis.score}</p>
        </div>
      ) : (
        <LoadingSpinner />
      )}
    </VipGuard>
  );
}
```

## Example 4: News Page with Multiple AI Sections

**File:** `fe/app/(features)/news/page.tsx`

Protect entire AI analysis tab/section:

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VipGuard } from "@/components";

export default function NewsPage() {
  return (
    <div className="container">
      <Tabs defaultValue="news">
        <TabsList>
          <TabsTrigger value="news">News Feed</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="trends">Sentiment Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="news">
          {/* Public content - all users */}
          <NewsList />
        </TabsContent>

        <TabsContent value="analysis">
          {/* VIP-only content */}
          <VipGuard>
            <SentimentStats />
            <CausalAnalysisDashboard />
          </VipGuard>
        </TabsContent>

        <TabsContent value="trends">
          {/* VIP-only content */}
          <VipGuard>
            <SentimentTrendChart />
          </VipGuard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Example 5: Inline VIP Feature Teaser

Show a teaser for VIP features within standard content:

```tsx
import { useAuth, isVipUser } from "@/lib/auth";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function NewsListWithAI() {
  const { user } = useAuth();
  const isVip = isVipUser(user);

  return (
    <div className="space-y-4">
      {/* Regular news list */}
      {newsList.map((news) => (
        <NewsCard key={news.id} news={news} />
      ))}

      {/* AI Analysis Section */}
      <div className="border rounded-lg p-6">
        {isVip ? (
          <>
            <h3 className="font-bold mb-4">AI-Powered Insights</h3>
            <SentimentTrendChart />
            <CausalCorrelation />
          </>
        ) : (
          <div className="text-center space-y-4">
            <Crown className="h-12 w-12 mx-auto text-yellow-500" />
            <h3 className="font-bold">Unlock AI-Powered Analysis</h3>
            <p className="text-muted-foreground">
              Get real-time sentiment analysis and causal insights with VIP
            </p>
            <Button asChild>
              <Link href="/profile">Upgrade to VIP</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Example 6: Analytics Button with Permission Check

Show analyze button only to VIP users:

```tsx
import { useAuth, canAccessAiFeatures } from "@/lib/auth";
import { Brain, Crown } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function NewsArticle({ article }) {
  const { user } = useAuth();
  const hasAiAccess = canAccessAiFeatures(user);

  const handleAnalyze = async () => {
    if (!hasAiAccess) {
      toast.error("VIP membership required for AI analysis");
      return;
    }
    // Perform analysis
    const result = await analyzeArticle(article.id);
    // Show results...
  };

  return (
    <div>
      <h2>{article.title}</h2>
      <p>{article.content}</p>

      <div className="flex gap-2">
        <Button variant="outline">Share</Button>
        <Button variant="outline">Save</Button>

        {hasAiAccess ? (
          <Button onClick={handleAnalyze}>
            <Brain className="h-4 w-4 mr-2" />
            Analyze with AI
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/profile">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade for AI
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
```

## Example 7: Upgrade Banner

Show a site-wide upgrade banner for non-VIP users:

```tsx
import { useAuth, isVipUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import Link from "next/link";

export function UpgradeBanner() {
  const { user, isAuthenticated } = useAuth();

  // Don't show banner if not authenticated or already VIP
  if (!isAuthenticated || isVipUser(user)) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-950/20 border-b border-yellow-200 dark:border-yellow-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-600" />
          <span className="text-sm font-medium">
            Upgrade to VIP for AI-powered analysis and advanced features
          </span>
        </div>
        <Button asChild size="sm" className="bg-yellow-600 hover:bg-yellow-700">
          <Link href="/profile">Upgrade Now</Link>
        </Button>
      </div>
    </div>
  );
}
```

## Example 8: Programmatic Account Upgrade

Handle upgrade in a custom component:

```tsx
import { authService } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

export function UpgradeButton() {
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      await authService.upgradeAccount("VIP");
      await refreshUser(); // Refresh user data in context
      toast.success("Successfully upgraded to VIP!", {
        description: "You now have access to all AI features",
      });
    } catch (error) {
      toast.error("Upgrade failed", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isLoading}
      className="bg-linear-to-r from-yellow-500 to-amber-500"
    >
      {isLoading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Upgrading...
        </>
      ) : (
        <>
          <Crown className="h-4 w-4 mr-2" />
          Upgrade to VIP
        </>
      )}
    </Button>
  );
}
```

## Integration Checklist

When integrating VIP features:

- ✅ **Wrap entire AI sections** with `<VipGuard>` component
- ✅ **Use `isVipUser(user)`** for conditional rendering
- ✅ **Use `canAccessAiFeatures(user)`** for API call checks
- ✅ **Show upgrade prompts** for non-VIP users
- ✅ **Add Crown icon** to VIP features
- ✅ **Link to `/profile`** for upgrades
- ✅ **Call `refreshUser()`** after upgrading
- ✅ **Test with both** STANDARD and VIP accounts

## AI Features to Protect

These features should be VIP-only:

- ✨ SentimentAnalysisCard
- ✨ CausalAnalysisCard
- ✨ SentimentTrendChart
- ✨ SentimentStats
- ✨ SentimentGauge
- ✨ AI-powered news analysis
- ✨ Advanced filtering/search
- ✨ Predictive analytics
- ✨ Custom AI reports

## Best Practices

1. **Always check authentication first** before checking VIP status
2. **Fail gracefully** - show helpful upgrade prompts instead of errors
3. **Use consistent styling** - golden/amber colors for VIP elements
4. **Make benefits clear** - explain what users get with VIP
5. **Test both paths** - verify standard and VIP user experiences
6. **Keep public features accessible** - don't lock everything behind VIP
