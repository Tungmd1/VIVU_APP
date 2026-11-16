/**
 * chibiMascotData.js - Vũ Trụ Nhân Vật Chibi Biểu Cảm VIVU (Chibi Mascot Universe)
 * - 3 Gia tộc: Bé Giọt Nước VIVU (droplet), Thú Cưng Meme Gen Z (meme_pets), Bạn Trẻ Anime (anime)
 * - 12 Sắc thái cảm xúc: troll, angry, happy, hungry, tired, lazy, sleepy, love, shocked, cool, drunk, rich
 * - 100% Vector SVG trong suốt siêu nét, không lo vỡ hạt, 0ms load offline
 * - Tích hợp Web Audio Synth đa tần số tương ứng từng biểu cảm
 * - 100% Bootstrap Icons (Rule 5)
 */

// Hàm tạo Data URL từ chuỗi SVG
function svgToDataUrl(svgString) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

// ==========================================
// 1. BỘ ÂM THANH HIỆU ỨNG WEB AUDIO SYNTH
// ==========================================
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playChibiSound(soundType) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    switch (soundType) {
      case 'troll': {
        // Tiếng lò xo nảy nhây nhúa "Boiiing-nyah!" (F4 -> C6 -> G5)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(349.23, now);
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.28);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
        break;
      }
      case 'angry': {
        // Tiếng bốc khói xèo xèo giận dữ (White Noise + Lowpass Drop)
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.38);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        break;
      }
      case 'happy': {
        // Chuông ngân hoan ca vui sướng (Chime Arpeggio C6-E6-G6-C7)
        [1046.5, 1318.5, 1567.98, 2093].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.2, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.26);
        });
        break;
      }
      case 'hungry': {
        // Tiếng bụng sôi ọc ọc đói meo (Sine Modulated FM)
        const osc = ctx.createOscillator();
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        mod.type = 'sawtooth';
        mod.frequency.setValueAtTime(25, now);
        modGain.gain.setValueAtTime(80, now);
        mod.connect(osc.frequency);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        mod.start(now);
        osc.start(now);
        mod.stop(now + 0.45);
        osc.stop(now + 0.45);
        break;
      }
      case 'tired': {
        // Tiếng thở dài sườn sượt cạn pin (Descending Pitch Slide)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.5);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.53);
        break;
      }
      case 'lazy': {
        // Tiếng ngáp lười biếng phì phò (Low Soft Wobble)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(320, now + 0.2);
        osc.frequency.linearRampToValueAtTime(150, now + 0.55);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.56);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.57);
        break;
      }
      case 'sleepy': {
        // Tiếng ngáy ngủ khò khò (Harmonic Snore)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.25);
        osc.frequency.linearRampToValueAtTime(80, now + 0.5);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.53);
        break;
      }
      case 'love': {
        // Nhịp tim thình thịch ngọt ngào (Thump-Thump Double Beat)
        [0, 0.16].forEach(delay => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(120, now + delay);
          osc.frequency.exponentialRampToValueAtTime(55, now + delay + 0.12);
          gain.gain.setValueAtTime(0.35, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.15);
        });
        break;
      }
      case 'shocked': {
        // Tiếng hú hồn há hốc mồm (Staccato High Sweep)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
        break;
      }
      case 'cool': {
        // Tiếng đeo kính râm tưng tửng (Synth Bass Pop E2 -> A2)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(82.41, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
        break;
      }
      case 'drunk': {
        // Tiếng say xỉn hoa mắt đảo chiều (Wobbly Vibrato)
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, now);
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(9, now);
        lfoGain.gain.setValueAtTime(45, now);
        lfo.connect(osc.frequency);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
        osc.connect(gain);
        gain.connect(ctx.destination);
        lfo.start(now);
        osc.start(now);
        lfo.stop(now + 0.49);
        osc.stop(now + 0.49);
        break;
      }
      case 'rich': {
        // Tiếng tung tiền vàng leng keng (Coin Clink Cascade)
        [1760, 2200, 2637, 3300].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.2, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.19);
        });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.warn('[Chibi Sound Error]:', err);
  }
}

// ==========================================
// 2. KHO SVG ĐỒ HỌA CHIBI CAO CẤP
// ==========================================

