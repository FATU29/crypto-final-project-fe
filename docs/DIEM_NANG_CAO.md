# 📊 BÁO CÁO ĐIỂM NÂNG CAO - Crypto Trading Platform

## Tổng Quan Dự Án

Nền tảng giao dịch tiền điện tử (Crypto Trading Platform) được xây dựng theo kiến trúc **Microservices** hoàn chỉnh, triển khai trên **Kubernetes (Minikube)** với khả năng scale tự động lên tới **1000+ kết nối đồng thời**. Hệ thống tích hợp AI phân tích cảm xúc, dự đoán giá, WebSocket thời gian thực, và crawl tin tức đa nguồn.

---

## 1. 🤖 AI Cải Tiến (Không chỉ gọi API đơn giản)

### 1.1 Kiến Trúc AI Service (Python/FastAPI)

| Thành phần                    | Mô tả                                                                                     | Độ phức tạp                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Sentiment Analysis Engine** | Phân tích cảm xúc bài viết crypto, phân loại bullish/bearish/neutral với confidence score | Xây dựng pipeline xử lý + prompt engineering phức tạp |
| **Price Prediction Engine**   | Tổng hợp tin tức → phân tích → dự đoán xu hướng giá                                       | Multi-step reasoning với context aggregation          |
| **Causal Analysis Engine**    | Phân tích quan hệ nhân quả giữa tin tức và biến động giá                                  | Tương quan dữ liệu Binance kline + tin tức + AI       |
| **AI HTML Parser**            | Trích xuất nội dung bài viết từ HTML thô                                                  | Structured output extraction từ unstructured data     |
| **AI Chatbox (MCP Pattern)**  | Chatbot sử dụng Function Calling (tool use)                                               | Agentic AI với multi-tool orchestration               |

### 1.2 Chứng Minh Độ Phức Tạp

**a) Không phải chỉ gọi OpenAI API đơn giản:**

- **Pipeline xử lý đa bước**: Tin tức → Crawl → Lọc chất lượng → Sentiment → Lưu DB → Aggregation → Prediction
- **Function Calling / MCP Pattern**: AI Chatbox sử dụng tool `get_crypto_price_prediction` và `search_articles_db` - hệ thống tự quyết định khi nào gọi tool nào
- **Server-side Model Control**: Tham số model (version, max_tokens, temperature) chỉ được cấu hình phía server, ngăn client thao túng chi phí
- **Async Processing**: Sử dụng SQLAlchemy 2.0 async + FastAPI async endpoints cho xử lý đồng thời
- **Structured Logging**: Structlog với JSON format, correlation IDs cho traceability

**b) Causal Analysis - Phân tích nhân quả:**

```
Flow: Tin tức → Xác định thời điểm → Lấy dữ liệu Binance kline (hours_before/hours_after)
     → So sánh giá trước/sau tin → AI phân tích mối tương quan → Kết luận impact
```

- Tự động fetch dữ liệu giá từ Binance REST API
- Tính toán % biến động giá trong khung thời gian
- AI phân tích mối quan hệ nhân quả giữa nội dung tin và biến động giá

**c) AI HTML Parser - Tự động trích xuất nội dung:**

- Khi rule-based CSS selector thất bại, hệ thống fallback sang AI để parse HTML
- Trích xuất structured data: title, content, author, date, images, tags
- Kết hợp với `SelectorLearner` tự học CSS selector mới

**File tham khảo:**

- `ai/app/` - Toàn bộ AI service code
- `ai/main.py` - FastAPI application entry point
- `ai/app/routers/` - API endpoints (sentiment, prediction, causal, chat)
- `ai/app/services/` - Business logic layer

---

## 2. 📊 Backtesting (Kết hợp phức tạp các điều kiện)

### 2.1 Causal Analysis = Backtesting Cơ Bản

| Tính năng                    | Mô tả                                                    |
| ---------------------------- | -------------------------------------------------------- |
| **News-Price Correlation**   | So sánh giá crypto trước và sau khi tin tức xuất hiện    |
| **Configurable Time Window** | Tùy chỉnh `hours_before` và `hours_after` (mặc định 24h) |
| **Multi-Symbol Support**     | Phân tích trên 20+ cặp giao dịch (BTCUSDT, ETHUSDT, ...) |
| **Binance Kline Data**       | Dữ liệu nến (candlestick) thực từ Binance REST API       |

### 2.2 Kết Hợp Chỉ Báo & Mô Hình AI

