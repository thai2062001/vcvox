/**
 * text-optimizer.js
 * Bộ tối ưu hóa kịch bản AI Voice / TTS tiếng Nhật tự động
 * Dựa trên "SỔ TAY KINH NGHIỆM TỐI ƯU KỊCH BẢN AI VOICE / TTS TIẾNG NHẬT"
 */

// 1. Từ điển tra cứu thuật ngữ chuyên ngành (Hàng hải, Quân sự, Khoa học, Âm đọc khó)
export const DEFAULT_DICTIONARY = [
  // Bẫy 2: Chữ Hán đa âm & quân sự
  { pattern: /水音/g, replacement: "みずおと", reason: "Phát âm chuẩn tiếng nước chảy (tránh bị đọc thành Suzoton)" },
  { pattern: /隔壁/g, replacement: "かくへき", reason: "Vách ngăn chịu áp tàu ngầm (tránh đọc sai Kakahi)" },
  { pattern: /圧壊/g, replacement: "あっかい", reason: "Nổ bẹp do áp suất lớn (tránh bị nhầm thành Atsukai - đối xử)" },
  { pattern: /南大西洋/g, replacement: "みなみたいせいよう", reason: "Nam Đại Tây Dương (tránh đọc nhầm 洋 thành shō)" },
  { pattern: /鉄の棺桶/g, replacement: "「てつのかんおけ」", reason: "Hội chứng quan tài sắt (giữ nhịp nhấn)" },
  { pattern: /米潜水艦/g, replacement: "アメリカ潜水艦", reason: "Tàu ngầm Mỹ (tránh đọc chữ 米 thành Kome/Gạo)" },
  { pattern: /米海軍/g, replacement: "アメリカ海軍", reason: "Hải quân Mỹ" },
  { pattern: /暗順応/g, replacement: "あんじゅんのう", reason: "Thích nghi bóng tối y sinh hải quân" },
  { pattern: /気閘/g, replacement: "きこう", reason: "Khoang khóa khí tàu ngầm" },

  // Bẫy 3: Tránh líu lưỡi từ ghép dài
  { pattern: /原子力潜水艦/g, replacement: "げんしりょく潜水艦", reason: "Tách nhẹ âm đầu giúp phát âm mượt, không líu lưỡi" },

  // Bẫy 4: Đơn vị đo áp lực & tên thiết bị viết tắt
  { pattern: /(\d+(?:\.\d+)?)\s*PSI\b/gi, replacement: "$1 ピー・エス・アイ", reason: "Thêm micro-pause cho đơn vị áp lực PSI" },
  { pattern: /\bPSI\b/gi, replacement: "ピー・エス・アイ", reason: "Phát âm chuẩn chữ viết tắt PSI" },
  { pattern: /SEIE、潜水艦脱出スーツ/g, replacement: "SEIE、潜水艦脱出用スーツ", reason: "Thêm trợ từ 用 cho tự nhiên" },
  { pattern: /\bROV\b/g, replacement: "アールオーブイ", reason: "Phát âm chuẩn chữ viết tắt ROV" },
  { pattern: /\bDSRV\b/g, replacement: "ディーエスアールブイ", reason: "Phát âm chuẩn chữ viết tắt DSRV" },

  // Bẫy 5: Sửa sai ngữ cảnh hàng hải
  { pattern: /漆黒の森林の前では/g, replacement: "漆黒の深海の前では", reason: "Sửa ngữ cảnh biển sâu thay vì rừng rậm" },

  // Bẫy 8: Số tầng & nối âm số đo
  { pattern: /18層/g, replacement: "じゅうはっそう", reason: "Khóa cách đọc số tầng (tránh bị nuốt thành sho...)" },
  { pattern: /1本のハンマー/g, replacement: "いっぽんのハンマー", reason: "Đọc chuẩn lượng từ いっぽん (ippon)" },
  { pattern: /水深(\d+)\s*(?:m|メートル)/g, replacement: "すいしん$1メートル", reason: "Khóa chuẩn âm đọc độ sâu (Suishin)" },
  { pattern: /地下(\d+)\s*(?:m|メートル)/g, replacement: "地下、$1メートル", reason: "Thêm dấu phẩy tách nhịp số đo (tránh nối âm chijū)" },

  // Bổ sung: Sửa lỗi phát âm cho kịch bản khảo cổ / lịch sử / khoa học
  { pattern: /最初の槌/g, replacement: "最初のつち", reason: "Sửa chữ 槌 đọc sai thành ズチ (zuchi) -> つち (tsuchi)" },
  { pattern: /脱出口/g, replacement: "だっしゅつぐち", reason: "Sửa chữ 脱出口 đọc nhầm thành ダツデグチ (thừa âm) -> だっしゅつぐち" },
  { pattern: /墓坑/g, replacement: "ぼこう", reason: "Khóa âm đọc hầm mộ ぼこう (tránh đọc nôm na thành hakaana)" },
  { pattern: /ヴァラ/g, replacement: "ヴアラ", reason: "Chuyển ヴァラ sang ヴアラ để Voicevox đọc chuẩn âm V (Vara), không bị biến thành Ba (Bara)" },
  { pattern: /深井戸/g, replacement: "深い井戸", reason: "Sửa chữ 深井戸 bị đọc lộn xộn thành fukai-to -> 深い井戸 (fukai ido/giếng sâu)" },
  { pattern: /燻り殺される/g, replacement: "、いぶり殺される", reason: "Sửa chữ 燻り殺される đọc sai thành kusuburi -> iburikorosareru (hun khói đến chết)" },
  { pattern: /開口部/g, replacement: "かいこうぶ", reason: "Sửa 開口部 đọc sai thành hirakikoobu -> かいこうぶ (kaikoubu - miệng mở/cửa giếng)" },
  { pattern: /生と死/g, replacement: "せいとし", reason: "Sửa 生と死 đọc sai thành nama to shi -> せいとし (sei to shi - sống và chết)" },
  { pattern: /氷期/g, replacement: "ひょうき", reason: "Sửa 氷期 đọc sai thành gooriki -> ひょうき (hyouki - kỷ băng hà)" },
  { pattern: /通気坑/g, replacement: "つうきこう", reason: "Sửa 通気坑 đọc nôm na thành tsuukiana -> つうきこう (thuật ngữ hầm/công trình)" },
  { pattern: /一寒村/g, replacement: "いっかんそん", reason: "Sửa 一寒村 đọc sai thành ichikanson -> いっかんそん (ikkanson - một ngôi làng nghèo heo lánh)" },
  { pattern: /1万5000本/g, replacement: "いちまんごせんぼん", reason: "Khóa âm đọc chuẩn lượng từ 1万5000本 (ichiman gosenbon)" },
  { pattern: /素焼き皿/g, replacement: "すやきざら", reason: "Khóa âm đĩa đất nung すやきざら (suyakizara)" },
  { pattern: /煮炊き/g, replacement: "にたき", reason: "Khóa âm nấu nướng にたき (nitaki)" },
  { pattern: /籠城/g, replacement: "ろうじょう", reason: "Khóa âm cố thủ trong thành ろうじょう (roujou)" },
  { pattern: /凝灰岩/g, replacement: "ぎょうかいがん", reason: "Khóa âm đá núi lửa ぎょうかいがん (gyoukaigan)" },
  { pattern: /外縁部/g, replacement: "がいえんぶ", reason: "Tránh nuốt âm gaienbu thành gaianbu" },
  { pattern: /標高/g, replacement: "ひょうこう", reason: "Khóa âm chuẩn độ cao (Hyōkō), tránh dính âm hyōgō" },
  { pattern: /砂海/g, replacement: "さかい", reason: "Khóa âm chuẩn sa hải / biển cát (Sakai)" },
  { pattern: /塩泥/g, replacement: "えんでい", reason: "Khóa âm thuật ngữ bùn muối địa chất (Endei)" },
];

