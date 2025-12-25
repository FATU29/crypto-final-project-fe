# WebSocket Quick Start Guide

## 🚀 For Developers: How to Use WebSocket in Your Component

### Option 1: Use the Hook (Recommended)

```typescript
import { useBackendPrice } from "@/hooks";

function MyPriceComponent() {
  const { price, isConnected, lastUpdate } = useBackendPrice({
    symbol: "BTCUSDT",
    enabled: true,
    onUpdate: (data) => {
      console.log("New price:", data.price);
    },
  });

  return (
    <div>
      <p>Status: {isConnected ? "🟢 Live" : "🔴 Offline"}</p>
      <p>Price: ${price || "---"}</p>
      <p>
        Updated:{" "}
        {lastUpdate ? new Date(lastUpdate.ts).toLocaleTimeString() : "---"}
      </p>
    </div>
  );
}
```

### Option 2: Use Socket Directly

```typescript
import { getPriceSocket, subscribeToPriceUpdates } from "@/lib/socket";
import { useEffect, useState } from "react";

function MyComponent() {
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToPriceUpdates("BTCUSDT", (data) => {
      setPrice(data.price);
    });

    return () => unsubscribe();
  }, []);

  return <div>Price: ${price}</div>;
}
```

### Option 3: Multiple Symbols

```typescript
function MultiPriceComponent() {
  const btc = useBackendPrice({ symbol: "BTCUSDT" });
  const eth = useBackendPrice({ symbol: "ETHUSDT" });
  const bnb = useBackendPrice({ symbol: "BNBUSDT" });

  return (
    <div>
      <div>BTC: ${btc.price}</div>
      <div>ETH: ${eth.price}</div>
      <div>BNB: ${bnb.price}</div>
    </div>
  );
}
```

## 📝 TypeScript Types

```typescript
interface PriceUpdatePayload {
  symbol: string; // e.g., "BTCUSDT"
  price: string; // e.g., "42350.50"
  ts: number; // Timestamp in ms
}

interface UseBackendPriceOptions {
  symbol: string;
  enabled?: boolean;
  onUpdate?: (data: PriceUpdatePayload) => void;
}

interface UseBackendPriceReturn {
  price: string | null;
  timestamp: number | null;
  isConnected: boolean;
  lastUpdate: PriceUpdatePayload | null;
}
```

## 🎯 Available Symbols

- `BTCUSDT` - Bitcoin
- `ETHUSDT` - Ethereum
- `BNBUSDT` - Binance Coin

## ⚙️ Configuration

### Environment Variables (.env.local)

```bash
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

### Socket Configuration

Located in `/fe/lib/socket.ts`:

```typescript
{
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
}
```

## 🧪 Testing

### Test Pages Available:

1. **Basic Test**: http://localhost:3001/integration-test
2. **Advanced Test**: http://localhost:3001/websocket-test (with logs & manual controls)

### Quick Backend Check:

```bash
curl http://localhost:3000/health
```

## 🐛 Debugging

### Enable Socket.IO Debug Mode

In browser console:

```javascript
localStorage.debug = "socket.io-client:socket";
```

Then reload the page to see detailed logs.

### Check Connection Status

```typescript
import { getPriceSocket } from "@/lib/socket";

const socket = getPriceSocket();
console.log("Connected:", socket.connected);
console.log("Socket ID:", socket.id);
```

## ⚠️ Common Mistakes

### ❌ Don't Do This:

```typescript
// Creating new socket on every render
function BadComponent() {
  const socket = io("ws://localhost:3000/prices"); // ❌ Memory leak!
  return <div>Price</div>;
}
```

### ✅ Do This Instead:

```typescript
// Use the hook or shared socket
function GoodComponent() {
  const { price } = useBackendPrice({ symbol: "BTCUSDT" }); // ✅ Correct!
  return <div>Price: {price}</div>;
}
```

## 📦 File Structure

```
fe/
├── lib/
│   └── socket.ts              # Socket.IO connection manager
├── hooks/
│   ├── use-backend-price.ts   # Main hook for price updates
│   └── index.ts               # Hook exports
├── components/
│   └── common/
│       └── BackendPriceTile.tsx # Reusable price component
└── app/
    └── (features)/
        ├── integration-test/page.tsx
        └── websocket-test/page.tsx  # Comprehensive test page
```

## 🔗 Related Files

- **Documentation**: `/binance-final-project-chart-backend/REALTIME_API_INTEGRATION.md`
- **Verification**: `/fe/WEBSOCKET_VERIFICATION.md`
- **Test Script**: `/fe/test-websocket.js`
- **Config**: `/fe/config/app.ts`

## 💡 Pro Tips

1. **Always clean up subscriptions** - The hook does this automatically
2. **Use enabled prop** to conditionally connect: `enabled={someCondition}`
3. **Avoid multiple subscriptions** to the same symbol in one component
4. **Monitor memory** - Check DevTools for WebSocket connections
5. **Test reconnection** - Stop/start backend to verify auto-reconnect works

## 🚀 Ready to Use!

Just import the hook and start using real-time prices:

```typescript
import { useBackendPrice } from "@/hooks";

// That's it! You're connected. 🎉
```

---

**Need help?** Check the full documentation in `REALTIME_API_INTEGRATION.md`
