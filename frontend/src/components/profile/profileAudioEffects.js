import confetti from 'canvas-confetti';

// Đã tắt toàn bộ âm thanh Web Audio để chống sập / out app
export function playProfileChime() {
  // No-op
}

export function playTactileClickSound() {
  // No-op
}

export function triggerProfileHaptic(pattern = [40, 20, 60]) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
}

export function triggerConfettiBurst() {
  try {
    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#00E5FF', '#FF2A85', '#10FFA0', '#FFFFFF']
    });
  } catch (e) {}
}

