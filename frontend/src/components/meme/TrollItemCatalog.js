/**
 * TrollItemCatalog.js - Kho Vũ Khí & Biểu Tượng Trêu Chọc Bản Đồ VIVU
 * Phân chia 4 Danh mục đặc sắc:
 * 1. Con vật (Animals & Pets)
 * 2. Đồ vật & Đồ dùng (Objects & Everyday Tools)
 * 3. Cây cối & Thực vật (Plants & Flora)
 * 4. Bộ Icon & Meme nổi tiếng (Famous & Friendly Memes)
 * 
 * 100% Bootstrap Icons (Rule 5) | Tối ưu < 450 dòng (Rule 7)
 */

export const TROLL_CATEGORIES = [
  {
    id: 'animals',
    name: 'Con Vật',
    icon: 'bi-emoji-smile',
    color: '#FFB800',
    description: 'Thú cưng & sinh vật ngáo ngơ, phán xét'
  },
  {
    id: 'tools',
    name: 'Đồ Dùng',
    icon: 'bi-hammer',
    color: '#FF2A85',
    description: 'Dép tổ ong, cà chua, xô nước, bom nổ'
  },
  {
    id: 'plants',
    name: 'Cây Cối',
    icon: 'bi-tree',
    color: '#10FFA0',
    description: 'Xương rồng, nấm ảo giác, ớt cay xì khói'
  },
  {
    id: 'memes',
    name: 'Meme Hot',
    icon: 'bi-stars',
    color: '#00E5FF',
    description: 'Ami béo, QooBee, Pepe, Quỳnh Aka, Trollface'
  }
];

