"use client";

import { StatsCard } from "./StatsCard";
import { QuickActions } from "./QuickActions";
import { WelcomeHeader } from "./WelcomeHeader";
import { Wallet, TrendingUp, Activity, Eye, DollarSign } from "lucide-react";

export function DashboardContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <WelcomeHeader />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Balance"
          description="Your total portfolio value"
          value="$0.00"
          subtitle="Start trading to see your balance"
          icon={Wallet}
          trend={{ value: "+0% from last month", positive: true }}
        />

        <StatsCard
          title="Active Trades"
          description="Currently open positions"
          value={0}
          subtitle="No active trades"
          icon={Activity}
        />

        <StatsCard
          title="Portfolio Growth"
          description="30-day performance"
          value="+0%"
          subtitle="Track your growth over time"
          icon={TrendingUp}
        />

        <StatsCard
          title="Watchlist"
          description="Cryptocurrencies you're watching"
          value={0}
          subtitle="Add coins to your watchlist"
          icon={Eye}
        />

        <StatsCard
          title="Profit/Loss"
          description="Total P&L this month"
          value="$0.00"
          subtitle="Start trading to see results"
          icon={DollarSign}
          trend={{ value: "+0%", positive: true }}
        />

        <QuickActions />
      </div>
    </div>
  );
}
