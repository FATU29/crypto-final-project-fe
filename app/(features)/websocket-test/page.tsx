"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Zap,
  Terminal,
  Play,
} from "lucide-react";
import { useBackendPrice } from "@/hooks";
import { getPriceSocket, PriceUpdatePayload } from "@/lib/socket";

interface SubscribeResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export default function WebSocketTestPage() {
  const [testSymbol, setTestSymbol] = useState("BTCUSDT");
  const [manualSymbol, setManualSymbol] = useState("");
  const [isManualTest, setIsManualTest] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 49), // Keep last 50 logs
    ]);
  }, []);

  // Test with useBackendPrice hook
  const { price, timestamp, isConnected, lastUpdate } = useBackendPrice({
    symbol: testSymbol,
    enabled: !isManualTest,
    onUpdate: useCallback(
      (data: PriceUpdatePayload) => {
        addLog(
          `📊 Price Update: ${data.symbol} = $${data.price} at ${new Date(
            data.ts
          ).toLocaleTimeString()}`
        );
      },
      [addLog]
    ),
  });

  // Monitor socket connection manually
  useEffect(() => {
    const socket = getPriceSocket();

    const handleConnect = () => {
      setConnectionStatus("connected");
      addLog("✅ Socket Connected: " + socket.id);
    };

    const handleDisconnect = (reason: string) => {
      setConnectionStatus("disconnected");
      addLog(`🔌 Socket Disconnected: ${reason}`);
    };

    const handleConnectError = (error: Error) => {
      setConnectionStatus("error");
      addLog(`❌ Connection Error: ${error.message}`);
    };

    const handleReconnect = (attemptNumber: number) => {
      addLog(`🔄 Reconnected after ${attemptNumber} attempts`);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("reconnect", handleReconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("reconnect", handleReconnect);
    };
  }, [addLog]);

  const handleManualSubscribe = () => {
    if (!manualSymbol.trim()) return;

    const socket = getPriceSocket();
    const symbol = manualSymbol.toUpperCase();

    addLog(`📤 Subscribing to ${symbol}...`);
    socket.emit("subscribe", { symbol }, (response: SubscribeResponse) => {
      if (response?.error) {
        addLog(`❌ Subscribe Error: ${response.error}`);
      } else {
        addLog(`✅ Subscribe Success: ${response?.message || "OK"}`);
      }
    });
  };

  const handleManualUnsubscribe = () => {
    if (!manualSymbol.trim()) return;

    const socket = getPriceSocket();
    const symbol = manualSymbol.toUpperCase();

    addLog(`📤 Unsubscribing from ${symbol}...`);
    socket.emit("unsubscribe", { symbol }, (response: SubscribeResponse) => {
      if (response?.error) {
        addLog(`❌ Unsubscribe Error: ${response.error}`);
      } else {
        addLog(`✅ Unsubscribe Success: ${response?.message || "OK"}`);
      }
    });
  };

  const handleSwitchSymbol = (symbol: string) => {
    setTestSymbol(symbol);
    addLog(`🔄 Switched to ${symbol}`);
  };

  const toggleManualTest = () => {
    setIsManualTest(!isManualTest);
    addLog(`${!isManualTest ? "🟢 Manual" : "🟡 Auto"} test mode enabled`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-500";
      case "connecting":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "connecting":
        return <Activity className="h-4 w-4 text-yellow-500 animate-spin" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          WebSocket Integration Test
        </h1>
        <p className="text-muted-foreground">
          Complete testing suite for Socket.IO backend connection
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              {getStatusIcon()}
              Connection Status
            </span>
            <Badge
              variant={
                connectionStatus === "connected" ? "default" : "secondary"
              }
            >
              <span className={getStatusColor()}>
                {connectionStatus.toUpperCase()}
              </span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">WebSocket URL:</span>
              <code className="block px-2 py-1 bg-muted rounded text-xs mt-1">
                {process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000"}
                /prices
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">Mode:</span>
              <Badge variant="outline" className="ml-2">
                {isManualTest ? "Manual" : "Auto (Hook)"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto Test with Hook */}
      {!isManualTest && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Play className="h-4 w-4 text-green-500" />
              Automatic Test (useBackendPrice Hook)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Symbol Selector */}
            <div className="flex gap-2">
              {["BTCUSDT", "ETHUSDT", "BNBUSDT"].map((symbol) => (
                <Button
                  key={symbol}
                  variant={testSymbol === symbol ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSwitchSymbol(symbol)}
                >
                  {symbol}
                </Button>
              ))}
            </div>

            {/* Price Display */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current Price
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      $
                      {price
                        ? parseFloat(price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })
                        : "---"}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Symbol</p>
                      <p className="font-medium">{testSymbol}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={isConnected ? "default" : "secondary"}>
                        {isConnected ? "Live" : "Offline"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Update</p>
                      <p className="font-medium">
                        {timestamp
                          ? new Date(timestamp).toLocaleTimeString()
                          : "---"}
                      </p>
                    </div>
                  </div>
                  {lastUpdate && (
                    <div className="mt-4 p-3 bg-background rounded border">
                      <p className="text-xs font-mono text-muted-foreground">
                        Raw Data:
                      </p>
                      <pre className="text-xs mt-2 overflow-x-auto">
                        {JSON.stringify(lastUpdate, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Manual Test */}
      {isManualTest && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="h-4 w-4 text-blue-500" />
              Manual Test (Direct Socket.IO)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter symbol (e.g., BTCUSDT)"
                value={manualSymbol}
                onChange={(e) => setManualSymbol(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button onClick={handleManualSubscribe} variant="default">
                Subscribe
              </Button>
              <Button onClick={handleManualUnsubscribe} variant="outline">
                Unsubscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Manually subscribe/unsubscribe to test Socket.IO events directly
            </p>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={toggleManualTest} variant="outline">
            {isManualTest ? "Switch to Auto" : "Switch to Manual"}
          </Button>
          <Button onClick={clearLogs} variant="outline">
            Clear Logs
          </Button>
        </CardContent>
      </Card>

      {/* Event Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Event Logs ({logs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black/90 text-green-400 font-mono text-xs p-4 rounded h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No events yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Available Events:</h4>
              <ul className="space-y-1 ml-4">
                <li>
                  <code className="px-2 py-1 bg-muted rounded">subscribe</code>{" "}
                  - Subscribe to price updates
                </li>
                <li>
                  <code className="px-2 py-1 bg-muted rounded">
                    unsubscribe
                  </code>{" "}
                  - Unsubscribe from updates
                </li>
                <li>
                  <code className="px-2 py-1 bg-muted rounded">
                    priceUpdate
                  </code>{" "}
                  - Receive price data
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Supported Symbols:</h4>
              <div className="flex gap-2">
                <Badge>BTCUSDT</Badge>
                <Badge>ETHUSDT</Badge>
                <Badge>BNBUSDT</Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Data Format:</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                {`{
  symbol: "BTCUSDT",
  price: "42350.50",
  ts: 1703520000000
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
