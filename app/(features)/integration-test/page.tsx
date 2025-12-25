"use client";

import { LivePriceGrid } from "@/components/pages/dashboard/LivePriceGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Database, Zap } from "lucide-react";

export default function IntegrationTestPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          Binance API Integration Test
        </h1>
        <p className="text-muted-foreground">
          Testing real-time price updates from the NestJS backend
        </p>
      </div>

      {/* Live Prices */}
      <LivePriceGrid />

      {/* Integration Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              Backend Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-medium">API URL:</span>
              <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">
                {process.env.NEXT_PUBLIC_API_URL}
              </code>
            </div>
            <div>
              <span className="font-medium">WebSocket:</span>
              <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">
                {process.env.NEXT_PUBLIC_WS_URL}
              </code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Code className="h-4 w-4 text-green-500" />
              Socket.IO Namespace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Namespace:</span>
              <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">
                /prices
              </code>
            </div>
            <div>
              <span className="font-medium">Events:</span>
              <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">
                subscribe, priceUpdate
              </code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Data Source
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Exchange:</span>
              <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">
                Binance
              </code>
            </div>
            <div>
              <span className="font-medium">Stream:</span>
              <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">
                miniTicker
              </code>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">1. Start Backend</h4>
            <code className="block px-4 py-2 bg-muted rounded text-xs">
              cd binance-final-project-chart-backend && npm run start:dev
            </code>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">2. Start Frontend</h4>
            <code className="block px-4 py-2 bg-muted rounded text-xs">
              cd fe && npm run dev
            </code>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">3. Using Docker</h4>
            <code className="block px-4 py-2 bg-muted rounded text-xs">
              docker-compose up --build
            </code>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Expected Behavior</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>
                Price tiles show &quot;Live&quot; badge with green indicator
              </li>
              <li>Prices update in real-time (every few seconds)</li>
              <li>Price changes trigger visual animations (flash effect)</li>
              <li>Console shows WebSocket connection messages</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Troubleshooting</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Check browser console for WebSocket errors</li>
              <li>Verify backend is running on port 3000</li>
              <li>Ensure Redis is running (docker-compose up redis)</li>
              <li>Check FRONTEND_URL in backend .env matches frontend URL</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
