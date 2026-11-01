/**
 * personalityAnalytics.js
 * Thuật toán thu thập và đánh giá hành vi người dùng thực tế
 * - Đo tốc độ phản hồi tin nhắn (Rep nhanh vs Chúa ngâm tin)
 * - Đo phong cách giao tiếp (Cục súc thẳng thắn vs Dịu dàng ấm áp)
 * - Đo mức độ Nhây / Hay trêu bạn bè (Tần suất ném meme & troll)
 * - Xuất ra 5 trục Biểu Đồ Năng Lượng Tính Cách (Vibe & Aura Radar)
 */

const BLUNT_WORDS = ['k', 'ko', 'ừ', 'uk', 'uh', 'ok', 'gì', 'thôi', 'kệ', 'sao', 'mệt', 'tùy'];
const WARM_WORDS = ['haha', 'hihi', 'hí hí', 'dạ', 'cảm ơn', 'yêu', 'iu', 'thương', 'dễ thương', 'vui', 'chill', 'quá trời'];

function getStorageKey(userId = 'default') {
  return `vivu_personality_data_${userId}`;
}

export function getRawPersonalityData(userId = 'default') {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    totalMessages: 8,
    bluntCount: 2,
    warmCount: 5,
    avgReplyMs: 35000,
    memesTrolled: 4,
    distanceKm: 8.5
  };
}

export function saveRawPersonalityData(userId = 'default', data) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
  } catch {}
}

/**
 * Ghi nhận tin nhắn người dùng vừa gửi đi
 */
export function recordSentMessage(userId = 'default', text = '') {
  if (!text) return;
  const data = getRawPersonalityData(userId);
  data.totalMessages = (data.totalMessages || 0) + 1;

  const lower = text.trim().toLowerCase();
  
  // Kiểm tra cục súc (tin nhắn quá ngắn hoặc chứa từ cụt lủn)
  if (lower.length <= 3 || BLUNT_WORDS.some(w => lower === w || lower.startsWith(w + ' '))) {
    data.bluntCount = (data.bluntCount || 0) + 1;
  }

  // Kiểm tra ấm áp / thân thiện
  if (WARM_WORDS.some(w => lower.includes(w)) || text.length > 30) {
    data.warmCount = (data.warmCount || 0) + 1;
  }

  saveRawPersonalityData(userId, data);
}

/**
 * Ghi nhận độ trễ thời gian trả lời tin nhắn (ms)
 */
export function recordReplyLatency(userId = 'default', latencyMs = 30000) {
  const data = getRawPersonalityData(userId);
  const prevAvg = data.avgReplyMs || 40000;
  data.avgReplyMs = Math.round((prevAvg * 0.7) + (latencyMs * 0.3));
  saveRawPersonalityData(userId, data);
}

/**
 * Ghi nhận hành vi ném Meme trêu bạn bè
 */
export function recordMemeTroll(userId = 'default') {
  const data = getRawPersonalityData(userId);
  data.memesTrolled = (data.memesTrolled || 0) + 1;
  saveRawPersonalityData(userId, data);
}

/**
 * Tính toán 5 trục năng lượng tính cách (Scores 15 - 98)
 */
export function getPersonalityRadar(userId = 'default') {
  const data = getRawPersonalityData(userId);
  const total = Math.max(1, data.totalMessages || 1);

  // 1. Tốc độ rep tin: Càng ít ms điểm càng cao
  let speed = 85;
  if (data.avgReplyMs < 15000) speed = 96; // < 15s
  else if (data.avgReplyMs < 60000) speed = 82; // < 1m
  else if (data.avgReplyMs < 300000) speed = 65; // < 5m
  else speed = 35; // Ngâm tin

  // 2. Mức độ Nhây / Trêu bạn: Tỷ lệ ném meme
  const trollRatio = Math.min(10, data.memesTrolled || 0);
  const troll = Math.min(98, Math.max(30, 45 + trollRatio * 6));

  // 3. Độ Cục Súc / Thẳng thắn: Tỷ lệ tin cộc lốc
  const bluntRatio = (data.bluntCount || 0) / total;
  const blunt = Math.min(98, Math.max(20, Math.round(30 + bluntRatio * 65)));

  // 4. Độ Thân Thiện & Ấm Áp
  const warmRatio = (data.warmCount || 0) / total;
  const warmth = Math.min(98, Math.max(25, Math.round(40 + warmRatio * 55)));

  // 5. Năng lượng Vi Vu
  const km = Math.min(50, data.distanceKm || 10);
  const spatial = Math.min(98, Math.max(35, Math.round(50 + km * 1.2)));

  // Phân tích danh hiệu phong cách từ điểm số
  let vibeTitle = 'Chúa Hề Thần Tốc ⚡';
  let vibeDesc = 'Rep tin siêu nhanh và cực kỳ thích ném meme trêu bạn bè.';

  if (blunt > 65 && speed < 50) {
    vibeTitle = 'Chúa Ngâm Tin Cục Súc 😴';
    vibeDesc = 'Ít khi rep tin, nói câu nào cộc lốc câu đó nhưng rất thẳng tính.';
  } else if (troll > 75) {
    vibeTitle = 'Thánh Nhây Không Đối Thủ 🐱';
    vibeDesc = 'Hở ra là ném meme bựa, tạo tiếng cười cho mọi cuộc trò chuyện.';
  } else if (warmth > 75) {
    vibeTitle = 'Thiên Sứ Ấm Áp & Lắng Nghe 💖';
    vibeDesc = 'Dịu dàng, nhắn tin có tâm, luôn biết cách quan tâm đối phương.';
  } else if (spatial > 75) {
    vibeTitle = 'Nhà Thám Hiểm Chân Đi 🏍️';
    vibeDesc = 'Thích lượn phố, không gian mở, năng lượng dồi dào suốt ngày.';
  }

  return {
    speed,
    troll,
    blunt,
    warmth,
    spatial,
    vibeTitle,
    vibeDesc
  };
}

