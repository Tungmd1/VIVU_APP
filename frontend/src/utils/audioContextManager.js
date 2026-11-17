/**
 * audioContextManager.js
 * Quản lý Singleton AudioContext duy nhất cho toàn bộ ứng dụng VIVU
 * Ngăn chặn triệt để hiện tượng rò rỉ AudioContext làm sập (crash) trình duyệt trên iOS Safari / Android
 */

let sharedAudioCtx = null;

export function getSharedAudioContext() {
  if (typeof window === 'undefined') return null;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass();
    }

    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }

    return sharedAudioCtx;
  } catch (e) {
    console.warn('[audioContextManager] Lỗi khởi tạo AudioContext:', e.message);
    return null;
  }
}
