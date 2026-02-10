# API Dự Đoán Giá AI - Predict Price Poll (Long Polling)

## Mô Tả

API này cung cấp cơ chế long-polling để lấy dự đoán giá AI một cách hiệu quả. API sử dụng cơ chế cache thông minh để giảm số lần gọi OpenAI API, giúp tiết kiệm chi phí và tối ưu hiệu suất. Dự đoán được lưu trong database và chỉ tạo mới khi cache hết hạn (sau 5 phút).

## Yêu Cầu

- **Phương thức**: POST
- **Endpoint**: `/api/v1/ai/predict-price-poll`
- **Xác thực**: Yêu cầu token Bearer (JWT) trong header Authorization
- **Quyền truy cập**: Chỉ dành cho tài khoản VIP

## Cách Hoạt Động

1. **Kiểm tra cache**: API đầu tiên kiểm tra database xem đã có dự đoán gần đây cho cặp giao dịch chưa. Nếu có dự đoán trong vòng 5 phút, API sẽ trả về ngay lập tức từ cache.

2. **Tạo dự đoán mới**: Nếu không có dự đoán trong database hoặc dự đoán đã quá 5 phút (cache hết hạn), API sẽ tự động tạo dự đoán mới bằng cách:
   - Lấy tin tức mới nhất từ dịch vụ crawler
   - Gửi đến OpenAI để phân tích và dự đoán
   - Lưu kết quả vào database để cache
   - Trả về dự đoán mới

3. **Kiểm tra dữ liệu mới**: Nếu client đã gửi `last_prediction_time` (thời gian của dự đoán cuối cùng mà client đã nhận), API sẽ so sánh với dự đoán trong database:
   - Nếu client đã có dữ liệu mới nhất: Trả về `has_new_data = false` và khuyến nghị thời gian chờ trước khi poll lại
   - Nếu có dữ liệu mới: Trả về `has_new_data = true` cùng với dự đoán mới

4. **Tối ưu polling**: API trả về `next_poll_after` để client biết nên đợi bao lâu trước khi gọi lại, tránh gọi quá thường xuyên không cần thiết.

## Tham Số Request

- **symbol** (bắt buộc): Cặp giao dịch, ví dụ: BTCUSDT, ETHUSDT
- **last_prediction_time** (tùy chọn): Thời gian của dự đoán cuối cùng mà client đã nhận được (định dạng ISO 8601). Nếu không có, API sẽ trả về dự đoán mới nhất hiện có.
- **timeout** (tùy chọn, mặc định: 10): Thời gian chờ tối đa (5-120 giây). Lưu ý: Endpoint này trả về ngay lập tức từ database, không thực sự long-poll như tên gọi.

## Response

API trả về thông tin bao gồm:
- **success**: Trạng thái thành công của request
- **has_new_data**: Có dữ liệu mới hay không (true nếu client chưa có dự đoán này, false nếu client đã có)
- **prediction**: Kết quả dự đoán chi tiết (nếu có), bao gồm:
  - **symbol**: Cặp giao dịch
  - **prediction**: Hướng dự đoán (bullish/bearish/neutral)
  - **confidence**: Độ tin cậy (0.0 đến 1.0)
  - **sentiment_summary**: Tóm tắt sentiment từ tin tức
  - **reasoning**: Lý do chi tiết cho dự đoán
  - **key_factors**: Danh sách các yếu tố chính ảnh hưởng
  - **news_analyzed**: Số lượng tin tức đã phân tích
  - **analyzed_at**: Thời gian phân tích
  - **model_version**: Phiên bản model AI sử dụng
- **cache_hit**: Có phải dữ liệu từ cache không (true nếu lấy từ database, false nếu vừa tạo mới)
- **next_poll_after**: Số giây nên đợi trước khi gọi lại API (khuyến nghị để tránh gọi quá thường xuyên)

## Lợi Ích

- **Tiết kiệm chi phí**: Dự đoán được cache 5 phút, giảm số lần gọi OpenAI API. Tối đa 12 lần gọi mỗi giờ cho mỗi cặp giao dịch.
- **Hiệu suất cao**: Trả về ngay lập tức từ database nếu có cache, không cần chờ phân tích AI.
- **Tối ưu băng thông**: Client chỉ nhận dữ liệu mới khi thực sự có, tránh tải dữ liệu trùng lặp.
- **Dễ sử dụng**: Client chỉ cần gọi API định kỳ, API tự động quản lý cache và tạo dự đoán mới khi cần.

## Cách Sử Dụng

1. **Lần đầu tiên**: Gọi API không có `last_prediction_time` để lấy dự đoán mới nhất.

2. **Các lần sau**: Gửi kèm `last_prediction_time` từ response trước đó. API sẽ cho biết có dữ liệu mới hay không.

3. **Tôn trọng next_poll_after**: Đợi đủ thời gian được khuyến nghị trước khi gọi lại để tránh gọi không cần thiết.

4. **Xử lý has_new_data**: Chỉ cập nhật UI khi `has_new_data = true`.

## Lưu Ý

- API này chỉ hoạt động khi đã cấu hình OpenAI API key
- Yêu cầu tài khoản VIP để sử dụng
- Cache có thời gian sống 5 phút, sau đó sẽ tự động tạo dự đoán mới
- Endpoint trả về ngay lập tức từ database, không thực sự long-poll (không chờ timeout)
- Nếu không có dự đoán trong database và việc tạo dự đoán mới thất bại, API sẽ trả về lỗi
- Nếu có dự đoán cũ trong database nhưng đã hết hạn, API vẫn có thể trả về dự đoán cũ nếu việc tạo mới thất bại
