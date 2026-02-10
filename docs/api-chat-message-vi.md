# API Chat Message - Tài Liệu Tiếng Việt

## Tổng Quan

Hệ thống cung cấp API để chat với AI assistant về giao dịch tiền điện tử. Tính năng này chỉ dành cho **VIP users** và sử dụng OpenAI GPT với Function Calling (MCP Pattern) để tự động gọi các tools như dự đoán giá và tìm kiếm tin tức.

Hệ thống hỗ trợ:
- Duy trì ngữ cảnh cuộc hội thoại (conversation context)
- Tự động gọi tools khi cần (price prediction, news search)
- Lưu trữ lịch sử hội thoại
- Gợi ý động từ phản hồi AI

---

## API Chat Message

### 1. Gửi Tin Nhắn Chat

**Endpoint**: `POST /api/v1/ai/chat`

**Mô tả**: Gửi tin nhắn đến AI assistant và nhận phản hồi. API này duy trì ngữ cảnh cuộc hội thoại và tự động gọi các tools khi cần thiết.

**Yêu cầu**:
- **Authentication**: Bắt buộc (Bearer token)
- **VIP Status**: Chỉ dành cho VIP users

**Headers**:
- `Authorization`: `Bearer {access_token}`
- `Content-Type`: `application/json`
- `X-User-Id`: User ID (tự động inject bởi API Gateway)
- `X-User-AccountType`: Account type (tự động inject bởi API Gateway)

**Request Body**:
```json
{
  "message": "Dự đoán giá BTC trong 24h tới",
  "conversation_id": "conv-abc123def456"
}
```

**Tham số**:
- **message** (bắt buộc): Nội dung tin nhắn từ user
  - Độ dài: 1-2000 ký tự
  - Có thể hỏi về: dự đoán giá, phân tích xu hướng, tin tức, sentiment
- **conversation_id** (tùy chọn): ID của cuộc hội thoại để tiếp tục
  - Nếu không cung cấp, hệ thống sẽ tạo conversation ID mới
  - Format: `conv-{16 ký tự hex}`

**Response**:
```json
{
  "conversation_id": "conv-abc123def456",
  "message": {
    "id": "assistant-xyz789",
    "role": "assistant",
    "content": "Dựa trên phân tích tin tức mới nhất, tôi dự đoán BTC có xu hướng tăng trong 24h tới...",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "total_messages": 5
}
```

**Các trường Response**:
- **conversation_id** (string): ID của cuộc hội thoại
- **message** (object): Phản hồi từ AI assistant
  - `id`: ID duy nhất của message
  - `role`: `"assistant"` hoặc `"user"`
  - `content`: Nội dung phản hồi
  - `timestamp`: Thời gian tạo message (ISO 8601)
- **total_messages** (number): Tổng số message trong cuộc hội thoại

**Status Codes**:
- `200 OK`: Thành công
- `403 Forbidden`: User không phải VIP
- `401 Unauthorized`: Chưa đăng nhập hoặc token không hợp lệ
- `500 Internal Server Error`: Lỗi server
- `503 Service Unavailable`: AI service tạm thời không khả dụng

**Ví dụ sử dụng**:
```typescript
const response = await fetch('https://api.example.com/api/v1/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    message: 'Dự đoán giá BTC trong 24h tới',
    conversation_id: 'conv-abc123def456',
  }),
});

const data = await response.json();
console.log(data.message.content);
```

---

### 2. Xóa Lịch Sử Hội Thoại

**Endpoint**: `DELETE /api/v1/ai/chat/{conversation_id}`

**Mô tả**: Xóa toàn bộ lịch sử của một cuộc hội thoại cụ thể.

**Yêu cầu**:
- **Authentication**: Bắt buộc (Bearer token)
- **VIP Status**: Chỉ dành cho VIP users

**Headers**:
- `Authorization`: `Bearer {access_token}`
- `X-User-AccountType`: Account type (tự động inject bởi API Gateway)

