/**
 * VivuStickerCatalog.js - Danh Mục 36 Sticker Độc Quyền VIVU
 * - 3 Bộ Sưu Tập Thần Thánh:
 *   1. Thỏ Quẩy (Hyper Rabbit - Usagyuuun): Siêu bựa, lầy lội, hài hước, quẩy tưng bừng
 *   2. Gấu Bông (Pastel Bears - Sugar Cubs): Ấm áp, yêu thương, ôm ấp, ngọt ngào
 *   3. Bé Chibi (Chibi Duo - Bubu & Dudu): Tặng hoa, xách giỏ, chúc phúc, dễ thương vô đối
 * - 100% tài nguyên ảnh trong suốt chuẩn HD lưu trực tiếp tại /stickers/...
 * - Tuân thủ Rule 5 (Bootstrap Icons) & Rule 7 (< 450 dòng, hiện tại ~180 dòng)
 */

export const VIVU_STICKER_PACKS = [
  {
    id: 'hyper_rabbit',
    name: 'Thỏ Quẩy',
    subtitle: 'Usagyuuun siêu lầy',
    icon: 'bi-lightning-charge-fill',
    color: '#FF2A85',
    avatar: '/stickers/rabbit/rabbit_01.png'
  },
  {
    id: 'pastel_bears',
    name: 'Gấu Bông',
    subtitle: 'Sugar Cubs ấm áp',
    icon: 'bi-heart-fill',
    color: '#FF69B4',
    avatar: '/stickers/bear/bear_02.webp'
  },
  {
    id: 'chibi_trio',
    name: 'Bé Chibi',
    subtitle: 'Bubu & Dudu cute',
    icon: 'bi-stars',
    color: '#10FFA0',
    avatar: '/stickers/chibi/chibi_01.webp'
  }
];

