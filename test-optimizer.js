import { optimizeJapaneseScript } from "./text-optimizer.js";
import { speakToFile } from "./voicevox.js";

async function main() {
  console.log("🔍 [KIỂM TRA LOGIC TỐI ƯU HÓA KỊCH BẢN AI VOICE TIẾNG NHẬT]\n");

  // Văn bản chứa đầy đủ các bẫy lỗi điển hình trong sổ tay:
  const dirtyText = "隔壁（かくへき）が圧壊し、水深600mの南大西洋に米潜水艦が沈没した。水音が響く中、原子力潜水艦の18層が耐えられるか？14.7PSIの圧力がかかる。";

  console.log("📝 VĂN BẢN GỐC (Chứa 7 bẫy lỗi kinh điển):");
  console.log(`"${dirtyText}"\n`);

  const { optimizedText, changes } = optimizeJapaneseScript(dirtyText);

  console.log(`✨ ĐÃ ÁP DỤNG THÀNH CÔNG ${changes.length} QUY TẮC TỰ ĐỘNG:`);
  changes.forEach((c, idx) => {
    console.log(`  ${idx + 1}. [${c.from}] ➔ [${c.to}]`);
    console.log(`     Lý do: ${c.rule}`);
  });

  console.log("\n🎯 KỊCH BẢN ĐÃ ĐƯỢC LÀM SẠCH (SẴN SÀNG NẠP VÀO TTS):");
  console.log(`"${optimizedText}"\n`);

  console.log("🎙️ Đang tổng hợp file âm thanh chuẩn bằng giọng Aoyama Ryusei (speakerId 13)...");
  await speakToFile({
    text: optimizedText,
    speakerId: 13,
    speedScale: 1.1,      // Tỉ lệ vàng 1.1x cho phim tài liệu/khoa học
    pitchScale: -0.02,
    intonationScale: 1.15,
    outputPath: "optimized_sample.wav",
    optimize: false       // Đã tối ưu sẵn ở trên
  });

  console.log("🎉 Hoàn tất! File âm thanh không vấp lỗi đã được tạo: optimized_sample.wav");
}

main().catch(err => console.error("Lỗi:", err.message));
