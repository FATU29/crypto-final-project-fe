# API Dự Đoán Giá AI - Predict Price

## Mô Tả

API này dự đoán xu hướng giá tiền điện tử dựa trên phân tích sentiment từ các tin tức mới nhất. API sử dụng OpenAI để phân tích các bài viết tin tức liên quan đến cặp giao dịch và đưa ra dự đoán về khả năng giá tăng, giảm hoặc giữ nguyên.

## Yêu Cầu

- **Phương thức**: POST
- **Endpoint**: `/api/ai/predict-price`
- **Xác thực**: Yêu cầu xác thực qua Next.js API route (kiểm tra accountType)
- **Quyền truy cập**: Chỉ dành cho tài khoản VIP

## Cách Hoạt Động

1. **Thu thập tin tức**: API tự động lấy các tin tức mới nhất liên quan đến cặp giao dịch từ dịch vụ crawler. Số lượng tin tức được phân tích có thể tùy chỉnh (mặc định 10 bài, tối đa 50 bài).

2. **Phân tích sentiment**: Mỗi bài tin tức đã được phân tích sentiment trước đó (positive, negative, neutral) với điểm số và độ tin cậy. API tổng hợp tất cả các tin tức này.

3. **Dự đoán bằng AI**: Dữ liệu tin tức được gửi đến OpenAI để phân tích sâu hơn. AI sẽ xem xét xu hướng sentiment tổng thể, mức độ ảnh hưởng của từng tin tức, độ mới của tin, độ tin cậy nguồn, và các tín hiệu xung đột.

4. **Lưu vào database**: Kết quả dự đoán được lưu vào database để cache, giúp giảm số lần gọi OpenAI API khi có nhiều request cùng lúc.

5. **Trả về kết quả**: API trả về dự đoán chi tiết bao gồm hướng dự đoán, độ tin cậy, tóm tắt sentiment, lý do dự đoán, các yếu tố chính ảnh hưởng, và danh sách các tin tức đã phân tích.

## Tham Số Request

- **symbol** (bắt buộc): Cặp giao dịch, ví dụ: BTCUSDT, ETHUSDT
- **limit** (tùy chọn, mặc định: 5): Số lượng tin tức gần nhất để phân tích (từ 1 đến 50)
- **accountType** (bắt buộc): Loại tài khoản, phải là "VIP" để sử dụng API này

## Response

API trả về thông tin bao gồm:
- **success**: Trạng thái thành công
- **prediction**: Kết quả dự đoán chi tiết
  - **symbol**: Cặp giao dịch
  - **prediction**: Hướng dự đoán (bullish/bearish/neutral)
  - **confidence**: Độ tin cậy (0.0 đến 1.0)
  - **sentiment_summary**: Tóm tắt sentiment từ tin tức
    - **overall_sentiment**: Sentiment tổng thể (positive/negative/mixed/neutral)
    - **bullish_signals**: Số lượng tín hiệu tăng giá
    - **bearish_signals**: Số lượng tín hiệu giảm giá
    - **neutral_signals**: Số lượng tín hiệu trung tính
    - **sentiment_score**: Điểm sentiment (-1.0 đến 1.0)
  - **reasoning**: Lý do chi tiết cho dự đoán
  - **key_factors**: Danh sách các yếu tố chính ảnh hưởng đến dự đoán
  - **news_analyzed**: Số lượng tin tức đã phân tích
  - **analyzed_at**: Thời gian phân tích
  - **model_version**: Phiên bản model AI sử dụng
- **news_articles**: Danh sách các tin tức đã được phân tích, mỗi tin tức bao gồm:
  - **id**: ID của tin tức
  - **title**: Tiêu đề
  - **summary**: Tóm tắt nội dung
  - **source**: Nguồn tin tức
  - **published_at**: Thời gian xuất bản
  - **sentiment**: Thông tin sentiment đã phân tích
  - **related_pairs**: Các cặp giao dịch liên quan

## Lưu Ý

- API này chỉ hoạt động khi đã cấu hình OpenAI API key
- Yêu cầu tài khoản VIP để sử dụng
- Kết quả dự đoán được cache trong database để tối ưu hiệu suất
- Thời gian xử lý có thể mất vài giây do cần gọi OpenAI API
- API phân tích dựa trên tin tức, không bao gồm dữ liệu giá lịch sử (tính năng này chưa được triển khai)
- Độ chính xác của dự đoán phụ thuộc vào chất lượng và số lượng tin tức có sẵn