export const VIVU_STICKERS = [
  // ================= 1. THỎ QUẨY (HYPER RABBIT - USAGYUUUN) =================
  {
    id: 'rabbit_cheer',
    packId: 'hyper_rabbit',
    name: 'Đỉnh Chóp',
    image: '/stickers/rabbit/rabbit_01.png',
    soundType: 'cheer',
    particleColor: '#FFD600',
    badge: 'Quá đỉnh'
  },
  {
    id: 'rabbit_friends',
    packId: 'hyper_rabbit',
    name: 'Bạn Tốt',
    image: '/stickers/rabbit/rabbit_02.png',
    soundType: 'success',
    particleColor: '#00E5FF',
    badge: 'Mãi keo'
  },
  {
    id: 'rabbit_love_carrot',
    packId: 'hyper_rabbit',
    name: 'Yêu Thương',
    image: '/stickers/rabbit/rabbit_03.png',
    soundType: 'kiss',
    particleColor: '#FF2A85',
    badge: 'Mê mẩn'
  },
  {
    id: 'rabbit_slap_fun',
    packId: 'hyper_rabbit',
    name: 'Tát Yêu',
    image: '/stickers/rabbit/rabbit_04.png',
    soundType: 'punch',
    particleColor: '#FF5252',
    badge: 'Cà khịa'
  },
  {
    id: 'rabbit_sunrise',
    packId: 'hyper_rabbit',
    name: 'Rạng Rỡ',
    image: '/stickers/rabbit/rabbit_05.png',
    soundType: 'cheer',
    particleColor: '#FFB800',
    badge: 'Quẩy lên'
  },
  {
    id: 'rabbit_cry_joy',
    packId: 'hyper_rabbit',
    name: 'Cảm Động',
    image: '/stickers/rabbit/rabbit_06.png',
    soundType: 'crying',
    particleColor: '#00E5FF',
    badge: 'Rớt nước mắt'
  },
  {
    id: 'rabbit_butt_dive',
    packId: 'hyper_rabbit',
    name: 'Phi Thân',
    image: '/stickers/rabbit/rabbit_07.png',
    soundType: 'boing',
    particleColor: '#7928CA',
    badge: 'Lắc mông'
  },
  {
    id: 'rabbit_devil',
    packId: 'hyper_rabbit',
    name: 'Tiểu Quỷ',
    image: '/stickers/rabbit/rabbit_08.png',
    soundType: 'laugh',
    particleColor: '#9333EA',
    badge: 'Nguy hiểm nha'
  },
  {
    id: 'rabbit_underpants',
    packId: 'hyper_rabbit',
    name: 'Quần Đỏ',
    image: '/stickers/rabbit/rabbit_09.png',
    soundType: 'zap',
    particleColor: '#EF4444',
    badge: 'Siêu bựa'
  },
  {
    id: 'rabbit_soul_out',
    packId: 'hyper_rabbit',
    name: 'Bay Hồn',
    image: '/stickers/rabbit/rabbit_10.png',
    soundType: 'magic',
    particleColor: '#60A5FA',
    badge: 'Xỉu up xỉu down'
  },
  {
    id: 'rabbit_cupid',
    packId: 'hyper_rabbit',
    name: 'Bắn Tim',
    image: '/stickers/rabbit/rabbit_11.png',
    soundType: 'kiss',
    particleColor: '#EC4899',
    badge: 'Thần tình yêu'
  },
  {
    id: 'rabbit_confused',
    packId: 'hyper_rabbit',
    name: 'Ủa Gì Dị',
    image: '/stickers/rabbit/rabbit_12.png',
    soundType: 'pop',
    particleColor: '#F59E0B',
    badge: 'Ngơ ngác'
  },

  // ================= 2. GẤU BÔNG PASTEL (SUGAR CUBS) =================
  {
    id: 'bear_grumpy',
    packId: 'pastel_bears',
    name: 'Hờn Dỗi',
    image: '/stickers/bear/bear_01.webp',
    soundType: 'pop',
    particleColor: '#A8A29E',
    badge: 'Dỗi rồi nha'
  },
  {
    id: 'bear_heart_eyes',
    packId: 'pastel_bears',
    name: 'Say Đắm',
    image: '/stickers/bear/bear_02.webp',
    soundType: 'kiss',
    particleColor: '#FF69B4',
    badge: 'Thả thính'
  },
  {
    id: 'bear_scarf_cozy',
    packId: 'pastel_bears',
    name: 'Quàng Khăn',
    image: '/stickers/bear/bear_03.webp',
    soundType: 'success',
    particleColor: '#F43F5E',
    badge: 'Ấm áp ghê'
  },
  {
    id: 'bear_arrow_pink',
    packId: 'pastel_bears',
    name: 'Trúng Tim',
    image: '/stickers/bear/bear_04.webp',
    soundType: 'boing',
    particleColor: '#FB7185',
    badge: 'Gục ngã'
  },
  {
    id: 'bear_arrow_beige',
    packId: 'pastel_bears',
    name: 'Đổ Đứ Đừ',
    image: '/stickers/bear/bear_05.webp',
    soundType: 'boing',
    particleColor: '#EAB308',
    badge: 'Mê muội'
  },
  {
    id: 'bear_blush_shy',
    packId: 'pastel_bears',
    name: 'Ngại Ngùng',
    image: '/stickers/bear/bear_06.webp',
    soundType: 'pop',
    particleColor: '#F472B6',
    badge: 'Đỏ mặt'
  },
  {
    id: 'bear_wake_up',
    packId: 'pastel_bears',
    name: 'Dậy Mau',
    image: '/stickers/bear/bear_07.webp',
    soundType: 'laugh',
    particleColor: '#E11D48',
    badge: 'Pounce!'
  },
  {
    id: 'bear_pillow_dream',
    packId: 'pastel_bears',
    name: 'Nhớ Nhau',
    image: '/stickers/bear/bear_08.webp',
    soundType: 'crying',
    particleColor: '#818CF8',
    badge: 'Mơ về em'
  },
  {
    id: 'bear_flower_wave',
    packId: 'pastel_bears',
    name: 'Vẫy Chào',
    image: '/stickers/bear/bear_09.webp',
    soundType: 'cheer',
    particleColor: '#34D399',
    badge: 'Hello xinh'
  },
  {
    id: 'bear_fountain_cry',
    packId: 'pastel_bears',
    name: 'Khóc Ròng',
    image: '/stickers/bear/bear_10.webp',
    soundType: 'crying',
    particleColor: '#38BDF8',
    badge: 'Bắt đền đó'
  },
  {
    id: 'bear_soul_float',
    packId: 'pastel_bears',
    name: 'Thăng Thiên',
    image: '/stickers/bear/bear_11.webp',
    soundType: 'magic',
    particleColor: '#A78BFA',
    badge: 'Kiệt sức'
  },
  {
    id: 'bear_shocked_jump',
    packId: 'pastel_bears',
    name: 'Hết Hồn',
    image: '/stickers/bear/bear_12.webp',
    soundType: 'zap',
    particleColor: '#F59E0B',
    badge: 'Bất ngờ'
  },

  // ================= 3. BÉ CHIBI (BUBU & DUDU) =================
  {
    id: 'chibi_bubu_basket',
    packId: 'chibi_trio',
    name: 'Đi Chợ',
    image: '/stickers/chibi/chibi_01.webp',
    soundType: 'pop',
    particleColor: '#10FFA0',
    badge: 'Ngoan ngoãn'
  },
  {
    id: 'chibi_dudu_basket',
    packId: 'chibi_trio',
    name: 'Xách Giỏ',
    image: '/stickers/chibi/chibi_02.webp',
    soundType: 'pop',
    particleColor: '#D97706',
    badge: 'Chu đáo'
  },
  {
    id: 'chibi_bubu_milk',
    packId: 'chibi_trio',
    name: 'Mua Sữa',
    image: '/stickers/chibi/chibi_03.webp',
    soundType: 'cheer',
    particleColor: '#06B6D4',
    badge: 'Bổ dưỡng'
  },
  {
    id: 'chibi_dudu_bread',
    packId: 'chibi_trio',
    name: 'Mua Bánh',
    image: '/stickers/chibi/chibi_04.webp',
    soundType: 'cheer',
    particleColor: '#F59E0B',
    badge: 'Ăn sáng nè'
  },
  {
    id: 'chibi_bubu_gift',
    packId: 'chibi_trio',
    name: 'Mở Quà',
    image: '/stickers/chibi/chibi_05.webp',
    soundType: 'magic',
    particleColor: '#8B5CF6',
    badge: 'Bất ngờ chưa'
  },
  {
    id: 'chibi_dudu_gift',
    packId: 'chibi_trio',
    name: 'Hộp Quà',
    image: '/stickers/chibi/chibi_06.webp',
    soundType: 'magic',
    particleColor: '#EC4899',
    badge: 'Quà cho bạn'
  },
  {
    id: 'chibi_bubu_rose',
    packId: 'chibi_trio',
    name: 'Tặng Hoa',
    image: '/stickers/chibi/chibi_07.webp',
    soundType: 'kiss',
    particleColor: '#EF4444',
    badge: 'Hoa hồng đỏ'
  },
  {
    id: 'chibi_dudu_rose',
    packId: 'chibi_trio',
    name: 'Tỏ Tình',
    image: '/stickers/chibi/chibi_08.webp',
    soundType: 'kiss',
    particleColor: '#BE123C',
    badge: 'Tặng em nè'
  },
  {
    id: 'chibi_dudu_fortune',
    packId: 'chibi_trio',
    name: 'Chúc Phúc',
    image: '/stickers/chibi/chibi_09.webp',
    soundType: 'cheer',
    particleColor: '#DC2626',
    badge: 'Tài lộc'
  },
  {
    id: 'chibi_bubu_blessing',
    packId: 'chibi_trio',
    name: 'Bình An',
    image: '/stickers/chibi/chibi_10.webp',
    soundType: 'success',
    particleColor: '#E11D48',
    badge: 'Cát tường'
  },
  {
    id: 'chibi_bubu_festival',
    packId: 'chibi_trio',
    name: 'Múa Lân',
    image: '/stickers/chibi/chibi_11.webp',
    soundType: 'boing',
    particleColor: '#F97316',
    badge: 'Tưng bừng'
  },
  {
    id: 'chibi_dudu_festival',
    packId: 'chibi_trio',
    name: 'Rước Đèn',
    image: '/stickers/chibi/chibi_12.webp',
    soundType: 'boing',
    particleColor: '#B45309',
    badge: 'Rộn rã'
  }
];

export function getStickersByPack(packId) {
  return VIVU_STICKERS.filter((s) => s.packId === packId);
}

export function getStickerById(id) {
  return VIVU_STICKERS.find((s) => s.id === id) || VIVU_STICKERS[0];
}

export function getRandomSticker() {
  const index = Math.floor(Math.random() * VIVU_STICKERS.length);
  return VIVU_STICKERS[index];
}
