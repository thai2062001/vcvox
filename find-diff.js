import fs from "fs/promises";
import { optimizeJapaneseScript } from "./text-optimizer.js";

async function findSentencesNeedingReRender() {
  const manifest = JSON.parse(await fs.readFile("./output/script/manifest.json", "utf-8"));
  const changedIndices = [];

  for (const item of manifest) {
    const { optimizedText, changes } = optimizeJapaneseScript(item.originalText);
    if (optimizedText !== item.optimizedText) {
      changedIndices.push({
        index: item.index,
        fileName: item.fileName,
        oldText: item.optimizedText,
        newText: optimizedText,
        changes: changes.map(c => `${c.from} -> ${c.to} (${c.rule})`)
      });
    }
  }

  console.log(`Tìm thấy ${changedIndices.length} câu cần tối ưu lại âm thanh:`);
  console.log(JSON.stringify(changedIndices, null, 2));
}

findSentencesNeedingReRender().catch(console.error);
