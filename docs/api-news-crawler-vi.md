# API Crawler News - Tài Liệu Tiếng Việt

## Tổng Quan

Hệ thống cung cấp các API để quản lý và truy xuất tin tức tiền điện tử được crawl tự động từ nhiều nguồn khác nhau. Các API này cho phép lấy danh sách tin tức, lọc theo nhiều tiêu chí, và quản lý quá trình crawl dữ liệu.

---

## API Lấy Tin Tức

### 1. Lấy Danh Sách Tin Tức (Có Phân Trang)

**Endpoint**: `GET /api/v1/news`

**Mô tả**: Lấy danh sách tin tức với phân trang và có thể lọc theo nguồn hoặc danh mục.

**Tham số query**:
- **page** (tùy chọn, mặc định: 1): Số trang
- **limit** (tùy chọn, mặc định: 20): Số lượng tin tức mỗi trang
- **source** (tùy chọn): Lọc theo nguồn tin tức
- **category** (tùy chọn): Lọc theo danh mục

**Response**: Trả về danh sách tin tức kèm thông tin phân trang (page, limit, total, total_pages, has_next, has_prev).

---

### 2. Lấy Tin Tức Theo ID

**Endpoint**: `GET /api/v1/news/{id}`

**Mô tả**: Lấy thông tin chi tiết của một tin tức cụ thể theo ID.

**Tham số path**:
- **id** (bắt buộc): ID của tin tức

**Response**: Trả về đối tượng tin tức đầy đủ.

---

### 3. Lấy Tin Tức Mới Nhất Theo Symbol

**Endpoint**: `GET /api/v1/news/latest/{symbol}`

**Mô tả**: Lấy các tin tức mới nhất liên quan đến một cặp giao dịch cụ thể (ví dụ: BTCUSDT, ETHUSDT).

**Tham số path**:
- **symbol** (bắt buộc): Cặp giao dịch, ví dụ: BTCUSDT, ETHUSDT

**Tham số query**:
- **limit** (tùy chọn, mặc định: 10, tối đa: 50): Số lượng tin tức cần lấy

**Response**: Trả về danh sách tin tức mới nhất với thông tin symbol, count, limit, và items.

---

### 4. Lấy Tin Tức Với Bộ Lọc

**Endpoint**: `GET /api/v1/news/filter`

**Mô tả**: Lấy danh sách tin tức với nhiều bộ lọc và phân trang. Hỗ trợ lọc theo nguồn, danh mục, cặp giao dịch, sentiment, và trạng thái phân tích AI.

**Tham số query**:
- **page** (tùy chọn, mặc định: 1): Số trang
- **limit** (tùy chọn, mặc định: 20, tối đa: 100): Số lượng tin tức mỗi trang
- **sources** (tùy chọn): Danh sách nguồn, phân cách bằng dấu phẩy (ví dụ: "source1,source2")
- **categories** (tùy chọn): Danh sách danh mục, phân cách bằng dấu phẩy
- **trading_pairs** (tùy chọn): Danh sách cặp giao dịch, phân cách bằng dấu phẩy (ví dụ: "BTCUSDT,ETHUSDT")
- **sentiment** (tùy chọn): Lọc theo sentiment (positive/negative/neutral)
- **ai_analyzed** (tùy chọn): Lọc theo trạng thái đã phân tích AI (true/false)
- **parsing_method** (tùy chọn): Lọc theo phương pháp parse

**Response**: Trả về danh sách tin tức đã lọc kèm thông tin phân trang.

---

### 5. Lấy Tin Tức Với Bộ Lọc Nâng Cao

**Endpoint**: `GET /api/v1/news/advanced`

**Mô tả**: Lấy tin tức với các bộ lọc nâng cao bao gồm khoảng thời gian, điểm sentiment tối thiểu, và nhiều tiêu chí khác.

**Tham số query**:
- **start_date** (tùy chọn): Ngày bắt đầu (định dạng RFC3339)
- **end_date** (tùy chọn): Ngày kết thúc (định dạng RFC3339)
- **sources** (tùy chọn): Danh sách nguồn, phân cách bằng dấu phẩy
- **categories** (tùy chọn): Danh sách danh mục, phân cách bằng dấu phẩy
- **trading_pairs** (tùy chọn): Danh sách cặp giao dịch, phân cách bằng dấu phẩy
- **sentiment** (tùy chọn): Lọc theo sentiment (positive/negative/neutral)
- **min_score** (tùy chọn): Điểm sentiment tối thiểu (-1.0 đến 1.0)
- **ai_analyzed** (tùy chọn): Lọc theo trạng thái đã phân tích AI (true/false)
- **language** (tùy chọn): Lọc theo ngôn ngữ
- **parsing_method** (tùy chọn): Lọc theo phương pháp parse