/**
 * Tối ưu hóa văn bản kịch bản tiếng Nhật
 * @param {string} text - Văn bản gốc
 * @param {object} options
 * @param {Array} [options.customDictionary] - Danh sách từ điển bổ sung
 * @param {boolean} [options.fixBrackets=true] - Tự động loại bỏ bẫy ngoặc Furigana
 * @param {boolean} [options.normalizePunctuation=true] - Chuẩn hóa dấu câu tiếng Nhật
 * @returns {{ optimizedText: string, changes: Array<{ rule: string, from: string, to: string }> }}
 */
export function optimizeJapaneseScript(text, options = {}) {
  const {
    customDictionary = [],
    fixBrackets = true,
    normalizePunctuation = true
  } = options;

  let result = text;
  const changes = [];

  // =========================================================================
  // 1. BẪY SỐ 1: LOẠI BỎ NGOẶC CHÚ THÍCH PHIÊN ÂM Hán（Hiragana）
  // Ví dụ: 隔壁（かくへき） -> かくへき (Chỉ giữ phần Hiragana đọc, bỏ Kanji ngoài)
  // =========================================================================
  if (fixBrackets) {
    const furiganaRegex = /([\u4e00-\u9faf\u3400-\u4dbf]+|[a-zA-Z0-9]+)[（\(]([ぁ-んァ-ヶー・]+)[\)）]/g;
    result = result.replace(furiganaRegex, (match, kanji, reading) => {
      changes.push({
        rule: "Bẫy 1: Xóa ngoặc đơn chú thích (Tránh đọc lặp)",
        from: match,
        to: reading
      });
      return reading;
    });
  }

  // =========================================================================
  // 2. BẪY SỐ 2, 3, 4, 5, 8: ÁP DỤNG TỪ ĐIỂN THUẬT NGỮ CHUYÊN NGÀNH
  // =========================================================================
  const allRules = [...DEFAULT_DICTIONARY, ...customDictionary];
  for (const item of allRules) {
    if (item.pattern.test(result)) {
      result = result.replace(item.pattern, (match, ...args) => {
        let replacement = item.replacement;
        if (typeof replacement === "string") {
          // Xử lý $1, $2 nếu regex có capture group
          args.slice(0, -2).forEach((arg, i) => {
            replacement = replacement.replace(new RegExp(`\\$${i + 1}`, "g"), arg);
          });
        }
        changes.push({
          rule: item.reason,
          from: match,
          to: replacement
        });
        return replacement;
      });
    }
  }

  // =========================================================================
  // 3. CHUẨN HÓA DẤU CÂU & KHOẢNG NGHỈ
  // =========================================================================
  if (normalizePunctuation) {
    // Chuyển dấu phẩy/chấm latin sang dấu tiếng Nhật chuẩn
    result = result.replace(/,\s*/g, "、").replace(/\.\s*/g, "。");
    // Xóa dấu cách thừa giữa các ký tự tiếng Nhật
    result = result.replace(/([ぁ-んァ-ヶー一-龯])\s+([ぁ-んァ-ヶー一-龯])/g, "$1$2");
  }

  return {
    originalText: text,
    optimizedText: result,
    changes
  };
}
