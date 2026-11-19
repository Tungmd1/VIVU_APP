import { RABBIT_SVGS, BEAR_SVGS, CHIBI_SVGS } from './vivuStickerSvgArt';

/**
 * VivuStickerCatalog.js - Danh Mục 24 Sticker Độc Quyền VIVU
 * - 3 Bộ Sưu Tập Đặc Sắc:
 *   1. Thỏ Quẩy (Hyper Rabbit - Usagyuuun / Betakkuma Style): Siêu lầy lội, quẩy tưng bừng
 *   2. Gấu Pastel (Pastel Bears - Fluffy Bears Style): Ôm ấp, dỗ dành, tình cảm ấm áp
 *   3. Hội Chibi (Chibi Trio & Jelly Blob): Nhí nhố, sinh nhật, gồng cơ bắp, ngơ ngác
 * - Tối ưu < 250 dòng (Rule 7)
 */

export const VIVU_STICKER_PACKS = [
  {
    id: 'hyper_rabbit',
    name: 'Thỏ Quẩy',
    subtitle: 'Siêu bựa & Lầy lội',
    icon: 'bi-lightning-charge-fill',
    color: '#FF2A85',
    avatar: RABBIT_SVGS.rabbit_twerk
  },
  {
    id: 'pastel_bears',
    name: 'Gấu Bông',
    subtitle: 'Ấm áp & Yêu thương',
    icon: 'bi-heart-fill',
    color: '#FF69B4',
    avatar: BEAR_SVGS.bear_hug
  },
  {
    id: 'chibi_trio',
    name: 'Hội Chibi',
    subtitle: 'Nhí nhố & Hài hước',
    icon: 'bi-stars',
    color: '#10FFA0',
    avatar: CHIBI_SVGS.chibi_muscle
  }
];

