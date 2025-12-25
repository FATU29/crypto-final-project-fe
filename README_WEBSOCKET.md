# 🚀 WebSocket Integration - Complete Setup

## Overview

This frontend application is fully integrated with the NestJS backend WebSocket server for real-time cryptocurrency price streaming from Binance.

## ✅ What's Included

### 📦 Core Implementation

- **Socket.IO Client**: v4.8.1 (latest stable)
- **Custom React Hook**: `useBackendPrice` for easy integration
- **Connection Manager**: Singleton pattern with auto-reconnect
- **TypeScript Support**: Full type safety
- **Error Handling**: Comprehensive error management

### 🎨 Components

- `BackendPriceTile` - Reusable price display with animations
- `LivePriceGrid` - Multi-symbol price grid
- Example components in `/components/examples/`

### 🧪 Test Pages

1. **Basic Integration Test**: `/integration-test`
2. **Advanced WebSocket Test**: `/websocket-test` ⭐ (Full test suite with logs)

### 📚 Documentation

- `IMPLEMENTATION_SUMMARY.md` - Complete overview
- `WEBSOCKET_VERIFICATION.md` - Testing checklist
- `WEBSOCKET_QUICK_START.md` - Developer reference
- `REALTIME_API_INTEGRATION.md` - Backend API docs (in backend folder)

---

## 🏃 Quick Start

### 1. Install Dependencies (Already Done)

```bash
npm install
# socket.io-client@4.8.1 is already installed
```

### 2. Configure Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

Or copy from example:

```bash
cp .env.example .env.local
```

### 3. Start the Application

```bash
npm run dev
```

### 4. Test the Connection

Open: http://localhost:3001/websocket-test

You should see:

- ✅ Connection status: **CONNECTED**
- 📊 Real-time price updates for BTC
- 📝 Event logs showing subscription success

---

## 💻 How to Use in Your Code

### Simple Example

```typescript
import { useBackendPrice } from "@/hooks";

function MyComponent() {
  const { price, isConnected } = useBackendPrice({
    symbol: "BTCUSDT",
  });

  return (
    <div>
      <p>Bitcoin: ${price}</p>
      <p>Status: {isConnected ? "🟢 Live" : "🔴 Offline"}</p>
    </div>
  );
}
```

### With Callback

```typescript
const { price } = useBackendPrice({
  symbol: "ETHUSDT",
  onUpdate: (data) => {
    console.log("New Ethereum price:", data.price);
  },
});
```

### Multiple Symbols

```typescript
function MultiPrice() {
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

### Conditional Connection

```typescript
const [shouldConnect, setShouldConnect] = useState(false);

const { price, isConnected } = useBackendPrice({
  symbol: "BTCUSDT",
  enabled: shouldConnect, // Only connect when true
});
```

---

## 📁 File Structure

```
fe/
├── lib/
│   └── socket.ts                      # Socket.IO connection manager
├── hooks/
│   ├── use-backend-price.ts           # Main WebSocket hook
│   └── index.ts
├── components/
│   ├── common/
│   │   └── BackendPriceTile.tsx       # Price tile component
│   ├── pages/
│   │   └── dashboard/
│   │       └── LivePriceGrid.tsx      # Multi-symbol grid
│   └── examples/
│       └── SimplePriceDisplay.tsx     # Copy-paste examples
├── app/
│   └── (features)/
│       ├── integration-test/          # Basic test page
│       └── websocket-test/            # Advanced test page ⭐
├── config/
│   └── app.ts                         # App configuration
├── test-websocket.js                  # Node.js test script
├── .env.example                       # Environment template
├── IMPLEMENTATION_SUMMARY.md          # This file
├── WEBSOCKET_VERIFICATION.md          # Testing guide
└── WEBSOCKET_QUICK_START.md           # Quick reference
```

---

## 🧪 Testing

### Web Interface Testing

**Recommended**: Use the advanced test page

```
http://localhost:3001/websocket-test
```

Features:

- ✅ Real-time connection monitoring
- ✅ Auto & manual test modes
- ✅ Event logging
- ✅ Subscribe/unsubscribe controls
- ✅ Symbol switching
- ✅ Raw data inspection

### Node.js Testing

```bash
node test-websocket.js
```

This will:

1. Connect to WebSocket server
2. Subscribe to BTCUSDT
3. Display 10 price updates
4. Auto-disconnect

### Browser Console Testing

```javascript
const socket = window.io("http://localhost:3000/prices");

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
  socket.emit("subscribe", { symbol: "BTCUSDT" });
});

