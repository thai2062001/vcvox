import { speakToFile } from "./voicevox.js";

async function main() {
  console.log("🚀 Đang kết nối tới Google Colab API...");
  
  const text = "こんにちは！VOICEVOXのAPIテストです。よろしくお願いします！";
  console.log(`📝 Đang tổng hợp giọng nói cho câu: "${text}"`);
  console.log("🎭 Nhân vật: Zundamon (speakerId = 3)");

  const startTime = Date.now();
  
  await speakToFile({
    text: text,
    speakerId: 3,         // 3: Zundamon bình thường (1: Ngọt ngào, 7: Tức giận, v.v.)
    speedScale: 1.05,     // Tốc độ nói hơi nhanh nhẹn một chút
    pitchScale: 0.0,      // Cao độ chuẩn
    intonationScale: 1.2, // Nhấn nhá cảm xúc tự nhiên
    outputPath: "output.wav"
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`🎉 Thành công! File âm thanh đã được tạo trong ${duration}s: output.wav`);
}

main().catch(err => {
  console.error("❌ Có lỗi xảy ra:", err.message);
});
