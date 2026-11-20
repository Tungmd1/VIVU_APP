/**
 * audioContextManager.js
 * Quản lý âm thanh VIVU - Đã vô hiệu hóa hoàn toàn âm thanh Web Audio
 * để ngăn chặn triệt để hiện tượng văng (crash / reload / out app) trên iOS Safari & Android.
 */

export function getSharedAudioContext() {
  // Trả về null an toàn, không bao giờ khởi tạo AudioContext trong DOM
  return null;
}
