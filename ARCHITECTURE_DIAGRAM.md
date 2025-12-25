# WebSocket Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BINANCE EXCHANGE                                    │
│                     (WebSocket Stream Source)                                │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ Binance WebSocket Streams
                                 │ (btcusdt@miniTicker, etc.)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NESTJS BACKEND SERVER                                  │
│                         (Port 3000)                                          │
│                                                                              │
│  ┌──────────────────┐    ┌──────────────┐    ┌────────────────────┐       │
│  │ Binance Stream   │───▶│    Redis     │───▶│  Price Processor   │       │
│  │    Service       │    │    Queue     │    │      Service       │       │
│  └──────────────────┘    └──────────────┘    └──────────┬─────────┘       │
│                                                           │                  │
│                                                           ▼                  │
│                                              ┌────────────────────┐         │
│                                              │  Socket.IO Gateway │         │
│                                              │  Namespace: /prices│         │
│                                              └──────────┬─────────┘         │
└─────────────────────────────────────────────────────────┼───────────────────┘
                                                           │ Socket.IO
                                                           │ Events: subscribe,
                                                           │ unsubscribe,
                                                           │ priceUpdate
                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS FRONTEND                                      │
│                         (Port 3001)                                          │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    /lib/socket.ts                                      │  │
│  │                Socket.IO Client Manager                                │  │
│  │  ┌──────────────────────────────────────────────────────────────┐   │  │
│  │  │ • Singleton socket instance                                   │   │  │
│  │  │ • Connection: ws://localhost:3000/prices                      │   │  │
│  │  │ • Auto-reconnect enabled                                      │   │  │
│  │  │ • Transports: WebSocket + Polling fallback                   │   │  │
│  │  └──────────────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────┬─────────────────────────────────────────┘  │
│                                │                                             │
│                                ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │              /hooks/use-backend-price.ts                              │  │
│  │                   React Custom Hook                                   │  │
│  │  ┌──────────────────────────────────────────────────────────────┐   │  │
│  │  │ • Subscribe to symbol on mount                                │   │  │
│  │  │ • Listen for priceUpdate events                              │   │  │
│  │  │ • Update state on new data                                   │   │  │
│  │  │ • Unsubscribe on unmount                                     │   │  │
│  │  │ • Call optional onUpdate callback                            │   │  │
│  │  └──────────────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────┬─────────────────────────────────────────┘  │
│                                │                                             │
│                                ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     React Components                                  │  │
│  │                                                                       │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │  │
│  │  │ BackendPrice   │  │  LivePriceGrid │  │  Your Custom   │        │  │
│  │  │     Tile       │  │   Component    │  │   Component    │        │  │
│  │  └────────────────┘  └────────────────┘  └────────────────┘        │  │
│  │                                                                       │  │
│  │  All components use useBackendPrice({ symbol: 'BTCUSDT' })          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────┐
│ Binance  │  Sends miniTicker data every 1-2 seconds
└────┬─────┘
     │
     ▼
┌────────────────┐
│ NestJS Backend │  Processes and broadcasts to subscribed clients
└────┬───────────┘
     │
     ▼ Event: priceUpdate
     │ { symbol: "BTCUSDT", price: "42350.50", ts: 1703520000000 }
     │
┌────▼──────────────────────────────────────────────────────────┐
│ Frontend Socket.IO Client                                      │
│ Listening on: ws://localhost:3000/prices                       │
└────┬───────────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────┐
│ useBackendPrice    │  Filters by symbol, updates React state
│ Hook               │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ React Component    │  Displays price in UI
│ (Your Code)        │
└────────────────────┘
```

## Event Flow

### 1. Component Mount

```
Component Mounts
      │
      ▼
useBackendPrice() called
      │
      ▼
getPriceSocket() - Creates or reuses socket
      │
      ▼
socket.emit('subscribe', { symbol: 'BTCUSDT' })
      │
      ▼
Backend joins client to 'BTCUSDT' room
      │
      ▼
