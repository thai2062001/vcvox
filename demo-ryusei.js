import { speakToFile } from "./voicevox.js";

async function main() {
  console.log("🎙️ Đang tạo demo giọng nam trầm Aoyama Ryusei (青山龍星)...");

  // 1. Bản Normal (ID 13) - Phong thái tự tin, trầm ấm
  console.log("\n[1/2] Đang tạo ryusei_normal.wav (Phong cách chuẩn - Normal)...");
  await speakToFile({
    text: "こんにちは。青山龍星だ。何か頼みたい用件でもあるのか？いつでも言ってくれ。",
    speakerId: 13,
    speedScale: 1.0,
    pitchScale: -0.02,
    intonationScale: 1.1,
    outputPath: "ryusei_normal.wav"
  });
  console.log("-> Đã tạo: ryusei_normal.wav");

  // 2. Bản Shittori (ID 84) - Rất trầm, sâu lắng, chậm rãi
  console.log("\n[2/2] Đang tạo ryusei_deep.wav (Phong cách trầm lắng - Shittori)...");
  await speakToFile({
    text: "夜も更けてきたな。焦る必要はない、ゆっくり休むといい。",
    speakerId: 84,
    speedScale: 0.95,
    pitchScale: -0.05,
    intonationScale: 1.2,
    outputPath: "ryusei_deep.wav"
  });
  console.log("-> Đã tạo: ryusei_deep.wav");

  console.log("\n🎉 Hoàn thành cả 2 file demo!");
}

main().catch(err => console.error("Lỗi:", err.message));
