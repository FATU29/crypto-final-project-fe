// components/news/crawler-control.tsx

"use client";

import { useState, useEffect } from "react";
import { NewsAPI } from "@/lib/services/news-api";
import { CrawlerStatus, CronJobStatus } from "@/types/news";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Square, RefreshCw } from "lucide-react";

interface CrawlerControlProps {
  onCrawlComplete?: () => void;
}

export function CrawlerControl({ onCrawlComplete }: CrawlerControlProps = {}) {
  const [status, setStatus] = useState<CrawlerStatus | null>(null);
  const [cronJobStatus, setCronJobStatus] = useState<CronJobStatus | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [cronJobEnabled, setCronJobEnabled] = useState(false);

  const fetchStatus = async () => {
    try {
      const data = await NewsAPI.getCrawlerStatus();
      setStatus(data);
    } catch (error) {
      console.error("Failed to fetch crawler status:", error);
    }
  };

  const fetchCronJobStatus = async () => {
    try {
      const data = await NewsAPI.getCronJobStatus();
      setCronJobStatus(data);
      setCronJobEnabled(data?.enabled || false);
    } catch (error) {
      console.error("Failed to fetch cron job status:", error);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchCronJobStatus();
    const interval = setInterval(() => {
      fetchStatus();
      fetchCronJobStatus();
    }, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStart = async (source: string) => {
    try {
      setLoading(true);
      await NewsAPI.startCrawler(source);

      // Poll status until crawl completes
      const pollInterval = setInterval(async () => {
        const currentStatus = await NewsAPI.getCrawlerStatus();
        setStatus(currentStatus);

        // If crawler stopped, crawl is complete
        if (!currentStatus.is_running) {
          clearInterval(pollInterval);
          setLoading(false);
          if (onCrawlComplete) {
            onCrawlComplete();
          }
        }
      }, 2000); // Poll every 2 seconds

      // Timeout after 60 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        setLoading(false);
        if (onCrawlComplete) {
          onCrawlComplete();
        }
      }, 60000);
    } catch (error) {
      console.error("Failed to start crawler:", error);
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      await NewsAPI.stopCrawler();
      await fetchStatus();
    } catch (error) {
      console.error("Failed to stop crawler:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCronJob = async (enabled: boolean) => {
    try {
      setLoading(true);
      if (enabled) {
        await NewsAPI.startCronJob();
      } else {
        await NewsAPI.stopCronJob();
      }
      await fetchCronJobStatus();
    } catch (error) {
      console.error("Failed to toggle cron job:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerNow = async () => {
    try {
      setLoading(true);
      await NewsAPI.triggerCronJobNow();

      // Poll status until crawl completes
      const pollInterval = setInterval(async () => {
        const currentStatus = await NewsAPI.getCrawlerStatus();
        setStatus(currentStatus);

        // If crawler stopped, crawl is complete
        if (!currentStatus.is_running) {
          clearInterval(pollInterval);
          setLoading(false);
          if (onCrawlComplete) {
            onCrawlComplete();
          }
        }
      }, 2000); // Poll every 2 seconds

      // Timeout after 60 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        setLoading(false);
        if (onCrawlComplete) {
          onCrawlComplete();
        }
      }, 60000);
    } catch (error) {
      console.error("Failed to trigger crawl:", error);
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Crawler Control</CardTitle>
        <CardDescription>Manual and automatic crawling</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-Crawl Section */}
        <div className="space-y-3 rounded-lg border p-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-crawl" className="text-sm font-medium">
                Auto-Crawl (CronJob)
              </Label>
              <p className="text-xs text-gray-500">
                Automatically crawl news on schedule
              </p>
            </div>
            <Switch
              id="auto-crawl"
              checked={cronJobEnabled}
              onCheckedChange={handleToggleCronJob}
              disabled={loading}
            />
          </div>
          {cronJobStatus && (
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={
                    cronJobStatus.enabled ? "text-green-600" : "text-gray-500"
                  }
                >
                  {cronJobStatus.enabled ? "Active" : "Inactive"}
                </span>
              </div>
              {cronJobStatus.interval && (
                <div className="flex justify-between">
                  <span>Interval:</span>
                  <span className="font-mono">{cronJobStatus.interval}</span>
                </div>
              )}
              {cronJobStatus.next_run && (
                <div className="flex justify-between">
                  <span>Next Run:</span>
                  <span>
                    {new Date(cronJobStatus.next_run).toLocaleString()}
                  </span>
                </div>
              )}
              {cronJobStatus.last_run && (
                <div className="flex justify-between">
                  <span>Last Run:</span>
                  <span>
                    {new Date(cronJobStatus.last_run).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
          <Button
            onClick={handleTriggerNow}
            disabled={loading}
            variant="outline"
            size="sm"
            className="w-full gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Trigger Crawl Now
          </Button>
        </div>

        {/* Manual Crawl Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Manual Crawl</h4>
            <span
              className={`rounded px-2 py-1 text-xs font-medium ${
                status?.is_running
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {status?.is_running ? "Running" : "Stopped"}
            </span>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleStart("cointelegraph")}
                disabled={loading || status?.is_running}
                size="sm"
                variant="outline"
              >
                CoinTelegraph
              </Button>
              <Button
                onClick={() => handleStart("coindesk")}
                disabled={loading || status?.is_running}
                size="sm"
                variant="outline"
              >
                CoinDesk
              </Button>
              <Button
                onClick={() => handleStart("binance")}
                disabled={loading || status?.is_running}
                size="sm"
                variant="outline"
              >
                Binance
              </Button>
              <Button
                onClick={() => handleStart("utoday")}
                disabled={loading || status?.is_running}
                size="sm"
                variant="outline"
              >
                U.Today
              </Button>
              <Button
                onClick={() => handleStart("cryptoslate")}
                disabled={loading || status?.is_running}
                size="sm"
                variant="outline"
              >
                CryptoSlate
              </Button>
              <Button
                onClick={() => handleStart("decrypt")}
                disabled={loading || status?.is_running}
                size="sm"
                variant="outline"
              >
                Decrypt
              </Button>
            </div>
            <Button
              onClick={handleStop}
              disabled={loading || !status?.is_running}
              variant="destructive"
              className="w-full gap-2"
              size="sm"
            >
              <Square className="h-4 w-4" />
              Stop Crawler
            </Button>
          </div>

          {/* Status Info */}
          {status && (
            <div className="space-y-1 text-xs text-gray-600 border-t pt-3">
              <div className="flex justify-between">
                <span>Active Jobs:</span>
                <span className="font-medium">{status.active_jobs}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Crawled:</span>
                <span className="font-medium">{status.total_crawled}</span>
              </div>
              {status.last_crawl_time && (
                <div className="flex justify-between">
                  <span>Last Crawl:</span>
                  <span className="text-xs">
                    {new Date(status.last_crawl_time).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
