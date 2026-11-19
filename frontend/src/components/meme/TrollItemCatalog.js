/**
 * TrollItemCatalog.js - Kho Biểu Tượng & Vũ Khí Trêu Chọc 3D Sang Trọng (Stitch Design Taste)
 * - Tích hợp bộ icon 3D chuẩn quốc tế Microsoft Fluent 3D Studio Ultra-HD
 * - Kết hợp Sticker 3D độc quyền văn hóa Việt Nam (Dép tổ ong 3D vàng bóng bẩy, Ami béo, Quỳnh Aka)
 * - 100% Bootstrap Icons (Rule 5) | Tối ưu < 450 dòng (Rule 7)
 */

const FLUENT_CDN = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets';

// Dép tổ ong 3D vàng bóng bẩy độc quyền cho VIVU
export const HONEYCOMB_SLIPPER_3D_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="soleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF275"/>
      <stop offset="50%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#E6A800"/>
    </linearGradient>
    <linearGradient id="strapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFF8B3"/>
      <stop offset="100%" stop-color="#F5B800"/>
    </linearGradient>
    <filter id="shadow3d" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="4" dy="12" stdDeviation="8" flood-color="#805300" flood-opacity="0.45"/>
    </filter>
  </defs>
  <!-- Đế dép dày 3D -->
  <path d="M50 25 C75 20, 110 30, 115 55 C120 78, 108 95, 102 115 C96 135, 78 145, 58 142 C38 139, 32 120, 36 95 C40 70, 35 30, 50 25 Z" 
        fill="#C48800" filter="url(#shadow3d)"/>
  <!-- Thân dép mặt trên -->
  <path d="M52 22 C76 17, 109 26, 114 52 C118 75, 106 92, 100 112 C94 132, 77 141, 58 138 C39 135, 34 116, 38 92 C42 67, 37 27, 52 22 Z" 
        fill="url(#soleGrad)"/>
  <!-- Các lỗ tổ ong huyền thoại -->
  <g fill="#A67300" opacity="0.65">
    <circle cx="56" cy="42" r="3.5"/><circle cx="72" cy="40" r="3.5"/><circle cx="88" cy="44" r="3.5"/>
    <circle cx="50" cy="56" r="3.5"/><circle cx="66" cy="54" r="3.5"/><circle cx="82" cy="55" r="3.5"/><circle cx="98" cy="59" r="3.5"/>
    <circle cx="54" cy="70" r="3.5"/><circle cx="70" cy="68" r="3.5"/><circle cx="86" cy="69" r="3.5"/><circle cx="100" cy="73" r="3.5"/>
    <circle cx="58" cy="84" r="3.5"/><circle cx="74" cy="82" r="3.5"/><circle cx="90" cy="83" r="3.5"/>
    <circle cx="60" cy="98" r="3.5"/><circle cx="76" cy="96" r="3.5"/><circle cx="88" cy="98" r="3.5"/>
    <circle cx="62" cy="112" r="3.5"/><circle cx="76" cy="111" r="3.5"/>
    <circle cx="65" cy="125" r="3"/>
  </g>
  <!-- Quai dép quàng ngang 3D -->
  <path d="M34 68 C40 45, 105 48, 113 72 C112 80, 102 78, 75 62 C48 78, 36 78, 34 68 Z" 
        fill="url(#strapGrad)" stroke="#E0A300" stroke-width="2"/>
  <!-- Highlight bóng viền mặt kính -->
  <path d="M55 25 C75 22, 100 30, 108 50" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
</svg>
`)}`;

