# API Binance Socket - Tài Liệu Tiếng Việt

## Tổng Quan

Hệ thống cung cấp các API WebSocket để nhận dữ liệu giá real-time từ Binance. Hệ thống hỗ trợ hai phương thức kết nối:

1. **Kết nối trực tiếp đến Binance WebSocket**: Kết nối trực tiếp đến Binance để nhận dữ liệu kline, ticker, và trade
2. **Kết nối qua Backend Socket.IO**: Kết nối qua server backend để nhận dữ liệu giá đã được xử lý và chuẩn hóa

---

## Kết Nối Trực Tiếp Đến Binance WebSocket

### 1. Kết Nối Kline Stream (Candlestick)

**Endpoint**: `wss://stream.binance.com:9443/ws/{streamName}`

**Stream Name Format**: `{symbol}@kline_{interval}`

**Mô tả**: Kết nối để nhận dữ liệu candlestick (nến) real-time từ Binance.

**Tham số**:
- **symbol** (bắt buộc): Cặp giao dịch, ví dụ: `btcusdt`, `ethusdt` (chữ thường)
- **interval** (bắt buộc): Khoảng thời gian, các giá trị hợp lệ:
  - `1m` - 1 phút
  - `5m` - 5 phút
  - `15m` - 15 phút
  - `30m` - 30 phút
  - `1h` - 1 giờ
  - `4h` - 4 giờ
  - `1d` - 1 ngày
  - `1w` - 1 tuần
  - `1M` - 1 tháng

**Ví dụ Stream Name**: `btcusdt@kline_1h`

**Response Format**:
```json
{
  "e": "kline",
  "E": 1234567890,
  "s": "BTCUSDT",
  "k": {
    "t": 1234567890000,
    "T": 1234567895999,
    "s": "BTCUSDT",
    "i": "1h",
    "f": 100,
    "L": 200,
    "o": "50000.00",
    "c": "50100.00",
    "h": "50200.00",
    "l": "49900.00",
    "v": "100.50",
    "n": 150,
    "x": true,
    "q": "5030000.00",
    "V": "50.25",
    "Q": "2515000.00"
  }
}
```

**Các trường quan trọng**:
- `k.t`: Thời gian bắt đầu kline (milliseconds)
- `k.T`: Thời gian kết thúc kline (milliseconds)
- `k.o`: Giá mở (open price)
- `k.c`: Giá đóng (close price)
- `k.h`: Giá cao nhất (high price)
- `k.l`: Giá thấp nhất (low price)
- `k.v`: Khối lượng base asset
- `k.q`: Khối lượng quote asset
- `k.x`: Kline đã đóng hay chưa (true/false)

---

### 2. Kết Nối Ticker Stream (24h Statistics)

**Endpoint**: `wss://stream.binance.com:9443/ws/{streamName}`

**Stream Name Format**: `{symbol}@ticker`

**Mô tả**: Kết nối để nhận thống kê giá 24 giờ của một cặp giao dịch.

**Tham số**:
- **symbol** (bắt buộc): Cặp giao dịch, ví dụ: `btcusdt`, `ethusdt` (chữ thường)

**Ví dụ Stream Name**: `btcusdt@ticker`

**Response Format**:
```json
{
  "e": "24hrTicker",
  "E": 1234567890,
  "s": "BTCUSDT",
  "p": "100.00",
  "P": "0.20",
  "c": "50100.00",
  "h": "51000.00",
  "l": "49000.00",
  "v": "1000.50",
  "q": "50000000.00"
}
```

**Các trường quan trọng**:
- `c`: Giá đóng cửa (last price)
- `p`: Thay đổi giá (price change)
- `P`: Phần trăm thay đổi giá (price change percent)
- `h`: Giá cao nhất 24h
- `l`: Giá thấp nhất 24h
- `v`: Tổng khối lượng base asset 24h
- `q`: Tổng khối lượng quote asset 24h

---

### 3. Kết Nối Trade Stream (Individual Trades)

