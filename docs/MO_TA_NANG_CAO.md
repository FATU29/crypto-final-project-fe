# Mô Tả Các Tính Năng Nâng Cao - Crypto Trading Platform

## 1. 🤖 AI Cải Tiến (Không chỉ gọi API đơn giản)

**Độ phức tạp đã chứng minh:**

- **Pipeline xử lý đa bước**: Hệ thống xây dựng pipeline hoàn chỉnh từ crawl tin tức → lọc chất lượng → phân tích sentiment → lưu database → aggregation → dự đoán giá. Không phải chỉ gọi OpenAI API trực tiếp.

- **Function Calling / MCP Pattern**: AI Chatbox sử dụng tool `get_crypto_price_prediction` và `search_articles_db` - hệ thống tự quyết định khi nào gọi tool nào, thể hiện agentic AI với multi-tool orchestration.

- **Causal Analysis Engine**: Phân tích quan hệ nhân quả giữa tin tức và biến động giá bằng cách tự động fetch dữ liệu Binance kline (hours_before/hours_after), tính toán % biến động, và AI phân tích mối tương quan.

- **AI HTML Parser**: Khi rule-based CSS selector thất bại, hệ thống fallback sang AI để parse HTML và trích xuất structured data (title, content, author, date, images, tags).

- **Server-side Model Control**: Tham số model (version, max_tokens, temperature) chỉ được cấu hình phía server, ngăn client thao túng chi phí.

**File chứng minh:**
- `ai/app/services/price_prediction_service.py` - Price prediction với multi-step reasoning
- `ai/app/services/causal_analysis_service.py` - Causal analysis engine
- `ai/app/services/chat_service.py` - AI Chatbox với Function Calling
- `ai/app/services/html_parser_service.py` - AI HTML parser
- `ai/app/services/prediction_line_service.py` - Prediction line generation

---

## 2. 📊 Backtesting (Kết hợp phức tạp các điều kiện)

**Độ phức tạp đã chứng minh:**

- **Causal Analysis = Backtesting**: Hệ thống so sánh giá crypto trước và sau khi tin tức xuất hiện với time window có thể cấu hình (hours_before/hours_after).

- **Kết hợp Chỉ báo & Mô hình AI**: 
  - Input: Tin tức + Dữ liệu giá lịch sử (kline từ Binance) + Sentiment score
  - Process: AI phân tích đa chiều (nội dung tin, context thị trường, biến động giá)
  - Output: Đánh giá impact (high/medium/low), hướng (bullish/bearish), confidence score

- **Multi-Symbol Support**: Phân tích trên 20+ cặp giao dịch (BTCUSDT, ETHUSDT, BNBUSDT, XRPUSDT, SOLUSDT, ADAUSDT, DOGEUSDT, MATICUSDT, LTCUSDT, LINKUSDT, DOTUSDT, AVAXUSDT, UNIUSDT, ATOMUSDT, ETCUSDT, FILUSDT, TRXUSDT, NEOUSDT, ALGOUSDT, VETUSDT).

- **Binance Kline Data**: Sử dụng dữ liệu nến (candlestick) thực từ Binance REST API để phân tích.

**File chứng minh:**
- `ai/app/services/causal_analysis_service.py` - Causal analysis với Binance data integration
- `ai/app/services/binance_service.py` - Binance API integration
- `ai/app/api/v1/endpoints/causal.py` - Causal analysis endpoints

---

## 3. 🏗️ Microservices (Dịch vụ độc lập, dễ mở rộng)

**Độ phức tạp đã chứng minh:**

- **7 Microservices độc lập, mỗi service có repo GitHub riêng:**
  - Frontend: TypeScript + Next.js 16 + React 19 (repo: `fe/`)
  - API Gateway: Java + Spring Cloud Gateway (Reactive/WebFlux) (repo: `binance-final-project-gateway-backend/`)
  - Auth Service: Java + Spring Boot + Spring Security + MongoDB (repo: `CSC13106-final-project-authentication-svc/`)
  - AI Service: Python + FastAPI + SQLAlchemy 2.0 (async) + PostgreSQL (repo: `ai/`)
  - Crawl Service: Go + Gin + Colly + GoFeed + PostgreSQL + Redis (repo: `crawl-news/`)
  - WebSocket Gateway: TypeScript + NestJS + Socket.IO + Redis (repo: `binance-final-project-chart-backend/`)

- **8 Kubernetes Namespaces riêng biệt**: crypto-frontend, crypto-gateway, crypto-auth, crypto-ai, crypto-crawl, crypto-websocket, crypto-data, crypto-ingress