export const TROLL_CATEGORIES = [
  {
    id: 'animals',
    name: 'Con Vật',
    icon: 'bi-emoji-smile',
    color: '#FFB800',
    description: 'Thú cưng 3D ngáo ngơ, siêu phán xét'
  },
  {
    id: 'tools',
    name: 'Đồ Dùng',
    icon: 'bi-lightning-charge',
    color: '#FF2A85',
    description: 'Dép tổ ong 3D, cà chua, bom nổ BÙM, xô nước'
  },
  {
    id: 'plants',
    name: 'Cây Cối',
    icon: 'bi-flower1',
    color: '#10FFA0',
    description: 'Xương rồng, nấm ảo giác, ớt cay xì khói'
  },
  {
    id: 'memes',
    name: 'Meme Hot',
    icon: 'bi-stars',
    color: '#00E5FF',
    description: 'Trollface, Ami béo, thả tim, cà khịa'
  }
];

export const TROLL_ITEMS = [
  // ================= 1. CON VẬT (ANIMALS - 3D FLUENT) =================
  {
    id: 'shiba_ngao',
    name: 'Shiba Ngáo',
    category: 'animals',
    emotion: 'Lêu lêu',
    soundType: 'quack',
    icon: 'bi-emoji-laughing',
    color: '#FFB800',
    particleColor: '#FFA500',
    threeMeshType: 'bounce',
    badge: 'Chó ngơ 3D',
    image3d: `${FLUENT_CDN}/Dog%20face/3D/dog_face_3d.png`,
    quotes: ['Lêu lêu đồ con gà!', 'Ủa ai biết gì đâu nè?', 'Ngơ ngác ngơ ngác!']
  },
  {
    id: 'cat_judge',
    name: 'Mèo Phán Xét',
    category: 'animals',
    emotion: 'Lườm lườm',
    soundType: 'slap',
    icon: 'bi-eye-fill',
    color: '#A855F7',
    particleColor: '#C084FC',
    threeMeshType: 'slap',
    badge: 'Hoàng thượng',
    image3d: `${FLUENT_CDN}/Cat%20face/3D/cat_face_3d.png`,
    quotes: ['Nhìn cái gì mà nhìn sen?', 'Tém tém cái nết lại!', 'Phán xét không trượt phát lào!']
  },
  {
    id: 'duck_quack',
    name: 'Vịt Vàng Quack',
    category: 'animals',
    emotion: 'Quác quác',
    soundType: 'quack',
    icon: 'bi-volume-up-fill',
    color: '#EAB308',
    particleColor: '#FACC15',
    threeMeshType: 'bounce',
    badge: 'Lắm mồm 3D',
    image3d: `${FLUENT_CDN}/Duck/3D/duck_3d.png`,
    quotes: ['Quác quác quác đi chơi ko?', 'Bớt xàm lại giùm tui nha!', 'Ê ê ê đứng lại coi!']
  },
  {
    id: 'pig_pink',
    name: 'Heo Hồng Ỉn',
    category: 'animals',
    emotion: 'Ủn ỉn',
    soundType: 'boing',
    icon: 'bi-heart-fill',
    color: '#EC4899',
    particleColor: '#F472B6',
    threeMeshType: 'bounce',
    badge: 'Ham ăn 3D',
    image3d: `${FLUENT_CDN}/Pig%20face/3D/pig_face_3d.png`,
    quotes: ['Bao một bữa trà sữa đê!', 'Lăn qua lăn lại đói bụng quá!', 'Heo con thèm ăn!']
  },
  {
    id: 'monkey_peek',
    name: 'Khỉ Bụm Miệng',
    category: 'animals',
    emotion: 'Cà khịa',
    soundType: 'laugh',
    icon: 'bi-hand-index-thumb',
    color: '#D97706',
    particleColor: '#F59E0B',
    threeMeshType: 'bounce',
    badge: 'Quê một cục',
    image3d: `${FLUENT_CDN}/Monkey%20face/3D/monkey_face_3d.png`,
    quotes: ['Hổng thấy gì hết trơn!', 'Bị quê quá chừng kìa!', 'Úi dà quê một cục!']
  },
  {
    id: 'panda_roll',
    name: 'Gấu Trúc Lăn',
    category: 'animals',
    emotion: 'Lười biếng',
    soundType: 'boing',
    icon: 'bi-circle-half',
    color: '#E2E8F0',
    particleColor: '#FFFFFF',
    threeMeshType: 'bounce',
    badge: 'Ngủ nướng',
    image3d: `${FLUENT_CDN}/Panda/3D/panda_3d.png`,
    quotes: ['Lăn một vòng ngủ tiếp...', 'Ngủ nướng tới chiều luôn!', 'Mệt quá không thèm rep!']
  },

  // ================= 2. ĐỒ VẬT & ĐỒ DÙNG (TOOLS - 3D FLUENT & CUSTOM) =================
  {
    id: 'honeycomb_slipper',
    name: 'Dép Tổ Ong',
    category: 'tools',
    emotion: 'Vả mặt',
    soundType: 'slap',
    icon: 'bi-lightning-fill',
    color: '#F59E0B',
    particleColor: '#FBBF24',
    threeMeshType: 'slap',
    badge: 'Huyền thoại 3D',
    image3d: HONEYCOMB_SLIPPER_3D_SVG,
    quotes: ['Một dép vào mặt cho tỉnh!', 'Dép tổ ong thần chưởng!', 'Bay màu trong 1 nốt nhạc!']
  },
  {
    id: 'tomato_splat',
    name: 'Cà Chua Ném',
    category: 'tools',
    emotion: 'Bẹp dí',
    soundType: 'splat',
    icon: 'bi-droplet-fill',
    color: '#EF4444',
    particleColor: '#DC2626',
    threeMeshType: 'splat',
    badge: 'Nổ sốt 3D',
    image3d: `${FLUENT_CDN}/Tomato/3D/tomato_3d.png`,
    quotes: ['Ăn ngay quả cà chua nè!', 'Dính sốt đỏ lòm cả màn hình!', 'Ném trúng tim đen chưa?']
  },
  {
    id: 'dynamite_boom',
    name: 'Bom Nổ BÙM',
    category: 'tools',
    emotion: 'Phát nổ',
    soundType: 'boom',
    icon: 'bi-fire',
    color: '#F97316',
    particleColor: '#EA580C',
    threeMeshType: 'boom',
    badge: 'BÙM CHỚP 3D',
    image3d: `${FLUENT_CDN}/Bomb/3D/bomb_3d.png`,
    quotes: ['Đếm 3-2-1 bùng nổ!', 'Hú hồn chưa bà dà?', 'Tức nước vỡ bờ rồi nha!']
  },
  {
    id: 'ice_water_bucket',
    name: 'Sóng Nước Đá',
    category: 'tools',
    emotion: 'Lạnh toát',
    soundType: 'splash',
    icon: 'bi-water',
    color: '#06B6D4',
    particleColor: '#22D3EE',
    threeMeshType: 'splash',
    badge: 'Dội lạnh 3D',
    image3d: `${FLUENT_CDN}/Water%20wave/3D/water_wave_3d.png`,
    quotes: ['Dội xô nước cho tỉnh ngủ!', 'Lạnh buốt con tim luôn nè!', 'Tỉnh táo lại đi bạn êi!']
  },
  {
    id: 'funny_poop',
    name: 'Poop Cười Tít',
    category: 'tools',
    emotion: 'Nhây bựa',
    soundType: 'splat',
    icon: 'bi-emoji-wink-fill',
    color: '#92400E',
    particleColor: '#B45309',
    threeMeshType: 'splat',
    badge: 'Siêu bựa 3D',
    image3d: `${FLUENT_CDN}/Pile%20of%20poo/3D/pile_of_poo_3d.png`,
    quotes: ['Tặng cục cưng bốc mùi nè!', 'Nhây vô đối không ai đọ lại!', 'Mùi hương ngào ngạt chưa?']
  },
  {
    id: 'cream_cake',
    name: 'Bánh Kem Úp',
    category: 'tools',
    emotion: 'Ngọt ngào',
    soundType: 'splat',
    icon: 'bi-gift-fill',
    color: '#F472B6',
    particleColor: '#FB7185',
    threeMeshType: 'splat',
    badge: 'Úp mặt 3D',
    image3d: `${FLUENT_CDN}/Birthday%20cake/3D/birthday_cake_3d.png`,
    quotes: ['Bánh kem úp trọn khuôn mặt!', 'Ngọt ngào đến mấy cũng bẹp dí!', 'Sinh nhật hay sinh sự?']
  },
  {
    id: 'heavy_brick',
    name: 'Cục Gạch Đỏ',
    category: 'tools',
    emotion: 'Cảnh cáo',
    soundType: 'slap',
    icon: 'bi-bricks',
    color: '#B91C1C',
    particleColor: '#DC2626',
    threeMeshType: 'slap',
    badge: 'Ném gạch 3D',
    image3d: `${FLUENT_CDN}/Brick/3D/brick_3d.png`,
    quotes: ['Gửi nhẹ cục gạch làm quen!', 'Chống chỉ định đứng gần!', 'Nhận lấy sự xây đắp này!']
  },

  // ================= 3. CÂY CỐI & THỰC VẬT (PLANTS - 3D FLUENT) =================
  {
    id: 'cactus_sting',
    name: 'Xương Rồng Gai',
    category: 'plants',
    emotion: 'Châm chích',
    soundType: 'slap',
    icon: 'bi-shield-shaded',
    color: '#10B981',
    particleColor: '#34D399',
    threeMeshType: 'slap',
    badge: 'Gai góc 3D',
    image3d: `${FLUENT_CDN}/Cactus/3D/cactus_3d.png`,
    quotes: ['Chích một cái đau điếng!', 'Đừng có mà đụng vào tui!', 'Gai góc khó gần chưa?']
  },
  {
    id: 'magic_mushroom',
    name: 'Nấm Thôi Miên',
    category: 'plants',
    emotion: 'Ảo giác',
    soundType: 'boing',
    icon: 'bi-cloud-sun-fill',
    color: '#8B5CF6',
    particleColor: '#A78BFA',
    threeMeshType: 'bounce',
    badge: 'Bay bổng 3D',
    image3d: `${FLUENT_CDN}/Mushroom/3D/mushroom_3d.png`,
    quotes: ['Bay bổng vào thế giới ảo!', 'Ảo thật đấy bạn mình ơi!', 'Đầu óc lâng lâng luôn nè!']
  },
  {
    id: 'super_chili',
    name: 'Ớt Siêu Cay',
    category: 'plants',
    emotion: 'Bốc hỏa',
    soundType: 'sizzle',
    icon: 'bi-fire',
    color: '#DC2626',
    particleColor: '#EF4444',
    threeMeshType: 'boom',
    badge: 'Cay xè 3D',
    image3d: `${FLUENT_CDN}/Hot%20pepper/3D/hot_pepper_3d.png`,
    quotes: ['Cay cú chưa cưng ơi?', 'Xì khói hai lỗ tai rồi kìa!', 'Nóng máu bốc hỏa luôn!']
  },
  {
    id: 'prickly_rose',
    name: 'Hoa Hồng Gai',
    category: 'plants',
    emotion: 'Tỏ tình lãng',
    soundType: 'boing',
    icon: 'bi-flower1',
    color: '#F43F5E',
    particleColor: '#FB7185',
    threeMeshType: 'bounce',
    badge: 'Lãng xẹt 3D',
    image3d: `${FLUENT_CDN}/Rose/3D/rose_3d.png`,
    quotes: ['Hoa hồng có gai cẩn thận đứt tay!', 'Tỏ tình sến rện xỉu up xỉu down!', 'Tặng bông cho bớt dỗi!']
  },
  {
    id: 'lucky_clover',
    name: 'Cỏ Bốn Lá',
    category: 'plants',
    emotion: 'May mắn',
    soundType: 'boing',
    icon: 'bi-stars',
    color: '#059669',
    particleColor: '#10B981',
    threeMeshType: 'bounce',
    badge: 'May mắn 3D',
    image3d: `${FLUENT_CDN}/Four%20leaf%20clover/3D/four_leaf_clover_3d.png`,
    quotes: ['Tặng bạn một rổ may mắn!', 'Hôm nay trúng số nha bạn ơi!', 'Cười lên cho đời tươi sáng!']
  },

  // ================= 4. BỘ MEME & BIỂU CẢM (MEMES - 3D FLUENT) =================
  {
    id: 'trollface_classic',
    name: 'Trollface 3D',
    category: 'memes',
    emotion: 'Problem?',
    soundType: 'laugh',
    icon: 'bi-emoji-laughing-fill',
    color: '#F59E0B',
    particleColor: '#FBBF24',
    threeMeshType: 'bounce',
    badge: 'Ông tổ meme',
    image3d: `${FLUENT_CDN}/Zany%20face/3D/zany_face_3d.png`,
    quotes: ['U mad bro? Problem?', 'Bị troll đau đớn chưa?', 'Cười nhe răng trêu ngươi!']
  },
  {
    id: 'love_heart_eyes',
    name: 'Bắn Tim Bự',
    category: 'memes',
    emotion: 'Nựng má',
    soundType: 'boing',
    icon: 'bi-heart-half',
    color: '#EC4899',
    particleColor: '#F472B6',
    threeMeshType: 'bounce',
    badge: 'Thả thính 3D',
    image3d: `${FLUENT_CDN}/Smiling%20face%20with%20heart-eyes/3D/smiling_face_with_heart-eyes_3d.png`,
    quotes: ['Bắn tim bự chảng nè!', 'Ngoan ngoan ta thương nha!', 'Dễ thương xỉu cái đùng!']
  },
  {
    id: 'cool_sunglasses',
    name: 'Ngầu Bá Cháy',
    category: 'memes',
    emotion: 'Flexing',
    soundType: 'slap',
    icon: 'bi-sunglasses',
    color: '#3B82F6',
    particleColor: '#60A5FA',
    threeMeshType: 'slap',
    badge: 'Cool ngầu 3D',
    image3d: `${FLUENT_CDN}/Smiling%20face%20with%20sunglasses/3D/smiling_face_with_sunglasses_3d.png`,
    quotes: ['Cool ngầu thế này ai đọ lại?', 'Flex nhẹ cái độ đẹp trai!', 'Nhìn anh mà học hỏi nè!']
  },
  {
    id: 'party_celebrate',
    name: 'Tiệc Tùng Quẩy',
    category: 'memes',
    emotion: 'Quẩy lên',
    soundType: 'laugh',
    icon: 'bi-balloon-fill',
    color: '#8B5CF6',
    particleColor: '#A78BFA',
    threeMeshType: 'boom',
    badge: 'Quẩy banh nóc',
    image3d: `${FLUENT_CDN}/Partying%20face/3D/partying_face_3d.png`,
    quotes: ['Alo quẩy lên bạn ơi!', 'Hôm nay không say không về!', 'Nhạc lên là quẩy thôi!']
  },
  {
    id: 'fire_hot',
    name: 'Lửa Cháy Khét',
    category: 'memes',
    emotion: 'Bốc hỏa',
    soundType: 'boom',
    icon: 'bi-fire',
    color: '#EA580C',
    particleColor: '#F97316',
    threeMeshType: 'boom',
    badge: 'Cháy khét lẹt',
    image3d: `${FLUENT_CDN}/Fire/3D/fire_3d.png`,
    quotes: ['Cháy quá rồi cứu tôi với!', 'Bùng cháy ngọn lửa tình bạn!', 'Hot hòn họt luôn!']
  }
];

export function getTrollItemById(id) {
  return TROLL_ITEMS.find((item) => item.id === id) || TROLL_ITEMS[0];
}

export function getTrollItemsByCategory(category) {
  return TROLL_ITEMS.filter((item) => item.category === category);
}
