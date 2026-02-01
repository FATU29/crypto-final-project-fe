"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent infinite loop - only process once
    if (hasProcessed.current) {
      return;
    }

    const handleCallback = async () => {
      hasProcessed.current = true;
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError(`Authentication failed: ${errorParam}`);
        setProcessing(false);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        setProcessing(false);
        return;
      }

      try {
        // Send the code to your backend for token exchange
        await loginWithGoogle(code);
        router.push("/charts");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to complete Google login",
        );
        setProcessing(false);
        // Reset flag on error to allow retry
        hasProcessed.current = false;
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {processing ? "Completing Sign In..." : "Authentication"}
          </CardTitle>
          <CardDescription>
            {processing
              ? "Please wait while we complete your Google sign in"
              : "There was an issue with authentication"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {processing ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
