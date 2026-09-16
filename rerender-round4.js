import fs from "fs";
import { speakToFile } from "./voicevox.js";

const targetIndices = [9, 12, 16, 20, 28, 32, 33, 45];
const dir = "./output/script_richat_atlantis_ja";
const manifestPath = `${dir}/manifest.json`;
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

const raw = fs.readFileSync("./Scripts/script_richat_atlantis_ja.md", "utf-8");
const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("#"));

async function rerenderRound4() {
  console.log(`Re-rendering ${targetIndices.length} câu: [${targetIndices.join(", ")}]...`);
  for (const idx of targetIndices) {
    const text = lines[idx - 1];
    const fileName = `${String(idx).padStart(3, "0")}.wav`;
    const filePath = `${dir}/${fileName}`;

    console.log(`\n[Re-rendering ${fileName}]: "${text}"`);
    const t0 = Date.now();
    await speakToFile({
      text: text,
      speakerId: 13,
      speedScale: 1.1,
      pitchScale: -0.02,
      intonationScale: 1.15,
      outputPath: filePath,
      optimize: false
    });
    const dur = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`✅ Đã xuất xong ${fileName} (${dur}s)`);

    // Cập nhật manifest
    const item = manifest.find(m => m.index === idx);
    if (item) {
      item.originalText = text;
      item.optimizedText = text;
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("\n🎉 Đã cập nhật xong toàn bộ các câu!");
}

rerenderRound4().catch(console.error);
