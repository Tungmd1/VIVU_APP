/**
 * storyAudioEffects.js
 * Hiệu ứng âm thanh Web Audio API & Cấu hình 10 Meme thịnh hành cho VIVU Story
 */

export function playStoryBeaconChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const freqs = [659.25, 880, 1318.5];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.6);

      gain.gain.setValueAtTime(0.001, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + 1.0);
    });
  } catch (e) {
    console.warn('[Web Audio] Story chime blocked:', e);
  }
}

export function playTactileClickSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  } catch (e) {}
}

export function playShutterSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // First click: mirror up
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(1400, now);
    osc1.frequency.exponentialRampToValueAtTime(300, now + 0.03);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.04);

    // Second click: shutter curtain (50ms later)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(800, now + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(120, now + 0.1);
    gain2.gain.setValueAtTime(0.3, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.12);
  } catch (e) {}
}

export function playCountdownBeep(isFinal = false) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const freq = isFinal ? 1760 : 880; // A6 vs A5
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.25 : 0.1));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + (isFinal ? 0.26 : 0.12));
  } catch (e) {}
}

// 10 MEME GỢI Ý THỊNH HÀNH VỚI ẢNH THẬT
export const MEME_STICKERS = [
  {
    id: 'meme-1',
    label: 'Doge Wow',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200',
    icon: 'bi-emoji-laughing',
    bg: 'bg-amber-500/10 text-amber-600 border-amber-300'
  },
  {
    id: 'meme-2',
    label: 'Cheems Chill',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200',
    icon: 'bi-cup-hot-fill',
    bg: 'bg-cyan-500/10 text-[#0A8395] border-cyan-300'
  },
  {
    id: 'meme-3',
    label: 'Thích Lắm (10 Điểm)',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200',
    icon: 'bi-hand-thumbs-up-fill',
    bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-300'
  },
  {
    id: 'meme-4',
    label: 'Chill Cafe',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200',
    icon: 'bi-cup-straw',
    bg: 'bg-amber-600/10 text-amber-700 border-amber-300'
  },
  {
    id: 'meme-5',
    label: 'Ngầu Kính Râm',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200',
    icon: 'bi-sunglasses',
    bg: 'bg-slate-800/10 text-slate-800 border-slate-300'
  },
  {
    id: 'meme-6',
    label: 'Cạn Pin / Hết Cứu',
    image: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=200',
    icon: 'bi-battery-half',
    bg: 'bg-rose-500/10 text-rose-600 border-rose-300'
  },
  {
    id: 'meme-7',
    label: 'Quẩy Phố Đêm',
    image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=200',
    icon: 'bi-lightning-charge-fill',
    bg: 'bg-purple-500/10 text-purple-600 border-purple-300'
  },
  {
    id: 'meme-8',
    label: 'Nghi Vấn / Soi',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200',
    icon: 'bi-search',
    bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-300'
  },
  {
    id: 'meme-9',
    label: 'Ngơ Ngác Hamster',
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200',
    icon: 'bi-question-circle-fill',
    bg: 'bg-orange-500/10 text-orange-600 border-orange-300'
  },
  {
    id: 'meme-10',
    label: 'Thả Tim Yêu Đời',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=200',
    icon: 'bi-heart-fill',
    bg: 'bg-pink-500/10 text-pink-600 border-pink-300'
  }
];

export const GRADIENT_PRESETS = [
  { id: 'g1', class: 'from-[#0A0A0C] via-[#1A1A24] to-[#251A30]', name: 'Midnight' },
  { id: 'g2', class: 'from-[#0052D4] via-[#4364F7] to-[#6FB1FC]', name: 'Ocean' },
  { id: 'g3', class: 'from-[#8A2387] via-[#E94057] to-[#F27121]', name: 'Sunset' },
  { id: 'g4', class: 'from-[#0F2027] via-[#203A43] to-[#2C5364]', name: 'Cyber' },
  { id: 'g5', class: 'from-[#052e16] via-[#065f46] to-[#10b981]', name: 'Neon Mint' }
];

export const EXPIRY_OPTIONS = [
  { value: 1, label: '1h', icon: 'bi-clock' },
  { value: 3, label: '3h', icon: 'bi-clock-history' },
  { value: 6, label: '6h', icon: 'bi-hourglass-split' },
  { value: 24, label: '24h', icon: 'bi-calendar-day' }
];
