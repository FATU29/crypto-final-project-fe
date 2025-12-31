"use client";

import { useAuth } from "@/lib/auth";

export function WelcomeHeader() {
  const { user } = useAuth();

  const getFullName = () => {
    if (!user) return "Guest";
    return `${user.firstName} ${user.lastName}`.trim();
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">Welcome back, {getFullName()}!</h1>
      <p className="text-muted-foreground mt-2">
        Here&apos;s an overview of your crypto portfolio
      </p>
    </div>
  );
}
