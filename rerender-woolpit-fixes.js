import fs from "fs/promises";
import { speakToFile } from "./voicevox.js";

async function runFixes() {
  const manifestPath = "./output/script_woolpit_green_children_ja/manifest.json";
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));

  const fixes = [
    {
      index: 34,
      newText: "この事件は、当時の二大知識人である歴史家ウィリアム・オブニューバーグのイギリス史と、修道院長ラルフ・オブコッゲシャールのイギリス年代記に詳細に記録されています。",
      reason: "Bỏ dấu chấm ngắt sau オブ để đọc liền mạch William-of-Newburgh và Ralph-of-Coggeshall"
    },
    {
      index: 41,
      newText: "医学的には、重度の鉄分欠乏性貧血である「萎黄病」を発症すると、皮膚が緑がかった青白色に変色することが知られています。",
      reason: "Chuẩn hóa danh từ y học 萎黄病"
    },
    {
      index: 46,
      newText: "そして「セント・マーティンの国」とは、近隣に実在したフランドル人の入植地、「フォーナム・セントマーティン村」を指していたという説明です。",
      reason: "Chuẩn hóa セント・マーティン và フォーナム・セントマーティン村 không bị ngắt quãng hay biến âm"
    }
  ];

  for (const f of fixes) {
    const item = manifest.find(i => i.index === f.index);
    if (!item) continue;
    console.log(`Đang re-render câu ${item.fileName}...`);
    item.optimizedText = f.newText;
    const t0 = Date.now();
    await speakToFile({
      text: f.newText,
      speakerId: 13,
      speedScale: 1.1,
      pitchScale: -0.02,
      intonationScale: 1.15,
      outputPath: item.filePath,
      optimize: false
    });
    console.log(`✅ Đã xong ${item.fileName} trong ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log("\n🎉 HOÀN TẤT TỐI ƯU 3 FILE (034, 041, 046)!");
}

runFixes().catch(console.error);
