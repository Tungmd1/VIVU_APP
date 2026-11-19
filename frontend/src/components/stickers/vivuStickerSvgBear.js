/**
 * vivuStickerSvgBear.js - 8 Vector SVG Gấu Bông Pastel Cảm Xúc (Fluffy Bears Style)
 */
function makeSvgUri(svgString) {
  const cleaned = svgString.replace(/\s+/g, ' ').trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
}

export const BEAR_SVGS = {
  // 1. Hai chú gấu ôm nhau (hug)
  bear_hug: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="110" rx="40" ry="7" fill="rgba(0,0,0,0.12)"/>
      <circle cx="42" cy="48" r="20" fill="#D7CCC8" stroke="#6D4C41" stroke-width="2.5"/>
      <circle cx="28" cy="34" r="7" fill="#BCAAA4" stroke="#6D4C41" stroke-width="2"/>
      <circle cx="56" cy="34" r="7" fill="#BCAAA4" stroke="#6D4C41" stroke-width="2"/>
      <ellipse cx="40" cy="78" rx="20" ry="24" fill="#D7CCC8" stroke="#6D4C41" stroke-width="2.5"/>
      <circle cx="78" cy="48" r="20" fill="#F8BBD0" stroke="#C2185B" stroke-width="2.5"/>
      <circle cx="64" cy="34" r="7" fill="#F48FB1" stroke="#C2185B" stroke-width="2"/>
      <circle cx="92" cy="34" r="7" fill="#F48FB1" stroke="#C2185B" stroke-width="2"/>
      <ellipse cx="78" cy="78" rx="20" ry="24" fill="#F8BBD0" stroke="#C2185B" stroke-width="2.5"/>
      <path d="M 90 28 L 96 32 L 96 24 Z M 96 32 L 102 28 L 96 24 Z" fill="#E91E63"/>
      <path d="M 46 68 Q 62 76 74 66" stroke="#6D4C41" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M 72 68 Q 58 76 46 66" stroke="#C2185B" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M 36 48 Q 40 52 44 48" stroke="#6D4C41" stroke-width="2.5" fill="none"/>
      <path d="M 74 48 Q 78 52 82 48" stroke="#C2185B" stroke-width="2.5" fill="none"/>
      <path d="M 60 18 C 55 8 46 12 52 22 L 60 30 L 68 22 C 74 12 65 8 60 18 Z" fill="#FF4081"/>
    </svg>
  `),

  // 2. Hôn má chụt chụt (kiss)
  bear_kiss: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="110" rx="38" ry="7" fill="rgba(0,0,0,0.12)"/>
      <circle cx="45" cy="55" r="22" fill="#D7CCC8" stroke="#6D4C41" stroke-width="2.5"/>
      <circle cx="30" cy="38" r="8" fill="#BCAAA4" stroke="#6D4C41" stroke-width="2"/>
      <circle cx="78" cy="55" r="22" fill="#F8BBD0" stroke="#C2185B" stroke-width="2.5"/>
      <circle cx="92" cy="38" r="8" fill="#F48FB1" stroke="#C2185B" stroke-width="2"/>
      <ellipse cx="64" cy="58" rx="6" ry="4" fill="#FF4081" stroke="#6D4C41" stroke-width="1.5"/>
      <path d="M 36 52 Q 42 56 46 52" stroke="#6D4C41" stroke-width="2.5" fill="none"/>
      <ellipse cx="76" cy="62" rx="6" ry="4" fill="#FF80AB"/>
      <path d="M 72 52 Q 76 48 80 52" stroke="#C2185B" stroke-width="2.5" fill="none"/>
      <path d="M 58 24 C 54 16 48 18 52 26 L 58 32 L 64 26 C 68 18 62 16 58 24 Z" fill="#FF1744"/>
      <circle cx="28" cy="22" r="3" fill="#FF80AB"/><circle cx="94" cy="22" r="3" fill="#FF80AB"/>
    </svg>
  `),

  // 3. Đắp chăn chúc ngủ ngon (sleep)
  bear_sleep: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="112" rx="42" ry="6" fill="rgba(0,0,0,0.12)"/>
      <rect x="20" y="38" width="80" height="35" rx="14" fill="#EDE7F6" stroke="#B39DDB" stroke-width="2"/>
      <circle cx="60" cy="48" r="20" fill="#F8BBD0" stroke="#C2185B" stroke-width="2.5"/>
      <circle cx="44" cy="35" r="7" fill="#F48FB1" stroke="#C2185B" stroke-width="2"/>
      <circle cx="76" cy="35" r="7" fill="#F48FB1" stroke="#C2185B" stroke-width="2"/>
      <path d="M 52 48 Q 56 52 60 48" stroke="#C2185B" stroke-width="2" fill="none"/>
      <path d="M 62 48 Q 66 52 70 48" stroke="#C2185B" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="54" rx="4" ry="3" fill="#C2185B"/>
      <rect x="16" y="62" width="88" height="46" rx="12" fill="#C5CAE9" stroke="#3F51B5" stroke-width="2.5"/>
      <path d="M 94 12 A 12 12 0 0 0 88 28 A 10 10 0 0 1 94 12 Z" fill="#FFD54F"/>
      <circle cx="28" cy="18" r="2" fill="#FFD54F"/><circle cx="70" cy="12" r="1.5" fill="#FFD54F"/>
      <text x="60" y="90" font-family="sans-serif" font-size="10" font-weight="bold" fill="#3F51B5" text-anchor="middle">Good Night</text>
    </svg>
  `),

  // 4. Chào buổi sáng rạng rỡ (morning)
  bear_morning: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="95" cy="25" r="14" fill="#FFA726"/>
      <circle cx="95" cy="25" r="10" fill="#FFD54F"/>
      <circle cx="60" cy="65" r="26" fill="#F8BBD0" stroke="#C2185B" stroke-width="2.5"/>
      <circle cx="40" cy="45" r="9" fill="#F48FB1" stroke="#C2185B" stroke-width="2"/>
      <circle cx="80" cy="45" r="9" fill="#F48FB1" stroke="#C2185B" stroke-width="2"/>
      <ellipse cx="32" cy="62" rx="7" ry="14" fill="#F8BBD0" stroke="#C2185B" stroke-width="2" transform="rotate(-30 32 62)"/>
      <ellipse cx="88" cy="62" rx="7" ry="14" fill="#F8BBD0" stroke="#C2185B" stroke-width="2" transform="rotate(30 88 62)"/>
      <circle cx="52" cy="62" r="3.5" fill="#C2185B"/><circle cx="68" cy="62" r="3.5" fill="#C2185B"/>
      <path d="M 56 70 Q 60 76 64 70" stroke="#C2185B" stroke-width="2.5" fill="none"/>
      <ellipse cx="44" cy="68" rx="5" ry="3" fill="#FF80AB"/><ellipse cx="76" cy="68" rx="5" ry="3" fill="#FF80AB"/>
    </svg>
  `),

  // 5. Xoa đầu ngoan ngoãn (pat)
  bear_pat: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="110" rx="36" ry="6" fill="rgba(0,0,0,0.12)"/>
      <circle cx="60" cy="65" r="26" fill="#D7CCC8" stroke="#6D4C41" stroke-width="2.5"/>
      <circle cx="40" cy="45" r="8" fill="#BCAAA4" stroke="#6D4C41" stroke-width="2"/>
      <circle cx="80" cy="45" r="8" fill="#BCAAA4" stroke="#6D4C41" stroke-width="2"/>
      <ellipse cx="60" cy="38" rx="16" ry="8" fill="#F8BBD0" stroke="#C2185B" stroke-width="2.5"/>
      <path d="M 40 32 L 32 30 M 80 32 L 88 30" stroke="#FF4081" stroke-width="2"/>
      <path d="M 52 65 Q 56 70 60 65" stroke="#6D4C41" stroke-width="2" fill="none"/>
      <path d="M 64 65 Q 68 70 72 65" stroke="#6D4C41" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="74" rx="4" ry="3" fill="#6D4C41"/>
      <ellipse cx="46" cy="70" rx="6" ry="3" fill="#FFAB91"/><ellipse cx="74" cy="70" rx="6" ry="3" fill="#FFAB91"/>
    </svg>
  `),

  // 6. Khóc nhè ôm bình sữa (sob)
  bear_sob: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="112" rx="36" ry="6" fill="rgba(0,0,0,0.12)"/>
      <circle cx="60" cy="55" r="26" fill="#F8BBD0" stroke="#C2185B" stroke-width="2.5"/>
      <circle cx="40" cy="35" r="8" fill="#F48FB1" stroke="#C2185B" stroke-width="2"/>
      <circle cx="80" cy="35" r="8" fill="#F48FB1" stroke="#C2185B" stroke-width="2"/>
      <path d="M 46 54 C 40 65 32 75 36 90" stroke="#29B6F6" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M 74 54 C 80 65 88 75 84 90" stroke="#29B6F6" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="60" cy="66" rx="8" ry="6" fill="#D81B60"/>
      <rect x="52" y="76" width="16" height="24" rx="5" fill="#E1F5FE" stroke="#0288D1" stroke-width="2"/>
      <rect x="56" y="70" width="8" height="6" rx="2" fill="#FFA726"/>
    </svg>
  `),

  // 7. Cúi đầu cảm ơn (thank you)
  bear_thankyou: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="110" rx="35" ry="6" fill="rgba(0,0,0,0.12)"/>
      <circle cx="60" cy="50" r="25" fill="#D7CCC8" stroke="#6D4C41" stroke-width="2.5"/>
      <circle cx="40" cy="32" r="8" fill="#BCAAA4" stroke="#6D4C41" stroke-width="2"/>
      <circle cx="80" cy="32" r="8" fill="#BCAAA4" stroke="#6D4C41" stroke-width="2"/>
      <ellipse cx="54" cy="72" rx="7" ry="10" fill="#D7CCC8" stroke="#6D4C41" stroke-width="2" transform="rotate(-20 54 72)"/>
      <ellipse cx="66" cy="72" rx="7" ry="10" fill="#D7CCC8" stroke="#6D4C41" stroke-width="2" transform="rotate(20 66 72)"/>
      <path d="M 50 48 Q 55 52 60 48" stroke="#6D4C41" stroke-width="2.5" fill="none"/>
      <path d="M 65 48 Q 70 52 75 48" stroke="#6D4C41" stroke-width="2.5" fill="none"/>
      <ellipse cx="60" cy="58" rx="4" ry="3" fill="#6D4C41"/>
      <text x="60" y="98" font-family="sans-serif" font-size="11" font-weight="900" fill="#6D4C41" text-anchor="middle">Thank You!</text>
    </svg>
  `),

  // 8. Tách trà ấm áp (teacup)
  bear_teacup: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <ellipse cx="60" cy="112" rx="38" ry="6" fill="rgba(0,0,0,0.12)"/>
      <circle cx="60" cy="46" r="22" fill="#F8BBD0" stroke="#C2185B" stroke-width="2.5"/>
      <circle cx="42" cy="30" r="7" fill="#F48FB1" stroke="#C2185B" stroke-width="2"/>
      <circle cx="78" cy="30" r="7" fill="#F48FB1" stroke="#C2185B" stroke-width="2"/>
      <circle cx="52" cy="45" r="3" fill="#C2185B"/><circle cx="68" cy="45" r="3" fill="#C2185B"/>
      <path d="M 56 52 Q 60 56 64 52" stroke="#C2185B" stroke-width="2" fill="none"/>
      <path d="M 28 60 L 92 60 C 90 95 30 95 28 60 Z" fill="#FFFFFF" stroke="#FFB300" stroke-width="3"/>
      <path d="M 90 68 C 104 68 104 84 88 84" stroke="#FFB300" stroke-width="3" fill="none"/>
      <path d="M 60 22 Q 56 16 60 10 Q 64 4 60 -2" stroke="#E0E0E0" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>
  `)
};
