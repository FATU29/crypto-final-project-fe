"use client";

import { useAuth } from "@/lib/auth";

export function WelcomeHeader() {
  const { user } = useAuth();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
      <p className="text-muted-foreground mt-2">
        Here&apos;s an overview of your crypto portfolio
      </p>
    </div>
  );
}
