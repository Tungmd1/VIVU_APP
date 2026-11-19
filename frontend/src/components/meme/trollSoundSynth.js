/**
 * trollSoundSynth.js - Bộ Tổng Hợp Âm Thanh Trêu Chọc Chân Thực Bằng Web Audio API
 * Tự phát trực tiếp từ trình duyệt, 0 phụ thuộc file MP3/WAV bên ngoài, 0 sợ lỗi 404
 * Tuân thủ Rule 7 (< 450 dòng)
 */

let sharedAudioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

// 1. Tiếng Dép Tổ Ong quất bẹp "CHÁT!"
export function playSlapSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(850, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);

  gain.gain.setValueAtTime(0.7, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

  // Tạo tiếng gió rít kèm tiếng quất
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.5, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

  whiteNoise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  osc.connect(gain);
  gain.connect(ctx.destination);

  whiteNoise.start(now);
  whiteNoise.stop(now + 0.09);
  osc.start(now);
  osc.stop(now + 0.15);
}

// 2. Tiếng Cà Chua / Bánh Kem ném bẹp "BẸP!"
export function playSplatSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(65, now + 0.22);

  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

// 3. Tiếng Bom BÙM nổ rung rinh
export function playBoomSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Sub-bass rung
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

  gain.gain.setValueAtTime(0.8, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

  // Noise nổ
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.6, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.52);
  noise.start(now);
  noise.stop(now + 0.42);
}

// 4. Tiếng Xô Nước Đá dội "ÀO!"
export function playSplashSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.45, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.frequency.exponentialRampToValueAtTime(300, now + 0.4);
  filter.Q.value = 1.8;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.55, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.46);
}

// 5. Tiếng Vịt Vàng Quack "QUÁC QUÁC!"
export function playQuackSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  [0, 0.13].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now + offset);
    osc.frequency.linearRampToValueAtTime(240, now + offset + 0.1);

    gain.gain.setValueAtTime(0.45, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.12);
  });
}

// 6. Tiếng Lò Xo Tưng Tưng "BOING!"
export function playBoingSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(680, now + 0.28);

  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.32);
}

// 7. Tiếng Ớt Cay Xì Khói "XÈO XÈO!"
export function playSizzleSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.35, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(3000, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.36);
}

// 8. Tiếng Cười Cà Khịa / Meme HaHa
export function playLaughSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  [0, 0.1, 0.2].forEach((offset, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450 + idx * 40, now + offset);
    osc.frequency.exponentialRampToValueAtTime(320 + idx * 30, now + offset + 0.08);

    gain.gain.setValueAtTime(0.5, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.09);
  });
}

// Bộ phân phối âm thanh trêu chọc theo soundType
export function playTrollSound(soundType) {
  try {
    switch (soundType) {
      case 'slap':
        playSlapSound();
        break;
      case 'splat':
        playSplatSound();
        break;
      case 'boom':
        playBoomSound();
        break;
      case 'splash':
        playSplashSound();
        break;
      case 'quack':
        playQuackSound();
        break;
      case 'boing':
        playBoingSound();
        break;
      case 'sizzle':
        playSizzleSound();
        break;
      case 'laugh':
        playLaughSound();
        break;
      default:
        playBoingSound();
        break;
    }
  } catch (err) {
    console.warn('[trollSoundSynth] Audio playback error:', err);
  }
}
