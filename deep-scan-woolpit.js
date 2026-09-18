import fs from "fs/promises";
import { createAudioQuery } from "./voicevox.js";

async function deepAuditAll() {
  const manifestPath = "./output/script_woolpit_green_children_ja/manifest.json";
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));

  console.log("=== BẮT ĐẦU SOI TOÀN BỘ 53 FILE AUDIO ===");
  const suspicious = [];

  for (const item of manifest) {
    const q = await createAudioQuery(item.optimizedText, 13, { optimize: false });
    const k = q.kana;
    const t = item.optimizedText;

    const reasons = [];

    // 1. Dấu ngoặc kép trong các câu dẫn chuyện (không phải câu thoại trực tiếp 28-33)
    if ((t.includes("「") || t.includes("」")) && (item.index < 28 || item.index > 33)) {
      reasons.push("Còn dấu ngoặc kép 「」 có thể gây khựng âm dạng đọc tiêu đề");
    }

    // 2. Tên Katakana nhiều dấu chấm giữa (A・B・C)
    const katakanaDots = t.match(/[\u30A0-\u30FF]+・[\u30A0-\u30FF]+・[\u30A0-\u30FF]+/g);
    if (katakanaDots) {
      reasons.push(`Katakana bị chẻ nhiều mảnh: ${katakanaDots.join(", ")}`);
    }

    // 3. Các dấu ngắt hơi / liên từ có nguy cơ tạo pause gượng gạo
    if (t.includes("、つまり") || t.includes("、あの") || t.includes("、ド・") || t.includes("、あるいは")) {
      reasons.push("Có liên từ/ngắt phẩy dễ làm đứt mạch câu");
    }

    // 4. Các từ Hán tự chuyên ngành có thể bị nuốt âm hoặc ngắt nhịp cuối câu
    if (t.endsWith("仮説です。") || t.endsWith("説明です。") || t.endsWith("ものでした。")) {
      // Kiểm tra âm đuôi
    }

    if (reasons.length > 0) {
      suspicious.push({
        index: item.index,
        fileName: item.fileName,
        text: t,
        kana: k,
        reasons
      });
    }
  }

  console.log(`\nPhát hiện ${suspicious.length} câu có thể tối ưu thêm để đạt độ tự nhiên tuyệt đối:\n`);
  suspicious.forEach(s => {
    console.log(`--------------------------------------------------`);
    console.log(`[Item ${s.index}] ${s.fileName}`);
    console.log(`Văn bản: "${s.text}"`);
    console.log(`Kana   : ${s.kana}`);
    console.log(`Vấn đề : ${s.reasons.join(" | ")}`);
  });
}

deepAuditAll().catch(console.error);
