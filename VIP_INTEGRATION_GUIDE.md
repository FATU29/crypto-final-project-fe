# VIP Feature Integration Guide

This guide shows how to use the VIP account features in the frontend application.

## Overview

The VIP feature has been fully integrated into the frontend with the following components:

### Files Modified/Created:

1. **Types** (`fe/types/auth.ts`)

   - Added `AccountType` type: `"STANDARD" | "VIP"`
   - Added `accountType` field to `User` interface
   - Added `accountType` to `BackendAuthResponse`

2. **API Configuration** (`fe/config/api-endpoints.ts`)

   - Added `upgradeAccount: "/api/v1/auth/upgrade-account"` endpoint

3. **Auth Service** (`fe/lib/api/auth.service.ts`)

   - Added `upgradeAccount()` method to upgrade users to VIP
   - Updated `transformAuthResponse()` to include `accountType`

4. **Auth Utilities** (`fe/lib/auth/permissions.ts`) - NEW

   - `isVipUser()` - Check if user is VIP
   - `canAccessAiFeatures()` - Check if user can access AI features
   - `hasAccountType()` - Check specific account type
   - `getAccountTypeBadgeClasses()` - Get badge styling for account type

5. **Profile Page** (`fe/app/(features)/profile/page.tsx`) - NEW

   - Display user information with VIP badge
   - Upgrade to VIP button for STANDARD users
   - VIP benefits list
   - Thank you card for existing VIP users

6. **Navbar Component** (`fe/components/layout/Navbar.tsx`)

   - VIP crown icon next to user name in dropdown
   - Account type display (STANDARD/VIP)
   - Profile link in user dropdown

7. **VipGuard Component** (`fe/components/common/VipGuard.tsx`) - NEW
   - Wraps VIP-only content
   - Shows upgrade prompt for non-VIP users
   - Shows login prompt for unauthenticated users

## Usage Examples

### 1. Check if User is VIP in Component

```tsx
import { useAuth, isVipUser } from "@/lib/auth";

export function MyComponent() {
  const { user } = useAuth();
  const isVip = isVipUser(user);

  return (
    <div>
      {isVip ? <div>VIP Content Here</div> : <div>Standard Content</div>}
    </div>
  );
}
```

### 2. Protect AI Features with VipGuard

```tsx
import { VipGuard } from "@/components";

export function NewsAnalysisPage() {
  return (
    <div>
      <h1>News Analysis</h1>

      {/* This content will only be visible to VIP users */}
      <VipGuard>
        <AIAnalysisComponent />
      </VipGuard>

      {/* Basic content visible to all users */}
      <NewsList />
    </div>
  );
}
```

### 3. Custom Fallback for VIP Guard

```tsx
import { VipGuard } from "@/components";
import { Card } from "@/components/ui/card";

export function SentimentAnalysisSection() {
  return (
    <VipGuard
      fallback={
        <Card>
          <p>Upgrade to VIP for sentiment analysis</p>
        </Card>
      }
    >
      <SentimentChart />
    </VipGuard>
  );
}
```

### 4. Check Permissions for Conditional Features

```tsx
import { useAuth, canAccessAiFeatures } from "@/lib/auth";

export function NewsArticle({ article }) {
  const { user } = useAuth();
  const hasAiAccess = canAccessAiFeatures(user);

  return (
    <div>
      <h2>{article.title}</h2>
      <p>{article.content}</p>

      {hasAiAccess && <button onClick={analyzeWithAI}>Analyze with AI</button>}
    </div>
  );
}
```

### 5. Show Upgrade Prompt in Navbar/Banner

```tsx
import { useAuth, isVipUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import Link from "next/link";

export function UpgradeBanner() {
  const { user } = useAuth();

  if (isVipUser(user)) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-600" />
          <span className="text-sm">
            Upgrade to VIP for AI-powered analysis
          </span>
        </div>
        <Button asChild size="sm">
          <Link href="/profile">Upgrade Now</Link>
        </Button>
      </div>
    </div>
  );
}
```

### 6. Programmatic Account Upgrade

```tsx
import { authService } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function UpgradeButton() {
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      await authService.upgradeAccount("VIP");
      await refreshUser(); // Refresh user data in context
      toast.success("Successfully upgraded to VIP!");
    } catch (error) {
      toast.error("Upgrade failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleUpgrade} disabled={isLoading}>
      {isLoading ? "Upgrading..." : "Upgrade to VIP"}
    </button>
  );
}
```

## Navigation

Users can access their profile and upgrade option through:

1. Navbar → User Avatar Dropdown → Profile
2. Direct URL: `/profile`

## API Integration

The frontend calls the backend authentication service at:

- **Endpoint**: `PUT /api/v1/auth/upgrade-account`
- **Body**: `{ "accountType": "VIP" }`
- **Auth**: Requires Bearer token in Authorization header
- **Response**: Updated user profile with VIP account type

## Styling

VIP-related UI uses golden/amber colors:

- Badge: `bg-linear-to-r from-yellow-500 to-amber-500`
- Text: `text-yellow-500` or `text-yellow-600`
- Icons: `<Crown />` from lucide-react

## Best Practices

1. **Always check authentication first** before checking VIP status
2. **Use VipGuard component** for large sections of VIP-only content
3. **Use permission helpers** for conditional UI elements
4. **Call refreshUser()** after upgrading to update the context
5. **Provide clear upgrade prompts** with benefits list
6. **Show VIP status** prominently in user profile and navbar

## Testing

To test VIP features:

1. **Login as STANDARD user**

   - Register a new account (defaults to STANDARD)
   - Check that AI features show upgrade prompts

2. **Upgrade to VIP**

   - Navigate to Profile page
   - Click "Upgrade to VIP" button
   - Verify crown icon appears in navbar

3. **Access AI Features**
   - Try accessing news sentiment analysis
   - Try accessing causal analysis
   - Verify VIP users can access these features

## Future Enhancements

Potential improvements:

- Payment integration for VIP subscription
- Trial period for VIP features
- VIP subscription management (renew/cancel)
- Usage analytics for VIP features
- Multiple VIP tiers (Silver, Gold, Platinum)