**Endpoint**: `wss://stream.binance.com:9443/ws/{streamName}`

**Stream Name Format**: `{symbol}@trade`

**Mô tả**: Kết nối để nhận từng giao dịch (trade) real-time.

**Tham số**:
- **symbol** (bắt buộc): Cặp giao dịch, ví dụ: `btcusdt`, `ethusdt` (chữ thường)

**Ví dụ Stream Name**: `btcusdt@trade`

**Response Format**:
```json
{
  "e": "trade",
  "E": 1234567890,
  "s": "BTCUSDT",
  "t": 12345,
  "p": "50100.00",
  "q": "0.5",
  "b": 67890,
  "a": 67891,
  "T": 1234567890,
  "m": false,
  "M": true
}
```

**Các trường quan trọng**:
- `t`: Trade ID
- `p`: Giá giao dịch (price)
- `q`: Khối lượng (quantity)
- `T`: Thời gian giao dịch (trade time)
- `m`: Người mua là market maker? (true/false)

---

### 4. Kết Nối Combined Stream (Nhiều Stream Cùng Lúc)

**Endpoint**: `wss://stream.binance.com:9443/stream?streams={stream1}/{stream2}/...`

**Mô tả**: Kết nối để nhận nhiều stream cùng lúc, tiết kiệm kết nối.

**Tham số query**:
- **streams** (bắt buộc): Danh sách stream names, phân cách bằng dấu `/`

**Ví dụ URL**: `wss://stream.binance.com:9443/stream?streams=btcusdt@kline_1h/ethusdt@kline_1h/btcusdt@trade`

**Response Format**:
```json
{
  "stream": "btcusdt@kline_1h",
  "data": {
    "e": "kline",
    "E": 1234567890,
    "s": "BTCUSDT",
    "k": { ... }
  }
}
```

**Lưu ý**: Response sẽ có thêm trường `stream` để xác định stream nào gửi dữ liệu.

---

## Kết Nối Qua Backend Socket.IO

### 5. Kết Nối Đến Price Gateway

**Endpoint**: `{WS_URL}/prices`

**Mô tả**: Kết nối đến Socket.IO gateway của backend để nhận dữ liệu giá đã được xử lý.

**Namespace**: `/prices`

**Cấu hình kết nối**:
- **Transports**: `websocket`, `polling`
- **Reconnection**: Tự động kết nối lại khi mất kết nối
- **Reconnection Delay**: 1000ms
- **Max Reconnection Delay**: 5000ms
- **Max Reconnection Attempts**: 5