socket.on('priceUpdate', callback) - Listen for updates
```

### 2. Price Update

```
Binance sends price update
      │
      ▼
Backend receives via WebSocket
      │
      ▼
Backend processes data
      │
      ▼
Backend broadcasts to room: socket.to('BTCUSDT').emit('priceUpdate', data)
      │
      ▼
Frontend socket receives event
      │
      ▼
useBackendPrice hook updates state
      │
      ▼
React component re-renders with new price
      │
      ▼
User sees updated price
```

### 3. Component Unmount

```
Component Unmounts
      │
      ▼
useEffect cleanup runs
      │
      ▼
socket.off('priceUpdate', handler) - Remove listener
      │
      ▼
socket.emit('unsubscribe', { symbol: 'BTCUSDT' })
      │
      ▼
Backend removes client from 'BTCUSDT' room
      │
      ▼
No more updates sent to this client for BTCUSDT
```

## Component Relationships

```
                    ┌─────────────────────┐
                    │  Socket Manager     │
                    │  (lib/socket.ts)    │
                    │  - Singleton        │
                    │  - Connection pool  │
                    └──────────┬──────────┘
                               │ used by
                               │
                               ▼
                    ┌─────────────────────┐
                    │  useBackendPrice    │
                    │  (hooks/)           │
                    │  - Subscribe        │
                    │  - State management │
                    │  - Cleanup          │
                    └──────────┬──────────┘
                               │ used by
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                   │
            ▼                  ▼                   ▼
   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
   │ BackendPrice   │  │ LivePriceGrid  │  │ Your Custom    │
   │ Tile           │  │                │  │ Component      │
   └────────────────┘  └────────────────┘  └────────────────┘
```

## Multiple Symbols Pattern

```
Component with 3 symbols
        │
        ├─ useBackendPrice({ symbol: 'BTCUSDT' })
        │       │
        │       └─ socket.emit('subscribe', { symbol: 'BTCUSDT' })
        │
        ├─ useBackendPrice({ symbol: 'ETHUSDT' })
        │       │
        │       └─ socket.emit('subscribe', { symbol: 'ETHUSDT' })
        │
        └─ useBackendPrice({ symbol: 'BNBUSDT' })
                │
                └─ socket.emit('subscribe', { symbol: 'BNBUSDT' })

Each subscription is independent but uses the same socket connection
```

## Reconnection Flow

```
Connection lost (network issue, server restart, etc.)
        │
        ▼
socket.io detects disconnect
        │
        ▼
Triggers 'disconnect' event
        │
        ▼
Waits 1 second (reconnectionDelay)
        │
        ▼
Attempts reconnection
        │
        ├─ Success ─────────────────┐
        │                            ▼
        │                   Triggers 'connect' event
        │                            │
        │                            ▼
        │                   Need to re-subscribe to symbols
        │                   (automatic in useBackendPrice)
        │
        └─ Failure ─────────────────┐
                                     ▼
                            Waits longer (exponential backoff)
                                     │
                                     ▼
                            Retry (up to 5 attempts)
```

## Performance Considerations

```
Single WebSocket Connection
        │
        ├─ BTCUSDT subscription (1-2 updates/sec, ~150 bytes each)
        ├─ ETHUSDT subscription (1-2 updates/sec, ~150 bytes each)
        └─ BNBUSDT subscription (1-2 updates/sec, ~150 bytes each)
                                  │
                                  ▼
                Total bandwidth: ~450 bytes per second (very efficient)
                Total memory: ~10MB per connection (low)
```

## Security Flow (Production)

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│ Load Balancer│
└──────┬──────┘
       │ WSS (Secure WebSocket)
       ▼
┌─────────────┐
│  Backend    │ Validates origin, checks auth token
└──────┬──────┘
       │
       ▼ (If valid)
┌─────────────┐
│ Established │
│ Connection  │
└─────────────┘
```

---

**Legend:**

- `─▶` : Data flow
- `│` : Vertical connection
- `├─`, `└─` : Branching
- `▼` : Process flow direction
