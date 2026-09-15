import fs from "fs";
import path from "path";

const dir = "./output/script";
const manifestPath = path.join(dir, "manifest.json");

if (!fs.existsSync(manifestPath)) {
  console.error("Manifest not found!");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
console.log(`Analyzing ${manifest.length} audio files in ${dir}...\n`);

const report = [];
let totalDuration = 0;
let totalSize = 0;

for (const item of manifest) {
  const filePath = path.join(dir, item.fileName);
  if (!fs.existsSync(filePath)) {
    report.push({
      index: item.index,
      fileName: item.fileName,
      status: "MISSING",
      error: "File does not exist"
    });
    continue;
  }

  const stat = fs.statSync(filePath);
  const size = stat.size;
  totalSize += size;

  // Read WAV header
  const buf = fs.readFileSync(filePath);
  if (buf.length < 44 || buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") {
    report.push({
      index: item.index,
      fileName: item.fileName,
      status: "CORRUPT_HEADER",
      error: "Invalid WAV format"
    });
    continue;
  }

  // Parse standard WAV info
  const channels = buf.readUInt16LE(22);
  const sampleRate = buf.readUInt32LE(24);
  const byteRate = buf.readUInt32LE(28);
  const blockAlign = buf.readUInt16LE(32);
  const bitsPerSample = buf.readUInt16LE(34);

  // Find data chunk
  let dataOffset = 12;
  let dataSize = 0;
  while (dataOffset < buf.length - 8) {
    const chunkId = buf.toString("ascii", dataOffset, dataOffset + 4);
    const chunkSize = buf.readUInt32LE(dataOffset + 4);
    if (chunkId === "data") {
      dataSize = chunkSize;
      break;
    }
    dataOffset += 8 + chunkSize;
  }

  if (dataSize === 0) {
    dataSize = buf.length - 44;
  }

  const durationSec = dataSize / (sampleRate * channels * (bitsPerSample / 8));
  totalDuration += durationSec;

  // Analyze PCM samples for volume, clipping, silence
  // Assume 16-bit PCM
  let maxAbs = 0;
  let sumSquare = 0;
  let sampleCount = 0;
  let silentSamplesLeading = 0;
  let silentSamplesTrailing = 0;
  let isLeading = true;

  const pcmStart = dataOffset + 8;
  const pcmEnd = Math.min(buf.length, pcmStart + dataSize);

  for (let i = pcmStart; i < pcmEnd - 1; i += 2) {
    const sample = buf.readInt16LE(i);
    const abs = Math.abs(sample);
    if (abs > maxAbs) maxAbs = abs;
    sumSquare += sample * sample;
    sampleCount++;

    if (abs < 300) { // Silence threshold
      if (isLeading) silentSamplesLeading++;
    } else {
      isLeading = false;
      silentSamplesTrailing = 0; // reset while sound exists
    }
    if (!isLeading && abs < 300) {
      silentSamplesTrailing++;
    }
  }

  const rms = Math.sqrt(sumSquare / (sampleCount || 1));
  const peakDb = 20 * Math.log10((maxAbs || 1) / 32768);
  const rmsDb = 20 * Math.log10((rms || 1) / 32768);

  const leadingSilenceSec = (silentSamplesLeading / sampleRate).toFixed(2);
  const trailingSilenceSec = (silentSamplesTrailing / sampleRate).toFixed(2);

  // Status check
  let qualityStatus = "EXCELLENT";
  const issues = [];

  if (size < 2000) {
    qualityStatus = "TOO_SHORT / CORRUPT";
    issues.push("File size too small (<2KB)");
  }
  if (peakDb > -0.05) {
    issues.push("Possible clipping / Peak near 0dB");
  }
  if (rmsDb < -35) {
    issues.push("Volume too low (RMS < -35dB)");
  }
  if (durationSec < 0.5) {
    issues.push("Duration under 0.5s");
  }

  report.push({
    index: item.index,
    fileName: item.fileName,
    sizeKb: (size / 1024).toFixed(1),
    durationSec: durationSec.toFixed(2),
    sampleRate,
    channels,
    bitsPerSample,
    peakDb: peakDb.toFixed(1),
    rmsDb: rmsDb.toFixed(1),
    leadingSilenceSec,
    trailingSilenceSec,
    issues: issues.length ? issues.join(", ") : "None (Clean)",
    qualityStatus: issues.length ? "WARNING" : "EXCELLENT",
    textSnippet: item.optimizedText.slice(0, 35) + "..."
  });
}

const warnings = report.filter(r => r.qualityStatus !== "EXCELLENT");

console.log("=== TỔNG QUAN HỆ THỐNG AUDIO ===");
console.log(`- Tổng số file: ${report.length}/75`);
console.log(`- Tổng thời lượng đọc: ${(totalDuration / 60).toFixed(2)} phút (${totalDuration.toFixed(1)} giây)`);
console.log(`- Tổng dung lượng: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
console.log(`- Số file cảnh báo / lỗi: ${warnings.length}`);

console.log("\n=== 10 FILE MẪU TIÊU BIỂU ===");
console.table(report.slice(0, 10), ["fileName", "durationSec", "sampleRate", "peakDb", "rmsDb", "qualityStatus", "issues"]);

if (warnings.length > 0) {
  console.log("\n⚠️ CÁC FILE CÓ VẤN ĐỀ:");
  console.table(warnings);
} else {
  console.log("\n✅ 100% TẤT CẢ 75 FILE ĐỀU ĐẠT CHẤT LƯỢNG CAO NHẤT (EXCELLENT)!");
}

// Lưu toàn bộ bảng report chi tiết ra file json
fs.writeFileSync("./output/script/quality_report.json", JSON.stringify(report, null, 2));
console.log("\nĐã lưu chi tiết đánh giá 75 file vào ./output/script/quality_report.json");