**Ví dụ kết nối**:
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/prices', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});
```

---

### 6. Subscribe Đến Symbol

**Event**: `subscribe`

**Mô tả**: Đăng ký nhận cập nhật giá cho một symbol cụ thể.

**Payload**:
```json
{
  "symbol": "BTCUSDT"
}
```

**Tham số**:
- **symbol** (bắt buộc): Cặp giao dịch, ví dụ: `BTCUSDT`, `ETHUSDT` (chữ hoa)

**Response**:
```json
{
  "success": true,
  "message": "Subscribed to BTCUSDT"
}
```

**Cách sử dụng**:
```typescript
socket.emit('subscribe', { symbol: 'BTCUSDT' });
```

**Lưu ý**: Sau khi subscribe, client sẽ tự động nhận các event `priceUpdate` cho symbol đó.

---

### 7. Unsubscribe Khỏi Symbol

**Event**: `unsubscribe`

**Mô tả**: Hủy đăng ký nhận cập nhật giá cho một symbol.

**Payload**:
```json
{
  "symbol": "BTCUSDT"
}
```

**Tham số**:
- **symbol** (bắt buộc): Cặp giao dịch cần hủy đăng ký

**Response**:
```json
{
  "success": true,
  "message": "Unsubscribed from BTCUSDT"
}
```

**Cách sử dụng**:
```typescript
socket.emit('unsubscribe', { symbol: 'BTCUSDT' });
```

---

### 8. Nhận Cập Nhật Giá (Price Update)

**Event**: `priceUpdate`

**Mô tả**: Event được emit tự động khi có cập nhật giá mới cho symbol đã subscribe.

**Payload**:
```json
{
  "symbol": "BTCUSDT",
  "price": "50100.00",
  "ts": 1234567890
}
```

**Các trường**:
- **symbol** (string): Cặp giao dịch
- **price** (string): Giá hiện tại
- **ts** (number): Timestamp (milliseconds)

**Cách sử dụng**:
```typescript
socket.on('priceUpdate', (data) => {
  console.log(`Price update for ${data.symbol}: ${data.price}`);
});
```

**Lưu ý**: 
- Chỉ nhận được event này sau khi đã subscribe đến symbol
- Dữ liệu được chuẩn hóa từ nhiều nguồn (24hrMiniTicker, trade, kline)
- Backend tự động lọc và gửi giá mới nhất

---

## React Hooks

### 9. useBinanceWebSocket Hook

**Mô tả**: Hook React để kết nối trực tiếp đến Binance WebSocket cho kline data.

**Import**:
```typescript
import { useBinanceWebSocket } from '@/hooks/use-binance-websocket';
```

**Tham số**:
- **symbol** (bắt buộc): Cặp giao dịch, ví dụ: `BTCUSDT`
- **interval** (bắt buộc): Khoảng thời gian kline, ví dụ: `1h`, `5m`
- **enabled** (tùy chọn, mặc định: `true`): Bật/tắt kết nối
- **onMessage** (tùy chọn): Callback khi nhận message
- **onConnect** (tùy chọn): Callback khi kết nối thành công
- **onDisconnect** (tùy chọn): Callback khi ngắt kết nối
- **onError** (tùy chọn): Callback khi có lỗi

**Return**:
- **isConnected** (boolean): Trạng thái kết nối
- **error** (string | null): Lỗi nếu có
- **lastMessage** (BinanceKlineMessage | null): Message cuối cùng nhận được
- **reconnect** (function): Hàm để kết nối lại
- **disconnect** (function): Hàm để ngắt kết nối

**Ví dụ sử dụng**:
```typescript
const { isConnected, lastMessage } = useBinanceWebSocket({
  symbol: 'BTCUSDT',
  interval: '1h',
  onMessage: (data) => {
    console.log('Kline update:', data);
  },
  onConnect: () => {
    console.log('Connected to Binance');
  },
});
```

---

### 10. useBackendPrice Hook

**Mô tả**: Hook React để kết nối qua backend Socket.IO và nhận cập nhật giá.

**Import**:
```typescript
import { useBackendPrice } from '@/hooks/use-backend-price';
```

**Tham số**:
- **symbol** (bắt buộc): Cặp giao dịch, ví dụ: `BTCUSDT`
- **enabled** (tùy chọn, mặc định: `true`): Bật/tắt kết nối
- **onUpdate** (tùy chọn): Callback khi có cập nhật giá

**Return**:
- **price** (string | null): Giá hiện tại
- **timestamp** (number | null): Timestamp của giá
- **isConnected** (boolean): Trạng thái kết nối
- **lastUpdate** (PriceUpdatePayload | null): Cập nhật cuối cùng

**Ví dụ sử dụng**:
```typescript
const { price, isConnected } = useBackendPrice({
  symbol: 'BTCUSDT',
  onUpdate: (data) => {
    console.log('New price:', data.price);
  },
});
```

---

## Service Classes

### 11. BinanceWebSocketService

**Mô tả**: Service class để quản lý kết nối WebSocket đến Binance.

**Import**:
```typescript
import { 
  BinanceWebSocketService,
  createKlineStream,
  createTickerStream,
  createCombinedStream 
} from '@/lib/services/binance-websocket';
```

**Tạo Kline Stream**:
```typescript
const klineStream = createKlineStream(
  'btcusdt',
  '1h',
  (data) => {
    console.log('Kline update:', data);
  },
  {
    onConnect: () => console.log('Connected'),
    onError: (error) => console.error('Error:', error),
    onDisconnect: () => console.log('Disconnected'),
  }
);