socket.on("priceUpdate", (data) => {
  console.log("📊 Price:", data);
});
```

---

## 🔧 Configuration

### Socket.IO Settings

Located in `/lib/socket.ts`:

```typescript
{
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
}
```

### Supported Symbols

- `BTCUSDT` - Bitcoin / Tether
- `ETHUSDT` - Ethereum / Tether
- `BNBUSDT` - Binance Coin / Tether

To add more symbols, update the backend's `BINANCE_STREAMS` environment variable.

---

## 🐛 Troubleshooting

### Issue: Cannot connect to WebSocket

**Solutions:**

1. Verify backend is running:
   ```bash
   curl http://localhost:3000/health
   ```
2. Check `.env.local` has correct `NEXT_PUBLIC_WS_URL`
3. Restart frontend dev server
4. Check firewall settings

### Issue: No price updates

**Solutions:**

1. Open `/websocket-test` and check logs
2. Verify subscription success message
3. Check backend logs for errors
4. Ensure Redis is running (backend dependency)
5. Verify symbol exists in backend `BINANCE_STREAMS`

### Issue: Connection keeps dropping

**Solutions:**

1. Check network stability
2. Verify backend server is stable
3. Check Redis connection
4. Review backend logs for crashes

### Enable Debug Mode

In browser console:

```javascript
localStorage.debug = "socket.io-client:socket";
```

Then reload page to see detailed logs.

---

## 📊 API Reference

### Hook: `useBackendPrice`

```typescript
interface UseBackendPriceOptions {
  symbol: string; // Required: "BTCUSDT", "ETHUSDT", etc.
  enabled?: boolean; // Optional: Enable/disable connection (default: true)
  onUpdate?: (data) => void; // Optional: Callback on price update
}

interface UseBackendPriceReturn {
  price: string | null; // Current price as string
  timestamp: number | null; // Last update timestamp
  isConnected: boolean; // Connection status
  lastUpdate: object | null; // Last update payload
}
```

### Data Format

```typescript
{
  symbol: "BTCUSDT",
  price: "42350.50",
  ts: 1703520000000
}
```

### Events

| Event         | Direction       | Purpose                 |
| ------------- | --------------- | ----------------------- |
| `subscribe`   | Client → Server | Subscribe to symbol     |
| `unsubscribe` | Client → Server | Unsubscribe from symbol |
| `priceUpdate` | Server → Client | Receive price update    |

---

## 🚀 Production Deployment

### Before deploying:

1. **Update WebSocket URL to use WSS**:

   ```bash
   NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
   ```

2. **Update backend CORS settings** to allow your frontend domain

3. **Enable HTTPS** (required for WSS)

4. **Add authentication** (optional but recommended):

   ```typescript
   io(wsUrl, {
     auth: {
       token: "your-jwt-token",
     },
   });
   ```

5. **Set up monitoring** for WebSocket connections

---

## 📈 Performance

| Metric                | Value          |
| --------------------- | -------------- |
| Connection time       | ~100-200ms     |
| Update frequency      | 1-2 seconds    |
| Data size per update  | ~100-200 bytes |
| Memory per connection | ~5-10MB        |
| Reconnection delay    | 1-5 seconds    |

---

## ✅ Verification Checklist

Before considering this complete:

- [ ] Backend running on port 3000
- [ ] Frontend running on port 3001
- [ ] Can connect to WebSocket
- [ ] Price updates received
- [ ] Can subscribe/unsubscribe
- [ ] Reconnection works after backend restart
- [ ] Multiple symbols work simultaneously
- [ ] No memory leaks after long sessions
- [ ] No console errors
- [ ] TypeScript compiles without errors

---

## 🎯 Next Steps

1. **Test the integration**: Visit http://localhost:3001/websocket-test
2. **Review the code**: Check `/lib/socket.ts` and `/hooks/use-backend-price.ts`
3. **Try examples**: Copy code from `/components/examples/SimplePriceDisplay.tsx`
4. **Read documentation**: See `WEBSOCKET_QUICK_START.md` for more examples
5. **Deploy**: Follow production checklist above

---

## 📞 Support

- **Backend API Docs**: `/binance-final-project-chart-backend/REALTIME_API_INTEGRATION.md`
- **Quick Start**: `WEBSOCKET_QUICK_START.md`
- **Verification**: `WEBSOCKET_VERIFICATION.md`
- **Examples**: `/components/examples/SimplePriceDisplay.tsx`

---

## ✨ Features

- ✅ Real-time price updates
- ✅ Automatic reconnection
- ✅ Multiple symbol support
- ✅ TypeScript support
- ✅ Error handling
- ✅ Memory leak prevention
- ✅ Connection status tracking
- ✅ Conditional connections
- ✅ Custom callbacks
- ✅ Reusable components

---

**Status**: ✅ Complete and Ready for Testing  
**Last Updated**: December 25, 2025  
**Version**: 1.0.0
