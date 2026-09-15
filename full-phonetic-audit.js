import fs from "fs";
import { createAudioQuery } from "./voicevox.js";

async function generateFullPhoneticAudit() {
  const manifest = JSON.parse(fs.readFileSync("./output/script/manifest.json", "utf-8"));
  console.log(`Đang phân tích chi tiết phiên âm và nhịp điệu (Accent Phrases & Morae) cho toàn bộ ${manifest.length} file...`);

  const fullAudit = [];

  for (let i = 0; i < manifest.length; i++) {
    const item = manifest[i];
    try {
      const q = await createAudioQuery(item.optimizedText, 13, { optimize: false });
      
      // Parse accent phrases to check pause, rhythm, mora length
      const phraseCount = q.accent_phrases.length;
      let totalMorae = 0;
      let pauseCount = 0;

      const phrasesInfo = q.accent_phrases.map((ap, pIdx) => {
        const moraTexts = ap.moras.map(m => m.text).join("");
        totalMorae += ap.moras.length;
        if (ap.pause_mora) pauseCount++;
        return {
          phraseIndex: pIdx + 1,
          reading: moraTexts,
          accent: ap.accent,
          hasPauseAfter: !!ap.pause_mora
        };
      });

      fullAudit.push({
        index: item.index,
        fileName: item.fileName,
        originalText: item.originalText,
        optimizedText: item.optimizedText,
        kana: q.kana,
        totalMorae,
        phraseCount,
        pauseCount,
        phrases: phrasesInfo
      });

      process.stdout.write(`\rĐã phân tích: ${item.index}/${manifest.length}`);
    } catch (e) {
      console.error(`\nLỗi tại ${item.fileName}:`, e.message);
    }
  }

  fs.writeFileSync("./output/script/full_phonetic_audit.json", JSON.stringify(fullAudit, null, 2), "utf-8");
  console.log("\nHoàn tất! Đã lưu vào ./output/script/full_phonetic_audit.json");
}

generateFullPhoneticAudit().catch(console.error);
