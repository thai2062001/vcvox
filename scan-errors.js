import fs from "fs";

const kanaData = JSON.parse(fs.readFileSync("./output/script/kana_inspection.json", "utf-8"));

console.log("=== SCANNING ALL 75 ITEMS FOR PHONETIC MISREADINGS ===");

const errors = [];

kanaData.forEach(item => {
  const t = item.optimizedText;
  const k = item.kana;

  // 1. Check 槌 (should be つち / ツチ, NOT ズチ / zuchi)
  if (t.includes("槌") && k.includes("ズチ")) {
    errors.push({ id: item.index, issue: "槌 (bị đọc thành ズチ/zuchi thay vì つち/tsuchi)", text: t, fix: t.replace(/槌/g, "つち") });
  }

  // 2. Check ヴァラ (Vara - should not be bara / バラ)
  if (t.includes("ヴァラ") && k.includes("バ'ラ")) {
    errors.push({ id: item.index, issue: "ヴァラ (bị đọc thành バラ/bara)", text: t, fix: t.replace(/ヴァラ/g, "ヴァラ") });
  }

  // 3. Check 墓坑 (should be ぼこう, let's see how it was read)
  if (t.includes("墓坑")) {
    console.log(`[Item ${item.index}] 墓坑 kana:`, k);
  }

  // 4. Check 18層 (should be じゅうはっそう)
  if (t.includes("18層")) {
    errors.push({ id: item.index, issue: "18層 còn sót chữ Hán chưa đổi sang じゅうはっそう", text: t, fix: t.replace(/18層/g, "じゅうはっそう") });
  }

  // 5. Check 通気坑 (tsuukikou)
  if (t.includes("通気坑")) {
    console.log(`[Item ${item.index}] 通気坑 kana:`, k);
  }

  // 6. Check 凝灰岩 (gyoukaigan)
  if (t.includes("凝灰岩")) {
    console.log(`[Item ${item.index}] 凝灰岩 kana:`, k);
  }

  // 7. Check カッパドキア, デリンクユ, カイマクル
  if (t.includes("デリンクユ")) {
    // console.log(`[Item ${item.index}] デリンクユ:`, k);
  }

  // 8. Check 85メートル (check if 地下、85メートル or 地下85メートル)
  if (t.includes("地下85メートル")) {
    errors.push({ id: item.index, issue: "地下85メートル chưa có dấu phẩy tách nhịp", text: t, fix: t.replace(/地下85メートル/g, "地下、85メートル") });
  }

  // 9. Check 1万5000本
  if (t.includes("1万5000本")) {
    console.log(`[Item ${item.index}] 1万5000本 kana:`, k);
  }

  // 10. Check 煮炊き (nitaki)
  if (t.includes("煮炊き")) {
    console.log(`[Item ${item.index}] 煮炊き kana:`, k);
  }

  // 11. Check 籠城 (roujou)
  if (t.includes("籠城")) {
    console.log(`[Item ${item.index}] 籠城 kana:`, k);
  }

  // 12. Check 素焼き皿
  if (t.includes("素焼き皿")) {
    console.log(`[Item ${item.index}] 素焼き皿 kana:`, k);
  }
});

console.log("\n--- DETECTED ERRORS ---");
console.log(JSON.stringify(errors, null, 2));