// Helper dựng SVG Bé Giọt Nước VIVU
function buildDropletSvg({ eyeType = 'normal', mouthType = 'smile', extras = '', bodyColor = '#00E5FF', blush = true }) {
  let eyesSvg = '';
  if (eyeType === 'troll') {
    // 1 mắt nháy ^ , 1 mắt mở tròn thè lưỡi
    eyesSvg = `
      <path d="M22 36 Q27 30 32 36" stroke="#08202E" stroke-width="3" stroke-linecap="round" fill="none"/>
      <ellipse cx="46" cy="35" rx="5" ry="6" fill="#08202E"/>
      <circle cx="48" cy="33" r="2" fill="white"/>
    `;
  } else if (eyeType === 'angry') {
    // Mắt gườm xếch ngược \ /
    eyesSvg = `
      <path d="M19 31 L32 35" stroke="#08202E" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M49 35 L36 31" stroke="#08202E" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="26" cy="37" r="4" fill="#08202E"/>
      <circle cx="42" cy="37" r="4" fill="#08202E"/>
    `;
  } else if (eyeType === 'happy') {
    // Mắt cười híp ^ ^
    eyesSvg = `
      <path d="M20 37 Q26 29 32 37" stroke="#08202E" stroke-width="3.2" stroke-linecap="round" fill="none"/>
      <path d="M36 37 Q42 29 48 37" stroke="#08202E" stroke-width="3.2" stroke-linecap="round" fill="none"/>
    `;
  } else if (eyeType === 'love') {
    // Mắt hình trái tim hồng
    eyesSvg = `
      <path d="M22 33 A 3 3 0 0 0 26 37 L 26 37 A 3 3 0 0 0 30 33 Q 30 30 26 27 Q 22 30 22 33 Z" fill="#FF2A85" transform="scale(1.2) translate(-5,-5)"/>
      <path d="M38 33 A 3 3 0 0 0 42 37 L 42 37 A 3 3 0 0 0 46 33 Q 46 30 42 27 Q 38 30 38 33 Z" fill="#FF2A85" transform="scale(1.2) translate(-5,-5)"/>
    `;
  } else if (eyeType === 'sleepy') {
    // Mắt nhắm tịt - -
    eyesSvg = `
      <path d="M20 37 L31 37" stroke="#08202E" stroke-width="3" stroke-linecap="round"/>
      <path d="M37 37 L48 37" stroke="#08202E" stroke-width="3" stroke-linecap="round"/>
    `;
  } else if (eyeType === 'shocked') {
    // Mắt tròn xoe há hốc
    eyesSvg = `
      <circle cx="26" cy="35" r="7" fill="white" stroke="#08202E" stroke-width="2.5"/>
      <circle cx="26" cy="35" r="3" fill="#08202E"/>
      <circle cx="42" cy="35" r="7" fill="white" stroke="#08202E" stroke-width="2.5"/>
      <circle cx="42" cy="35" r="3" fill="#08202E"/>
    `;
  } else if (eyeType === 'drunk') {
    // Mắt xoắn ốc hoa mắt @ @
    eyesSvg = `
      <path d="M26 35 m-5 0 a5 5 0 1 0 10 0 a3 3 0 1 0 -6 0 a1 1 0 1 0 2 0" fill="none" stroke="#08202E" stroke-width="2"/>
      <path d="M42 35 m-5 0 a5 5 0 1 0 10 0 a3 3 0 1 0 -6 0 a1 1 0 1 0 2 0" fill="none" stroke="#08202E" stroke-width="2"/>
    `;
  } else if (eyeType === 'rich') {
    // Kính râm đen hoặc đồng $
    eyesSvg = `
      <rect x="18" y="30" width="32" height="12" rx="4" fill="#151619" stroke="#FFD700" stroke-width="1.5"/>
      <line x1="18" y1="36" x2="50" y2="36" stroke="#FFD700" stroke-width="1"/>
      <circle cx="26" cy="36" r="3" fill="#FFD700"/>
      <circle cx="42" cy="36" r="3" fill="#FFD700"/>
    `;
  } else if (eyeType === 'cool') {
    // Kính râm đen sành điệu
    eyesSvg = `
      <path d="M18 31 L32 31 L30 42 L20 42 Z" fill="#151619" stroke="white" stroke-width="1"/>
      <path d="M36 31 L50 31 L48 42 L38 42 Z" fill="#151619" stroke="white" stroke-width="1"/>
      <line x1="32" y1="34" x2="36" y2="34" stroke="#151619" stroke-width="2.5"/>
      <line x1="21" y1="33" x2="27" y2="39" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
    `;
  } else {
    // Mắt to tròn long lanh mặc định
    eyesSvg = `
      <ellipse cx="25" cy="36" rx="5.5" ry="6.5" fill="#08202E"/>
      <circle cx="27" cy="33" r="2.2" fill="white"/>
      <circle cx="24" cy="38" r="1.2" fill="white"/>
      <ellipse cx="43" cy="36" rx="5.5" ry="6.5" fill="#08202E"/>
      <circle cx="45" cy="33" r="2.2" fill="white"/>
      <circle cx="42" cy="38" r="1.2" fill="white"/>
    `;
  }

  let mouthSvg = '';
  if (mouthType === 'tongue') {
    // Thè lưỡi hồng lêu lêu
    mouthSvg = `
      <path d="M30 44 Q34 46 38 44" stroke="#08202E" stroke-width="2.5" fill="none"/>
      <path d="M32 45 Q34 53 37 49 Q38 45 35 45 Z" fill="#FF2A85"/>
      <line x1="34.5" y1="46" x2="34.5" y2="49" stroke="#D10056" stroke-width="1"/>
    `;
  } else if (mouthType === 'angry') {
    // Miệng cắn răng tức tối
    mouthSvg = `
      <rect x="29" y="44" width="10" height="5" rx="2" fill="white" stroke="#08202E" stroke-width="2"/>
      <line x1="34" y1="44" x2="34" y2="49" stroke="#08202E" stroke-width="1.5"/>
    `;
  } else if (mouthType === 'open') {
    // Miệng cười to ngoác
    mouthSvg = `
      <path d="M29 43 Q34 53 39 43 Z" fill="#FF2A85" stroke="#08202E" stroke-width="2"/>
      <path d="M31 44 Q34 48 37 44 Z" fill="#FF80AB"/>
    `;
  } else if (mouthType === 'drool') {
    // Chảy nước dãi
    mouthSvg = `
      <path d="M29 43 Q34 49 39 43 Z" fill="#08202E"/>
      <path d="M38 45 Q40 52 41 54 Q42 56 39 55" fill="#00F5FF" stroke="#00B4D8" stroke-width="1"/>
    `;
  } else if (mouthType === 'shocked') {
    // Miệng chữ O tròn
    mouthSvg = `
      <ellipse cx="34" cy="46" rx="4" ry="5.5" fill="#08202E"/>
      <ellipse cx="34" cy="46" rx="2.5" ry="3.5" fill="#FF2A85"/>
    `;
  } else {
    // Cười mỉm xinh xắn
    mouthSvg = `
      <path d="M30 43 Q34 48 38 43" stroke="#08202E" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    `;
  }

  const blushSvg = blush ? `
    <ellipse cx="19" cy="40" rx="4" ry="2.2" fill="#FF80AB" opacity="0.6"/>
    <ellipse cx="49" cy="40" rx="4" ry="2.2" fill="#FF80AB" opacity="0.6"/>
  ` : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 68" width="100%" height="100%" class="chibi-svg-art">
      <defs>
        <linearGradient id="bodyGrad_${bodyColor.replace('#','')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bodyColor}"/>
          <stop offset="100%" stop-color="#0080FF"/>
        </linearGradient>
        <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.25"/>
        </filter>
      </defs>
      <!-- Thân Giọt Nước VIVU 3D bo tròn -->
      <path d="M34 6 C23 20, 10 32, 10 44 A 24 24 0 0 0 58 44 C 58 32, 45 20, 34 6 Z" fill="url(#bodyGrad_${bodyColor.replace('#','')})" stroke="white" stroke-width="2.5" filter="url(#shadowFilter)"/>
      <!-- Vệt highlight bóng sáng 3D -->
      <path d="M22 22 Q16 32 16 42" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.65" fill="none"/>
      ${blushSvg}
      ${eyesSvg}
      ${mouthSvg}
      ${extras}
    </svg>
  `.trim();
}

// Helper dựng SVG Thú Cưng Meme (Mèo Cam Béo & Capybara)
function buildPetSvg({ petType = 'cat', eyeType = 'normal', mouthType = 'cat', extras = '', color = '#FB923C' }) {
  const isCapy = petType === 'capy';
  const headColor = isCapy ? '#A16207' : color;

  const earsSvg = isCapy ? `
    <!-- Tai Capybara tròn nhỏ cụp -->
    <ellipse cx="14" cy="24" rx="4.5" ry="6" fill="#78350F" stroke="#451A03" stroke-width="1.5"/>
    <ellipse cx="54" cy="24" rx="4.5" ry="6" fill="#78350F" stroke="#451A03" stroke-width="1.5"/>
  ` : `
    <!-- Tai Mèo Cam tam giác vểnh -->
    <path d="M12 28 L17 10 L30 22 Z" fill="${color}" stroke="#C2410C" stroke-width="2"/>
    <path d="M16 24 L19 14 L26 21 Z" fill="#FECDD3"/>
    <path d="M56 28 L51 10 L38 22 Z" fill="${color}" stroke="#C2410C" stroke-width="2"/>
    <path d="M52 24 L49 14 L42 21 Z" fill="#FECDD3"/>
  `;

  let eyesSvg = `
    <ellipse cx="24" cy="35" rx="4.5" ry="5.5" fill="#1C1917"/>
    <circle cx="26" cy="33" r="1.8" fill="white"/>
    <ellipse cx="44" cy="35" rx="4.5" ry="5.5" fill="#1C1917"/>
    <circle cx="46" cy="33" r="1.8" fill="white"/>
  `;
  if (eyeType === 'troll') {
    eyesSvg = `
      <path d="M20 35 Q25 30 30 35" stroke="#1C1917" stroke-width="3" stroke-linecap="round" fill="none"/>
      <ellipse cx="45" cy="35" rx="4.5" ry="5.5" fill="#1C1917"/>
      <circle cx="47" cy="33" r="1.8" fill="white"/>
    `;
  } else if (eyeType === 'angry') {
    eyesSvg = `
      <path d="M18 31 L30 35" stroke="#1C1917" stroke-width="3" stroke-linecap="round"/>
      <path d="M50 31 L38 35" stroke="#1C1917" stroke-width="3" stroke-linecap="round"/>
      <circle cx="25" cy="37" r="3.5" fill="#1C1917"/>
      <circle cx="43" cy="37" r="3.5" fill="#1C1917"/>
    `;
  } else if (eyeType === 'lazy' || eyeType === 'sleepy') {
    eyesSvg = `
      <path d="M20 36 L29 36" stroke="#1C1917" stroke-width="3" stroke-linecap="round"/>
      <path d="M39 36 L48 36" stroke="#1C1917" stroke-width="3" stroke-linecap="round"/>
    `;
  }

  const snoutSvg = isCapy ? `
    <!-- Mõm Capy vuông vức đặc trưng -->
    <rect x="25" y="38" width="18" height="15" rx="5" fill="#78350F"/>
    <circle cx="30" cy="43" r="1.5" fill="#1C1917"/>
    <circle cx="38" cy="43" r="1.5" fill="#1C1917"/>
    <path d="M31 48 Q34 50 37 48" stroke="#1C1917" stroke-width="2" fill="none"/>
  ` : `
    <!-- Mũi & Miệng Mèo hình chữ :3 -->
    <polygon points="34,39 31,36 37,36" fill="#F43F5E"/>
    <path d="M31 41 Q34 44 34 40 Q34 44 37 41" stroke="#1C1917" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <!-- Râu mèo 2 bên -->
    <line x1="12" y1="38" x2="21" y2="40" stroke="#78350F" stroke-width="1.5"/>
    <line x1="12" y1="43" x2="21" y2="43" stroke="#78350F" stroke-width="1.5"/>
    <line x1="56" y1="38" x2="47" y2="40" stroke="#78350F" stroke-width="1.5"/>
    <line x1="56" y1="43" x2="47" y2="43" stroke="#78350F" stroke-width="1.5"/>
  `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 68" width="100%" height="100%" class="chibi-svg-art">
      ${earsSvg}
      <!-- Đầu tròn béo múp míp -->
      <ellipse cx="34" cy="40" rx="24" ry="21" fill="${headColor}" stroke="white" stroke-width="2.5"/>
      <!-- Má hồng cute -->
      <circle cx="18" cy="42" r="3.5" fill="#FDA4AF" opacity="0.7"/>
      <circle cx="50" cy="42" r="3.5" fill="#FDA4AF" opacity="0.7"/>
      ${eyesSvg}
      ${snoutSvg}
      ${extras}
    </svg>
  `.trim();
}

