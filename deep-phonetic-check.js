import { createAudioQuery } from "./voicevox.js";

async function deepCheck() {
  const tests = [
    { label: "開口部", text: "これらの井戸の開口部が", alt: "これらの井戸のかいこうぶが" },
    { label: "生と死", text: "生と死の危うい境界線", alt: "せいとしの危うい境界線" },
    { label: "ヤンガードリアス氷期", text: "ヤンガードリアス氷期の破局", alt: "ヤンガードリアスひょうきの破局" },
    { label: "通気坑", text: "主通気坑は", alt: "主つうきこうは" },
    { label: "通気坑2", text: "1万5000本以上もの通気坑が", alt: "1万5000本以上ものつうきこうが" },
    { label: "金属の梁", text: "金属の梁やモルタル", alt: "金属のはりやモルタル" },
    { label: "一寒村", text: "デリンクユは一寒村の", alt: "デリンクユはいっかんそんの" }
  ];

  for (const t of tests) {
    const q1 = await createAudioQuery(t.text, 13, { optimize: false });
    const q2 = await createAudioQuery(t.alt, 13, { optimize: false });
    console.log(`=== ${t.label} ===`);
    console.log(`Original: "${t.text}" -> Kana: ${q1.kana}`);
    console.log(`Optimized: "${t.alt}" -> Kana: ${q2.kana}\n`);
  }
}

deepCheck().catch(console.error);