export const VIVU_STICKERS = [
  // ================= 1. THỎ QUẨY (HYPER RABBIT) =================
  {
    id: 'rabbit_twerk',
    packId: 'hyper_rabbit',
    name: 'Lắc Mông',
    image: RABBIT_SVGS.rabbit_twerk,
    soundType: 'boing',
    particleColor: '#FF2A85',
    badge: 'Quẩy tưng bừng'
  },
  {
    id: 'rabbit_cheer',
    packId: 'hyper_rabbit',
    name: 'Tung Hoa',
    image: RABBIT_SVGS.rabbit_cheer,
    soundType: 'cheer',
    particleColor: '#00E5FF',
    badge: 'Siêu hào hứng'
  },
  {
    id: 'rabbit_boxer',
    packId: 'hyper_rabbit',
    name: 'Đấm Bốc',
    image: RABBIT_SVGS.rabbit_boxer,
    soundType: 'punch',
    particleColor: '#FF5252',
    badge: 'Chiến không'
  },
  {
    id: 'rabbit_laugh',
    packId: 'hyper_rabbit',
    name: 'Cười Bò',
    image: RABBIT_SVGS.rabbit_laugh,
    soundType: 'laugh',
    particleColor: '#FFD600',
    badge: 'Cười té ghế'
  },
  {
    id: 'rabbit_shock',
    packId: 'hyper_rabbit',
    name: 'Quá Sốc',
    image: RABBIT_SVGS.rabbit_shock,
    soundType: 'zap',
    particleColor: '#7928CA',
    badge: 'Bất ngờ chưa'
  },
  {
    id: 'rabbit_peek',
    packId: 'hyper_rabbit',
    name: 'Hóng Hớt',
    image: RABBIT_SVGS.rabbit_peek,
    soundType: 'pop',
    particleColor: '#10FFA0',
    badge: 'Rình mò nha'
  },
  {
    id: 'rabbit_ok',
    packId: 'hyper_rabbit',
    name: 'Quá OK',
    image: RABBIT_SVGS.rabbit_ok,
    soundType: 'success',
    particleColor: '#FF3366',
    badge: 'Chuẩn bài'
  },
  {
    id: 'rabbit_meat',
    packId: 'hyper_rabbit',
    name: 'Đùi Gà',
    image: RABBIT_SVGS.rabbit_meat,
    soundType: 'slap',
    particleColor: '#FF9900',
    badge: 'Xin miếng thịt'
  },

  // ================= 2. GẤU PASTEL (PASTEL BEARS) =================
  {
    id: 'bear_hug',
    packId: 'pastel_bears',
    name: 'Ôm Chặt',
    image: BEAR_SVGS.bear_hug,
    soundType: 'magic',
    particleColor: '#FFB6C1',
    badge: 'Ôm cái nè'
  },
  {
    id: 'bear_kiss',
    packId: 'pastel_bears',
    name: 'Hôn Má',
    image: BEAR_SVGS.bear_kiss,
    soundType: 'kiss',
    particleColor: '#FF69B4',
    badge: 'Chụt chụt'
  },
  {
    id: 'bear_sleep',
    packId: 'pastel_bears',
    name: 'Ngủ Ngon',
    image: BEAR_SVGS.bear_sleep,
    soundType: 'wind',
    particleColor: '#9370DB',
    badge: 'Chúc ngủ ngon'
  },
  {
    id: 'bear_morning',
    packId: 'pastel_bears',
    name: 'Chào Ngày Mới',
    image: BEAR_SVGS.bear_morning,
    soundType: 'bell',
    particleColor: '#FFA07A',
    badge: 'Rạng rỡ'
  },
  {
    id: 'bear_pat',
    packId: 'pastel_bears',
    name: 'Xoa Đầu',
    image: BEAR_SVGS.bear_pat,
    soundType: 'bubble',
    particleColor: '#E6E6FA',
    badge: 'Ngoan nha'
  },
  {
    id: 'bear_sob',
    packId: 'pastel_bears',
    name: 'Khóc Nhè',
    image: BEAR_SVGS.bear_sob,
    soundType: 'splash',
    particleColor: '#87CEFA',
    badge: 'Bắt đền đó'
  },
  {
    id: 'bear_thankyou',
    packId: 'pastel_bears',
    name: 'Cảm Ơn',
    image: BEAR_SVGS.bear_thankyou,
    soundType: 'bell',
    particleColor: '#98FB98',
    badge: 'Biết ơn bạn'
  },
  {
    id: 'bear_teacup',
    packId: 'pastel_bears',
    name: 'Tách Trà',
    image: BEAR_SVGS.bear_teacup,
    soundType: 'magic',
    particleColor: '#D8BFD8',
    badge: 'Thảnh thơi'
  },

  // ================= 3. HỘI CHIBI (CHIBI TRIO & JELLY BLOB) =================
  {
    id: 'chibi_beg',
    packId: 'chibi_trio',
    name: 'Năn Nỉ',
    image: CHIBI_SVGS.chibi_beg,
    soundType: 'pop',
    particleColor: '#4CAF50',
    badge: 'Đi mà bạn êi'
  },
  {
    id: 'chibi_cake',
    packId: 'chibi_trio',
    name: 'Bánh Kem',
    image: CHIBI_SVGS.chibi_cake,
    soundType: 'cheer',
    particleColor: '#FF69B4',
    badge: 'Sinh nhật vui'
  },
  {
    id: 'chibi_muscle',
    packId: 'chibi_trio',
    name: 'Lực Sĩ',
    image: CHIBI_SVGS.chibi_muscle,
    soundType: 'punch',
    particleColor: '#00FA9A',
    badge: 'Cơ bắp lực'
  },
  {
    id: 'chibi_party',
    packId: 'chibi_trio',
    name: 'Thổi Kèn',
    image: CHIBI_SVGS.chibi_party,
    soundType: 'laser',
    particleColor: '#FFD700',
    badge: 'Quẩy tiệc thôi'
  },
  {
    id: 'chibi_heart',
    packId: 'chibi_trio',
    name: 'Trái Tim Bự',
    image: CHIBI_SVGS.chibi_heart,
    soundType: 'kiss',
    particleColor: '#FF1493',
    badge: 'Thương lắm'
  },
  {
    id: 'chibi_ghost',
    packId: 'chibi_trio',
    name: 'Bé Thạch',
    image: CHIBI_SVGS.chibi_ghost,
    soundType: 'wind',
    particleColor: '#7FFFD4',
    badge: 'Ngơ ngác'
  },
  {
    id: 'chibi_fart',
    packId: 'chibi_trio',
    name: 'Xì Hơi',
    image: CHIBI_SVGS.chibi_fart,
    soundType: 'splat',
    particleColor: '#ADFF2F',
    badge: 'Thơm phức'
  },
  {
    id: 'chibi_confused',
    packId: 'chibi_trio',
    name: 'Ủa Gì Dậy',
    image: CHIBI_SVGS.chibi_confused,
    soundType: 'boing',
    particleColor: '#FFA500',
    badge: 'Dấu hỏi chấm'
  }
];

export function getStickersByPack(packId) {
  return VIVU_STICKERS.filter((s) => s.packId === packId);
}

export function findStickerById(id) {
  return VIVU_STICKERS.find((s) => s.id === id);
}
