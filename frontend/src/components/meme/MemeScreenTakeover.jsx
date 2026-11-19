import React, { useEffect, useState } from 'react';
import { playTrollSound } from './trollSoundSynth';

/**
 * MemeScreenTakeover - Hiệu Ứng Bùng Nổ Thị Giác & Âm Thanh Toàn Màn Hình Khi Bị Trêu Chọc
 * - Xuất hiện trên màn hình đối phương ĐÚNG 3 GIÂY (3000ms) kèm đồng hồ đếm ngược
 * - 100% Web Audio API Synth, 100% Bootstrap Icons (Rule 5)
 * - Tối ưu < 450 dòng (Rule 7)
 * - Hiệu ứng riêng biệt: Dép tổ ong vả mặt, Cà chua nổ sốt, Bom nổ BÙM, Xô nước dội lạnh, Ớt siêu cay bốc hỏa...
 * - Nút "🔥 PHẢN ĐÒN NGAY!" để trêu ngược lại lập tức
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

  useEffect(() => {
    // 1. Kích hoạt âm thanh Web Audio Synth tương ứng
    if (meme?.soundType) {
      playTrollSound(meme.soundType);
    } else {
      playTrollSound('boing');
    }

    // 2. Hoạt họa phóng to và rung lắc màn hình
    const tScale = setTimeout(() => setScaleUp(true), 40);
    const tShake = setTimeout(() => setShaking(true), 200);

    // 3. Đếm ngược đúng 3.0 giây (3000ms) rồi tự động đóng
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
      clearTimeout(tShake);
      clearInterval(interval);
    };
  }, [meme, onDismiss]);

  if (!meme) return null;
  const itemId = meme.id || 'honeycomb_slipper';
  const displayQuote = quote || meme.caption || 'Bị troll bất ngờ chưa bạn êi!';

  return (
    <div
      className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl select-none overflow-hidden font-sans animate-in fade-in duration-200"
      onClick={onDismiss}
    >
      {/* 1. HIỆU ỨNG THỊ GIÁC ĐỒ HỌA THEO TỪNG VŨ KHÍ */}

      {/* FX 1: Cà chua nổ sốt văng vương vãi trên kính */}
      {itemId === 'tomato_splat' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-[500px] h-[500px] rounded-full bg-red-600/35 blur-3xl animate-ping" />
          <div className="absolute w-[360px] h-[360px] bg-gradient-to-tr from-red-600 to-rose-500 rounded-full blur-2xl opacity-80" />
          <div className="absolute inset-x-10 top-20 flex justify-around opacity-90 animate-in zoom-in duration-300">
            <div className="w-20 h-32 bg-red-600/90 rounded-full blur-xs rotate-12" />
            <div className="w-28 h-28 bg-red-700/90 rounded-full blur-xs -rotate-45" />
            <div className="w-16 h-40 bg-red-600/90 rounded-full blur-xs rotate-6" />
          </div>
        </div>
      )}

      {/* FX 2: Dép tổ ong bay rung giật màn hình */}
      {itemId === 'honeycomb_slipper' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-96 h-96 rounded-full bg-yellow-500/20 blur-3xl" />
          <div className="absolute text-8xl sm:text-9xl transform -rotate-12 animate-in zoom-in-50 duration-200 drop-shadow-[0_20px_40px_rgba(255,204,0,0.6)]">
            🩴
          </div>
        </div>
      )}

      {/* FX 3: Bom BÙM nổ chớp trắng chói lòa */}
      {itemId === 'dynamite_boom' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="absolute inset-0 bg-white/40 animate-pulse duration-150" />
          <div className="w-[600px] h-[600px] rounded-full bg-orange-600/40 blur-3xl animate-ping" />
          <div className="absolute text-9xl animate-in zoom-in duration-150">
            💥
          </div>
        </div>
      )}

      {/* FX 4: Xô nước đá dội lạnh toát */}
      {itemId === 'ice_water_bucket' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/40 via-blue-600/25 to-transparent backdrop-blur-xs animate-in slide-in-from-top duration-300" />
          <div className="w-[450px] h-[450px] rounded-full bg-cyan-400/30 blur-2xl animate-pulse" />
          <div className="absolute text-8xl top-1/4 animate-bounce">
            🪣
          </div>
        </div>
      )}

      {/* FX 5: Ớt siêu cay bốc hỏa */}
      {itemId === 'super_chili' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="absolute inset-0 border-8 border-red-600/60 shadow-[inset_0_0_80px_rgba(255,0,0,0.6)] animate-pulse" />
          <div className="w-96 h-96 rounded-full bg-red-600/30 blur-3xl" />
          <div className="absolute text-8xl animate-spin-slow">
            🌶️
          </div>
        </div>
      )}

      {/* 2. THẺ THÔNG BÁO BỊ TRÊU CHỌC Ở TRỌNG TÂM */}
      <div
        className={`relative z-20 w-full max-w-sm bg-[#121318]/95 border-2 border-white/20 rounded-3xl p-6 text-center shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col items-center transition-all duration-300 ${
          scaleUp ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        } ${shaking ? 'animate-wiggle' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thanh đếm lùi 3.0s ở đỉnh */}
        <div className="absolute -top-3.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF2A85] to-[#7928CA] text-white text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-white/30">
          <i className="bi bi-clock-history animate-spin" />
          <span>Biến mất sau: {secondsLeft.toFixed(1)}s</span>
        </div>

        {/* Nút tắt góc phải */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Đóng ngay"
        >
          <i className="bi bi-x-lg text-xs" />
        </button>

        {/* Người ném trêu */}
        <div className="flex items-center gap-2 mb-3 mt-1">
          <span className="w-2 h-2 rounded-full bg-[#FF2A85] animate-ping" />
          <span className="text-xs text-neutral-300 font-semibold">
            <b className="text-white font-bold">{senderName}</b> vừa ném trêu bạn!
          </span>
        </div>

        {/* Biểu tượng / Emoji vũ khí cỡ đại */}
        <div className="relative my-2">
          <div className="w-24 h-24 rounded-3xl bg-white/10 border-2 border-white/25 shadow-[0_0_30px_rgba(255,42,133,0.4)] flex items-center justify-center text-6xl transform hover:scale-110 transition-transform">
            <span>{meme.previewEmoji || '💣'}</span>
          </div>
          <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white text-black font-black text-[10px] tracking-wider uppercase shadow-md whitespace-nowrap">
            {meme.name}
          </span>
        </div>

        {/* Lời thoại cà khịa */}
        <div className="space-y-1 mt-4">
          <h3 className="text-base font-black text-white tracking-tight leading-snug">
            "{displayQuote}"
          </h3>
          <p className="text-[11px] text-pink-400 font-medium">
            Biểu cảm: {meme.emotion || 'Trêu chọc'}
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
            <i className="bi bi-arrow-repeat text-base animate-spin" />
            <span>🔥 PHẢN ĐÒN NGAY!</span>
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