- **Input**: Tin tức + Dữ liệu giá lịch sử (kline) + Sentiment score
- **Process**: AI phân tích đa chiều (nội dung tin, context thị trường, biến động giá)
- **Output**: Đánh giá impact (high/medium/low), hướng (bullish/bearish), confidence score

**API Endpoints:**

- `POST /api/v1/causal/analyze/direct` - Phân tích trực tiếp với bài viết cụ thể
- `POST /api/v1/predictions/predict` - Dự đoán giá dựa trên tổng hợp tin tức

---

## 3. 🏗️ Microservices (Dịch vụ độc lập, dễ mở rộng)

### 3.1 Kiến Trúc 7 Microservices

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NGINX Ingress Controller                          │
│  localhost:80 → routing theo path                                          │
│  /              → Frontend (Next.js)                                       │
│  /api/          → API Gateway (Spring Cloud Gateway)                       │
│  /ws/           → WebSocket Gateway (NestJS + Socket.IO)                   │
│  /ai/           → AI Service (FastAPI) - truy cập trực tiếp               │
└─────────────┬───────────────┬───────────────┬──────────────┬───────────────┘
              │               │               │              │
   ┌──────────▼──────┐ ┌─────▼──────┐ ┌──────▼─────┐ ┌──────▼──────┐
   │  Frontend        │ │ API Gateway│ │ WebSocket  │ │  AI Service │
   │  Next.js 16      │ │ Spring     │ │ Gateway    │ │  FastAPI    │
   │  React 19        │ │ Cloud GW   │ │ NestJS     │ │  Python 3   │
   │  TypeScript      │ │ Java       │ │ Socket.IO  │ │  OpenAI     │
   │  Port: 3000      │ │ Port: 9000 │ │ Port: 3000 │ │  Port: 8000 │
   │  Replicas: 2-10  │ │ Rep: 2-10  │ │ Rep: 3-20  │ │  Rep: 1-5   │
   └──────────────────┘ └──────┬─────┘ └──────┬─────┘ └──────┬──────┘
                               │              │              │
                    ┌──────────▼──────────┐   │              │
                    │  Route to services  │   │              │
                    ├─────────────────────┤   │              │
                    │ /auth → Auth Svc    │   │              │
                    │ /news → Crawl Svc   │   │              │
                    │ /ai   → AI Svc      │   │              │
                    └──┬──────────┬───────┘   │              │
                       │          │           │              │
            ┌──────────▼───┐ ┌────▼──────┐   │              │
            │ Auth Service │ │ Crawl Svc │   │              │
            │ Spring Boot  │ │ Golang    │   │              │
            │ MongoDB      │ │ Colly     │   │              │
            │ JWT + OAuth  │ │ GoFeed    │   │              │
            │ Port: 8081   │ │ Port:9000 │   │              │
            │ Rep: 1-5     │ │ Rep: 1-3  │   │              │
            └──────┬───────┘ └──┬────────┘   │              │
                   │            │             │              │
   ┌───────────────▼────────────▼─────────────▼──────────────▼──────────┐
   │                        Data Layer (crypto-data namespace)          │
   │  ┌──────────┐    ┌──────────────┐    ┌──────────┐                  │
   │  │  Redis   │    │  PostgreSQL  │    │  MongoDB │                  │
   │  │ 7-alpine │    │  15-alpine   │    │ 7-jammy  │                  │
   │  │ Pub/Sub  │    │  crypto_news │    │ auth_db  │                  │
   │  │ Cache    │    │  ai_service  │    │ Users    │                  │
   │  │ Socket.IO│    │              │    │ Tokens   │                  │
   │  │ Adapter  │    │              │    │          │                  │
   │  └──────────┘    └──────────────┘    └──────────┘                  │
   └────────────────────────────────────────────────────────────────────┘