**Tham số path**:
- **conversation_id** (bắt buộc): ID của cuộc hội thoại cần xóa

**Response**:
- `204 No Content`: Xóa thành công (không có body)

**Status Codes**:
- `204 No Content`: Xóa thành công
- `403 Forbidden`: User không phải VIP
- `401 Unauthorized`: Chưa đăng nhập hoặc token không hợp lệ
- `404 Not Found`: Không tìm thấy conversation (hoặc đã bị xóa)

**Ví dụ sử dụng**:
```typescript
const response = await fetch(
  `https://api.example.com/api/v1/ai/chat/${conversationId}`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);

if (response.status === 204) {
  console.log('Conversation deleted successfully');
}
```

---

## AI Tools & Function Calling

### 3. Tools Tự Động Gọi

AI assistant tự động quyết định khi nào cần gọi tools dựa trên ngữ cảnh cuộc hội thoại. Hệ thống hỗ trợ 2 tools chính:

#### 3.1. get_crypto_price_prediction

**Mô tả**: Dự đoán xu hướng tăng/giảm giá cryptocurrency dựa trên phân tích tin tức mới nhất.

**Khi nào được gọi**:
- User hỏi về dự đoán giá
- User hỏi về xu hướng giá
- User hỏi về phân tích coin cụ thể

**Tham số**:
- **symbol** (bắt buộc): Cặp giao dịch
  - Các giá trị hợp lệ: `BTCUSDT`, `ETHUSDT`, `SOLUSDT`, `BNBUSDT`, `ADAUSDT`, `DOGEUSDT`, `XRPUSDT`, `DOTUSDT`, `AVAXUSDT`, `MATICUSDT`
- **limit** (tùy chọn, mặc định: 10): Số lượng tin tức để phân tích
  - Giá trị: 5-20

**Kết quả trả về**:
```json
{
  "success": true,
  "symbol": "BTCUSDT",
  "prediction": "up",
  "confidence": 0.75,
  "sentiment_summary": "Overall bullish sentiment...",
  "reasoning": "Based on recent news...",
  "key_factors": ["Positive news", "Market sentiment"],
  "news_analyzed": 10,
  "analyzed_at": "2024-01-15T10:30:00Z"
}
```

**Ví dụ câu hỏi kích hoạt tool**:
- "Dự đoán giá BTC trong 24h tới"
- "Xu hướng giá ETH như thế nào?"
- "Phân tích SOL cho tôi"
- "BTC sẽ tăng hay giảm?"

---

#### 3.2. search_articles_db

**Mô tả**: Tìm kiếm trong database tin tức cryptocurrency để tìm thông tin mới nhất, xu hướng, và dữ liệu cho phân tích dự đoán.

**Khi nào được gọi**:
- User hỏi về tin tức
- User hỏi về xu hướng thị trường
- User yêu cầu nghiên cứu
- AI cần thông tin bổ sung để trả lời

**Tham số**:
- **keyword** (bắt buộc): Từ khóa tìm kiếm
  - Ví dụ: "Bitcoin", "regulation", "DeFi", "Ethereum upgrade"
- **symbol** (tùy chọn): Lọc theo symbol cụ thể
  - Ví dụ: "BTC", "ETH", "SOL"
- **limit** (tùy chọn, mặc định: 10): Số lượng bài viết
  - Giá trị: 5-30

**Kết quả trả về**:
```json
{
  "success": true,
  "articles_found": 8,
  "search_query": "Bitcoin regulation",
  "articles": [
    {
      "id": "article-123",
      "title": "Bitcoin Regulation Update",
      "summary": "Recent regulatory changes...",
      "source": "coindesk",
      "published_at": "2024-01-15T09:00:00Z",
      "url": "https://..."
    }
  ]
}
```

**Ví dụ câu hỏi kích hoạt tool**:
- "Tin tức mới nhất về Bitcoin"
- "Có tin gì về DeFi không?"
- "Tìm bài viết về Ethereum upgrade"
- "Regulation ảnh hưởng thế nào?"

---

## React Hooks & Client Libraries

### 4. useAIChat Hook

**Mô tả**: React hook để quản lý AI chat với tự động lưu trữ, validation VIP, và xử lý suggestions.

**Import**:
```typescript
import { useAIChat } from '@/hooks/use-ai-chat';
```

**Tham số**:
- **autoLoadLatest** (tùy chọn, mặc định: `true`): Tự động load cuộc hội thoại mới nhất khi mount

**Return**:
- **messages** (ChatMessage[]): Danh sách messages trong cuộc hội thoại
- **isVipUser** (boolean): User có phải VIP không
- **isSending** (boolean): Đang gửi message
- **error** (string | null): Lỗi nếu có
- **conversationId** (string | null): ID cuộc hội thoại hiện tại
- **sendMessage** (function): Hàm gửi message
- **clearChat** (function): Hàm xóa cuộc hội thoại
- **dynamicSuggestions** (string[]): Gợi ý động từ AI response
- **isAuthenticated** (boolean): Trạng thái đăng nhập

**Ví dụ sử dụng**:
```typescript
const {
  messages,
  isVipUser,
  isSending,
  error,
  sendMessage,
  clearChat,
  dynamicSuggestions,
} = useAIChat();