export const TROLL_ITEMS = [
  // ================= 1. CON VẬT (ANIMALS) =================
  {
    id: 'shiba_ngao',
    name: 'Shiba Ngáo',
    category: 'animals',
    emotion: 'Lêu lêu',
    soundType: 'quack',
    icon: 'bi-emoji-laughing',
    color: '#FFB800',
    badge: 'Chó ngơ',
    quotes: ['Lêu lêu đồ con gà!', 'Ủa ai biết gì đâu nè?', 'Ngơ ngác ngơ ngác!'],
    previewEmoji: '🐶'
  },
  {
    id: 'cat_judge',
    name: 'Mèo Phán Xét',
    category: 'animals',
    emotion: 'Lườm lườm',
    soundType: 'slap',
    icon: 'bi-eye-fill',
    color: '#7928CA',
    badge: 'Hoàng thượng',
    quotes: ['Nhìn cái gì mà nhìn sen?', 'Tém tém cái nết lại!', 'Phán xét không trượt phát lào!'],
    previewEmoji: '🐱'
  },
  {
    id: 'duck_quack',
    name: 'Vịt Vàng Quack',
    category: 'animals',
    emotion: 'Quác quác',
    soundType: 'quack',
    icon: 'bi-volume-up-fill',
    color: '#FFDD00',
    badge: 'Lắm mồm',
    quotes: ['Quác quác quác đi chơi ko?', 'Bớt xàm lại giùm tui nha!', 'Ê ê ê đứng lại coi!'],
    previewEmoji: '🦆'
  },
  {
    id: 'pig_pink',
    name: 'Heo Hồng Ỉn',
    category: 'animals',
    emotion: 'Ủn ỉn',
    soundType: 'boing',
    icon: 'bi-heart-fill',
    color: '#FF69B4',
    badge: 'Ham ăn',
    quotes: ['Bao một bữa trà sữa đê!', 'Lăn qua lăn lại đói bụng quá!', 'Heo con thèm ăn!'],
    previewEmoji: '🐷'
  },
  {
    id: 'monkey_peek',
    name: 'Khỉ Bụm Miệng',
    category: 'animals',
    emotion: 'Xấu hổ',
    soundType: 'laugh',
    icon: 'bi-hand-index-thumb',
    color: '#D2691E',
    badge: 'Cà khịa',
    quotes: ['Hổng thấy gì hết trơn!', 'Bị quê quá chừng kìa!', 'Úi dà quê một cục!'],
    previewEmoji: '🐵'
  },
  {
    id: 'panda_roll',
    name: 'Gấu Trúc Lăn',
    category: 'animals',
    emotion: 'Lăn lông lốc',
    soundType: 'boing',
    icon: 'bi-circle-half',
    color: '#F0F0F0',
    badge: 'Lười biếng',
    quotes: ['Lăn một vòng ngủ tiếp...', 'Ngủ nướng tới chiều luôn!', 'Mệt quá không thèm rep!'],
    previewEmoji: '🐼'
  },

  // ================= 2. ĐỒ VẬT & ĐỒ DÙNG (TOOLS & OBJECTS) =================
  {
    id: 'honeycomb_slipper',
    name: 'Dép Tổ Ong',
    category: 'tools',
    emotion: 'Vả mặt',
    soundType: 'slap',
    icon: 'bi-lightning-fill',
    color: '#FFCC00',
    badge: 'Huyền thoại',
    quotes: ['Một dép vào mặt cho tỉnh!', 'Dép tổ ong thần chưởng!', 'Bay màu trong 1 nốt nhạc!'],
    previewEmoji: '🩴'
  },
  {
    id: 'tomato_splat',
    name: 'Cà Chua Ném',
    category: 'tools',
    emotion: 'Bẹp dí',
    soundType: 'splat',
    icon: 'bi-droplet-fill',
    color: '#FF3B30',
    badge: 'Bẹp sốt',
    quotes: ['Ăn ngay quả cà chua nè!', 'Dính sốt đỏ lòm cả màn hình!', 'Ném trúng tim đen chưa?'],
    previewEmoji: '🍅'
  },
  {
    id: 'dynamite_boom',
    name: 'Bom Nổ BÙM',
    category: 'tools',
    emotion: 'Phát nổ',
    soundType: 'boom',
    icon: 'bi-fire',
    color: '#FF4500',
    badge: 'BÙM!',
    quotes: ['Đếm 3-2-1 bùng nổ!', 'Hú hồn chưa bà dà?', 'Tức nước vỡ bờ rồi nha!'],
    previewEmoji: '💣'
  },
  {
    id: 'ice_water_bucket',
    name: 'Xô Nước Đá',
    category: 'tools',
    emotion: 'Lạnh toát',
    soundType: 'splash',
    icon: 'bi-water',
    color: '#00E5FF',
    badge: 'Dội lạnh',
    quotes: ['Dội xô nước cho tỉnh ngủ!', 'Lạnh buốt con tim luôn nè!', 'Tỉnh táo lại đi bạn êi!'],
    previewEmoji: '🪣'
  },
  {
    id: 'funny_poop',
    name: 'Poop Cười Tít',
    category: 'tools',
    emotion: 'Nhây bựa',
    soundType: 'splat',
    icon: 'bi-emoji-wink-fill',
    color: '#8B4513',
    badge: 'Siêu bựa',
    quotes: ['Tặng cục cưng bốc mùi nè!', 'Nhây vô đối không ai đọ lại!', 'Mùi hương ngào ngạt chưa?'],
    previewEmoji: '💩'
  },
  {
    id: 'cream_cake',
    name: 'Bánh Kem Úp',
    category: 'tools',
    emotion: 'Ngọt ngào',
    soundType: 'splat',
    icon: 'bi-gift-fill',
    color: '#FFB6C1',
    badge: 'Úp mặt',
    quotes: ['Bánh kem úp trọn khuôn mặt!', 'Ngọt ngào đến mấy cũng bẹp dí!', 'Sinh nhật hay sinh sự?'],
    previewEmoji: '🎂'
  },
  {
    id: 'heavy_brick',
    name: 'Cục Gạch Đỏ',
    category: 'tools',
    emotion: 'Cảnh cáo',
    soundType: 'slap',
    icon: 'bi-bricks',
    color: '#CD5C5C',
    badge: 'Ném gạch',
    quotes: ['Gửi nhẹ cục gạch làm quen!', 'Chống chỉ định đứng gần!', 'Nhận lấy sự xây đắp này!'],
    previewEmoji: '🧱'
  },

  // ================= 3. CÂY CỐI & THỰC VẬT (PLANTS & FLORA) =================
  {
    id: 'cactus_sting',
    name: 'Xương Rồng Gai',
    category: 'plants',
    emotion: 'Châm chích',
    soundType: 'slap',
    icon: 'bi-shield-shaded',
    color: '#2E8B57',
    badge: 'Gai góc',
    quotes: ['Chích một cái đau điếng!', 'Đừng có mà đụng vào tui!', 'Gai góc khó gần chưa?'],
    previewEmoji: '🌵'
  },
  {
    id: 'magic_mushroom',
    name: 'Nấm Thôi Miên',
    category: 'plants',
    emotion: 'Ảo giác',
    soundType: 'boing',
    icon: 'bi-cloud-sun-fill',
    color: '#BA55D3',
    badge: 'Bay bổng',
    quotes: ['Bay bổng vào thế giới ảo!', 'Ảo thật đấy bạn mình ơi!', 'Đầu óc lâng lâng luôn nè!'],
    previewEmoji: '🍄'
  },
  {
    id: 'super_chili',
    name: 'Ớt Siêu Cay',
    category: 'plants',
    emotion: 'Bốc hỏa',
    soundType: 'sizzle',
    icon: 'bi-fire',
    color: '#E60000',
    badge: 'Cay xè',
    quotes: ['Cay cú chưa cưng ơi?', 'Xì khói hai lỗ tai rồi kìa!', 'Nóng máu bốc hỏa luôn!'],
    previewEmoji: '🌶️'
  },
  {
    id: 'prickly_rose',
    name: 'Hoa Hồng Gai',
    category: 'plants',
    emotion: 'Tỏ tình lãng',
    soundType: 'boing',
    icon: 'bi-flower1',
    color: '#FF1493',
    badge: 'Lãng xẹt',
    quotes: ['Hoa hồng có gai cẩn thận đứt tay!', 'Tỏ tình sến rện xỉu up xỉu down!', 'Tặng bông cho bớt dỗi!'],
    previewEmoji: '🌹'
  },
  {
    id: 'durian_spiky',
    name: 'Sầu Riêng Gai',
    category: 'plants',
    emotion: 'Nồng nàn',
    soundType: 'slap',
    icon: 'bi-gem',
    color: '#9ACD32',
    badge: 'Thơm lừng',
    quotes: ['Mùi thơm này ai chịu nổi?', 'Gai góc nhưng ngọt lịm!', 'Ăn trọn quả sầu riêng nè!'],
    previewEmoji: '🍈'
  },

  // ================= 4. BỘ MEME NỔI TIẾNG (FAMOUS MEMES) =================
  {
    id: 'ami_fat_cat',
    name: 'Ami Bụng Bự',
    category: 'memes',
    emotion: 'Lắc mông',
    soundType: 'laugh',
    icon: 'bi-music-note-beamed',
    color: '#FF6B6B',
    badge: 'Ami Cute',
    quotes: ['Lắc mông lắc mông vui vẻ nè!', 'Đói meo mốc mỏ rồi sen ơi!', 'Ủa ai biết gì đâu nè?'],
    previewEmoji: '🐱'
  },
  {
    id: 'qoobee_dino',
    name: 'QooBee Vàng',
    category: 'memes',
    emotion: 'Nựng má',
    soundType: 'boing',
    icon: 'bi-heart-half',
    color: '#FFD700',
    badge: 'Khủng long',
    quotes: ['Bắn tim bự chảng nè!', 'Ngoan ngoan ta thương nha!', 'Dễ thương xỉu cái đùng!'],
    previewEmoji: '🦖'
  },
  {
    id: 'pepe_frog',
    name: 'Ếch Xanh Pepe',
    category: 'memes',
    emotion: 'Buồn tủi',
    soundType: 'quack',
    icon: 'bi-emoji-frown-fill',
    color: '#228B22',
    badge: 'Huyền thoại',
    quotes: ['Cảm thấy bất lực ghê gớm...', 'Nước mắt lưng tròng rồi nè...', 'Tại sao lại đối xử với tôi như vậy?'],
    previewEmoji: '🐸'
  },
  {
    id: 'quynh_aka',
    name: 'Quỳnh Aka',
    category: 'memes',
    emotion: 'Nhí nhảnh',
    soundType: 'laugh',
    icon: 'bi-chat-heart-fill',
    color: '#FF69B4',
    badge: 'Nhây vô đối',
    quotes: ['Alo bạn êi, nghe rõ trả lời!', 'Hổng thèm giận luôn á trời!', 'Đẹp gái không bao giờ sai!'],
    previewEmoji: '👧'
  },
  {
    id: 'trollface_classic',
    name: 'Trollface',
    category: 'memes',
    emotion: 'Problem?',
    soundType: 'laugh',
    icon: 'bi-emoji-laughing-fill',
    color: '#E0E0E0',
    badge: 'Ông tổ meme',
    quotes: ['U mad bro? Problem?', 'Bị troll đau đớn chưa?', 'Cười nhe răng trêu ngươi!'],
    previewEmoji: '🤪'
  }
];

export function getTrollItemById(id) {
  return TROLL_ITEMS.find((item) => item.id === id) || TROLL_ITEMS[0];
}

export function getTrollItemsByCategory(category) {
  return TROLL_ITEMS.filter((item) => item.category === category);
}
