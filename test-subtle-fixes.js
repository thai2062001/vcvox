import { createAudioQuery } from "./voicevox.js";

async function testItem27() {
  const t1 = "垂直に掘られた深井戸を通じて";
  const t2 = "垂直に掘られた「ふかいど」を通じて";
  const t3 = "垂直に掘られた深い井戸を通じて";
  const t4 = "吸気口を塞がれて燻り殺される危険がありました。";
  const t5 = "吸気口を塞がれて、いぶり殺される危険がありました。";

  console.log("t1 (深井戸):", (await createAudioQuery(t1, 13, { optimize: false })).kana);
  console.log("t2 (ふかいど):", (await createAudioQuery(t2, 13, { optimize: false })).kana);
  console.log("t3 (深い井戸):", (await createAudioQuery(t3, 13, { optimize: false })).kana);
  console.log("t4 (燻り殺される):", (await createAudioQuery(t4, 13, { optimize: false })).kana);
  console.log("t5 (いぶり殺される):", (await createAudioQuery(t5, 13, { optimize: false })).kana);
}

testItem27().catch(console.error);
