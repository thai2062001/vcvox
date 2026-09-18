import fs from "fs/promises";
import { speakToFile } from "./voicevox.js";

async function fixRawBeanPronunciation() {
  const manifestPath = "./output/script_woolpit_green_children_ja/manifest.json";
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));

  const targetFixes = [
    {
      index: 4,
      newText: "なぜ二人の子どもの肌は緑色だったのか。なぜ未知の言語を話し、なまの豆しか口にしなかったのか。",
      reason: "Đổi '生の豆' -> 'なまの豆' (Nama no mame) sửa dứt điểm lỗi đọc sai 'せいのまめ'"
    },
    {
      index: 16,
      newText: "数日間、水以外の何も口にせず、飢え死に寸前となった時、庭から収穫したばかりのなまのインゲン豆が持ち込まれました。",
      reason: "Đổi '生のインゲン豆' -> 'なまのインゲン豆' chuẩn Kunyomi"
    },
    {
      index: 17,
      newText: "すると子どもたちは激しい歓喜を示し、夢中で豆のさやを開けてなまの豆を食べ始め、ようやく飢えをしのぐことができたのです。",
      reason: "Đổi '生の豆' -> 'なまの豆' chuẩn Kunyomi"
    },
    {
      index: 18,
      newText: "その後、彼らは長い間なまの豆だけを食べて生き延びましたが、幼い少年の方は新しい環境に適応できず、間もなく重い病気にかかり息を引き取ってしまいました。",
      reason: "Đổi '生の豆' -> 'なまの豆' chuẩn Kunyomi"
    },
    {
      index: 43,
      newText: "ヒ素中毒は皮膚の色素異常や重度の消化器障害を引き起こすため、調理された食事を受け付けず、なまの豆しか食べられなかった理由として説明できるという仮説です。",
      reason: "Đổi '生の豆' -> 'なまの豆' chuẩn Kunyomi"
    }
  ];

  console.log(`=== BẮT ĐẦU RE-RENDER SỬA ÂM KUNYOMI (なまの豆 - NAMA NO MAME) CHO 5 FILE ===`);

  for (const f of targetFixes) {
    const item = manifest.find(i => i.index === f.index);
    if (!item) continue;

    console.log(`\n[${item.index}/53] Đang re-render ${item.fileName}...`);
    item.optimizedText = f.newText;
    const t0 = Date.now();
    await speakToFile({
      text: f.newText,
      speakerId: 13,
      speedScale: 1.1,
      pitchScale: -0.02,
      intonationScale: 1.15,
      outputPath: item.filePath,
      optimize: false
    });
    console.log(`   ✅ Xong ${item.fileName} trong ${((Date.now() - t0) / 1000).toFixed(1)}s: ${f.reason}`);
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log("\n🎉 HOÀN TẤT 100% VIỆC SỬA PHÁT ÂM 'NAMA NO MAME' CHO TOÀN BỘ KỊCH BẢN!");
}

fixRawBeanPronunciation().catch(console.error);