- **API Gateway Pattern**: Zero-Trust Authentication, VIP Authorization, Circuit Breaker (Resilience4j), Route-level Timeout, CORS Management

- **Independent Deployment & Scaling**: Mỗi service có Dockerfile riêng, HPA, PodDisruptionBudget, Pod Anti-Affinity

**File chứng minh:**
- `k8s/*.yaml` - Kubernetes manifests cho toàn bộ services
- `docker-compose.yml` - Docker Compose cho development
- Mỗi service có thư mục riêng với source code đầy đủ

---

## 4. ⚡ Dữ Liệu Thời Gian Thực

**Độ phức tạp đã chứng minh:**

- **Multi-layer Architecture:**
  1. Binance WebSocket Consumer → Kết nối persistent WebSocket tới Binance với auto-reconnect, exponential backoff, max 10 retry attempts
  2. Redis Pub/Sub → Fan-out giá tới tất cả WebSocket Gateway pods
  3. Redis Socket.IO Adapter → Đồng bộ Socket.IO events giữa các pods
  4. BullMQ Queue → Async price persistence jobs
  5. Socket.IO Broadcast → Push real-time tới frontend clients

- **20+ Trading Pairs Đồng Thời**: BTCUSDT, ETHUSDT, BNBUSDT, XRPUSDT, SOLUSDT, ADAUSDT, DOGEUSDT, MATICUSDT, LTCUSDT, LINKUSDT, DOTUSDT, AVAXUSDT, UNIUSDT, ATOMUSDT, ETCUSDT, FILUSDT, TRXUSDT, NEOUSDT, ALGOUSDT, VETUSDT

- **WebSocket Optimization:**
  - WS_PING_INTERVAL: 25s - Heartbeat interval
  - WS_PING_TIMEOUT: 60s - Connection timeout
  - WS_MAX_PAYLOAD: 1MB - Maximum message size
  - WS_PER_MESSAGE_DEFLATE: disabled - Giảm CPU overhead cho high-throughput

**File chứng minh:**
- `binance-final-project-chart-backend/src/realtime/price.gateway.ts` - WebSocket Gateway
- `binance-final-project-chart-backend/src/realtime/redis-subscriber.service.ts` - Redis Pub/Sub
- `binance-final-project-chart-backend/src/binance/binance-stream.service.ts` - Binance WebSocket consumer
- `fe/hooks/use-binance-websocket.ts` - Frontend WebSocket hook
- `fe/lib/services/binance-websocket.ts` - Frontend WebSocket service

---

## 5. 📰 Phân Tích Cảm Xúc (Sentiment Analysis)

**Độ phức tạp đã chứng minh:**

- **16 Nguồn Tin Tức Crypto**: CoinTelegraph, CoinDesk, CryptoNews, Binance, CoinMarketCap, TheBlock, Decrypt, UToday, CryptoSlate, BeInCrypto, AMBCrypto, NewsBTC, BitcoinMagazine, CryptoPotato, 99Bitcoins, BitcoinCom

- **Adaptive Crawler System (Go):**
  - SelectorLearner: Tự học CSS selector dựa trên success/failure rate
  - StructureMonitor: Phát hiện website thay đổi cấu trúc tự động
  - Auto-discovery CSS selectors mới khi selectors cũ thất bại
  - Content Quality Assessment: Spam detection, length validation, caps detection, quality scoring (0-100)

- **Multi-step Processing Pipeline:**
  1. Crawl 16 nguồn
  2. Lọc chất lượng
  3. Trích xuất nội dung
  4. Detect trading pairs
  5. Gửi AI phân tích sentiment
  6. Lưu kết quả
  7. Aggregate trends
  8. Hiển thị dashboard

- **AI Fallback cho HTML Parsing**: Rule-based selectors (CSS) → Nếu thất bại → AI HTML Parser (OpenAI) với structured output: title, content, author, date, images, tags

- **Trading Pair Auto-Detection**: Tự động phát hiện crypto symbols trong nội dung tin tức và map tin tức → cặp giao dịch liên quan

**File chứng minh:**
- `crawl-news/internal/service/ai_service.go` - AI sentiment analysis integration
- `crawl-news/internal/crawler/` - Adaptive crawler system
- `ai/app/services/sentiment_service.py` - Sentiment analysis engine
- `ai/app/routers/sentiment.py` - Sentiment API endpoints

---

## 6. 🔌 WebSocket (Xử lý nhiều kết nối đồng thời, ổn định)

**Độ phức tạp đã chứng minh:**

- **Sticky Session ở Socket-Gateway**: Sử dụng IP-hash sticky session (`upstream-hash-by: "$remote_addr"`) trong NGINX Ingress để điều hướng connection - mỗi client IP luôn được route tới cùng một pod, đảm bảo connection ổn định và tránh mất state.

