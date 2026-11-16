import React, { useEffect, useState } from 'react';
import { playChibiSound, getChibiMascotById, getChibiDataUrl } from '../../data/chibiMascotData';

/**
 * MemeScreenTakeover - Hiệu Ứng Bùng Nổ Thị Giác Toàn Màn Hình Khi Bị Trêu Chọc
 * 100% Native Graphics (Canvas / SVG / CSS FX), Web Audio Synth, 100% Bootstrap Icons
 * Hỗ trợ 6 chiêu thức độc bản: Cà chua nổ sốt, Dép lào rung màn hình, Còi hơi shockwave,
 * Phun sương nước mờ kính, Mưa tiền rơi, Popcat combo hit
 * Kèm nút 'BẮN TRẢ NGAY!' (Revenge) để đối kháng tức thì!
 */
export default function MemeScreenTakeover({
  meme,
  senderName = 'Một người bạn',
  senderUser = null,
  onDismiss,
  onCounterAttack
}) {
  const [scaleUp, setScaleUp] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [waterCleaned, setWaterCleaned] = useState(false);

  useEffect(() => {
    // Phát âm thanh khi nổ hiệu ứng
    if (meme?.soundType) {
      playChibiSound(meme.soundType);
    }

    const t1 = setTimeout(() => setScaleUp(true), 40);
    const t2 = setTimeout(() => setShaking(true), 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [meme]);

  // Bộ tổng hợp âm thanh Web Audio Synth đa tần số
  const playVisceralAudio = (type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'splat') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(360, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);
      } else if (type === 'bonk') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(750, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.65, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'airhorn') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(466, ctx.currentTime);
        osc.frequency.setValueAtTime(587, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.48);
      } else if (type === 'spray') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);
      } else if (type === 'cash') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(920, ctx.currentTime);
        osc.frequency.setValueAtTime(1380, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(1840, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.45, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.32);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1300, ctx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      }
    } catch {}
  };

  if (!meme) return null;
  const prankId = meme.id || 'tomato_splat';

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg select-none overflow-hidden transition-all duration-300 font-sans"
      onClick={onDismiss}
    >
      {/* 1. HIỆU ỨNG THỊ GIÁC ĐỒ HỌA GỐC (NATIVE FX LAYERS) */}

      {/* FX 1: Cà chua nổ sốt văng vương vãi trên kính */}
      {prankId === 'tomato_splat' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-96 h-96 rounded-full bg-red-600/30 blur-2xl animate-ping" />
          <div className="absolute w-[320px] h-[320px] bg-gradient-to-tr from-red-600 to-rose-500 rounded-full blur-xl opacity-80" />
          {/* Vết văng sốt cà chua loang lổ */}
          <div className="absolute inset-x-12 top-20 flex justify-around opacity-90">
            <div className="w-16 h-28 bg-red-600 rounded-full blur-xs rotate-12" />
            <div className="w-24 h-24 bg-red-700 rounded-full blur-xs -rotate-45" />
            <div className="w-14 h-36 bg-red-600 rounded-full blur-xs rotate-6" />
          </div>
        </div>
      )}

      {/* FX 2: Dép lào thần chưởng gõ rung màn hình */}
      {prankId === 'slipper_throw' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-[450px] h-[450px] rounded-full bg-[#00E5FF]/20 blur-3xl animate-pulse" />
          <div className="absolute text-[120px] text-[#00E5FF] rotate-[-25deg] animate-bounce drop-shadow-[0_0_35px_#00E5FF]">
            <i className="bi bi-send-fill" />
          </div>
        </div>
      )}

      {/* FX 3: Còi hơi phát sóng xung kích chớp nháy */}
      {prankId === 'airhorn_blast' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-full h-full border-8 border-amber-400/50 animate-ping" />
          <div className="w-80 h-80 rounded-full bg-amber-500/30 blur-3xl animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-amber-500/10" />
        </div>
      )}

      {/* FX 4: Phun sương nước làm mờ kính */}
      {prankId === 'water_spray' && (
        <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${
          waterCleaned ? 'opacity-0 backdrop-blur-none' : 'opacity-95 backdrop-blur-2xl bg-cyan-950/40'
        }`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-72 h-72 rounded-full bg-cyan-400/20 blur-2xl" />
          </div>
        </div>
      )}

      {/* FX 5: Cơn mưa tiền rơi rộn rã */}
      {prankId === 'cash_rain' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 text-emerald-400 text-4xl animate-bounce">
            <i className="bi bi-cash-stack" />
          </div>
          <div className="absolute top-20 right-16 text-emerald-300 text-5xl animate-pulse">
            <i className="bi bi-cash" />
          </div>
          <div className="absolute bottom-28 left-20 text-emerald-400 text-4xl animate-bounce">
            <i className="bi bi-cash-stack" />
          </div>
          <div className="absolute bottom-20 right-24 text-emerald-300 text-5xl animate-pulse">
            <i className="bi bi-cash" />
          </div>
        </div>
      )}

      {/* 2. KHUNG NỘI DUNG CHÍNH (CARD MEME) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 max-w-sm w-full bg-[#11131A]/95 border-2 border-white/20 rounded-3xl p-6 text-center text-white shadow-[0_0_60px_rgba(0,0,0,0.95)] transition-all duration-500 transform ${
          scaleUp ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        } ${shaking ? 'animate-wiggle' : ''}`}
      >
        {/* Nút đóng góc phải */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#8E8E93] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <i className="bi bi-x-lg text-xs" />
        </button>

        {/* Banner người gửi */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-white mb-4">
          <i className="bi bi-broadcast text-[#FF2A85] animate-ping" />
          <span>{senderName} vừa ném trêu bạn!</span>
        </div>

        {/* Khối Icon / Chibi Mascot Nổi Bật */}
        <div className="relative mx-auto w-36 h-36 rounded-3xl p-1 bg-gradient-to-tr from-[#FF2A85] via-purple-500 to-[#00E5FF] shadow-[0_0_35px_rgba(255,42,133,0.5)] flex items-center justify-center mb-4">
          <div className="w-full h-full rounded-[22px] bg-[#161922] p-2 flex items-center justify-center text-5xl text-white overflow-hidden">
            {meme.chibiDataUrl ? (
              <img src={meme.chibiDataUrl} alt={meme.name} className="w-full h-full object-contain animate-bounce" />
            ) : (
              <i className={`bi ${meme.icon || 'bi-lightning-charge-fill'}`} style={{ color: meme.color || '#FF2A85' }} />
            )}
          </div>
          <span className="absolute -bottom-2.5 px-3 py-0.5 rounded-full bg-white text-black font-black text-[10px] tracking-wider uppercase shadow-md">
            {meme.name}
          </span>
        </div>

        {/* Lời thoại nhây trêu ngươi */}
        <div className="space-y-1.5 mt-5">
          <h3 className="text-lg font-black text-white tracking-tight">
            "{meme.caption || meme.reactionText || 'Bị troll rồi nha cưng!'}"
          </h3>
          <p className="text-xs text-[#8E8E93]">
            {meme.subtext || 'Đã cộng +1 điểm Độ Nhây vào chỉ số tính cách!'}
          </p>
        </div>

        {/* Tùy chọn đặc thù: Nút lau kính khi bị xịt nước */}
        {prankId === 'water_spray' && !waterCleaned && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setWaterCleaned(true)}
              className="px-4 py-1.5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs hover:bg-cyan-400/30 transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
            >
              <i className="bi bi-wind" />
              <span>Gạt nước lau kính</span>
            </button>
          </div>
        )}

        {/* 3. CỤM HÀNH ĐỘNG: BẮN TRẢ NGAY HOẶC ĐÓNG */}
        <div className="mt-6 space-y-2.5">
          {/* NÚT BẮN TRẢ NGAY (REVENGE / COUNTER-ATTACK) */}
          <button
            type="button"
            onClick={() => {
              onDismiss();
              if (onCounterAttack) {
                onCounterAttack(senderUser || { name: senderName, id: senderUser?.id });
              }
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF2A85] via-[#FF539A] to-[#00E5FF] text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,42,133,0.5)] hover:opacity-95 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <i className="bi bi-arrow-repeat text-base" />
            <span>BẮN TRẢ NGAY! (PHẢN CÔNG)</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Bỏ qua
          </button>
        </div>

      </div>
    </div>
  );
}
