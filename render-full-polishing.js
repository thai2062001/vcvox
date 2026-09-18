import fs from "fs/promises";
import { speakToFile } from "./voicevox.js";

async function runFullScriptPolishing() {
  const manifestPath = "./output/script_woolpit_green_children_ja/manifest.json";
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));

  // Danh sách các câu còn dính ngoặc kép hoặc liên từ ngắt khúc
  const polishingList = [
    {
      index: 6,
      newText: "今回は、中世史における最も不可解な謎の一つ、ウールピットの緑の子供たちの真相と、現代科学や歴史学が導き出した論理的な解釈に迫ります。",
      reason: "Bỏ ngoặc kép quanh 'ウールピットの緑の子供たち' để câu mở đầu lướt êm, không bị ngắt thành tiêu đề"
    },
    {
      index: 8,
      newText: "ウールピットという地名は、古英語のウルフピットに由来し、当時害獣であったオオカミを捕獲するために掘られた、深い落とし穴を意味していました。",
      reason: "Bỏ ngoặc kép quanh 'ウールピット' để nối âm tự nhiên với 'という地名は'"
    },
    {
      index: 21,
      newText: "英語を習得した少女は村の生活に溶け込み、周囲の大人たちから、自分たちはどこから来たのかと問われました。",
      reason: "Bỏ ngoặc kép và thay dấu phẩy để dòng tự sự mượt mà"
    },
    {
      index: 23,
      newText: "少女は、自分たちはセントマーティンの国という場所から来たと語りました。",
      reason: "Bỏ ngoặc kép và chuẩn hóa tên Saint Martin"
    },
    {
      index: 25,
      newText: "さらに少女は、自分たちの世界には太陽が昇ることはなく、常に太陽が沈んだ後の夕暮れ時のような、薄暗い光に包まれていると述べました。",
      reason: "Bỏ ngoặc kép quanh lời trần thuật để đọc liền mạch không bị khựng"
    },
    {
      index: 26,
      newText: "そして、川を挟んだ向こう側には、光り輝く明るい別の国が見えていたと語ったのです。",
      reason: "Bỏ ngoặc kép để nối âm tự nhiên với 'と語ったのです'"
    },
    {
      index: 41,
      newText: "医学的には、重度の鉄分欠乏性貧血である萎黄病を発症すると、皮膚が緑がかった青白色に変色することが知られています。",
      reason: "Bỏ ngoặc kép quanh 萎黄病 để đọc liền 'である萎黄病を発症すると'"
    },
    {
      index: 42,
      newText: "さらに一部の法医学者からは、財産を狙った後見人による、ヒ素の継続的な投与による中毒説も提起されています。",
      reason: "Bỏ ngoặc kép quanh 'ヒ素の継続的な投与による中毒説'"
    },
    {
      index: 44,
      newText: "彼らが話していた未知の言語とは、英語の農民には理解できなかったフランドル方言、すなわち中世オランダ語であり、",
      reason: "Đổi 'つまり' thành 'すなわち' để giọng đọc sang trọng và uyển chuyển chuẩn tài liệu"
    },
    {
      index: 47,
      newText: "一方で、当時の記録を忠実に読み解く研究者たちからは、民俗学的な異世界伝承や、地下世界説との関連性も指摘されています。",
      reason: "Bỏ ngoặc kép quanh '異世界伝承' và '地下世界説' để nối liền với trợ từ 'や'"
    },
    {
      index: 48,
      newText: "少女が語った太陽のない薄暗い国や、洞窟を抜けて別の世界に至るというモチーフは、ケルト神話における妖精郷や、地下世界の概念と酷似しています。",
      reason: "Bỏ ngoặc kép để câu văn triết lý/huyền học trôi chảy"
    },
    {
      index: 50,
      newText: "八百年以上前の文献に記された、ウールピットの緑の子供たち。",
      reason: "Bỏ ngoặc kép để tạo khoảng lắng đọng tự nhiên ở phần kết"
    }
  ];

  console.log(`Bắt đầu đánh bóng toàn diện cho ${polishingList.length} câu...`);

  for (const p of polishingList) {
    const item = manifest.find(i => i.index === p.index);
    if (!item) continue;

    console.log(`\n[${item.index}/53] Re-rendering ${item.fileName}...`);
    item.optimizedText = p.newText;
    const t0 = Date.now();
    await speakToFile({
      text: p.newText,
      speakerId: 13,
      speedScale: 1.1,
      pitchScale: -0.02,
      intonationScale: 1.15,
      outputPath: item.filePath,
      optimize: false
    });
    console.log(`   ✅ Xong ${item.fileName} (${((Date.now() - t0) / 1000).toFixed(1)}s): ${p.reason}`);
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log("\n🎉 HOÀN TẤT ĐÁNH BÓNG TOÀN DIỆN TẤT CẢ CÁC CÂU CÒN LẠI!");
}

runFullScriptPolishing().catch(console.error);
