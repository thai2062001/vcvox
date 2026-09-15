import { getSpeakers } from "./voicevox.js";

async function main() {
  console.log("🔍 Đang tải danh sách nhân vật từ VOICEVOX...");
  const speakers = await getSpeakers();
  
  console.log(`\nTổng cộng có ${speakers.length} nhân vật:\n` + "=".repeat(60));

  speakers.forEach((s, idx) => {
    const styles = s.styles.map(st => `${st.name} (ID: ${st.id})`).join(", ");
    console.log(`${idx + 1}. ${s.name} [UUID: ${s.speaker_uuid.slice(0, 8)}...]`);
    console.log(`   -> Phong cách: ${styles}\n`);
  });
}

main().catch(err => console.error("Lỗi:", err.message));
