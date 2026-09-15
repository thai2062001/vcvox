import fs from "fs/promises";
import { speakToFile } from "./voicevox.js";

async function generateSpeedDemos() {
  const sampleText = "トルコの荒涼とした大地の地下、85メートル。そこには、2万人以上の命を隠蔽するに足る超巨大地下都市が存在しています。そして、その驚異の扉が開かれたのは、一本のハンマーによる偶然の一撃でした。";

  console.log("=== ĐANG TẠO CÁC BẢN TEST TỐC ĐỘ (SPEED SCALE) ===");

  const configs = [
    {
      name: "demo_speed_1.0_cinematic.wav",
      speedScale: 1.0,
      pitchScale: -0.03,
      intonationScale: 1.18,
      desc: "Tốc độ 1.0 (Chuẩn phim tài liệu huyền bí, trầm ấm, đĩnh đạc)"
    },
    {
      name: "demo_speed_1.03_balanced.wav",
      speedScale: 1.03,
      pitchScale: -0.02,
      intonationScale: 1.15,
      desc: "Tốc độ 1.03 (Cân bằng, vừa đủ nhanh nhưng không bị vội)"
    },
    {
      name: "demo_speed_1.1_current.wav",
      speedScale: 1.1,
      pitchScale: -0.02,
      intonationScale: 1.15,
      desc: "Tốc độ 1.1 (Tốc độ cũ hiện tại để so sánh đối chiếu)"
    }
  ];

  for (const cfg of configs) {
    const outPath = `./output/${cfg.name}`;
    console.log(`\nĐang tạo: ${cfg.name} (${cfg.desc})...`);
    const t0 = Date.now();
    await speakToFile({
      text: sampleText,
      speakerId: 13,
      speedScale: cfg.speedScale,
      pitchScale: cfg.pitchScale,
      intonationScale: cfg.intonationScale,
      outputPath: outPath,
      optimize: false
    });
    console.log(`✅ Xong: ${outPath} trong ${((Date.now() - t0)/1000).toFixed(1)}s`);
  }

  console.log("\n🎉 Đã tạo xong cả 3 bản demo tốc độ trong thư mục ./output/!");
}

generateSpeedDemos().catch(err => {
  console.error("❌ Lỗi kết nối:", err.message);
  process.exit(1);
});