klineStream.connect();
// ... sau khi dùng xong
klineStream.disconnect();
```

**Tạo Ticker Stream**:
```typescript
const tickerStream = createTickerStream(
  'btcusdt',
  (data) => {
    console.log('Ticker update:', data);
  }
);

tickerStream.connect();
```

**Tạo Combined Stream**:
```typescript
const combinedStream = createCombinedStream(
  ['btcusdt@kline_1h', 'ethusdt@kline_1h'],
  (data) => {
    console.log('Stream update:', data);
  }
);

combinedStream.connect();
```

**Methods**:
- `connect()`: Kết nối WebSocket
- `disconnect()`: Ngắt kết nối
- `isConnected()`: Kiểm tra trạng thái kết nối
- `getReadyState()`: Lấy ready state của WebSocket

---

### 12. subscribeToPriceUpdates Function

**Mô tả**: Function helper để subscribe đến cập nhật giá qua backend Socket.IO.

**Import**:
```typescript
import { subscribeToPriceUpdates } from '@/lib/socket';
```

**Cách sử dụng**:
```typescript
const unsubscribe = subscribeToPriceUpdates('BTCUSDT', (data) => {
  console.log('Price update:', data.price);
});

// Khi không cần nữa, gọi unsubscribe
unsubscribe();
```

**Return**: Function để unsubscribe (cleanup function)

---

## Lưu Ý Chung

### Kết Nối Trực Đến Binance
- **URL Base**: `wss://stream.binance.com:9443`
- **Single Stream**: `/ws/{streamName}`
- **Combined Stream**: `/stream?streams={stream1}/{stream2}/...`
- **Reconnection**: Nên implement tự động kết nối lại khi mất kết nối
- **Rate Limits**: Binance có giới hạn số lượng kết nối, nên sử dụng combined stream khi cần nhiều stream
- **Symbol Format**: Luôn sử dụng chữ thường cho symbol trong stream name (ví dụ: `btcusdt`, không phải `BTCUSDT`)

### Kết Nối Qua Backend
- **Namespace**: `/prices`
- **Auto Reconnection**: Socket.IO tự động kết nối lại
- **Room-based**: Backend sử dụng room-based broadcasting, mỗi symbol là một room
- **Data Normalization**: Backend tự động chuẩn hóa dữ liệu từ nhiều nguồn (24hrMiniTicker, trade, kline)
- **Symbol Format**: Sử dụng chữ hoa cho symbol khi subscribe/unsubscribe (ví dụ: `BTCUSDT`)

### Best Practices
1. **Sử dụng Backend Socket.IO** khi cần dữ liệu giá đơn giản, đã được chuẩn hóa
2. **Sử dụng Direct Binance WebSocket** khi cần dữ liệu chi tiết (kline, ticker, trade)
3. **Luôn cleanup** khi component unmount hoặc không cần nữa
4. **Xử lý lỗi** đầy đủ với các callback `onError`
5. **Implement reconnection logic** cho kết nối trực tiếp đến Binance
6. **Sử dụng combined stream** khi cần nhiều stream để tiết kiệm kết nối
7. **Kiểm tra trạng thái kết nối** trước khi gửi/nhận dữ liệu

### Error Handling
- WebSocket có thể bị ngắt kết nối bất cứ lúc nào
- Cần xử lý các trường hợp: network error, timeout, server error
- Implement retry logic với exponential backoff
- Log lỗi để debug

### Performance
- Backend tự động lọc và chỉ gửi giá mới nhất, giảm traffic
- Combined stream giúp giảm số lượng kết nối WebSocket
- Sử dụng React hooks để tự động cleanup khi component unmount
- Tránh subscribe quá nhiều symbol cùng lúc nếu không cần thiết
