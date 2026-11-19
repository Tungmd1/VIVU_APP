import React, { useEffect, useState, useCallback, useRef } from 'react';
import { playTrollSound } from './trollSoundSynth';
import { TROLL_ITEMS } from './TrollItemCatalog';
import TrollThreeCanvas from './TrollThreeCanvas';

/**
 * MemeScreenTakeover - Trải Nghiệm Chuyển Động WebGL 3D Thuần Khiết Toàn Màn Hình
 * - 100% Thuần Chuyển Động: Không chữ, không đồng hồ đếm thời gian, không nút bấm rườm rà
 * - WebGL Three.js: Vũ khí 3D phóng từ chiều sâu đập nát kính, tạo sóng xung kích & nổ 120+ hạt ánh sáng
 * - Âm thanh Web Audio Synth và hiệu ứng rung giật màn hình
 * - Tự động biến mất êm dịu sau 2.5 giây, hoặc chạm bất kỳ đâu để đóng ngay
 * - Tối ưu < 120 dòng (Rule 7) | 100% Bootstrap Icons (Rule 5)
 */
export default function MemeScreenTakeover({ meme, onDismiss }) {
  const [shaking, setShaking] = useState(false);
  const hasImpactedRef = useRef(false);

  // Tìm icon 3D và thông số màu sắc từ catalog nếu payload thiếu
  const catalogItem = TROLL_ITEMS.find((it) => it.id === meme?.id) || meme;
  const itemData = {
    ...catalogItem,
    image3d: meme?.image3d || catalogItem?.image3d,
    particleColor: meme?.particleColor || catalogItem?.particleColor || '#FF2A85',
    soundType: meme?.soundType || catalogItem?.soundType || 'punch'
  };

  // Kích hoạt khi vũ khí 3D đập trúng mặt kính màn hình
  const handleImpact = useCallback(() => {
    if (hasImpactedRef.current) return;
    hasImpactedRef.current = true;
    setShaking(true);
    playTrollSound(itemData.soundType);
    setTimeout(() => setShaking(false), 450);
  }, [itemData.soundType]);

  useEffect(() => {
    // Tự động đóng êm dịu sau đúng 2.5 giây
    const timer = setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!meme) return null;

  return (
    <div
      className={`fixed inset-0 z-[125] flex items-center justify-center p-0 bg-black/60 backdrop-blur-md select-none overflow-hidden cursor-pointer animate-in fade-in duration-200 ${
        shaking ? 'animate-wiggle' : ''
      }`}
      onClick={onDismiss}
      title="Chạm bất kỳ đâu để đóng"
    >
      {/* 1. THREE.JS 3D WEBGL CANVAS - VŨ KHÍ 3D PHÓNG TỚI & BÙNG NỔ 120+ HẠT */}
      <TrollThreeCanvas item={itemData} onImpact={handleImpact} />

      {/* 2. ÁNH SÁNG TỎA TRÒN AMBIENT GLOW THEO MÀU VŨ KHÍ */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none opacity-40 animate-pulse"
        style={{ backgroundColor: itemData.particleColor }}
      />
    </div>
  );
}
