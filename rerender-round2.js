import fs from "fs/promises";
import path from "path";
import { speakToFile } from "./voicevox.js";
import { optimizeJapaneseScript } from "./text-optimizer.js";

async function reRenderAllUpdates() {
  const manifestPath = "./output/script/manifest.json";
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));
  
  const targetIndices = [22, 23, 28, 55, 59, 67];
  console.log(`Bắt đầu re-render và tối ưu âm thanh cho ${targetIndices.length} câu: [${targetIndices.join(", ")}]...`);

  for (const idx of targetIndices) {
    const item = manifest.find(m => m.index === idx);
    if (!item) continue;

    const { optimizedText, changes } = optimizeJapaneseScript(item.originalText);
    item.optimizedText = optimizedText;
    item.changesCount = changes.length;

    console.log(`\n--------------------------------------------------`);
    console.log(`[Item ${item.index}] File: ${item.fileName}`);
    console.log(`Nội dung tối ưu: "${optimizedText}"`);
    console.log(`Các sửa đổi:`, changes.map(c => `${c.from} -> ${c.to} (${c.rule})`));

    const t0 = Date.now();
    await speakToFile({
      text: item.optimizedText,
      speakerId: 13,
      speedScale: 1.1,
      pitchScale: -0.02,
      intonationScale: 1.15,
      outputPath: item.filePath,
      optimize: false
    });
    console.log(`✅ Đã re-render thành công câu ${item.fileName} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  }

  // Cập nhật lại manifest
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`\n🎉 Đã cập nhật xong toàn bộ file âm thanh và manifest!`);
}

reRenderAllUpdates().catch(console.error);
