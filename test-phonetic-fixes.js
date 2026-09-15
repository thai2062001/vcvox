import { createAudioQuery } from "./voicevox.js";

async function testFixes() {
  const tests = [
    { name: "Fix 脱出口 -> だっしゅつこう", text: "秘密のだっしゅつこうから脱出する" },
    { name: "Fix 脱出口 -> だっしゅつぐち", text: "秘密のだっしゅつぐちから脱出する" },
    { name: "Fix 墓坑 -> ぼこう", text: "近くにあるぼこうの岩壁に" },
    { name: "Fix ヴァラ -> ヴァラ", text: "地下要塞「ヴァラ」を" },
    { name: "Fix ヴァラ -> ヴアラ", text: "地下要塞「ヴアラ」を" },
    { name: "Fix 槌 -> つち", text: "最初のつちを打ち下ろしたのは" },
  ];

  for (const t of tests) {
    const q = await createAudioQuery(t.text, 13, { optimize: false });
    console.log(`${t.name}:`);
    console.log(`   Kana: ${q.kana}`);
  }
}

testFixes().catch(console.error);
