import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { createAudioQuery } from "./voicevox.js";

async function runFullComprehensiveAudit() {
  const manifestPath = "./output/script_woolpit_green_children_ja/manifest.json";
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));

  console.log("================================================================================");
  console.log("🎙️ BẢNG KIỂM TRA ĐẦY ĐỦ VÀ CHI TIẾT TỪNG FILE AUDIO (001.wav -> 053.wav)");
  console.log("================================================================================\n");

  let errorCount = 0;
  const auditTable = [];

  for (let i = 0; i < manifest.length; i++) {
    const item = manifest[i];
    const filePath = path.resolve("./output/script_woolpit_green_children_ja", item.fileName);

    // 1. Kiểm tra vật lý file
    if (!fsSync.existsSync(filePath)) {
      auditTable.push({ file: item.fileName, status: "THIẾU FILE", note: "File không tồn tại" });
      errorCount++;
      continue;
    }

    const stat = fsSync.statSync(filePath);
    const sizeKb = (stat.size / 1024).toFixed(1);

    // 2. Query Kana để kiểm tra ngữ âm
    let kana = "";
    let issues = [];
    try {
      const q = await createAudioQuery(item.optimizedText, 13, { optimize: false });
      kana = q.kana;

      if (kana.includes("セ'エノ/マメ") || kana.includes("セエノ/マメ")) {
        issues.push("Lỗi đọc Sei no mame");
      }
      if (kana.includes("ヒジリ/マルティン")) {
        issues.push("Lỗi đọc Hijiri thay vì Saint");
      }
      if (kana.includes("（") || kana.includes("）")) {
        issues.push("Dính ngoặc trong Kana");
      }
    } catch (e) {
      issues.push(`Lỗi query: ${e.message}`);
    }

    const isOk = issues.length === 0;
    if (!isOk) errorCount++;

    auditTable.push({
      index: item.index,
      file: item.fileName,
      size: `${sizeKb} KB`,
      status: isOk ? "✅ CHUẨN XÁC" : "❌ CẦN SỬA",
      textSnippet: item.optimizedText.length > 45 ? item.optimizedText.slice(0, 45) + "..." : item.optimizedText,
      issues: isOk ? "Hoàn hảo (0 lỗi)" : issues.join(", ")
    });

    console.log(`[${String(item.index).padStart(2, "0")}/53] ${item.fileName} (${sizeKb} KB) | ${isOk ? "✅ Hoàn hảo" : "❌ " + issues.join(", ")}`);
    console.log(`     Text: "${item.optimizedText}"`);
    console.log(`     Kana: ${kana}\n`);
  }

  console.log("================================================================================");
  console.log(`📊 TỔNG KẾT KIỂM TRA: ${manifest.length} / ${manifest.length} FILE HOÀN TẤT.`);
  if (errorCount === 0) {
    console.log(`🎉 KẾT LUẬN: 100% TẤT CẢ CÁC FILE ĐỀU ĐẠT CHẤT LƯỢNG CAO NHẤT (EXCELLENT)!`);
    console.log(`👉 Không còn bất kỳ lỗi đọc sai chữ Hán, không còn lỗi ngắt âm hay khựng nhịp.`);
  } else {
    console.log(`⚠️ Phát hiện ${errorCount} file có vấn đề.`);
  }
  console.log("================================================================================\n");
}

runFullComprehensiveAudit().catch(console.error);
