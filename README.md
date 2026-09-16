# VOICEVOX API Client & Web Studio (Node.js)

Dự án gọi API **VOICEVOX** chạy từ Google Colab về máy tính, hoàn toàn an toàn và không cần cài đặt bất kỳ file `.exe` nào.

---

## 📁 Cấu trúc thư mục

- `config.js`: Chứa đường link API từ Google Colab.
- `voicevox.js`: Thư viện hàm Node.js (tạo query, tổng hợp âm thanh, lưu file `.wav`).
- `test.js`: Script test nhanh tạo ra file `output.wav`.
- `list-speakers.js`: Script liệt kê toàn bộ 43 nhân vật và ID cảm xúc.
- `web-server.js` + `public/index.html`: Giao diện Web Studio trực quan (chỉnh tốc độ, cao độ, cảm xúc, nghe trực tiếp).

---

## 🚀 Cách sử dụng

### 1. Test nhanh qua dòng lệnh (CLI):
```bash
node test.js
```
File âm thanh `output.wav` sẽ được tạo ngay trong thư mục.

### 2. Xem danh sách nhân vật & ID giọng nói:
```bash
node list-speakers.js
```

### 3. Mở giao diện Web Studio để tùy chỉnh trực quan:
```bash
node web-server.js
```
Mở trình duyệt truy cập: **`http://localhost:3000`**
- Chọn nhân vật (Zundamon, Shikikou, Metan, Tsumugi...)
- Chọn sắc thái (Normal, Sweet, Tsundere, Whisper...)
- Kéo thanh trượt Tốc độ (Speed), Cao độ (Pitch), Nhấn nhá cảm xúc (Intonation).
- Bấm **"Tạo & Nghe giọng nói"** hoặc tải file `.wav` về.

---

## 🎬 Render Hàng Loạt Nhiều Kịch Bản (Multi-Script Batch Render)

Mỗi file script khi nạp vào sẽ được tự động tạo một thư mục riêng biệt bên trong `./output/` theo tên file kịch bản, giúp quản lý nhiều video/dự án độc lập không sợ bị lẫn lộn file hay ghi đè.

### 1. Tự động tạo thư mục riêng theo tên file:
```bash
# Tự động lưu audio và manifest vào: ./output/derinkuyu_city/
node batch-render.js ./Scripts/derinkuyu_city.md

# Tự động lưu audio và manifest vào: ./output/submarine_san_juan/
node batch-render.js ./Scripts/submarine_san_juan.md
```

### 2. Tùy chỉnh thư mục output bằng cờ `--out`:
```bash
node batch-render.js ./Scripts/script.md --out ./output/video_tap_1
```

### 3. Kiểm tra chất lượng & Báo cáo riêng từng kịch bản:
```bash
node check-audio-quality.js ./output/derinkuyu_city
node check-audio-quality.js ./output/submarine_san_juan
```

---

## 🔄 Khi nào cần đổi link API?
Mỗi khi bạn tắt hoặc khởi động lại Google Colab, nó sẽ cấp 1 đường link Cloudflare mới.
Bạn chỉ cần mở file [config.js](file:///c:/Users/Admin/Desktop/Du%20an%20web/vcvox/config.js) và dán link mới vào:
```javascript
export const VOICEVOX_API_URL = "https://link-moi-cua-ban.trycloudflare.com";
```