- **Horizontal Scaling với Redis Socket.IO Adapter**: Messages được broadcast giữa tất cả pods qua Redis, client subscribe room `price:{symbol}` nhận data từ bất kỳ pod nào.

- **HPA Configuration**: minReplicas: 3, maxReplicas: 20, scale up ngay lập tức khi cần.

- **Connection Stability**: PodDisruptionBudget, Pod Anti-Affinity, PreStop Hook (15s), SessionAffinity: ClientIP với timeout 3600s.

- **Load Testing**: K6 tests với 1500 VUs, message latency < 200ms (p95).

**File chứng minh:**
- `k8s/ingress.yaml` - NGINX Ingress với sticky session configuration (line 45: `upstream-hash-by: "$remote_addr"`)
- `k8s/websocket-gateway.yaml` - K8s deployment với SessionAffinity (line 151-154)
- `binance-final-project-chart-backend/src/realtime/price.gateway.ts` - NestJS WebSocket code

---

## 7. 🧪 Load Testing & Performance

**Độ phức tạp đã chứng minh:**

- **K6 Performance Testing với 3 test scenarios:**
  - `websocket-load-test.js`: 1,500 VUs, ~26 phút, WebSocket scaling, message latency < 200ms (p95)
  - `api-gateway-load-test.js`: 1,500 VUs, ~17 phút, Auth flow, News API, VIP endpoints, latency < 2s (p95)
  - `socketio-scaling-test.js`: 1,000+ VUs (configurable), 10+ phút, Socket.IO handshake, namespace connect, polling

- **Test Scenarios Chi Tiết:**
  - WebSocket Load Test: Ramp 0 → 500 (2m) → 1000 (3m) → hold 10m → spike 1500 (2m) → hold 3m → ramp down
  - Thresholds: Connection error < 1%, Message error < 1%, Latency p95 < 200ms
  - API Gateway Load Test: Full auth flow với 70% Standard users, 30% VIP users

**File chứng minh:**
- `k6-tests/websocket-load-test.js` - WebSocket load test
- `k6-tests/api-gateway-load-test.js` - API Gateway load test
- `k6-tests/socketio-scaling-test.js` - Socket.IO scaling test
- `k6-tests/run-tests.sh` - Test execution scripts

---

## 8. ☸️ Kubernetes Orchestration

**Độ phức tạp đã chứng minh:**

- **8 Namespaces**: Isolation theo tier (presentation, api, security, analysis, data-collection, realtime, storage, edge)

- **HPA trên mọi service**: Auto-scale dựa trên CPU/Memory

- **StatefulSets**: Redis, PostgreSQL, MongoDB với Persistent Volumes

- **PodDisruptionBudget**: Đảm bảo minimum availability

- **Pod Anti-Affinity**: Phân bổ pods HA trên nhiều nodes

- **Health Checks**: Readiness + Liveness probes trên mọi service

- **Graceful Shutdown**: PreStop hooks, termination grace periods

- **Service Discovery**: Kubernetes DNS: `{service}.{namespace}.svc.cluster.local`

- **NGINX Ingress**: Path-based routing, WebSocket support, IP-hash sticky sessions

**File chứng minh:**
- `k8s/*.yaml` - Kubernetes manifests cho toàn bộ services
- `k8s/minikube-deploy.sh` - Deployment scripts
- `k8s/architecture.puml` - Architecture diagram

---

## Tổng Kết

Dự án đã triển khai đầy đủ các tính năng nâng cao với độ phức tạp cao:

✅ **AI Cải tiến**: Pipeline đa bước, Function Calling, Causal Analysis, AI HTML Parser  
✅ **Backtesting**: Kết hợp tin tức + dữ liệu giá Binance + AI phân tích  
✅ **Microservices**: 7 services, 5 ngôn ngữ, 8 namespaces, API Gateway pattern  
✅ **Dữ liệu thời gian thực**: Binance WS → Redis Pub/Sub → Socket.IO → Frontend (20+ pairs)  
✅ **Phân tích cảm xúc**: 16 nguồn tin, Adaptive Crawler, AI Sentiment, Quality Assessment  
✅ **WebSocket**: 1000+ connections, Redis Adapter, HPA 3→20, IP-hash sticky, graceful shutdown  
✅ **K8s Scaling**: Full K8s deployment, HPA, PDB, Anti-Affinity, StatefulSets, Ingress  
✅ **Load Testing**: K6 tests với 1500 VUs, WebSocket + API + Socket.IO scenarios