// Gửi message
await sendMessage('Dự đoán giá BTC');

// Xóa cuộc hội thoại
clearChat();
```

**Tính năng tự động**:
- Tự động lưu conversation vào localStorage
- Tự động load conversation mới nhất khi mount
- Tự động parse suggestions từ AI response
- Tự động validate VIP status
- Optimistic UI update (hiển thị user message ngay)

---

### 5. sendChatMessage Function

**Mô tả**: Function helper để gửi chat message đến API.

**Import**:
```typescript
import { sendChatMessage } from '@/lib/api/chat';
```

**Tham số**:
- **request** (ChatMessageRequest): Request object
  - `message`: Nội dung message
  - `conversation_id`: ID cuộc hội thoại (tùy chọn)
- **accessToken** (string): Access token để authenticate

**Return**: `Promise<ChatResponse>`

**Ví dụ sử dụng**:
```typescript
const response = await sendChatMessage(
  {
    message: 'Dự đoán giá BTC',
    conversation_id: 'conv-abc123',
  },
  accessToken
);

console.log(response.message.content);
```

---

### 6. clearConversation Function

**Mô tả**: Function helper để xóa conversation.

**Import**:
```typescript
import { clearConversation } from '@/lib/api/chat';
```

**Tham số**:
- **conversationId** (string): ID conversation cần xóa
- **accessToken** (string): Access token để authenticate

**Return**: `Promise<void>`

**Ví dụ sử dụng**:
```typescript
await clearConversation('conv-abc123', accessToken);
```

---

## Local Storage Management

### 7. Conversation Storage

**Mô tả**: Hệ thống tự động lưu conversations vào localStorage để phục hồi khi reload trang.

**Storage Key**: `ai_chat_conversations`

**Giới hạn**:
- Tối đa 5 conversations được lưu
- Tối đa 50 messages mỗi conversation
- Tự động xóa conversations cũ nhất khi vượt quá giới hạn

**Functions**:
- `getStoredConversations()`: Lấy tất cả conversations
- `getConversation(conversationId)`: Lấy conversation theo ID
- `saveConversation(conversationId, messages)`: Lưu conversation
- `clearConversation(conversationId)`: Xóa conversation cụ thể
- `clearAllConversations()`: Xóa tất cả conversations
- `getLatestConversation()`: Lấy conversation mới nhất

**Import**:
```typescript
import {
  getStoredConversations,
  saveConversation,
  clearConversation,
  getLatestConversation,
} from '@/lib/storage/chatStorage';
```

---

## Dynamic Suggestions

### 8. Suggestions Từ AI Response

**Mô tả**: AI có thể trả về suggestions trong response, được parse tự động và hiển thị dưới dạng buttons.

**Format trong AI Response**:
```
[SUGGESTIONS]
Gợi ý 1
Gợi ý 2
Gợi ý 3
[/SUGGESTIONS]
```

**Cách hoạt động**:
1. AI trả về response có chứa `[SUGGESTIONS]...[/SUGGESTIONS]`
2. Hook tự động parse và tách suggestions
3. Suggestions được lưu vào `dynamicSuggestions`
4. UI hiển thị suggestions dưới dạng clickable buttons
5. User click suggestion → tự động gửi message mới

**Ví dụ**:
```typescript
const { dynamicSuggestions, sendMessage } = useAIChat();