// Helper dựng SVG Bạn Trẻ Chibi Anime (Boy & Girl)
function buildAnimeSvg({ gender = 'girl', eyeType = 'normal', mouthType = 'smile', hairColor = '#3B82F6', extras = '' }) {
  const isGirl = gender === 'girl';
  const faceSkin = '#FEE2E2';

  const hairBack = isGirl ? `
    <!-- Tóc dài 2 bím Anime Girl -->
    <path d="M12 28 Q6 46 16 56 Q20 48 18 36 Z" fill="${hairColor}"/>
    <path d="M56 28 Q62 46 52 56 Q48 48 50 36 Z" fill="${hairColor}"/>
  ` : '';

  const hairFront = isGirl ? `
    <!-- Mái ngố bồng bềnh + Kẹp nơ xinh -->
    <path d="M15 28 Q24 10 34 10 Q44 10 53 28 Q43 20 34 22 Q25 20 15 28 Z" fill="${hairColor}"/>
    <circle cx="20" cy="18" r="4" fill="#FF2A85"/>
  ` : `
    <!-- Tóc vuốt nhọn anime boy cool ngầu -->
    <path d="M14 30 L22 12 L30 18 L36 8 L44 16 L52 11 L54 30 Q45 22 34 23 Q24 22 14 30 Z" fill="${hairColor}"/>
  `;

  let eyesSvg = `
    <ellipse cx="25" cy="38" rx="4.5" ry="6" fill="#1E293B"/>
    <circle cx="27" cy="35" r="2.2" fill="white"/>
    <ellipse cx="43" cy="38" rx="4.5" ry="6" fill="#1E293B"/>
    <circle cx="45" cy="35" r="2.2" fill="white"/>
  `;
  if (eyeType === 'troll') {
    eyesSvg = `
      <path d="M21 38 Q25 32 29 38" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
      <ellipse cx="44" cy="38" rx="4.5" ry="6" fill="#1E293B"/>
      <circle cx="46" cy="35" r="2.2" fill="white"/>
    `;
  } else if (eyeType === 'angry') {
    eyesSvg = `
      <path d="M19 33 L30 37" stroke="#1E293B" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M49 33 L38 37" stroke="#1E293B" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="25" cy="39" r="3.5" fill="#1E293B"/>
      <circle cx="43" cy="39" r="3.5" fill="#1E293B"/>
    `;
  }

  const mouthSvg = `
    <path d="M31 46 Q34 50 37 46" stroke="#991B1B" stroke-width="2" stroke-linecap="round" fill="none"/>
  `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 68" width="100%" height="100%" class="chibi-svg-art">
      ${hairBack}
      <!-- Khuôn mặt Chibi tròn bầu bĩnh -->
      <ellipse cx="34" cy="40" rx="20" ry="18" fill="${faceSkin}" stroke="white" stroke-width="2"/>
      <!-- Má hồng phúng phính -->
      <ellipse cx="20" cy="44" rx="4" ry="2" fill="#F43F5E" opacity="0.6"/>
      <ellipse cx="48" cy="44" rx="4" ry="2" fill="#F43F5E" opacity="0.6"/>
      ${hairFront}
      ${eyesSvg}
      ${mouthSvg}
      ${extras}
    </svg>
  `.trim();
}

// ==========================================
// 3. DANH SÁCH 36 BIẾN THỂ CHIBI (3 FAMILIES)
// ==========================================

export const CHIBI_MASCOT_FAMILIES = [
  { id: 'droplet', label: 'Bé Giọt Nước VIVU', icon: 'bi-droplet-fill' },
  { id: 'meme_pets', label: 'Thú Cưng Meme', icon: 'bi-emoji-laughing-fill' },
  { id: 'anime', label: 'Bạn Trẻ Anime', icon: 'bi-person-heart' }
];

export const CHIBI_MASCOTS = [
  // ----------------------------------------
  // GIA TỘC 1: BÉ GIỌT NƯỚC VIVU (DROPLET)
  // ----------------------------------------
  {
    id: 'droplet_troll',
    name: 'Giọt Nước Cà Khịa',
    family: 'droplet',
    familyLabel: 'Bé Giọt Nước VIVU',
    emotionKey: 'troll',
    emotionLabel: 'Trêu Chọc',
    color: '#00E5FF',
    soundType: 'troll',
    sloganPlaceholder: 'Nêu suy nghĩ trêu chọc...',
    svgRaw: buildDropletSvg({ eyeType: 'troll', mouthType: 'tongue', bodyColor: '#00E5FF' }),
    extrasDesc: 'Thè lưỡi lêu lêu, nháy mắt cà khịa đỉnh cao'
  },
  {
    id: 'droplet_angry',
    name: 'Giọt Nước Bốc Hỏa',
    family: 'droplet',
    familyLabel: 'Bé Giọt Nước VIVU',
    emotionKey: 'angry',
    emotionLabel: 'Tức Giận',
    color: '#FF2A85',
    soundType: 'angry',
    sloganPlaceholder: 'Nêu suy nghĩ tức giận...',
    svgRaw: buildDropletSvg({
      eyeType: 'angry',
      mouthType: 'angry',
      bodyColor: '#FF3366',
      extras: '<path d="M42 12 Q46 6 52 10 Q50 16 46 14" stroke="#FFD700" stroke-width="2" fill="none"/>'
    }),
    extrasDesc: 'Mặt đỏ gay gắt, đầu bốc khói xèo xèo'
  },
  {
    id: 'droplet_happy',
    name: 'Giọt Nước Vui Quẩy',
    family: 'droplet',
    familyLabel: 'Bé Giọt Nước VIVU',
    emotionKey: 'happy',
    emotionLabel: 'Vui Sướng',
    color: '#10FFA0',
    soundType: 'happy',
    sloganPlaceholder: 'Nêu suy nghĩ vui vẻ...',
    svgRaw: buildDropletSvg({
      eyeType: 'happy',
      mouthType: 'open',
      bodyColor: '#10FFA0',
      extras: '<polygon points="56,22 59,28 65,29 60,34 62,40 56,37 50,40 52,34 47,29 53,28" fill="#FFD700" transform="scale(0.5) translate(40,-10)"/>'
    }),
    extrasDesc: 'Cười tít mắt, hào quang quẩy tưng bừng'
  },
  {
    id: 'droplet_hungry',
    name: 'Giọt Nước Đói Meo',
    family: 'droplet',
    familyLabel: 'Bé Giọt Nước VIVU',
    emotionKey: 'hungry',
    emotionLabel: 'Đói Bụng',
    color: '#F59E0B',
    soundType: 'hungry',
    sloganPlaceholder: 'Nêu món bạn đang thèm...',
    svgRaw: buildDropletSvg({ eyeType: 'normal', mouthType: 'drool', bodyColor: '#F59E0B' }),
    extrasDesc: 'Chảy nước dãi, thèm ăn sập quán xá'
  },
  {
    id: 'droplet_tired',
    name: 'Giọt Nước Cạn Pin',
    family: 'droplet',
    familyLabel: 'Bé Giọt Nước VIVU',
    emotionKey: 'tired',
    emotionLabel: 'Mệt Mỏi',
    color: '#94A3B8',
    soundType: 'tired',
    sloganPlaceholder: 'Nêu điều khiến bạn mệt mỏi...',
    svgRaw: buildDropletSvg({
      eyeType: 'sleepy',
      mouthType: 'smile',
      bodyColor: '#64748B',
      extras: '<ellipse cx="50" cy="30" rx="2.5" ry="4" fill="#38BDF8"/>'
    }),
    extrasDesc: 'Mồ hôi rơi ròng ròng, năng lượng báo đỏ'
  },
  {
    id: 'droplet_lazy',
    name: 'Giọt Nước Đình Công',
    family: 'droplet',
    familyLabel: 'Bé Giọt Nước VIVU',
    emotionKey: 'lazy',
    emotionLabel: 'Lười Biếng',
    color: '#8B5CF6',
    soundType: 'lazy',
    sloganPlaceholder: 'Nêu lý do lười hôm nay...',
    svgRaw: buildDropletSvg({
      eyeType: 'sleepy',
      mouthType: 'smile',
      bodyColor: '#A78BFA',
      extras: '<path d="M12 48 Q34 40 56 48 L56 60 L12 60 Z" fill="#C4B5FD" opacity="0.9"/>'
    }),
    extrasDesc: 'Nằm bẹp dí trùm chăn, hôm nay đình công'
  },
  {
    id: 'droplet_sleepy',
    name: 'Giọt Nước Khò Khò',
    family: 'droplet',
    familyLabel: 'Bé Giọt Nước VIVU',
    emotionKey: 'sleepy',
    emotionLabel: 'Buồn Ngủ',
    color: '#6366F1',
    soundType: 'sleepy',
    sloganPlaceholder: 'Nêu cơn buồn ngủ của bạn...',
    svgRaw: buildDropletSvg({
      eyeType: 'sleepy',
      mouthType: 'smile',
      bodyColor: '#818CF8',
      extras: '<circle cx="48" cy="42" r="4.5" fill="#38BDF8" opacity="0.8"/><text x="46" y="24" fill="#818CF8" font-size="11" font-weight="bold">Zzz</text>'
    }),
    extrasDesc: 'Bong bóng mũi phập phồng, Zzz bay lượn'
  },
  {
    id: 'droplet_love',
    name: 'Giọt Nước Bắn Tim',
    family: 'droplet',
    familyLabel: 'Bé Giọt Nước VIVU',
    emotionKey: 'love',
    emotionLabel: 'Đang Yêu',
    color: '#EC4899',
    soundType: 'love',
    sloganPlaceholder: 'Nêu lời yêu thương ngọt ngào...',
    svgRaw: buildDropletSvg({
      eyeType: 'love',
      mouthType: 'open',
      bodyColor: '#F472B6',
      extras: '<path d="M52 18 Q55 12 60 16 Q58 22 52 26 Z" fill="#FF2A85"/>'
    }),
    extrasDesc: 'Mắt trái tim hồng, nhịp tim thình thịch'
  },
  {
    id: 'droplet_shocked',
    name: 'Giọt Nước Hú Hồn',
    family: 'droplet',
    familyLabel: 'Bé Giọt Nước VIVU',
    emotionKey: 'shocked',
    emotionLabel: 'Sốc Hú Hồn',
    color: '#F43F5E',
    soundType: 'shocked',
    sloganPlaceholder: 'Nêu sự việc gây sốc...',
    svgRaw: buildDropletSvg({ eyeType: 'shocked', mouthType: 'shocked', bodyColor: '#FB7185' }),
    extrasDesc: 'Mắt tròn xoe, miệng chữ O há hốc mồm'
  },
  {
    id: 'droplet_cool',
    name: 'Giọt Nước Ngầu Lòi',
    family: 'droplet',
    familyLabel: 'Bé Giọt Nước VIVU',
    emotionKey: 'cool',
    emotionLabel: 'Cool Ngầu',
    color: '#0284C7',
    soundType: 'cool',
    sloganPlaceholder: 'Nêu phong thái cool ngầu...',
    svgRaw: buildDropletSvg({ eyeType: 'cool', mouthType: 'smile', bodyColor: '#0EA5E9' }),
    extrasDesc: 'Đeo kính râm đen bóng loáng, nhếch mép tự tin'
  },
  {
    id: 'droplet_drunk',
    name: 'Giọt Nước Phê Pha',
    family: 'droplet',
    familyLabel: 'Bé Giọt Nước VIVU',
    emotionKey: 'drunk',
    emotionLabel: 'Say Xỉn',
    color: '#D946EF',
    soundType: 'drunk',
    sloganPlaceholder: 'Nêu trạng thái say sưa...',
    svgRaw: buildDropletSvg({ eyeType: 'drunk', mouthType: 'smile', bodyColor: '#E879F9' }),
    extrasDesc: 'Mắt xoắn ốc hoa mắt, má đỏ lựng liêu xiêu'
  },
  {
    id: 'droplet_rich',
    name: 'Giọt Nước Phú Ông',
    family: 'droplet',
    familyLabel: 'Bé Giọt Nước VIVU',
    emotionKey: 'rich',
    emotionLabel: 'Giàu Sang',
    color: '#EAB308',
    soundType: 'rich',
    sloganPlaceholder: 'Nêu mục tiêu flex hôm nay...',
    svgRaw: buildDropletSvg({
      eyeType: 'rich',
      mouthType: 'open',
      bodyColor: '#FACC15',
      extras: '<polygon points="26,14 34,4 42,14 48,8 48,18 20,18 20,8" fill="#FFD700" stroke="#B45309" stroke-width="1.2"/>'
    }),
    extrasDesc: 'Đội vương miện vàng, đô la bay ngập tràn'
  },

  // ----------------------------------------
  // GIA TỘC 2: THÚ CƯNG MEME GEN Z (PETS)
  // ----------------------------------------
  {
    id: 'pet_cat_troll',
    name: 'Mèo Cam Cà Khịa',
    family: 'meme_pets',
    familyLabel: 'Thú Cưng Meme',
    emotionKey: 'troll',
    emotionLabel: 'Trêu Chọc',
    color: '#FB923C',
    soundType: 'troll',
    sloganPlaceholder: 'Nêu suy nghĩ cà khịa của mèo...',
    svgRaw: buildPetSvg({ petType: 'cat', eyeType: 'troll', color: '#FB923C' }),
    extrasDesc: 'Mèo cam béo thè lưỡi ngoe nguẩy nhây nhúa'
  },
  {
    id: 'pet_cat_angry',
    name: 'Mèo Cam Cào Mặt',
    family: 'meme_pets',
    familyLabel: 'Thú Cưng Meme',
    emotionKey: 'angry',
    emotionLabel: 'Tức Giận',
    color: '#EA580C',
    soundType: 'angry',
    sloganPlaceholder: 'Nêu điều mèo đang bực mình...',
    svgRaw: buildPetSvg({ petType: 'cat', eyeType: 'angry', color: '#F97316' }),
    extrasDesc: 'Mắt xếch ngược, xù lông giận dữ'
  },
  {
    id: 'pet_capy_chill',
    name: 'Capybara Vô Tri',
    family: 'meme_pets',
    familyLabel: 'Thú Cưng Meme',
    emotionKey: 'lazy',
    emotionLabel: 'Lười Biếng',
    color: '#CA8A04',
    soundType: 'lazy',
    sloganPlaceholder: 'Nêu triết lý vô tri của bạn...',
    svgRaw: buildPetSvg({ petType: 'capy', eyeType: 'lazy' }),
    extrasDesc: 'Mặt bất cần đời, thế giới sao cũng kệ'
  },
  {
    id: 'pet_cat_hungry',
    name: 'Mèo Đòi Pate',
    family: 'meme_pets',
    familyLabel: 'Thú Cưng Meme',
    emotionKey: 'hungry',
    emotionLabel: 'Đói Bụng',
    color: '#F59E0B',
    soundType: 'hungry',
    sloganPlaceholder: 'Nêu món ăn bạn đang muốn được dắt đi...',
    svgRaw: buildPetSvg({ petType: 'cat', eyeType: 'normal', color: '#FBBF24' }),
    extrasDesc: 'Mắt mèo ướt át xin ăn pate cá ngừ'
  },
  {
    id: 'pet_cat_sleepy',
    name: 'Mèo Khò Khò',
    family: 'meme_pets',
    familyLabel: 'Thú Cưng Meme',
    emotionKey: 'sleepy',
    emotionLabel: 'Buồn Ngủ',
    color: '#818CF8',
    soundType: 'sleepy',
    sloganPlaceholder: 'Nêu giấc ngủ mơ màng...',
    svgRaw: buildPetSvg({ petType: 'cat', eyeType: 'sleepy', color: '#F97316' }),
    extrasDesc: 'Cuộn tròn như ổ bánh mì ngủ say sưa'
  },
  {
    id: 'pet_capy_cool',
    name: 'Capy Trùm Phố',
    family: 'meme_pets',
    familyLabel: 'Thú Cưng Meme',
    emotionKey: 'cool',
    emotionLabel: 'Cool Ngầu',
    color: '#A16207',
    soundType: 'cool',
    sloganPlaceholder: 'Nêu sự ngầu lòi vô cảm...',
    svgRaw: buildPetSvg({
      petType: 'capy',
      extras: '<rect x="18" y="32" width="32" height="9" rx="3" fill="#151619" stroke="white" stroke-width="1"/>'
    }),
    extrasDesc: 'Capybara đeo kính đen điềm tĩnh qua giông bão'
  },

  // ----------------------------------------
  // GIA TỘC 3: BẠN TRẺ CHIBI ANIME (ANIME)
  // ----------------------------------------
  {
    id: 'anime_girl_troll',
    name: 'Bé Gái Lêu Lêu',
    family: 'anime',
    familyLabel: 'Bạn Trẻ Anime',
    emotionKey: 'troll',
    emotionLabel: 'Trêu Chọc',
    color: '#EC4899',
    soundType: 'troll',
    sloganPlaceholder: 'Nêu lời trêu chọc ngọt ngào...',
    svgRaw: buildAnimeSvg({ gender: 'girl', eyeType: 'troll', hairColor: '#F472B6' }),
    extrasDesc: 'Cô bé tóc hồng hai bím nháy mắt trêu ghẹo'
  },
  {
    id: 'anime_boy_angry',
    name: 'Bé Trai Hờn Dỗi',
    family: 'anime',
    familyLabel: 'Bạn Trẻ Anime',
    emotionKey: 'angry',
    emotionLabel: 'Tức Giận',
    color: '#EF4444',
    soundType: 'angry',
    sloganPlaceholder: 'Nêu cơn hờn dỗi của bạn...',
    svgRaw: buildAnimeSvg({ gender: 'boy', eyeType: 'angry', hairColor: '#3B82F6' }),
    extrasDesc: 'Cậu bé cau có bĩu môi hờn dỗi siêu cute'
  },
  {
    id: 'anime_girl_love',
    name: 'Bé Gái Mộng Mơ',
    family: 'anime',
    familyLabel: 'Bạn Trẻ Anime',
    emotionKey: 'love',
    emotionLabel: 'Đang Yêu',
    color: '#F43F5E',
    soundType: 'love',
    sloganPlaceholder: 'Nêu cảm xúc rung động...',
    svgRaw: buildAnimeSvg({ gender: 'girl', hairColor: '#FB7185' }),
    extrasDesc: 'Má ửng hồng e ấp mong manh như nữ chính anime'
  },
  {
    id: 'anime_boy_cool',
    name: 'Bé Trai Cool Ngầu',
    family: 'anime',
    familyLabel: 'Bạn Trẻ Anime',
    emotionKey: 'cool',
    emotionLabel: 'Cool Ngầu',
    color: '#0284C7',
    soundType: 'cool',
    sloganPlaceholder: 'Nêu độ đẹp trai hôm nay...',
    svgRaw: buildAnimeSvg({
      gender: 'boy',
      hairColor: '#1E293B',
      extras: '<rect x="18" y="34" width="32" height="9" rx="3" fill="#0F172A" stroke="#00E5FF" stroke-width="1"/>'
    }),
    extrasDesc: 'Kính râm phản chiếu ánh neon cyberpunk'
  }
];

// Bản đồ tra cứu nhanh theo ID
export const CHIBI_MASCOT_MAP = new Map(CHIBI_MASCOTS.map(c => [c.id, c]));

// Lấy Chibi an toàn có fallback (hỗ trợ cả chuỗi ID và Mascot Object)
export function getChibiMascotById(chibiId) {
  if (!chibiId) return null;
  if (typeof chibiId === 'object') {
    if (chibiId.svgRaw) return chibiId;
    if (chibiId.id) return CHIBI_MASCOT_MAP.get(chibiId.id) || chibiId;
  }
  return CHIBI_MASCOT_MAP.get(chibiId) || CHIBI_MASCOTS[0];
}

// Lấy chuỗi SVG hoặc Data URI của Chibi
export function getChibiSvgString(chibiId) {
  const item = getChibiMascotById(chibiId);
  return item ? item.svgRaw : '';
}

export function getChibiDataUrl(chibiId) {
  const svg = getChibiSvgString(chibiId);
  return svg ? svgToDataUrl(svg) : '';
}

