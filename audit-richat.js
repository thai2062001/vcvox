import fs from "fs";
import { createAudioQuery } from "./voicevox.js";

const raw = fs.readFileSync("./Scripts/script_richat_atlantis_ja.md", "utf-8");
const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("#"));

async function inspectAll() {
  console.log(`Kiểm tra toàn bộ ${lines.length} câu qua VOICEVOX API...`);
  const results = [];

  for (let i = 0; i < lines.length; i++) {
    const text = lines[i];
    try {
      const q = await createAudioQuery(text, 13, { optimize: true });
      results.push({
        index: i + 1,
        text,
        kana: q.kana
      });
      console.log(`[${i+1}/${lines.length}] ✅ OK`);
    } catch (err) {
      console.error(`[${i+1}/${lines.length}] ❌ Lỗi:`, err.message);
      break;
    }
  }

  fs.writeFileSync("./output/richat_kana_audit.json", JSON.stringify(results, null, 2));
  console.log("Đã lưu kết quả kiểm tra vào ./output/richat_kana_audit.json");
}

inspectAll().catch(console.error);
