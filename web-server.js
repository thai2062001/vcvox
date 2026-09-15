import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { VOICEVOX_API_URL } from "./config.js";
import { getSpeakers, speakToFile } from "./voicevox.js";
import { optimizeJapaneseScript } from "./text-optimizer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);

  // 1. API lấy danh sách nhân vật
  if (reqUrl.pathname === "/api/speakers" && req.method === "GET") {
    try {
      const speakers = await getSpeakers();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(speakers));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 2. API Xem trước tối ưu hóa kịch bản (Preview Text Optimizer)
  if (reqUrl.pathname === "/api/optimize-preview" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const { text } = JSON.parse(body);
        const result = optimizeJapaneseScript(text || "");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 3. API tạo giọng nói
  if (reqUrl.pathname === "/api/synthesize" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const { text, speakerId, speedScale, pitchScale, intonationScale, optimize } = JSON.parse(body);
        if (!text) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Text không được để trống" }));
        }

        const audioBuffer = await speakToFile({
          text,
          speakerId: Number(speakerId) || 13,
          speedScale: Number(speedScale) || 1.1,
          pitchScale: Number(pitchScale) || -0.02,
          intonationScale: Number(intonationScale) || 1.1,
          optimize: optimize !== false,
          outputPath: null
        });

        res.writeHead(200, {
          "Content-Type": "audio/wav",
          "Content-Length": audioBuffer.length
        });
        res.end(audioBuffer);
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 4. Phục vụ file giao diện tĩnh index.html
  if (reqUrl.pathname === "/" || reqUrl.pathname === "/index.html") {
    try {
      const filePath = path.join(__dirname, "public", "index.html");
      const html = await fs.readFile(filePath, "utf-8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`🌐 Web Studio đã sẵn sàng tại: http://localhost:${PORT}`);
  console.log(`🔗 Đang kết nối tới Colab API: ${VOICEVOX_API_URL}`);
  console.log(`⚡ Đã kích hoạt bộ tối ưu hóa kịch bản tiếng Nhật (Anti-Glitch/Kanji G2P)!`);
});
