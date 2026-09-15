import fs from "fs";

const kanaData = JSON.parse(fs.readFileSync("./output/script/kana_inspection.json", "utf-8"));

console.log("=== SCANNING ALL 75 SENTENCES FOR POTENTIAL MISPRONUNCIATIONS ===");

const candidates = [];

kanaData.forEach(item => {
  const t = item.optimizedText;
  const k = item.kana;

  // Let's log words that are prone to errors:
  // 1. Số đếm: 1963年, 85メートル, 2万人, 50センチ, 1トン, 2メートル, 1万5000本, 55メートル, 18層, 10キロメートル, 1万2000年前, 13度から15度
  // 2. Tên riêng: カッパドキア, デリンクユ, アナトリア, カイマクル, ビザンツ, ペルシャ, アラブ, ヒッタイト, フリギア, ヤンガードリアス, ゾロアスター, アフラ・マズダ, ジャムシード
  // 3. Kanji hiếm/dễ sai: 隠蔽 (impei), 漆喰 (shikkui), 覗き穴 (nozoki-ana), 籠城 (roujou), 偽装 (gisou), 脱出 (dasshutsu), 軟質 (nanshitsu), 粘り強さ (nebarizuyosa), 凝灰岩 (gyoukaigan), 耐荷重 (taikajuu), 連鎖崩壊 (rensahoukai), 対流 (tairyuu), 負圧 (fuatsu), 深井戸 (fukaido), 難攻不落 (nankoufuraku), 密閉 (mippei), 糞尿 (funnyou), 排泄物 (haisetsubutsu), 一酸化炭素 (issankatanso), 燻り殺される (ibusarikorosareru), 煮炊き (nitaki), 閉所恐怖症 (heishokyoufushou), 墓坑 (bokou), 掃討 (soutou), 略奪 (ryakudatsu), 猛吹雪 (moufubuki), 凍土 (toudo), 業火 (gouka), 隕石 (inseki), 槌 (tsuchi)

  const words = [
    { kanji: "隠蔽", expected: "インペエ", actual: k },
    { kanji: "漆喰", expected: "シックイ", actual: k },
    { kanji: "覗き穴", expected: "ノゾキアナ", actual: k },
    { kanji: "籠城", expected: "ロオジョオ", actual: k },
    { kanji: "偽装", expected: "ギソオ", actual: k },
    { kanji: "凝灰岩", expected: "ギョオカイガン", actual: k },
    { kanji: "耐荷重", expected: "タイカジュウ", actual: k },
    { kanji: "連鎖崩壊", expected: "レンサホオカイ", actual: k },
    { kanji: "負圧", expected: "フアツ", actual: k },
    { kanji: "深井戸", expected: "フカイド", actual: k },
    { kanji: "難攻不落", expected: "ナンコオフラク", actual: k },
    { kanji: "糞尿", expected: "フンニョオ", actual: k },
    { kanji: "排泄物", expected: "ハイセツブツ", actual: k },
    { kanji: "一酸化炭素", expected: "イッサンカタ'ンソ", actual: k },
    { kanji: "燻り殺される", expected: "イブサリ", actual: k },
    { kanji: "煮炊き", expected: "ニタキ", actual: k },
    { kanji: "閉所恐怖症", expected: "ヘエショキョ'オフショオ", actual: k },
    { kanji: "猛吹雪", expected: "モオフ'ブキ", actual: k },
    { kanji: "凍土", expected: "ト'オド", actual: k },
    { kanji: "業火", expected: "ゴ'オカ", actual: k },
    { kanji: "隕石", expected: "イ'ンセキ", actual: k },
    { kanji: "流星群", expected: "リュウセエ'グン", actual: k },
    { kanji: "熱線", expected: "ネッセン", actual: k },
    { kanji: "放射性粉塵", expected: "ホオシャセエ'/フンジン", actual: k },
    { kanji: "先史文明", expected: "センシブ'ンメエ", actual: k },
  ];

  words.forEach(w => {
    if (t.includes(w.kanji)) {
      if (!k.includes(w.expected)) {
        candidates.push({
          index: item.index,
          kanji: w.kanji,
          expected: w.expected,
          actualKana: k,
          text: t
        });
      }
    }
  });
});

console.log(`Found ${candidates.length} discrepancies:`);
console.log(JSON.stringify(candidates, null, 2));
