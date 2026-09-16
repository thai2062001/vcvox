import fs from "fs/promises";
import { VOICEVOX_API_URL } from "./config.js";
import { optimizeJapaneseScript } from "./text-optimizer.js";

/**
 * Lấy danh sách toàn bộ nhân vật và phong cách giọng nói (styles)
 */
export async function getSpeakers(apiUrl = VOICEVOX_API_URL) {
  const res = await fetch(`${apiUrl}/speakers`);
  if (!res.ok) {
    throw new Error(`Lỗi lấy danh sách nhân vật: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

/**
 * Bước 1: Tạo cấu hình âm thanh (Audio Query) từ đoạn văn bản
 * @param {string} text - Văn bản tiếng Nhật cần đọc
 * @param {number} speakerId - ID giọng nhân vật (Mặc định 3: Zundamon - Normal)
 * @param {object} [options]
 * @param {boolean} [options.optimize=true] - Tự động tối ưu hóa kịch bản theo sổ tay kinh nghiệm
 */
export async function createAudioQuery(text, speakerId = 3, options = {}) {
  const { apiUrl = VOICEVOX_API_URL, optimize = true } = options;

  let finalText = text;
  if (optimize) {
    const optResult = optimizeJapaneseScript(text);
    finalText = optResult.optimizedText;
    if (optResult.changes.length > 0) {
      console.log(`✨ [Tối ưu kịch bản]: Đã áp dụng ${optResult.changes.length} quy tắc:`);
      optResult.changes.forEach(c => console.log(`   - ${c.from} -> ${c.to} (${c.rule})`));
    }
  }

  const url = `${apiUrl}/audio_query?speaker=${speakerId}&text=${encodeURIComponent(finalText)}`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    throw new Error(`Lỗi tạo audio_query: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

/**
 * Bước 2: Tổng hợp giọng nói từ cấu hình Audio Query thành file nhị phân WAV
 * @param {object} audioQuery - Cấu hình nhận được từ bước 1
 * @param {number} speakerId - ID giọng nhân vật
 */
export async function synthesizeVoice(audioQuery, speakerId = 3, apiUrl = VOICEVOX_API_URL) {
  const url = `${apiUrl}/synthesis?speaker=${speakerId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "audio/wav"
    },
    body: JSON.stringify(audioQuery)
  });

  if (!res.ok) {
    throw new Error(`Lỗi tổng hợp âm thanh (synthesis): ${res.status} ${res.statusText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Hàm tiện ích tất cả-trong-một: Đọc text và lưu thẳng ra file .wav
 * @param {object} options
 * @param {string} options.text - Câu tiếng Nhật
 * @param {number} [options.speakerId=13] - ID giọng nhân vật (13: Aoyama Ryusei)
 * @param {number} [options.speedScale=1.05] - Tốc độ nói (Tỉ lệ vàng phim tài liệu 1.03x - 1.08x)
 * @param {number} [options.pitchScale=-0.02] - Cao độ tông giọng (-0.15 đến 0.15)
 * @param {number} [options.intonationScale=1.15] - Mức độ nhấn nhá cảm xúc (1.0 đến 1.5)
 * @param {number} [options.volumeScale=1.0] - Âm lượng (1.0)
 * @param {string} [options.outputPath="output.wav"] - Đường dẫn lưu file .wav
 * @param {boolean} [options.optimize=true] - Bật tối ưu hóa kịch bản
 */
export async function speakToFile({
  text,
  speakerId = 13,
  speedScale = 1.05,
  pitchScale = -0.02,
  intonationScale = 1.15,
  volumeScale = 1.0,
  outputPath = "output.wav",
  optimize = true,
  apiUrl = VOICEVOX_API_URL
}) {
  // 1. Tạo audio query (kèm tối ưu hóa text)
  const query = await createAudioQuery(text, speakerId, { apiUrl, optimize });

  // 2. Tùy chỉnh các thông số theo yêu cầu
  if (speedScale !== undefined) query.speedScale = speedScale;
  if (pitchScale !== undefined) query.pitchScale = pitchScale;
  if (intonationScale !== undefined) query.intonationScale = intonationScale;
  if (volumeScale !== undefined) query.volumeScale = volumeScale;

  // 3. Render ra buffer âm thanh
  const wavBuffer = await synthesizeVoice(query, speakerId, apiUrl);

  // 4. Lưu ra file nếu cần
  if (outputPath) {
    await fs.writeFile(outputPath, wavBuffer);
  }

  return wavBuffer;
}
