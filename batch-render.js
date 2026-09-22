import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import readline from "readline";
import { speakToFile } from "./voicevox.js";
import { optimizeJapaneseScript } from "./text-optimizer.js";

/**
 * Tách nội dung file script thành danh sách các câu/đoạn độc lập
 */
function parseScriptSentences(rawContent) {
  const lines = rawContent.split(/\r?\n/);
  const sentences = [];

  for (let line of lines) {
    line = line.trim();
    // Bỏ qua dòng trống hoặc tiêu đề markdown dạng #
    if (!line || line.startsWith("#")) continue;

    // Loại bỏ số thứ tự ở đầu nếu có (ví dụ: "1: ", "01. ")
    const cleanLine = line.replace(/^\d+[\.:]\s*/, "").trim();
    if (cleanLine) {
      sentences.push(cleanLine);
    }
  }

  return sentences;
}

/**
 * Hỏi người dùng trên terminal
 */
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(query, ans => {
      rl.close();
      resolve(ans.trim().toLowerCase());
    });
  });
}

async function main() {
  // 1. Phân tích tham số dòng lệnh
  const args = process.argv.slice(2);
  let scriptArg = "./Scripts/script.md";
  let customOutputDir = null;
  let customSpeed = 0.9; // Mặc định tốc độ 0.9 cho giọng bedtime ấm áp, thư giãn
  let customSpeaker = 13; // Giọng Ryusei

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--out" || args[i] === "-o") {
      customOutputDir = args[i + 1];
      i++;
    } else if (args[i] === "--speed" || args[i] === "-s") {
      customSpeed = parseFloat(args[i + 1]);
      i++;
    } else if (args[i] === "--speaker") {
      customSpeaker = parseInt(args[i + 1], 10);
      i++;
    } else if (!args[i].startsWith("-")) {
      scriptArg = args[i];
    }
  }

  const scriptPath = path.resolve(scriptArg);

  if (!fsSync.existsSync(scriptPath)) {
    console.error(`❌ Không tìm thấy file script tại: ${scriptPath}`);
    console.log(`👉 Cách dùng: node batch-render.js <đường_dẫn_file_script> [--out <thư_mục_output>]`);
    process.exit(1);
  }

  // 2. Tạo thư mục output riêng biệt theo tên file script (hoặc theo --out)
  const scriptBaseName = path.basename(scriptPath, path.extname(scriptPath));
  const outputDir = customOutputDir 
    ? path.resolve(customOutputDir) 
    : path.resolve("./output", scriptBaseName);
    
  await fs.mkdir(outputDir, { recursive: true });

  console.log("=".repeat(65));
  console.log(`🎬 BATCH VOICE RENDER - HỆ THỐNG TỰ ĐỘNG TẠO GIỌNG NÓI HÀNG LOẠT`);
  console.log("=".repeat(65));
  console.log(`📄 Kịch bản: ${path.basename(scriptPath)}`);
  console.log(`📁 Thư mục lưu audio riêng biệt: ${outputDir}`);

  // 3. Đọc và phân tích các câu trong kịch bản
  const rawContent = await fs.readFile(scriptPath, "utf-8");
  const rawSentences = parseScriptSentences(rawContent);

  if (rawSentences.length === 0) {
    console.error("❌ Kịch bản trống hoặc không có câu nào hợp lệ!");
    process.exit(1);
  }

  console.log(`📊 Tổng số câu phát hiện: ${rawSentences.length} câu\n`);

  // 4. Áp dụng bộ lọc tối ưu hóa kịch bản cho từng câu
  const items = rawSentences.map((origText, idx) => {
    const fileIndex = idx + 1;
    const fileName = `${String(fileIndex).padStart(3, "0")}.wav`;
    const filePath = path.join(outputDir, fileName);
    const { optimizedText, changes } = optimizeJapaneseScript(origText);

    return {
      index: fileIndex,
      fileName,
      filePath,
      originalText: origText,
      optimizedText,
      changesCount: changes.length
    };
  });

  // Lưu manifest đối chiếu text & audio
  const manifestPath = path.join(outputDir, "manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(items, null, 2), "utf-8");

  // 5. Đọc file progress (nếu đã có từ trước để resume)
  const progressPath = path.join(outputDir, "progress.json");
  let progress = { lastCompletedIndex: 0, completedFiles: [] };
  if (fsSync.existsSync(progressPath)) {
    try {
      progress = JSON.parse(await fs.readFile(progressPath, "utf-8"));
    } catch {
      // Bỏ qua nếu file lỗi
    }
  }

  // Bắt sự kiện người dùng bấm Ctrl + C để thông báo lưu tiến trình
  process.on("SIGINT", () => {
    console.log("\n\n⏸️  [TẠM DỪNG TIẾN TRÌNH] Bạn vừa bấm dừng.");
    console.log(`💾 Tiến trình đã được lưu an toàn tại: ${progressPath}`);
    console.log(`👉 Khi nào muốn chạy tiếp, chỉ cần gõ lại: node batch-render.js "${scriptArg}"\n`);
    process.exit(0);
  });

  // =========================================================================
  // GIAI ĐOẠN 1: LUÔN TẠO CÂU 1 ĐẦU TIÊN ĐỂ NGƯỜI DÙNG NGHE THỬ & DUYỆT
  // =========================================================================
  const firstItem = items[0];
  const firstFileExists = fsSync.existsSync(firstItem.filePath);

  if (!firstFileExists) {
    console.log(`⏳ [BƯỚC 1/2] Đang tạo câu demo số 1 (${firstItem.fileName}) để bạn nghe thử...`);
    console.log(`📝 Nội dung gốc: "${firstItem.originalText}"`);
    console.log(`✨ Đã tối ưu   : "${firstItem.optimizedText}"\n`);

    const t0 = Date.now();
    await speakToFile({
      text: firstItem.optimizedText,
      speakerId: customSpeaker,
      speedScale: customSpeed,
      pitchScale: -0.02,
      intonationScale: 1.15,
      outputPath: firstItem.filePath,
      optimize: false
    });
    const dur = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`🎉 Đã tạo xong câu số 1 trong ${dur}s: ${firstItem.filePath}`);

    if (!progress.completedFiles.includes(firstItem.fileName)) {
      progress.completedFiles.push(firstItem.fileName);
      progress.lastCompletedIndex = 1;
      await fs.writeFile(progressPath, JSON.stringify(progress, null, 2));
    }
  } else {
    console.log(`✅ Câu số 1 (${firstItem.fileName}) đã có sẵn tại thư mục.`);
  }

  // Thông báo để người dùng kiểm tra file 1
  console.log("\n" + "=".repeat(65));
  console.log(`🎧 HÃY MỞ NGHE THỬ CÂU SỐ 1:`);
  console.log(`👉 Đường dẫn: ${firstItem.filePath}`);
  console.log("=".repeat(65));

  // Kiểm tra cờ --all hoặc --yes để bỏ qua câu hỏi nếu muốn tự động hóa
  const autoContinue = process.argv.includes("--all") || process.argv.includes("-y");
  
  if (!autoContinue) {
    const answer = await askQuestion(
      "\n❓ Bạn đã nghe thử câu 1 chưa? Bấm 'y' (hoặc Enter) để tiếp tục tạo hàng loạt các câu còn lại, gõ 'n' để dừng: "
    );

    if (answer === "n" || answer === "no") {
      console.log("\n🛑 Đã dừng theo yêu cầu của bạn. Bạn có thể chỉnh lại kịch bản hoặc thông số trước khi chạy tiếp.");
      process.exit(0);
    }
  }

  // =========================================================================
  // GIAI ĐOẠN 2: CHẠY HÀNG LOẠT (CÓ THỂ PAUSE / RESUME TỰ ĐỘNG)
  // =========================================================================
  console.log(`\n🚀 [BƯỚC 2/2] BẮT ĐẦU TIẾN TRÌNH RENDER HÀNG LOẠT (${items.length} câu)`);
  console.log(`💡 Mẹo: Bạn có thể bấm [Ctrl + C] bất cứ lúc nào để tạm dừng! Tiến trình sẽ tự nhớ vị trí để resume lần sau.\n`);

  let renderedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Kiểm tra xem file đã tồn tại và hợp lệ chưa (Resume logic)
    if (fsSync.existsSync(item.filePath)) {
      const stats = fsSync.statSync(item.filePath);
      if (stats.size > 1000) { // Lớn hơn 1KB là file wav hợp lệ
        skippedCount++;
        continue;
      }
    }

    console.log(`[${item.index}/${items.length}] Đang tạo ${item.fileName}...`);
    console.log(`   "${item.optimizedText.length > 50 ? item.optimizedText.slice(0, 50) + '...' : item.optimizedText}"`);

    const startTime = Date.now();
    try {
      await speakToFile({
        text: item.optimizedText,
        speakerId: customSpeaker,
        speedScale: customSpeed,
        pitchScale: -0.02,
        intonationScale: 1.15,
        outputPath: item.filePath,
        optimize: false
      });

      const sec = ((Date.now() - startTime) / 1000).toFixed(1);
      renderedCount++;
      console.log(`   ✅ Xong (${sec}s)\n`);

      // Cập nhật progress ngay lập tức sau mỗi câu thành công
      if (!progress.completedFiles.includes(item.fileName)) {
        progress.completedFiles.push(item.fileName);
      }
      progress.lastCompletedIndex = item.index;
      progress.totalSentences = items.length;
      progress.percent = Math.round((progress.completedFiles.length / items.length) * 100);
      await fs.writeFile(progressPath, JSON.stringify(progress, null, 2));

    } catch (err) {
      console.error(`\n❌ Lỗi ở câu ${item.fileName}: ${err.message}`);
      console.log(`⚠️ Bạn có thể chạy lại script bất kỳ lúc nào, hệ thống sẽ tự động tiếp tục từ câu này.`);
      process.exit(1);
    }
  }

  console.log("\n" + "=".repeat(65));
  console.log(`🎉 HOÀN THÀNH XUẤT SẮC TOÀN BỘ KỊCH BẢN!`);
  console.log(`📁 Tất cả các file đã được lưu tại: ${outputDir}`);
  console.log(`📊 Tổng cộng: ${items.length} file | Vừa tạo: ${renderedCount} | Đã có sẵn (bỏ qua): ${skippedCount}`);
  console.log("=".repeat(65) + "\n");
}

main().catch(err => console.error("Lỗi:", err));
