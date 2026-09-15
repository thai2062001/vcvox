import fs from "fs/promises";
import { createAudioQuery } from "./voicevox.js";

async function inspectSentences() {
  const manifest = JSON.parse(await fs.readFile("./output/script/manifest.json", "utf-8"));
  console.log(`Checking ${manifest.length} sentences for kana readings...`);
  
  const results = [];
  for (const item of manifest) {
    try {
      const q = await createAudioQuery(item.optimizedText, 13, { optimize: false });
      results.push({
        index: item.index,
        fileName: item.fileName,
        optimizedText: item.optimizedText,
        kana: q.kana
      });
      process.stdout.write(`\rAnalyzed ${item.index}/${manifest.length}`);
    } catch (e) {
      console.error(`\nError at item ${item.index}:`, e.message);
    }
  }

  await fs.writeFile("./output/script/kana_inspection.json", JSON.stringify(results, null, 2), "utf-8");
  console.log("\nFinished inspecting. Saved to ./output/script/kana_inspection.json");
}

inspectSentences().catch(console.error);
