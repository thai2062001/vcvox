import fs from "fs/promises";
import { createAudioQuery, synthesizeVoice } from "./voicevox.js";

async function fix034And035Seamlessly() {
  console.log("=== BẮT ĐẦU FIX TRIỆT ĐỂ NỐI ÂM LIỀN MẠCH CHO 034 VÀ 035 ===");

  // 1. FIX 034: Gỡ bỏ hoàn toàn pause sau 'ウィリアム' (index 6) và 'ラルフ' (index 10)
  const text34 = "この事件は、当時の二大知識人である歴史家ウィリアム・オブニューバーグのイギリス史と、修道院長ラルフ・オブコッゲシャールのイギリス年代記に詳細に記録されています。";
  const q34 = await createAudioQuery(text34, 13, { optimize: false });
  for (let i = 0; i < q34.accent_phrases.length; i++) {
    const t = q34.accent_phrases[i].moras.map(x => x.text).join("");
    if (t === "ウィリアム" || t === "ラルフ") {
      q34.accent_phrases[i].pause_mora = null;
      console.log(`Gỡ pause thành công cho [${t}] ở câu 034`);
    }
  }
  const buf34 = await synthesizeVoice(q34, 13);
  await fs.writeFile("./output/script_woolpit_green_children_ja/034.wav", Buffer.from(buf34));
  console.log("✅ Đã tạo 034.wav hoàn hảo (Nối liền hoàn toàn William of Newburgh & Ralph of Coggeshall)");

  // 2. FIX 035: Gộp 'キング' (index 6) và 'スリンノ' (index 7) thành 1 khối moras duy nhất
  const text35 = "少女はその後成長してアグネスと名乗り、キングスリンの役人と結婚して、普通の市民として暮らしたと記録されています。";
  const q35 = await createAudioQuery(text35, 13, { optimize: false });
  for (let i = 0; i < q35.accent_phrases.length - 1; i++) {
    const t1 = q35.accent_phrases[i].moras.map(x => x.text).join("");
    const t2 = q35.accent_phrases[i+1].moras.map(x => x.text).join("");
    if (t1 === "キング" && t2.startsWith("スリン")) {
      console.log(`Gộp 2 phrases trong 035: [${t1}] + [${t2}]`);
      q35.accent_phrases[i].moras.push(...q35.accent_phrases[i+1].moras);
      q35.accent_phrases[i].accent = 5; // Trọng âm mượt mà cho King's Lynn
      q35.accent_phrases[i].pause_mora = null;
      q35.accent_phrases.splice(i + 1, 1);
      break;
    }
  }
  const buf35 = await synthesizeVoice(q35, 13);
  await fs.writeFile("./output/script_woolpit_green_children_ja/035.wav", Buffer.from(buf35));
  console.log("✅ Đã tạo 035.wav hoàn hảo (Khóa khối âm King's Lynn liền 1 mạch)");

  console.log("\n🎉 HOÀN TẤT NỐI ÂM 100% CHO 034 VÀ 035!");
}

fix034And035Seamlessly().catch(console.error);
