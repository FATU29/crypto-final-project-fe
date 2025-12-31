// components/news/sentiment-trend-chart.tsx

"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TooltipProps } from "recharts";
import { useSentimentTrends } from "@/hooks/use-sentiment-trends";
import { SentimentTrendRequest } from "@/lib/services/analytics-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    payload: {
      fullTime: string;
      positive: number;
      negative: number;
      neutral: number;
      avgScore: string;
      total: number;
    };
  }>;
}

interface SentimentTrendChartProps {
  timeframe?: "hour" | "day" | "week" | "month";
  sources?: string[];
  tradingPairs?: string[];
  chartType?: "line" | "area" | "stacked";
  height?: number;
}

// CustomTooltip component declared outside render
function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-sm mb-2">{payload[0].payload.fullTime}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Positive: {payload[0].payload.positive}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Negative: {payload[0].payload.negative}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-sm">Neutral: {payload[0].payload.neutral}</span>
          </div>
          <div className="pt-2 border-t">
            <span className="text-xs text-gray-600">
              Avg Score: {payload[0].payload.avgScore}%
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-600">
              Total: {payload[0].payload.total} articles
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function SentimentTrendChart({
  timeframe = "day",
  sources,
  tradingPairs,
  chartType = "area",
  height = 400,
}: SentimentTrendChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [selectedChartType, setSelectedChartType] = useState(chartType);

  const params: SentimentTrendRequest = {
    timeframe: selectedTimeframe,
    sources,
    trading_pairs: tradingPairs,
  };

  const { trends, loading, error } = useSentimentTrends(params);

  // Format data for chart
  const chartData = trends.map((trend) => {
    const date = dayjs(trend.time);
    let timeLabel = "";

    switch (selectedTimeframe) {
      case "hour":
        timeLabel = date.format("HH:mm");
        break;
      case "day":
        timeLabel = date.format("MMM DD");
        break;
      case "week":
        timeLabel = `Week ${date.format("WW")}`;
        break;
      case "month":
        timeLabel = date.format("MMM YYYY");
        break;
      default:
        timeLabel = date.format("MMM DD");
    }

    return {
      time: timeLabel,
      fullTime: trend.time,
      positive: trend.positive,
      negative: trend.negative,
      neutral: trend.neutral,
      avgScore: (trend.avg_score * 100).toFixed(1),
      total: trend.total,
    };
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trends</CardTitle>
          <CardDescription>Analyzing sentiment over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trends</CardTitle>
          <CardDescription>Error loading trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trends</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            No sentiment data found for the selected filters
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sentiment Trends</CardTitle>
            <CardDescription>
              Sentiment analysis over time
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedTimeframe}
              onValueChange={(value) =>
                setSelectedTimeframe(
                  value as "hour" | "day" | "week" | "month"
                )
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">Hourly</SelectItem>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedChartType}
              onValueChange={(value) =>
                setSelectedChartType(value as "line" | "area" | "stacked")
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="stacked">Stacked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {selectedChartType === "stacked" ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                dataKey="time"
                className="text-xs"
                tick={{ fill: "#6b7280" }}
              />
              <YAxis className="text-xs" tick={{ fill: "#6b7280" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="positive"
                stackId="1"
                stroke="#10b981"
                fill="url(#colorPositive)"
                name="Positive"
              />
              <Area
                type="monotone"
                dataKey="neutral"
                stackId="1"
                stroke="#6b7280"
                fill="url(#colorNeutral)"
                name="Neutral"
              />
              <Area
                type="monotone"
                dataKey="negative"
                stackId="1"
                stroke="#ef4444"
                fill="url(#colorNegative)"
                name="Negative"
              />
            </AreaChart>
          ) : selectedChartType === "area" ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                dataKey="time"
                className="text-xs"
                tick={{ fill: "#6b7280" }}
              />
              <YAxis className="text-xs" tick={{ fill: "#6b7280" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="positive"
                stroke="#10b981"
                fill="url(#colorPositive)"
                name="Positive"
              />
              <Area
                type="monotone"
                dataKey="neutral"
                stroke="#6b7280"
                fill="url(#colorNeutral)"
                name="Neutral"
              />
              <Area
                type="monotone"
                dataKey="negative"
                stroke="#ef4444"
                fill="url(#colorNegative)"
                name="Negative"
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                dataKey="time"
                className="text-xs"
                tick={{ fill: "#6b7280" }}
              />
              <YAxis className="text-xs" tick={{ fill: "#6b7280" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="positive"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                name="Positive"
              />
              <Line
                type="monotone"
                dataKey="neutral"
                stroke="#6b7280"
                strokeWidth={2}
                dot={{ fill: "#6b7280", r: 4 }}
                name="Neutral"
              />
              <Line
                type="monotone"
                dataKey="negative"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", r: 4 }}
                name="Negative"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

