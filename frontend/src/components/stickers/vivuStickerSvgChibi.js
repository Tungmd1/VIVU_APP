/**
 * vivuStickerSvgChibi.js - 8 Vector SVG Hội Bạn Chibi & Cục Thạch Xanh
 */
function makeSvgUri(svgString) {
  const cleaned = svgString.replace(/\s+/g, ' ').trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
}

export const CHIBI_SVGS = {
  // 1. Thỏ trắng năn nỉ trong bụi rậm
  chibi_beg: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="65" r="42" fill="#4CAF50" stroke="#1B5E20" stroke-width="3"/>
      <circle cx="40" cy="45" r="18" fill="#66BB6A"/>
      <circle cx="80" cy="45" r="18" fill="#66BB6A"/>
      <circle cx="60" cy="85" r="20" fill="#388E3C"/>
      <circle cx="60" cy="62" r="18" fill="#FFFFFF" stroke="#111111" stroke-width="2"/>
      <ellipse cx="52" cy="42" rx="4" ry="10" fill="#FFFFFF" stroke="#111111" stroke-width="2" transform="rotate(-15 52 42)"/>
      <ellipse cx="68" cy="42" rx="4" ry="10" fill="#FFFFFF" stroke="#111111" stroke-width="2" transform="rotate(15 68 42)"/>
      <circle cx="54" cy="58" r="3.5" fill="#111111"/><circle cx="53" cy="56" r="1.5" fill="#FFFFFF"/>
      <circle cx="66" cy="58" r="3.5" fill="#111111"/><circle cx="65" cy="56" r="1.5" fill="#FFFFFF"/>
      <path d="M 58 66 Q 60 69 62 66" stroke="#111111" stroke-width="2" fill="none"/>
      <text x="60" y="24" font-family="Arial Black, sans-serif" font-size="10" font-weight="900" fill="#FFD54F" text-anchor="middle">PLEAAASE</text>
    </svg>
  `),

  // 2. Thỏ hồng đội bánh kem sinh nhật
  chibi_cake: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="110" rx="32" ry="6" fill="rgba(0,0,0,0.15)"/>
      <circle cx="60" cy="65" r="24" fill="#F8BBD0" stroke="#111111" stroke-width="2.5"/>
      <ellipse cx="48" cy="40" rx="6" ry="16" fill="#F8BBD0" stroke="#111111" stroke-width="2" transform="rotate(-20 48 40)"/>
      <ellipse cx="72" cy="40" rx="6" ry="16" fill="#F8BBD0" stroke="#111111" stroke-width="2" transform="rotate(20 72 40)"/>
      <rect x="42" y="22" width="36" height="18" rx="4" fill="#FFF8E1" stroke="#FF6F00" stroke-width="2"/>
      <ellipse cx="60" cy="22" rx="18" ry="6" fill="#FF4081"/>
      <circle cx="60" cy="12" r="4" fill="#D50000"/>
      <path d="M 50 62 Q 54 66 58 62" stroke="#111111" stroke-width="2.5" fill="none"/>
      <path d="M 64 62 Q 68 66 72 62" stroke="#111111" stroke-width="2.5" fill="none"/>
      <text x="60" y="104" font-family="Impact, sans-serif" font-size="12" fill="#E91E63" text-anchor="middle">HAPPY BIRTHDAY</text>
    </svg>
  `),

  // 3. Cục thạch xanh gồng cơ bắp cuồn cuộn
  chibi_muscle: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="110" rx="34" ry="7" fill="rgba(0,0,0,0.15)"/>
      <ellipse cx="60" cy="65" rx="28" ry="24" fill="#69F0AE" stroke="#00C853" stroke-width="3"/>
      <path d="M 32 60 C 15 50 15 30 30 38 C 36 42 34 56 34 60" fill="#B9F6CA" stroke="#00C853" stroke-width="2.5"/>
      <path d="M 88 60 C 105 50 105 30 90 38 C 84 42 86 56 86 60" fill="#B9F6CA" stroke="#00C853" stroke-width="2.5"/>
      <circle cx="52" cy="60" r="3" fill="#111111"/><circle cx="68" cy="60" r="3" fill="#111111"/>
      <rect x="55" y="68" width="10" height="4" rx="2" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
      <path d="M 25 22 L 30 16 M 95 22 L 90 16" stroke="#00E676" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `),

  // 4. Thổi kèn pháo giấy quẩy tiệc
  chibi_party: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="110" rx="30" ry="6" fill="rgba(0,0,0,0.15)"/>
      <circle cx="55" cy="55" r="22" fill="#FFFFFF" stroke="#111111" stroke-width="2.5"/>
      <ellipse cx="44" cy="30" rx="5" ry="14" fill="#FFFFFF" stroke="#111111" stroke-width="2" transform="rotate(-15 44 30)"/>
      <ellipse cx="62" cy="28" rx="5" ry="14" fill="#FFFFFF" stroke="#111111" stroke-width="2" transform="rotate(15 62 28)"/>
      <path d="M 68 58 L 98 48 L 108 54 L 102 62 Z" fill="#FF4081" stroke="#111111" stroke-width="2"/>
      <circle cx="50" cy="50" r="3" fill="#111111"/>
      <circle cx="106" cy="38" r="3" fill="#FFD600"/><circle cx="114" cy="50" r="2.5" fill="#00E5FF"/>
      <circle cx="98" cy="28" r="2" fill="#76FF03"/><circle cx="86" cy="22" r="3" fill="#FF1744"/>
    </svg>
  `),

  // 5. Thỏ vàng ôm tim to bự
  chibi_heart: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="112" rx="32" ry="6" fill="rgba(0,0,0,0.15)"/>
      <circle cx="60" cy="40" r="22" fill="#FFF59D" stroke="#FBC02D" stroke-width="2.5"/>
      <ellipse cx="48" cy="15" rx="6" ry="16" fill="#FFF59D" stroke="#FBC02D" stroke-width="2" transform="rotate(-15 48 15)"/>
      <ellipse cx="72" cy="15" rx="6" ry="16" fill="#FFF59D" stroke="#FBC02D" stroke-width="2" transform="rotate(15 72 15)"/>
      <circle cx="52" cy="38" r="3.5" fill="#111111"/><circle cx="68" cy="38" r="3.5" fill="#111111"/>
      <path d="M 57 46 Q 60 50 63 46" stroke="#111111" stroke-width="2" fill="none"/>
      <path d="M 60 58 C 42 42 20 60 36 82 L 60 102 L 84 82 C 100 60 78 42 60 58 Z" fill="#FF1744" stroke="#B71C1C" stroke-width="3"/>
      <circle cx="34" cy="72" r="5" fill="#FFF59D" stroke="#FBC02D" stroke-width="1.5"/>
      <circle cx="86" cy="72" r="5" fill="#FFF59D" stroke="#FBC02D" stroke-width="1.5"/>
    </svg>
  `),

  // 6. Cục thạch xanh bay lơ lửng ngơ ngác
  chibi_ghost: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="108" rx="28" ry="5" fill="rgba(0,0,0,0.12)"/>
      <path d="M 60 22 C 30 22 25 55 28 85 C 32 98 48 88 60 92 C 72 88 88 98 92 85 C 95 55 90 22 60 22 Z" fill="#A7FFEB" stroke="#00BFA5" stroke-width="3"/>
      <circle cx="48" cy="54" r="4.5" fill="#111111"/><circle cx="50" cy="52" r="1.5" fill="#FFFFFF"/>
      <circle cx="72" cy="54" r="4.5" fill="#111111"/><circle cx="74" cy="52" r="1.5" fill="#FFFFFF"/>
      <ellipse cx="60" cy="66" rx="4" ry="5" fill="#00BFA5"/>
      <ellipse cx="38" cy="62" rx="4" ry="2.5" fill="#FF80AB"/><ellipse cx="82" cy="62" rx="4" ry="2.5" fill="#FF80AB"/>
    </svg>
  `),

  // 7. Thỏ dắt cục thạch xì hơi
  chibi_fart: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="50" cy="110" rx="34" ry="6" fill="rgba(0,0,0,0.15)"/>
      <circle cx="40" cy="60" r="20" fill="#FFFFFF" stroke="#111111" stroke-width="2.5"/>
      <circle cx="34" cy="56" r="3" fill="#111111"/><circle cx="46" cy="56" r="3" fill="#111111"/>
      <ellipse cx="78" cy="74" rx="16" ry="12" fill="#69F0AE" stroke="#00C853" stroke-width="2"/>
      <circle cx="74" cy="72" r="2.5" fill="#111111"/><circle cx="82" cy="72" r="2.5" fill="#111111"/>
      <path d="M 94 74 Q 106 68 102 60 Q 112 54 106 44" stroke="#FFD600" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="108" cy="62" r="3" fill="#FFEA00"/><circle cx="114" cy="46" r="2" fill="#FFEA00"/>
    </svg>
  `),

  // 8. Ba chú thỏ hiện dấu hỏi chấm
  chibi_confused: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="110" rx="42" ry="6" fill="rgba(0,0,0,0.15)"/>
      <circle cx="32" cy="70" r="15" fill="#F8BBD0" stroke="#111111" stroke-width="2"/>
      <circle cx="28" cy="68" r="2" fill="#111111"/><circle cx="36" cy="68" r="2" fill="#111111"/>
      <circle cx="60" cy="65" r="16" fill="#FFF59D" stroke="#111111" stroke-width="2"/>
      <circle cx="56" cy="62" r="2.5" fill="#111111"/><circle cx="64" cy="62" r="2.5" fill="#111111"/>
      <circle cx="88" cy="70" r="15" fill="#FFFFFF" stroke="#111111" stroke-width="2"/>
      <circle cx="84" cy="68" r="2" fill="#111111"/><circle cx="92" cy="68" r="2" fill="#111111"/>
      <text x="32" y="42" font-family="Arial Black, sans-serif" font-size="14" fill="#D50000" text-anchor="middle">?</text>
      <text x="60" y="34" font-family="Arial Black, sans-serif" font-size="16" fill="#D50000" text-anchor="middle">?</text>
      <text x="88" y="42" font-family="Arial Black, sans-serif" font-size="14" fill="#D50000" text-anchor="middle">?</text>
    </svg>
  `)
};
