import React from 'react';
import { playTactileClickSound } from '../storyAudioEffects';

/**
 * DualCameraOverlay - Khung ảnh lồng góc Picture-in-Picture kiểu BeReal
 * Cho phép chạm vào để hoán đổi vị trí ảnh chính / ảnh phụ
 * 100% Bootstrap Icons, Rule 7 (< 200 dòng)
 */
export default function DualCameraOverlay({
  secondaryImage,
  onSwap,
  isSwapped = false
}) {
  if (!secondaryImage) return null;

  const handleSwap = (e) => {
    e.stopPropagation();
    playTactileClickSound();
    if (onSwap) onSwap();
  };

  return (
    <div
      onClick={handleSwap}
      className="absolute top-20 left-4 z-20 w-28 h-36 rounded-2xl overflow-hidden border-2 border-white/90 shadow-2xl shadow-black/80 cursor-pointer transition-transform active:scale-95 group"
      title="Chạm để hoán đổi 2 góc nhìn camera"
    >
      <img
        src={secondaryImage}
        alt="Dual selfie view"
        className="w-full h-full object-cover"
      />
      
      {/* Nút hoán đổi nhỏ ở góc */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center text-sm shadow-md">
          <i className="bi bi-arrow-left-right"></i>
        </div>
      </div>

      {/* Huy hiệu BeReal Dual */}
      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-bold text-white font-mono flex items-center gap-1 border border-white/20">
        <i className="bi bi-camera-fill text-[8px] text-purple-400"></i>
        <span>DUAL</span>
      </div>
    </div>
  );
}
