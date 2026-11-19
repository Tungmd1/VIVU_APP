/**
 * vivuStickerSvgRabbit.js - 8 Vector SVG Thỏ Trắng Siêu Quẩy Bựa (Usagyuuun / Betakkuma style)
 */
function makeSvgUri(svgString) {
  const cleaned = svgString.replace(/\s+/g, ' ').trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
}

export const RABBIT_SVGS = {
  // 1. Thỏ vỗ mông quẩy tưng bừng
  rabbit_twerk: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="108" rx="35" ry="8" fill="rgba(0,0,0,0.15)"/>
      <ellipse cx="60" cy="78" rx="28" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="3"/>
      <path d="M 50 68 Q 60 78 70 68" stroke="#FF2A85" stroke-width="2.5" fill="none"/>
      <ellipse cx="44" cy="76" rx="14" ry="16" fill="#FFFFFF" stroke="#111111" stroke-width="2.5"/>
      <ellipse cx="76" cy="76" rx="14" ry="16" fill="#FFFFFF" stroke="#111111" stroke-width="2.5"/>
      <circle cx="60" cy="68" r="6" fill="#FFB6C1" stroke="#111111" stroke-width="2"/>
      <path d="M 24 74 L 14 70 M 26 84 L 16 86 M 96 74 L 106 70 M 94 84 L 104 86" stroke="#FF2A85" stroke-width="3" stroke-linecap="round"/>
      <circle cx="60" cy="38" r="22" fill="#FFFFFF" stroke="#111111" stroke-width="3"/>
      <path d="M 46 22 C 40 2 34 0 42 -8 C 50 -6 52 14 50 20" fill="#FFFFFF" stroke="#111111" stroke-width="2.5"/>
      <path d="M 74 22 C 80 2 86 0 78 -8 C 70 -6 68 14 70 20" fill="#FFFFFF" stroke="#111111" stroke-width="2.5"/>
      <path d="M 50 36 Q 54 30 58 36" stroke="#111111" stroke-width="2.5" fill="none"/>
      <path d="M 62 36 Q 66 30 70 36" stroke="#111111" stroke-width="2.5" fill="none"/>
      <ellipse cx="60" cy="44" rx="8" ry="6" fill="#FF2A85"/>
      <ellipse cx="46" cy="40" rx="4" ry="2.5" fill="#FF8DA1"/><ellipse cx="74" cy="40" rx="4" ry="2.5" fill="#FF8DA1"/>
    </svg>
  `),

  // 2. Thỏ nhảy múa tung hoa
  rabbit_cheer: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="110" rx="30" ry="6" fill="rgba(0,0,0,0.15)"/>
      <ellipse cx="60" cy="65" rx="24" ry="28" fill="#FFFFFF" stroke="#111111" stroke-width="3"/>
      <path d="M 45 88 L 36 102 M 75 88 L 84 98" stroke="#111111" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 40 55 L 20 32 M 80 55 L 100 32" stroke="#111111" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="60" cy="40" r="22" fill="#FFFFFF" stroke="#111111" stroke-width="3"/>
      <ellipse cx="48" cy="12" rx="7" ry="18" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" transform="rotate(-15 48 12)"/>
      <ellipse cx="72" cy="12" rx="7" ry="18" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" transform="rotate(15 72 12)"/>
      <circle cx="52" cy="38" r="4" fill="#111111"/><circle cx="53" cy="36" r="1.5" fill="#FFFFFF"/>
      <circle cx="68" cy="38" r="4" fill="#111111"/><circle cx="69" cy="36" r="1.5" fill="#FFFFFF"/>
      <ellipse cx="60" cy="46" rx="7" ry="5" fill="#FF3366"/>
      <circle cx="16" cy="20" r="3" fill="#FFD700"/><circle cx="104" cy="20" r="3" fill="#00E5FF"/><circle cx="60" cy="6" r="3" fill="#FF2A85"/>
      <path d="M 12 40 L 22 44 M 98 42 L 108 38" stroke="#10FFA0" stroke-width="2"/>
    </svg>
  `),

  // 3. Thỏ đấm bốc siêu hăng
  rabbit_boxer: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="112" rx="32" ry="6" fill="rgba(0,0,0,0.15)"/>
      <ellipse cx="60" cy="66" rx="24" ry="26" fill="#FFFFFF" stroke="#111111" stroke-width="3"/>
      <circle cx="60" cy="42" r="22" fill="#FFFFFF" stroke="#111111" stroke-width="3"/>
      <ellipse cx="46" cy="16" rx="6" ry="16" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" transform="rotate(-20 46 16)"/>
      <ellipse cx="74" cy="16" rx="6" ry="16" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" transform="rotate(20 74 16)"/>
      <path d="M 48 38 L 56 42 M 72 38 L 64 42" stroke="#111111" stroke-width="3" stroke-linecap="round"/>
      <circle cx="52" cy="43" r="2" fill="#111111"/><circle cx="68" cy="43" r="2" fill="#111111"/>
      <rect x="54" y="49" width="12" height="6" rx="2" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
      <circle cx="36" cy="58" r="14" fill="#FF2A2A" stroke="#111111" stroke-width="2.5"/>
      <circle cx="84" cy="58" r="14" fill="#FF2A2A" stroke="#111111" stroke-width="2.5"/>
      <path d="M 16 58 L 24 58 M 96 58 L 104 58" stroke="#FF5252" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `),

  // 4. Thỏ cười ngoác miệng té ghế
  rabbit_laugh: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="108" rx="34" ry="7" fill="rgba(0,0,0,0.15)"/>
      <ellipse cx="60" cy="70" rx="26" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="3" transform="rotate(15 60 70)"/>
      <circle cx="60" cy="42" r="24" fill="#FFFFFF" stroke="#111111" stroke-width="3"/>
      <ellipse cx="44" cy="15" rx="6" ry="18" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" transform="rotate(-35 44 15)"/>
      <ellipse cx="70" cy="12" rx="6" ry="18" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" transform="rotate(-10 70 12)"/>
      <path d="M 46 38 L 52 34 L 46 30" stroke="#111111" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 74 38 L 68 34 L 74 30" stroke="#111111" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 48 46 Q 60 70 72 46 Z" fill="#D32F2F" stroke="#111111" stroke-width="2.5"/>
      <ellipse cx="60" cy="56" rx="6" ry="4" fill="#FF80AB"/>
      <path d="M 38 38 Q 34 44 38 48 Q 42 44 38 38" fill="#00E5FF"/>
      <path d="M 82 38 Q 86 44 82 48 Q 78 44 82 38" fill="#00E5FF"/>
    </svg>
  `),

  // 5. Thỏ há hốc mồm quá sốc
  rabbit_shock: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="110" rx="30" ry="6" fill="rgba(0,0,0,0.15)"/>
      <ellipse cx="60" cy="74" rx="25" ry="24" fill="#FFFFFF" stroke="#111111" stroke-width="3"/>
      <ellipse cx="36" cy="52" rx="8" ry="12" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" transform="rotate(30 36 52)"/>
      <ellipse cx="84" cy="52" rx="8" ry="12" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" transform="rotate(-30 84 52)"/>
      <circle cx="60" cy="44" r="23" fill="#FFFFFF" stroke="#111111" stroke-width="3"/>
      <ellipse cx="48" cy="14" rx="6" ry="18" fill="#FFFFFF" stroke="#111111" stroke-width="2.5"/>
      <ellipse cx="72" cy="14" rx="6" ry="18" fill="#FFFFFF" stroke="#111111" stroke-width="2.5"/>
      <circle cx="50" cy="40" r="5" fill="#FFFFFF" stroke="#111111" stroke-width="2.5"/><circle cx="50" cy="40" r="2" fill="#111111"/>
      <circle cx="70" cy="40" r="5" fill="#FFFFFF" stroke="#111111" stroke-width="2.5"/><circle cx="70" cy="40" r="2" fill="#111111"/>
      <ellipse cx="60" cy="54" rx="7" ry="12" fill="#111111"/>
      <path d="M 52 26 L 52 32 M 56 25 L 56 31 M 60 25 L 60 31 M 64 26 L 64 32" stroke="#00B0FF" stroke-width="2"/>
    </svg>
  `),

  // 6. Thỏ thò đầu góc rình mò
  rabbit_peek: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect x="0" y="0" width="30" height="120" fill="#2A2D36" stroke="#111111" stroke-width="2.5"/>
      <circle cx="65" cy="60" r="28" fill="#FFFFFF" stroke="#111111" stroke-width="3"/>
      <ellipse cx="88" cy="38" rx="8" ry="22" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" transform="rotate(50 88 38)"/>
      <ellipse cx="98" cy="56" rx="8" ry="20" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" transform="rotate(75 98 56)"/>
      <ellipse cx="32" cy="48" rx="6" ry="4" fill="#FFFFFF" stroke="#111111" stroke-width="2"/>
      <ellipse cx="32" cy="72" rx="6" ry="4" fill="#FFFFFF" stroke="#111111" stroke-width="2"/>
      <circle cx="56" cy="56" r="4" fill="#111111"/><circle cx="54" cy="54" r="1.5" fill="#FFFFFF"/>
      <circle cx="74" cy="56" r="4" fill="#111111"/><circle cx="72" cy="54" r="1.5" fill="#FFFFFF"/>
      <path d="M 62 66 Q 66 70 70 66" stroke="#111111" stroke-width="2.5" fill="none"/>
      <ellipse cx="50" cy="62" rx="5" ry="3" fill="#FF8DA1"/><ellipse cx="78" cy="62" rx="5" ry="3" fill="#FF8DA1"/>
    </svg>
  `),

  // 7. Thỏ bế chữ OK to bự
  rabbit_ok: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="112" rx="34" ry="6" fill="rgba(0,0,0,0.15)"/>
      <circle cx="60" cy="36" r="22" fill="#FFFFFF" stroke="#111111" stroke-width="3"/>
      <ellipse cx="48" cy="12" rx="6" ry="16" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" transform="rotate(-15 48 12)"/>
      <ellipse cx="72" cy="12" rx="6" ry="16" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" transform="rotate(15 72 12)"/>
      <circle cx="52" cy="34" r="3.5" fill="#111111"/>
      <path d="M 64 36 L 72 32 L 64 28" stroke="#111111" stroke-width="2.5" fill="none"/>
      <ellipse cx="60" cy="42" rx="5" ry="4" fill="#FF2A85"/>
      <rect x="24" y="55" width="72" height="42" rx="14" fill="#FF3366" stroke="#111111" stroke-width="3"/>
      <text x="60" y="85" font-family="Arial Black, Impact, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" text-anchor="middle">OK</text>
      <circle cx="28" cy="66" r="6" fill="#FFFFFF" stroke="#111111" stroke-width="2"/>
      <circle cx="92" cy="66" r="6" fill="#FFFFFF" stroke="#111111" stroke-width="2"/>
    </svg>
  `),

  // 8. Thỏ cắp đùi gà chạy vội
  rabbit_meat: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="50" cy="110" rx="32" ry="6" fill="rgba(0,0,0,0.15)"/>
      <ellipse cx="50" cy="70" rx="26" ry="20" fill="#FFFFFF" stroke="#111111" stroke-width="3" transform="rotate(-20 50 70)"/>
      <circle cx="70" cy="45" r="20" fill="#FFFFFF" stroke="#111111" stroke-width="3"/>
      <path d="M 35 84 L 20 96 M 55 84 L 70 98" stroke="#111111" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="90" cy="54" rx="14" ry="10" fill="#D87A24" stroke="#111111" stroke-width="2.5" transform="rotate(-15 90 54)"/>
      <rect x="100" y="51" width="12" height="6" rx="2" fill="#FFF8E7" stroke="#111111" stroke-width="2"/>
      <ellipse cx="55" cy="22" rx="6" ry="18" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" transform="rotate(-65 55 22)"/>
      <ellipse cx="62" cy="15" rx="6" ry="18" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" transform="rotate(-45 62 15)"/>
      <circle cx="68" cy="42" r="3.5" fill="#111111"/>
      <path d="M 8 72 L 22 72 M 12 80 L 26 80" stroke="#FF9900" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `)
};
