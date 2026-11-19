import React, { useEffect, useState, useCallback, useRef } from 'react';
import { playTrollSound } from './trollSoundSynth';
import { TROLL_ITEMS } from './TrollItemCatalog';
import TrollThreeCanvas from './TrollThreeCanvas';

/**
 * MemeScreenTakeover - Hiệu Ứng Bùng Nổ Thị Giác 3D Toàn Màn Hình Khi Bị Trêu Chọc
 * - WebGL Three.js 3D Projectile bay vút từ độ sâu z: -35 đập thẳng vào mặt kính màn hình
 * - Vỡ tan 120+ hạt vật lý đa chiều và sóng chấn động tỏa tròn
 * - Xuất hiện trên màn hình đúng 3 giây (3000ms) kèm đồng hồ đếm ngược kỹ thuật số
 * - Nút "PHẢN ĐÒN NGAY" với icon sấm sét để đáp trả lập tức
 * - 100% Bootstrap Icons (Rule 5) | Tối ưu < 220 dòng (Rule 7)
 */
export default function MemeScreenTakeover({
  meme,
  senderName = 'Một người bạn',
  senderUser = null,
  quote = '',
  onDismiss,
  onCounterAttack
}) {
  const [scaleUp, setScaleUp] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(3.0);
  const hasImpactedRef = useRef(false);

  // Tìm icon 3D và thông số chuẩn từ catalog nếu payload thiếu
  const catalogItem = TROLL_ITEMS.find((it) => it.id === meme?.id) || meme;
  const itemData = {
    ...catalogItem,
    image3d: meme?.image3d || catalogItem?.image3d,
    particleColor: meme?.particleColor || catalogItem?.particleColor || '#FF2A85',
    soundType: meme?.soundType || catalogItem?.soundType || 'punch'
  };

  // Kích hoạt khi vật phẩm 3D đập trúng mặt kính màn hình
  const handleImpact = useCallback(() => {
    if (hasImpactedRef.current) return;
    hasImpactedRef.current = true;
    setShaking(true);
    playTrollSound(itemData.soundType);
    setTimeout(() => setShaking(false), 450);
  }, [itemData.soundType]);

  useEffect(() => {
    // Hoạt họa hiển thị bảng thông tin
    const tScale = setTimeout(() => setScaleUp(true), 60);

    // Đồng hồ đếm lùi chính xác 3.0 giây
    const startTime = Date.now();
    const durationMs = 3000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (durationMs - elapsed) / 1000);
      setSecondsLeft(remaining);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        if (onDismiss) onDismiss();
      }
    }, 100);

    return () => {
      clearTimeout(tScale);
      clearInterval(interval);
    };
  }, [onDismiss]);

  if (!meme) return null;
  const displayQuote = quote || meme.caption || 'Bị troll bất ngờ chưa bạn êi!';

  return (
    <div
      className={`fixed inset-0 z-[125] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none overflow-hidden font-sans animate-in fade-in duration-200 ${
        shaking ? 'animate-wiggle' : ''
      }`}
      onClick={onDismiss}
    >
      {/* 1. THREE.JS 3D WEBGL CANVAS - VŨ KHÍ 3D PHÓNG TỚI & NỔ BÙNG HẠT */}
      <TrollThreeCanvas item={itemData} onImpact={handleImpact} />

      {/* Ánh sáng tỏa tròn Ambient Glow theo màu vũ khí */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none opacity-30 animate-pulse"
        style={{ backgroundColor: itemData.particleColor }}
      />

      {/* 2. THẺ THÔNG BÁO BỊ TRÊU CHỌC Ở TRỌNG TÂM (STITCH DESIGN TASTE) */}
      <div
        className={`relative z-20 w-full max-w-sm bg-[#0E1015]/90 border border-white/20 rounded-3xl p-6 text-center shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl flex flex-col items-center transition-all duration-300 ${
          scaleUp ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Đồng hồ đếm lùi LED Neon 3.0s ở đỉnh */}
        <div className="absolute -top-3.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FF2A85] via-purple-600 to-[#00E5FF] text-white text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-white/30">
          <i className="bi bi-clock-history animate-spin" />
          <span>Biến mất sau: {secondsLeft.toFixed(1)}s</span>
        </div>

        {/* Nút đóng nhanh góc phải */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Đóng ngay"
        >
          <i className="bi bi-x-lg text-xs" />
        </button>

        {/* Người ném trêu */}
        <div className="flex items-center gap-2 mb-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-[#FF2A85] animate-ping" />
          <span className="text-xs text-neutral-300 font-semibold">
            <b className="text-white font-bold">{senderName}</b> vừa ném trêu bạn!
          </span>
        </div>

        {/* Biểu tượng 3D Ultra-HD của vật phẩm */}
        <div className="relative my-2.5 flex items-center justify-center">
          <div
            className="w-24 h-24 rounded-3xl border-2 flex items-center justify-center p-3 shadow-xl transition-transform hover:scale-110"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: `${itemData.particleColor}60`,
              boxShadow: `0 0 30px ${itemData.particleColor}40`
            }}
          >
            {itemData.image3d ? (
              <img
                src={itemData.image3d}
                alt={itemData.name}
                className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
              />
            ) : (
              <i className={`bi ${itemData.icon || 'bi-lightning-fill'} text-4xl text-white`} />
            )}
          </div>

          <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white text-black font-black text-[10px] tracking-wider uppercase shadow-md whitespace-nowrap">
            {itemData.name}
          </span>
        </div>

        {/* Lời thoại cà khịa */}
        <div className="space-y-1 mt-3">
          <h3 className="text-base font-black text-white tracking-tight leading-snug">
            "{displayQuote}"
          </h3>
          <p className="text-[11px] text-[#00E5FF] font-medium flex items-center justify-center gap-1">
            <i className={`bi ${itemData.icon || 'bi-stars'} text-xs`} />
            <span>Biểu cảm: {itemData.emotion || 'Trêu chọc'}</span>
          </p>
        </div>

        {/* 3. NÚT PHẢN ĐÒN NGAY (COUNTER-ATTACK) */}
        <div className="mt-5 w-full space-y-2">
          <button
            type="button"
            onClick={() => {
              if (onDismiss) onDismiss();
              if (onCounterAttack) {
                onCounterAttack(senderUser || { name: senderName, id: meme.senderId });
              }
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF2A85] via-purple-600 to-[#00E5FF] text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,42,133,0.6)] hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <i className="bi bi-lightning-charge-fill text-sm animate-bounce" />
            <span>PHẢN ĐÒN NGAY!</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Bỏ qua
          </button>
        </div>
      </div>
    </div>
  );
}