// Hiển thị suggestions
{dynamicSuggestions.map((suggestion, index) => (
  <button key={index} onClick={() => sendMessage(suggestion)}>
    {suggestion}
  </button>
))}
```

---

## Lưu Ý Chung

### Authentication & Authorization
- **Bắt buộc đăng nhập**: Tất cả endpoints yêu cầu Bearer token
- **VIP Only**: Chỉ VIP users mới có thể sử dụng chat
- **API Gateway**: Requests đi qua API Gateway để validate VIP status
- **Fallback Check**: Backend cũng kiểm tra VIP status qua header `X-User-AccountType`

### Conversation Management
- **Auto Create**: Conversation ID tự động tạo nếu không cung cấp
- **Context Preservation**: Hệ thống duy trì ngữ cảnh tối đa 50 messages
- **Auto Cleanup**: Tự động xóa messages cũ khi vượt quá 50 messages
- **In-Memory Storage**: Hiện tại lưu trong memory (development), production sẽ dùng Redis/DB

### AI Behavior
- **Function Calling**: AI tự động quyết định khi nào gọi tools
- **Multi-Tool Support**: Hỗ trợ nhiều tools cùng lúc
- **Context Aware**: AI nhớ toàn bộ cuộc hội thoại
- **Tool Execution**: Tools được execute async và kết quả được đưa vào context

### Error Handling
- **403 Forbidden**: User không phải VIP → Hiển thị message yêu cầu upgrade
- **401 Unauthorized**: Token không hợp lệ → Yêu cầu đăng nhập lại
- **503 Service Unavailable**: AI service lỗi → Hiển thị message thông báo
- **500 Internal Server Error**: Lỗi server → Hiển thị message lỗi chung

### Performance
- **Optimistic UI**: User message hiển thị ngay, không chờ response
- **Local Storage**: Conversations được cache để load nhanh
- **Message Limit**: Giới hạn 50 messages để tránh context quá dài
- **Auto Reconnect**: Tự động retry khi có lỗi network

### Best Practices
1. **Luôn cung cấp conversation_id** khi tiếp tục cuộc hội thoại
2. **Xử lý lỗi đầy đủ** với try-catch và user-friendly messages
3. **Validate VIP status** trước khi hiển thị chat UI
4. **Cleanup conversations** khi không cần nữa để tiết kiệm storage
5. **Sử dụng suggestions** để cải thiện UX
6. **Giới hạn message length** để tránh lỗi validation
7. **Handle loading states** để user biết AI đang xử lý

### Supported Symbols
Các symbol được hỗ trợ cho price prediction:
- `BTCUSDT` - Bitcoin
- `ETHUSDT` - Ethereum
- `SOLUSDT` - Solana
- `BNBUSDT` - Binance Coin
- `ADAUSDT` - Cardano
- `DOGEUSDT` - Dogecoin
- `XRPUSDT` - Ripple
- `DOTUSDT` - Polkadot
- `AVAXUSDT` - Avalanche
- `MATICUSDT` - Polygon

### Rate Limits
- Hiện tại không có rate limit cụ thể
- Nên implement rate limiting ở API Gateway level
- Khuyến nghị: Tối đa 10 requests/phút/user

### Security
- **Token Validation**: Tất cả requests phải có valid Bearer token
- **VIP Validation**: Kiểm tra ở cả Gateway và Backend
- **Input Validation**: Message length và format được validate
- **XSS Protection**: Content được sanitize trước khi hiển thị
