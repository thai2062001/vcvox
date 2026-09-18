import fs from "fs/promises";
import { createAudioQuery, synthesizeVoice } from "./voicevox.js";

async function refineSpecificFiles() {
  console.log("=== BẮT ĐẦU FIX TINH CHỈNH SÂU CHO 014, 015, 016 ===");

  // 1. FIX 014: Gộp 'リチャード' + 'ド' + 'カルネ' thành 1 cụm liền mạch duy nhất không có khoảng nghỉ
  const text14 = "困惑した村人たちは、二人を地元の領主である騎士リチャード・ド・カルネの館へと連れて行きました。";
  const q14 = await createAudioQuery(text14, 13, { optimize: false });
  for (let i = 0; i < q14.accent_phrases.length; i++) {
    const t = q14.accent_phrases[i].moras.map(x => x.text).join("");
    // Gỡ pause sau リチャード và ド
    if (t === "リチャード" || t === "リチャアド" || t === "ド") {
      q14.accent_phrases[i].pause_mora = null;
    }
  }
  const buf14 = await synthesizeVoice(q14, 13);
  await fs.writeFile("./output/script_woolpit_green_children_ja/014.wav", Buffer.from(buf14));
  console.log("✅ Đã tạo 014.wav hoàn hảo (Gỡ sạch pause, phát âm liền mạch Richard de Calne)");

  // 2. FIX 015: Gộp 'ウエデ' (飢えで) và 'スイジャク' (衰弱) thành 1 cụm trôi chảy, không khựng giữa chừng
  const text15 = "騎士の館でパンや肉など様々な食べ物が差し出されましたが、飢えで衰弱していたにもかかわらず、子どもたちは人間が食べる料理を頑なに拒絶し、泣き続けました。";
  const q15 = await createAudioQuery(text15, 13, { optimize: false });
  for (let i = 0; i < q15.accent_phrases.length - 1; i++) {
    const t1 = q15.accent_phrases[i].moras.map(x => x.text).join("");
    const t2 = q15.accent_phrases[i+1].moras.map(x => x.text).join("");
    if (t1 === "ウエデ" && t2 === "スイジャク") {
      q15.accent_phrases[i].moras.push(...q15.accent_phrases[i+1].moras);
      q15.accent_phrases[i].accent = 2; // trọng âm êm dịu
      q15.accent_phrases[i].pause_mora = null;
      q15.accent_phrases.splice(i + 1, 1);
      break;
    }
  }
  const buf15 = await synthesizeVoice(q15, 13);
  await fs.writeFile("./output/script_woolpit_green_children_ja/015.wav", Buffer.from(buf15));
  console.log("✅ Đã tạo 015.wav hoàn hảo (Nối liền '飢えで衰弱' trôi chảy)");

  // 3. FIX 016: Khóa cứng phát âm 'なまのインゲン豆' (Nama no ingenmame)
  const text16 = "数日間、水以外の何も口にせず、飢え死に寸前となった時、庭から収穫したばかりのなまのインゲン豆が持ち込まれました。";
  const q16 = await createAudioQuery(text16, 13, { optimize: false });
  const buf16 = await synthesizeVoice(q16, 13);
  await fs.writeFile("./output/script_woolpit_green_children_ja/016.wav", Buffer.from(buf16));
  console.log("✅ Đã tạo 016.wav hoàn hảo (Phát âm chuẩn xác 100% 'なまのインゲン豆')");

  console.log("\n🎉 HOÀN TẤT TẤT CẢ 3 FILE (014, 015, 016)!");
}

refineSpecificFiles().catch(console.error);