**Response**: Trả về danh sách tin tức đã lọc (không có phân trang).

---

### 6. Lấy Tin Tức Theo Cặp Giao Dịch

**Endpoint**: `GET /api/v1/news/pair/{pair}`

**Mô tả**: Lấy tất cả tin tức liên quan đến một cặp giao dịch cụ thể.

**Tham số path**:
- **pair** (bắt buộc): Cặp giao dịch, ví dụ: BTCUSDT

**Response**: Trả về danh sách tin tức liên quan đến cặp giao dịch.

---

### 7. Lấy Tóm Tắt Tin Tức

**Endpoint**: `GET /api/v1/news/summaries`

**Mô tả**: Lấy dữ liệu tin tức đã được rút gọn, phù hợp cho hiển thị danh sách.

**Tham số query**:
- **limit** (tùy chọn, mặc định: 50): Số lượng tóm tắt cần lấy
- **trading_pair** (tùy chọn): Lọc theo cặp giao dịch
- **sentiment** (tùy chọn): Lọc theo sentiment (positive/negative/neutral)

**Response**: Trả về danh sách tóm tắt tin tức.

---

### 8. Lấy Chi Tiết Đầy Đủ Của Tin Tức

**Endpoint**: `POST /api/v1/news/{id}/fetch-detail`

**Mô tả**: Crawl lại URL nguồn của tin tức để lấy nội dung đầy đủ và cập nhật vào database. Hữu ích khi tin tức ban đầu chỉ có tóm tắt.

**Tham số path**:
- **id** (bắt buộc): ID của tin tức

**Cách hoạt động**:
1. Lấy thông tin tin tức hiện tại từ database
2. Crawl lại URL nguồn để lấy nội dung đầy đủ
3. Cập nhật nội dung, tác giả, tags, và hình ảnh vào database
4. Trả về tin tức đã được cập nhật

**Response**: Trả về tin tức đã được cập nhật với nội dung đầy đủ.

---

## API Quản Lý Crawler

### 9. Bắt Đầu Crawler

**Endpoint**: `POST /api/v1/crawler/start`

**Mô tả**: Bắt đầu quá trình crawl tin tức từ một hoặc nhiều nguồn.

**Request body**:
- **source** (tùy chọn): Tên nguồn đơn lẻ để crawl
- **sources** (tùy chọn): Mảng các nguồn để crawl (ưu tiên nếu có)
- **only_new** (tùy chọn, mặc định: false): Chỉ crawl tin tức mới hơn lần crawl cuối
- **min_age_hours** (tùy chọn): Chỉ crawl tin tức từ N giờ trước
- **force_refresh** (tùy chọn, mặc định: false): Bắt buộc crawl lại ngay cả khi tin tức đã tồn tại

**Lưu ý**: Phải có ít nhất một trong hai trường `source` hoặc `sources`.

**Response**: 
- Nếu crawl một nguồn: Trả về message và job_id
- Nếu crawl nhiều nguồn: Trả về message, job_ids (mảng), và count

---

### 10. Dừng Crawler

**Endpoint**: `POST /api/v1/crawler/stop`

**Mô tả**: Dừng tất cả các job crawl đang chạy.

**Response**: Trả về message xác nhận đã dừng crawler thành công.

---

### 11. Lấy Trạng Thái Crawler

**Endpoint**: `GET /api/v1/crawler/status`

**Mô tả**: Lấy trạng thái hiện tại của crawler, bao gồm các job đang chạy, đã hoàn thành, hoặc lỗi.

**Response**: Trả về thông tin trạng thái crawler bao gồm:
- Trạng thái hiện tại (running/stopped)
- Số lượng job đang chạy
- Số lượng job đã hoàn thành
- Số lượng job lỗi
- Thông tin chi tiết về các job

---

## Lưu Ý Chung

- Tất cả các API đều trả về response theo format chuẩn với trường `success`, `data`, và `message` (nếu có lỗi).
- Các API lấy tin tức không yêu cầu xác thực (trừ khi được cấu hình khác).
- Các API quản lý crawler có thể yêu cầu quyền quản trị tùy theo cấu hình.
- Thời gian xử lý có thể khác nhau tùy thuộc vào số lượng dữ liệu và độ phức tạp của bộ lọc.
- API crawl chi tiết (`fetch-detail`) có thể mất thời gian do cần crawl lại từ URL nguồn.
