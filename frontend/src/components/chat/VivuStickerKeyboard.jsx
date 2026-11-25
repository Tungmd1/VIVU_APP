import React, { useState, useMemo } from 'react';
import { VIVU_STICKER_PACKS, getStickersByPack } from '../stickers/VivuStickerCatalog';
import { playTrollSound } from '../meme/trollSoundSynth';

/**
 * VivuStickerKeyboard - Bàn Phím Sticker Độc Quyền VIVU Trong Khung Chat
 * - 3 Bộ Sưu Tập: Thỏ Quẩy Bựa, Gấu Bông Pastel Cảm Xúc, Hội Chibi & Cục Thạch
 * - Cơ chế 1-Chạm Gửi Ngay vào cuộc trò chuyện kèm hiệu ứng âm thanh
 * - Giao diện Bento Glassmorphism tối giản, mượt mà
 * - 100% Bootstrap Icons (Rule 5) | Tối ưu < 200 dòng (Rule 7)
 */
export default function VivuStickerKeyboard({ isOpen, onClose, onSelectSticker }) {
  const [activePackId, setActivePackId] = useState('hyper_rabbit');

  const stickers = useMemo(() => {
    return getStickersByPack(activePackId);
  }, [activePackId]);

  if (!isOpen) return null;

  const handleStickerClick = (sticker) => {
    try {
      if (navigator?.vibrate) {
        navigator.vibrate([40]);
      }
    } catch (_) {}

    // Phát âm thanh của sticker
    if (sticker.soundType) {
      playTrollSound(sticker.soundType);
    }

    if (onSelectSticker) {
      onSelectSticker(sticker);
    }
  };

  return (
    <div className="mx-2 mb-2 p-3 bg-[#0D0F16]/96 border border-white/15 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex flex-col space-y-2.5 animate-in slide-in-from-bottom-3 duration-200 z-30 select-none">
      {/* 1. Header Khay Sticker: Tabs Bộ Sưu Tập & Nút đóng */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {VIVU_STICKER_PACKS.map((pack) => {
            const isActive = activePackId === pack.id;
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => setActivePackId(pack.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF2A85] to-[#7928CA] text-white shadow-[0_0_12px_rgba(255,42,133,0.4)]'
                    : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <img
                  src={pack.avatar}
                  alt={pack.name}
                  className="w-5 h-5 object-contain"
                />
                <span className="text-[11px] whitespace-nowrap">{pack.name}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 ml-1"
          title="Đóng khay sticker"
        >
          <i className="bi bi-x-lg text-xs" />
        </button>
      </div>

      {/* 2. Lưới Sticker Độc Quyền VIVU (4 Cột) */}
      <div className="grid grid-cols-4 gap-2 max-h-[220px] overflow-y-auto no-scrollbar p-1">
        {stickers.map((sticker) => {
          return (
            <div
              key={sticker.id}
              onClick={() => handleStickerClick(sticker)}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-90 border border-white/5 hover:border-white/20 transition-all cursor-pointer flex flex-col items-center justify-center group relative overflow-hidden"
              title={sticker.badge || sticker.name}
            >
              {/* Vầng sáng Ambient Glow phía sau khi hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-opacity pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${sticker.particleColor || '#FF2A85'} 0%, transparent 70%)`
                }}
              />

              {/* Vector SVG Sticker */}
              <img
                src={sticker.image}
                alt={sticker.name}
                className="w-16 h-16 sm:w-[72px] sm:h-[72px] object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] group-hover:scale-115 transition-transform duration-200"
                loading="lazy"
              />

              {/* Tên sticker nhỏ xinh */}
              <span className="text-[10px] font-semibold text-neutral-300 group-hover:text-white truncate max-w-full mt-1">
                {sticker.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
