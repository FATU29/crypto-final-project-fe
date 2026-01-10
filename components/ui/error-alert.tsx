/**
 * Error Alert Component
 * Displays user-friendly error messages with proper styling
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Lock, WifiOff, RefreshCw, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface ErrorAlertProps {
  error: string | null | undefined;
  title?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({
  error,
  title = "Error",
  showRetry = false,
  onRetry,
  className,
}: ErrorAlertProps) {
  if (!error) return null;

  // Check if it's an authentication error
  const isAuthError =
    error.toLowerCase().includes("log in") ||
    error.toLowerCase().includes("login") ||
    error.toLowerCase().includes("unauthorized") ||
    error.toLowerCase().includes("authentication") ||
    error.toLowerCase().includes("session has expired") ||
    (error.toLowerCase().includes("missing") &&
      error.toLowerCase().includes("authorization"));

  // Determine error type and icon
  const getErrorIcon = () => {
    if (isAuthError) {
      return <Lock className="h-4 w-4" />;
    }
    if (
      error.toLowerCase().includes("network") ||
      error.toLowerCase().includes("connection")
    ) {
      return <WifiOff className="h-4 w-4" />;
    }
    return <AlertCircle className="h-4 w-4" />;
  };

  // Determine error variant
  const getErrorVariant = () => {
    if (
      error.toLowerCase().includes("vip") ||
      error.toLowerCase().includes("upgrade")
    ) {
      return "default" as const; // Info variant for VIP prompts
    }
    return "destructive" as const;
  };

  return (
    <Alert variant={getErrorVariant()} className={className}>
      {getErrorIcon()}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {error}
        <div className="flex gap-2 mt-3">
          {isAuthError && (
            <Button variant="default" size="sm" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-3 w-3" />
                Log In
              </Link>
            </Button>
          )}
          {showRetry && onRetry && !isAuthError && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-2 h-3 w-3" />
              Try Again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Compact error display for inline use
 */
export function ErrorText({
  error,
  className,
}: {
  error: string | null | undefined;
  className?: string;
}) {
  if (!error) return null;

  return (
    <p className={`text-sm text-destructive ${className || ""}`}>
      <AlertCircle className="inline h-3 w-3 mr-1" />
      {error}
    </p>
  );
}

/**
 * VIP Upgrade Prompt (styled differently from errors)
 */
export function VipUpgradeAlert({
  message,
  onUpgrade,
  className,
}: {
  message?: string;
  onUpgrade?: () => void;
  className?: string;
}) {
  return (
    <Alert className={`border-amber-500 bg-amber-50 ${className || ""}`}>
      <Lock className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">VIP Feature</AlertTitle>
      <AlertDescription className="text-amber-800 mt-2">
        {message ||
          "This feature requires a VIP account. Upgrade to access AI-powered analysis and advanced insights."}
        {onUpgrade && (
          <Button
            variant="default"
            size="sm"
            onClick={onUpgrade}
            className="mt-3 bg-amber-600 hover:bg-amber-700"
          >
            Upgrade to VIP
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
