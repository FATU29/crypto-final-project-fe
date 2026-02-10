# API Dự Đoán Giá AI - Prediction Line

## Mô Tả

API này tạo ra một đường dự đoán giá AI để hiển thị trên biểu đồ giá. API sử dụng OpenAI để phân tích dữ liệu giá gần đây và tin tức liên quan đến cặp giao dịch, sau đó dự đoán xu hướng giá trong tương lai.

## Yêu Cầu

- **Phương thức**: POST
- **Endpoint**: `/api/v1/ai/prediction-line`
- **Xác thực**: Yêu cầu token Bearer (JWT) trong header Authorization
- **Quyền truy cập**: Chỉ dành cho tài khoản VIP

## Cách Hoạt Động

1. **Thu thập dữ liệu**: API sẽ tự động lấy 50 nến giá gần nhất từ Binance và các tin tức mới nhất liên quan đến cặp giao dịch từ dịch vụ crawler.

2. **Phân tích AI**: Dữ liệu giá và tin tức được gửi đến OpenAI để phân tích và dự đoán xu hướng giá trong tương lai.

3. **Trả về kết quả**: API trả về một mảng các điểm dự đoán (thời gian và giá) để vẽ đường dự đoán trên biểu đồ, cùng với thông tin về hướng dự đoán (tăng/giảm/trung tính), độ tin cậy và lý do dự đoán.

## Tham Số Request

- **symbol** (bắt buộc): Cặp giao dịch, ví dụ: BTCUSDT, ETHUSDT
- **interval** (tùy chọn, mặc định: "1h"): Khung thời gian biểu đồ, hỗ trợ: 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w
- **periods** (tùy chọn, mặc định: 24): Số lượng nến tương lai cần dự đoán (từ 4 đến 100)
- **news_limit** (tùy chọn, mặc định: 10): Số lượng tin tức gần nhất để phân tích (từ 1 đến 50)

## Response

API trả về thông tin bao gồm:
- Điểm bắt đầu (giá và thời gian hiện tại)
- Mảng các điểm dự đoán giá trong tương lai
- Hướng dự đoán (bullish/bearish/neutral)
- Độ tin cậy (0.0 đến 1.0)
- Lý do dự đoán
- Số lượng tin tức đã phân tích
- Phiên bản model AI sử dụng
- Thời gian tạo dự đoán

## Lưu Ý

- API này chỉ hoạt động khi đã cấu hình OpenAI API key
- Yêu cầu tài khoản VIP để sử dụng
- Cần đăng nhập và có token hợp lệ
- Thời gian xử lý có thể mất vài giây do cần gọi OpenAI API
