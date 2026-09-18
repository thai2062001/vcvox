import fs from "fs/promises";
import { speakToFile } from "./voicevox.js";

async function runFineTunedFixes() {
  const manifestPath = "./output/script_woolpit_green_children_ja/manifest.json";
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));

  const fixes = [
    {
      index: 5,
      // Bỏ hẳn cặp ngoặc 「」, dùng liên từ という để câu tự sự trôi chảy, không bị khựng bot đọc tiêu đề
      newText: "そして、彼らが語った太陽の昇らない世界とは、一体どこを指していたのか。",
      reason: "Bỏ ngoặc kép quanh '太陽の昇らない世界' để dòng văn tự sự lướt mượt tự nhiên"
    },
    {
      index: 14,
      // Viết liền 'リチャード・ドカルネ' để chữ ド lướt nhẹ như âm đệm 'de' trong tiếng Pháp/Anh
      newText: "困惑した村人たちは、二人を地元の領主である騎士リチャード・ドカルネの館へと連れて行きました。",
      reason: "Viết liền 'リチャード・ドカルネ' để chữ ド lướt nhẹ, không bị gằn âm"
    },
    {
      index: 35,
      // Viết liền 'キングスリン' để tránh AI chẻ đôi tên địa danh King's Lynn
      newText: "少女はその後成長してアグネスと名乗り、キングスリンの役人と結婚して、普通の市民として暮らしたと記録されています。",
      reason: "Viết liền 'キングスリン' để phát âm trọn vẹn tên thị trấn King's Lynn"
    },
    {
      index: 37,
      // Bỏ ngoặc kép và nối từ '医学的な解釈です' để âm đuôi 'です' ngân êm chuẩn phong cách tài liệu
      newText: "現代の研究において、最も有力視されているのが、歴史的、かつ医学的な解釈です。",
      reason: "Thêm liên từ nối 'かつ' và '医学的な解釈です' để đuôi câu ngân vang mềm mại, không bị cụt"
    },
    {
      index: 46,
      // Viết Katakana chuẩn 'フォーナム・セントマーティン村' và 'セントマーティンの国' (viết liền martín để nhịp đi liền mạch)
      newText: "そして、セントマーティンの国とは、近隣に実在したフランドル人の入植地、フォーナム・セントマーティン村を指していたという説明です。",
      reason: "Bỏ ngoặc kép và viết liền 'セントマーティン' để đọc đúng 1 hơi tự nhiên không ngắt 3 phần"
    }
  ];

  console.log(`Bắt đầu tinh chỉnh sâu và re-render cho ${fixes.length} file: [005, 014, 035, 037, 046]...`);

  for (const f of fixes) {
    const item = manifest.find(i => i.index === f.index);
    if (!item) continue;

    console.log(`\n--------------------------------------------------`);
    console.log(`[Item ${item.index}] File: ${item.fileName}`);
    console.log(`Nội dung mới: "${f.newText}"`);
    console.log(`Mục đích: ${f.reason}`);

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
    console.log(`✅ Hoàn thành ${item.fileName} trong ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log("\n🎉 ĐÃ CẬP NHẬT HOÀN HẢO TOÀN BỘ 5 FILE (005, 014, 035, 037, 046)!");
}

runFineTunedFixes().catch(console.error);
