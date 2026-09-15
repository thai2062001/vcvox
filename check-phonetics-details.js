import fs from "fs";

const kanaData = JSON.parse(fs.readFileSync("./output/script/kana_inspection.json", "utf-8"));

console.log("=== CHECKING PHONETIC READING DETAILS ===");

kanaData.forEach(item => {
  const t = item.optimizedText;
  const k = item.kana;

  // List of words to inspect
  const checks = [
    { word: "凝灰岩", expected: "ギョオカイガン" },
    { word: "通気坑", expected: "ツウキコオ" },
    { word: "墓坑", expected: "ボコオ" },
    { word: "籠城", expected: "ロオジョオ" },
    { word: "石扉", expected: "セキヒ or イシトビラ" },
    { word: "漆喰", expected: "シックイ" },
    { word: "鎚", expected: "ツチ" },
    { word: "掃討作戦", expected: "ソオトオサクセン" },
    { word: "ヒッタイト", expected: "ヒッタイト" },
    { word: "フリギア", expected: "フリギア" },
    { word: "カイマクル", expected: "カイマクル" },
    { word: "ヤンガードリアス", expected: "ヤンガードリアス" },
    { word: "アフラ・マズダ", expected: "アフラ・マズダ" },
    { word: "ジャムシード", expected: "ジャムシード" },
    { word: "ヴァラ", expected: "ヴァラ" },
    { word: "吻合", expected: "" },
    { word: "脱出口", expected: "ダツシュツグチ" },
    { word: "副排気管", expected: "フクハイキカン" },
    { word: "耐荷重比率", expected: "タイカジュウヒリツ" },
    { word: "熱対流原理", expected: "ネツタイリュウゲンリ" },
    { word: "生体防御", expected: "セイタイボウギョ" },
    { word: "多層防衛", expected: "タソウボウエイ" },
    { word: "難攻不落", expected: "ナンコウフラク" },
    { word: "一網打尽", expected: "イチモウダジン" },
    { word: "糞尿", expected: "フンニョウ" },
    { word: "煮炊き", expected: "ニタキ" },
    { word: "坑道", expected: "コウドウ" },
    { word: "素焼き皿", expected: "スヤキザラ" },
    { word: "地鳴り", expected: "ジナリ" },
    { word: "落盤", expected: "ラクバン" },
    { word: "地下聖堂", expected: "チカセイドウ" },
    { word: "大動脈", expected: "ダイドウミャク" },
    { word: "一寒村", expected: "イッカンソン" },
    { word: "場当たり的", expected: "バアタリテキ" },
    { word: "諸文明", expected: "ショブンメイ" },
    { word: "急襲", expected: "キュウシュウ" },
    { word: "壊滅的", expected: "カイメツテキ" },
    { word: "破滅の業火", expected: "ゴウカ" },
    { word: "放射性粉塵", expected: "フンジン" }
  ];

  checks.forEach(c => {
    if (t.includes(c.word)) {
      console.log(`[Item ${item.index}] Word: "${c.word}" -> Expected ~${c.expected}`);
      console.log(`   Text: ${t}`);
      console.log(`   Kana: ${k}\n`);
    }
  });
});
