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

## 🔄 Khi nào cần đổi link API?
Mỗi khi bạn tắt hoặc khởi động lại Google Colab, nó sẽ cấp 1 đường link Cloudflare mới.
Bạn chỉ cần mở file [config.js](file:///c:/Users/Admin/Desktop/Du%20an%20web/vcvox/config.js) và dán link mới vào:
```javascript
export const VOICEVOX_API_URL = "https://link-moi-cua-ban.trycloudflare.com";
```
