import fs from "fs";

const kanaData = JSON.parse(fs.readFileSync("./output/script/kana_inspection.json", "utf-8"));

console.log("=== COMPREHENSIVE KANA ACCENT & READING AUDIT ===");

const problematic = [];

kanaData.forEach(item => {
  const t = item.optimizedText;
  const k = item.kana;

  // 1. 槌 -> ズチ (sai âm, phải là つち)
  if (t.includes("槌")) {
    problematic.push({
      index: item.index,
      word: "槌",
      problem: "Đọc thành ズチ (zuchi) thay vì つち (tsuchi - chiếc búa/nhát búa đầu tiên)",
      currentKana: k,
      recommendedText: t.replace(/槌/g, "つち")
    });
  }

  // 2. ヴァラ -> バラ (Vara trong thần thoại Ba Tư bị đọc thành Bara/hoa hồng)
  // Trong Voicevox, 'ヴァ' thường được đọc tốt hơn nếu viết ヴゔ hoặc ヴァ rõ ràng, kiểm tra xem nó có đọc là ヴァ/va không
  if (t.includes("ヴァラ") && k.includes("バ'ラ")) {
    problematic.push({
      index: item.index,
      word: "ヴァラ",
      problem: "Đọc thành バラ (bara) thay vì ヴァラ (vara)",
      currentKana: k,
      recommendedText: t.replace(/「ヴァラ」/g, "「ヴァ・ラ」")
    });
  }

  // 3. 墓坑 -> ハカアナ (hakaana) thay vì ぼこう (bokou)
  // 墓坑 trong ngữ cảnh hầm mộ là ぼこう (bokou)
  if (t.includes("墓坑")) {
    problematic.push({
      index: item.index,
      word: "墓坑",
      problem: "Đọc thành ハカアナ (hakaana - hố mộ thường) thay vì ボコウ (bokou - hầm mộ ngầm)",
      currentKana: k,
      recommendedText: t.replace(/墓坑/g, "ぼこう")
    });
  }

  // 4. 通気坑 -> ツウキアナ (tsuukiana)
  // Trong kỹ thuật mỏ/địa chất, 通気坑 đọc là つうきこう (tsuukikou) hoặc つうきこう. AI đọc là ツウキアナ (hố thông hơi). 
  // Nếu muốn đọc chuẩn thuật ngữ mỏ/công trình: つうきこう

  // 5. 18層 còn trong câu nào không?
  if (t.includes("18層")) {
    problematic.push({
      index: item.index,
      word: "18層",
      problem: "Chưa đổi sang じゅうはっそう",
      currentKana: k,
      recommendedText: t.replace(/18層/g, "じゅうはっそう")
    });
  }

  // 6. 脱出口 trong item 10: "ダツデ'グ_チ" (Datsudeguchi -> đọc dư chữ デ do ghép 脱出 + 出口!)
  // Hãy kiểm tra item 10!
  if (k.includes("ダツデ'グ_チ")) {
    problematic.push({
      index: item.index,
      word: "脱出口",
      problem: "Đọc lỗi thành ダツデグチ (Datsudeguchi - thừa âm デ) do AI ghép nhầm 脱出 + 出口",
      currentKana: k,
      recommendedText: t.replace(/脱出口/g, "だっしゅつこう") // hoặc だっしゅつぐち
    });
  }

  // 7. 素焼き皿 item 48: スヤキサラ (suyakisara)
  // Kiểm tra xem có bị cụt không

  // 8. 1本のハンマー item 1
  // Đã kiểm tra: イッ'ポンノ/ハ'ンマア (rất chuẩn)
});

console.log("Found issues:", problematic.length);
console.log(JSON.stringify(problematic, null, 2));