```

### 3.2 Chứng Minh Độ Phức Tạp

**a) 5 ngôn ngữ / framework khác nhau:**
| Service | Ngôn ngữ | Framework | Database |
|---|---|---|---|
| Frontend | TypeScript | Next.js 16 + React 19 | - |
| API Gateway | Java | Spring Cloud Gateway (Reactive/WebFlux) | - |
| Auth Service | Java | Spring Boot + Spring Security | MongoDB |
| AI Service | Python | FastAPI + SQLAlchemy 2.0 (async) | PostgreSQL |
| Crawl Service | Go | Gin + Colly + GoFeed | PostgreSQL + Redis |
| WebSocket Gateway | TypeScript | NestJS + Socket.IO | Redis |

**b) 8 Kubernetes Namespaces riêng biệt:**

- `crypto-frontend` - Presentation tier
- `crypto-gateway` - API routing tier
- `crypto-auth` - Security tier
- `crypto-ai` - Analysis tier
- `crypto-crawl` - Data collection tier
- `crypto-websocket` - Real-time tier
- `crypto-data` - Storage tier (Redis, PostgreSQL, MongoDB)
- `crypto-ingress` - Edge tier

**c) API Gateway Pattern (Spring Cloud Gateway):**

- **Zero-Trust Authentication**: Mỗi request được validate JWT bằng cách gọi Auth service `/me`
- **VIP Authorization Filter**: Kiểm tra account type cho AI endpoints
- **Circuit Breaker** (Resilience4j): Mỗi service có circuit breaker riêng với configurable thresholds
- **Route-level Timeout**: Auth: 10s, AI: 120s, Crawl: 90s, Default: 60s
- **CORS Management**: Centralized qua `CorsResponseFilter`
- **User Context Forwarding**: Inject `X-User-Id`, `X-User-Email`, `X-User-Role` headers

**d) Independent Deployment & Scaling:**

- Mỗi service có Dockerfile riêng, build và deploy độc lập
- HPA (Horizontal Pod Autoscaler) trên mỗi service
- PodDisruptionBudget đảm bảo high availability
- Pod Anti-Affinity phân bổ pods trên nhiều nodes

**File tham khảo:**

- `k8s/*.yaml` - Kubernetes manifests cho toàn bộ services
- `docker-compose.yml` - Docker Compose cho development
- `binance-final-project-gateway-backend/` - API Gateway source code

---

## 4. ⚡ Dữ Liệu Thời Gian Thực

### 4.1 Kiến Trúc Real-time Data Pipeline

```
Binance WebSocket API (wss://stream.binance.com:9443)
    │
    │  20+ trading pairs: BTC, ETH, BNB, XRP, SOL, ADA, DOGE, ...
    │  Mini Ticker streams (cập nhật mỗi giây)
    │
    ▼
┌──────────────────────────────┐
│   NestJS WebSocket Gateway   │
│   BinanceStreamService       │
│   - Auto-reconnect           │
│   - Exponential backoff      │
│   - Max 10 retry attempts    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Redis Pub/Sub              │
│   Channel: price:{symbol}    │
│   - Fan-out to all pods      │
│   - Cross-pod broadcasting   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Redis Socket.IO Adapter    │
│   - Multi-pod sync           │
│   - Horizontal scaling       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Socket.IO /prices NS       │
│   PriceGateway               │
│   - Room-based subscription  │
│   - Per-symbol rooms         │
│   - Client subscribe/unsub   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Frontend (Browser)         │
│   - TradingView Charts       │
│   - Real-time price update   │
│   - News markers on chart    │
└──────────────────────────────┘
```

### 4.2 Chứng Minh Độ Phức Tạp

**a) Multi-layer Architecture:**

1. **Binance WebSocket Consumer** → Kết nối persistent WebSocket tới Binance
2. **Redis Pub/Sub** → Fan-out giá tới tất cả WebSocket Gateway pods
3. **Redis Socket.IO Adapter** → Đồng bộ Socket.IO events giữa các pods
4. **BullMQ Queue** → Async price persistence jobs
5. **Socket.IO Broadcast** → Push real-time tới frontend clients

**b) 20+ Trading Pairs Đồng Thời:**

- BTCUSDT, ETHUSDT, BNBUSDT, XRPUSDT, SOLUSDT, ADAUSDT, DOGEUSDT, MATICUSDT
- LTCUSDT, LINKUSDT, DOTUSDT, AVAXUSDT, UNIUSDT, ATOMUSDT, ETCUSDT
- FILUSDT, TRXUSDT, NEOUSDT, ALGOUSDT, VETUSDT

**c) WebSocket Optimization:**

- `WS_PING_INTERVAL`: 25s - Heartbeat interval
- `WS_PING_TIMEOUT`: 60s - Connection timeout
- `WS_MAX_PAYLOAD`: 1MB - Maximum message size
- `WS_PER_MESSAGE_DEFLATE`: disabled - Giảm CPU overhead cho high-throughput

**File tham khảo:**

- `binance-final-project-chart-backend/src/` - WebSocket Gateway source
- `fe/components/` - Frontend real-time chart components

---

## 5. 📰 Phân Tích Cảm Xúc (Sentiment Analysis)

### 5.1 Pipeline Phân Tích Cảm Xúc

```
16 Nguồn Tin Tức Crypto
    │
    │  CoinTelegraph, CoinDesk, CryptoNews, Binance, CoinMarketCap,
    │  TheBlock, Decrypt, UToday, CryptoSlate, BeInCrypto,
    │  AMBCrypto, NewsBTC, BitcoinMagazine, CryptoPotato, 99Bitcoins, BitcoinCom
    │
    ▼
┌──────────────────────────────┐
│   Go Crawler Service          │
│   - Colly (HTML scraping)     │
│   - GoFeed (RSS parsing)     │
│   - Adaptive Selectors       │
│   - Quality Assessment       │
│   - Spam Detection            │
│   - CronJob (hourly)         │
└──────────────┬───────────────┘
               │
               │  POST /api/v1/sentiment/analyze
               ▼
┌──────────────────────────────┐
│   AI Sentiment Engine         │
│   - Phân loại: Bullish /      │
│     Bearish / Neutral         │
│   - Confidence Score (0-1)    │
│   - Key Factors extraction    │
│   - Trading pair detection    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   PostgreSQL Storage          │
│   - Sentiment per article     │
│   - Trend tracking            │
│   - Source analytics          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Frontend Dashboard          │
│   - Sentiment Gauge           │
│   - Trend Charts (Recharts)   │
│   - Per-pair sentiment        │
│   - Badge indicators          │
└──────────────────────────────┘
```

### 5.2 Chứng Minh Không Chỉ Call API

**a) Adaptive Crawler System (Go):**

- `SelectorLearner`: Tự học CSS selector dựa trên success/failure rate
- `StructureMonitor`: Phát hiện website thay đổi cấu trúc tự động
- Auto-discovery CSS selectors mới khi selectors cũ thất bại
- **Content Quality Assessment**: Spam detection, length validation, caps detection, quality scoring (0-100)

**b) Multi-step Processing Pipeline:**

1. Crawl 16 nguồn → 2. Lọc chất lượng → 3. Trích xuất nội dung → 4. Detect trading pairs
2. Gửi AI phân tích sentiment → 6. Lưu kết quả → 7. Aggregate trends → 8. Hiển thị dashboard

**c) AI Fallback cho HTML Parsing:**

- Rule-based selectors (CSS) → Nếu thất bại → AI HTML Parser (OpenAI)
- Structured output: title, content, author, date, images, tags

**d) Trading Pair Auto-Detection:**

- Tự động phát hiện crypto symbols trong nội dung tin tức
- Map tin tức → cặp giao dịch liên quan (BTCUSDT, ETHUSDT, ...)

**File tham khảo:**

- `crawl-news/internal/` - Crawler business logic
- `crawl-news/pkg/` - Shared packages
- `ai/app/routers/sentiment.py` - Sentiment API
- `fe/components/` - Sentiment dashboard UI

---

## 6. 🔌 WebSocket (Xử lý nhiều kết nối đồng thời, ổn định)

### 6.1 Kiến Trúc WebSocket Scaling

```
                     1000+ Clients
                         │
                         ▼
              ┌─────────────────────┐
              │   NGINX Ingress     │
              │   IP Hash Sticky    │
              │   Timeout: 3600s    │
              └──────────┬──────────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
     ┌──────▼──────┐ ┌───▼──────┐ ┌───▼──────┐
     │   Pod #1    │ │  Pod #2  │ │  Pod #3  │  ... Pod #N (up to 20)
     │   NestJS    │ │  NestJS  │ │  NestJS  │
     │   Socket.IO │ │  Socket.IO│ │ Socket.IO│
     └──────┬──────┘ └───┬──────┘ └───┬──────┘
            │            │            │
            └────────────┼────────────┘
                         │
              ┌──────────▼──────────┐
              │   Redis Pub/Sub     │
              │   + Socket.IO       │
              │   Adapter           │
              │   maxclients: 10000 │
              │   maxmemory: 512MB  │
              └─────────────────────┘
```

### 6.2 Chứng Minh Độ Phức Tạp

**a) Horizontal Scaling với Redis Socket.IO Adapter:**

- Mỗi pod kết nối tới Redis adapter
- Messages được broadcast giữa tất cả pods
- Client subscribe room `price:{symbol}` → nhận data từ bất kỳ pod nào

**b) HPA Configuration (Aggressive Scaling):**

```yaml
# WebSocket Gateway HPA
minReplicas: 3 # Luôn có ít nhất 3 pods
maxReplicas: 20 # Scale tối đa 20 pods
scaleUp:
  stabilizationWindowSeconds: 0 # Scale up ngay lập tức
  policies:
    - type: Percent
      value: 100 # Tăng gấp đôi số pods
      periodSeconds: 10 # Mỗi 10 giây
    - type: Pods
      value: 5 # Hoặc thêm 5 pods
      periodSeconds: 10
```

**c) Connection Stability:**

- `PodDisruptionBudget`: Luôn giữ ít nhất 2 pods running
- `Pod Anti-Affinity`: Phân bổ pods trên nhiều nodes
- `PreStop Hook`: Sleep 15s trước khi terminate (graceful drain connections)
- `terminationGracePeriodSeconds`: 30s cho connections close gracefully
- `SessionAffinity: ClientIP` với timeout 3600s
- Headless Service cho direct pod discovery

**d) NGINX Ingress WebSocket Settings:**

```yaml
nginx.ingress.kubernetes.io/proxy-http-version: "1.1" # WebSocket require HTTP/1.1
nginx.ingress.kubernetes.io/upstream-hash-by: "$remote_addr" # IP-hash sticky session
nginx.ingress.kubernetes.io/websocket-services: "websocket-gateway"
nginx.ingress.kubernetes.io/proxy-read-timeout: "3600" # 1 hour timeout
nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
nginx.ingress.kubernetes.io/proxy-buffering: "off" # No buffering for real-time
```

**File tham khảo:**

- `k8s/websocket-gateway.yaml` - K8s deployment + HPA
- `k8s/ingress.yaml` - NGINX Ingress configuration
- `binance-final-project-chart-backend/src/` - NestJS WebSocket code

---

## 7. 🧪 Load Testing (K6 Performance Testing)

### 7.1 Bộ Test Scenarios

| Test                       | Max VUs               | Thời gian | Mục đích                                               |
| -------------------------- | --------------------- | --------- | ------------------------------------------------------ |
| `websocket-load-test.js`   | 1,500                 | ~26 phút  | WebSocket scaling, message latency < 200ms (p95)       |
| `api-gateway-load-test.js` | 1,500                 | ~17 phút  | Auth flow, News API, VIP endpoints, latency < 2s (p95) |
| `socketio-scaling-test.js` | 1,000+ (configurable) | 10+ phút  | Socket.IO handshake, namespace connect, polling        |

### 7.2 Test Scenarios Chi Tiết

**WebSocket Load Test:**

- Ramp: 0 → 500 (2m) → 1000 (3m) → hold 10m → spike 1500 (2m) → hold 3m → ramp down
- Thresholds: Connection error < 1%, Message error < 1%, Latency p95 < 200ms

**API Gateway Load Test:**

- Full auth flow: Register → Login → Get Profile → News → VIP AI endpoints
- 70% Standard users, 30% VIP users
- Tests Circuit Breaker, rate limiting, VIP authorization

**Socket.IO Scaling Test:**

- Gradual ramp-up: 50 → 200 → 500 → MAX_VUS
- Exponential backoff retry
- Socket.IO protocol: Handshake → Namespace connect → Subscribe → Long-polling → Close

### 7.3 Scripts Chạy Test

```bash
# Quick test
./k6-tests/run-tests.sh ws-quick    # 100 VUs, 2 phút
./k6-tests/run-tests.sh api-quick   # 200 VUs, 3 phút

# Full scaling test
./k6-tests/run-tests.sh ws-full     # 1500 VUs, 26 phút
./k6-tests/run-tests.sh api-full    # 1500 VUs, 17 phút

# All tests
./k6-tests/run-tests.sh all         # Chạy tất cả tuần tự
```

---

## 8. 🔒 Bảo Mật Nâng Cao

| Tính năng              | Mô tả                                                                       |
| ---------------------- | --------------------------------------------------------------------------- |
| **Zero-Trust Auth**    | Gateway validate mọi JWT bằng cách gọi Auth service                         |
| **VIP Authorization**  | Filter riêng cho AI endpoints, kiểm tra account type                        |
| **Token Blacklisting** | Logout invalidate token ngay lập tức (MongoDB collection)                   |
| **Google OAuth 2.0**   | Full flow: auth code → token → user info → JWT                              |
| **Circuit Breaker**    | Resilience4j per-service, ngăn cascade failure                              |
| **CORS Centralized**   | Gateway quản lý CORS, downstream services skip nếu có `X-Gateway-Validated` |
| **Secret Management**  | Kubernetes Secrets cho credentials                                          |

---

## 9. ☸️ Kubernetes Orchestration

### 9.1 Deployment Architecture

| Tính năng                | Chi tiết                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| **8 Namespaces**         | Isolation theo tier (presentation, api, security, analysis, data-collection, realtime, storage, edge) |
| **HPA trên mọi service** | Auto-scale dựa trên CPU/Memory                                                                        |
| **StatefulSets**         | Redis, PostgreSQL, MongoDB với Persistent Volumes                                                     |
| **PodDisruptionBudget**  | Đảm bảo minimum availability                                                                          |
| **Pod Anti-Affinity**    | Phân bổ pods HA trên nhiều nodes                                                                      |
| **Health Checks**        | Readiness + Liveness probes trên mọi service                                                          |
| **Graceful Shutdown**    | PreStop hooks, termination grace periods                                                              |
| **Service Discovery**    | Kubernetes DNS: `{service}.{namespace}.svc.cluster.local`                                             |
| **NGINX Ingress**        | Path-based routing, WebSocket support, IP-hash sticky sessions                                        |

### 9.2 Build & Deploy

```bash
# Full deployment
cd k8s && ./minikube-deploy.sh all

# Chỉ build images
./minikube-deploy.sh build

# Deploy services
./minikube-deploy.sh deploy

# Monitoring
watch -n 2 'kubectl get hpa --all-namespaces && kubectl get pods --all-namespaces'
```

---

## 10. 📈 Tổng Kết Điểm Nâng Cao

| Tiêu chí                      | Có/Không | Mô tả                                                                                         |
| ----------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| ✅ **AI Cải tiến**            | ✅       | Sentiment + Prediction + Causal Analysis + AI Chatbox (MCP/Function Calling) + AI HTML Parser |
| ✅ **Backtesting**            | ✅       | Causal Analysis: kết hợp tin tức + dữ liệu giá Binance + AI phân tích                         |
| ✅ **Microservices**          | ✅       | 7 services, 5 ngôn ngữ, 8 namespaces, API Gateway pattern, Circuit Breaker                    |
| ✅ **Dữ liệu thời gian thực** | ✅       | Binance WS → Redis Pub/Sub → Socket.IO → Frontend (20+ pairs, sub-second)                     |
| ✅ **Phân tích cảm xúc**      | ✅       | 16 nguồn tin, Adaptive Crawler, AI Sentiment, Quality Assessment, Trading Pair Detection      |
| ✅ **WebSocket**              | ✅       | 1000+ connections, Redis Adapter, HPA 3→20, IP-hash sticky, graceful shutdown                 |
| ✅ **K8s Scaling**            | ✅       | Full K8s deployment, HPA, PDB, Anti-Affinity, StatefulSets, Ingress                           |
| ✅ **Load Testing**           | ✅       | K6 tests: 1500 VUs, WebSocket + API + Socket.IO scenarios                                     |
| ✅ **Security**               | ✅       | Zero-Trust, VIP Auth, Token Blacklist, Google OAuth, Circuit Breaker                          |
| ✅ **Multi-Database**         | ✅       | PostgreSQL + MongoDB + Redis (3 database systems)                                             |

---

## 📁 Cấu Trúc Thư Mục

```
cryto-final-project/
├── ai/                          # 🤖 AI Service (Python/FastAPI)
├── binance-final-project-chart-backend/  # 📊 WebSocket Gateway (NestJS)
├── binance-final-project-gateway-backend/ # 🌐 API Gateway (Spring Cloud)
├── CSC13106-final-project-authentication-svc/ # 🔐 Auth Service (Spring Boot)
├── crawl-news/                  # 🕷️ News Crawler (Go)
├── fe/                          # 🖥️ Frontend (Next.js)
├── k8s/                         # ☸️ Kubernetes Manifests
├── k6-tests/                    # 🧪 Load Tests (K6)
├── postgres-init/               # 🗃️ DB Init Scripts
├── scripts/                     # 🛠️ Utility Scripts
├── docker-compose.yml           # 🐳 Local Development
└── docs/                        # 📖 Documentation
```
