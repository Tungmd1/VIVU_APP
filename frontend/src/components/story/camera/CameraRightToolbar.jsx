import React from 'react';
import { playTactileClickSound } from '../storyAudioEffects';

/**
 * CameraRightToolbar - Cột Công Cụ Bên Phải Chuẩn 100% Ảnh Instagram
 * - Hiển thị chữ chú thích bên trái + icon tròn bên phải
 * - Tạo [Aa] • Boomerang [∞] • Hiệu ứng [✿] • Mũi tên mở rộng [⌄]
 * - Danh sách mở rộng: Nhạc [♫], Nhãn dán [☺]
 * Rule 5 (100% Bootstrap Icons), Rule 7 (< 200 dòng)
 */
export default function CameraRightToolbar({
  onSwitchToTextMode,
  isDualCam,
  onToggleDualCam,
  selectedFilter,
  onNextFilter,
  isToolbarExpanded,
  onToggleExpand,
  selectedSong,
  onOpenMusicPicker,
  onOpenStickerPicker
}) {
  return (
    <div className="absolute right-3.5 top-20 z-30 flex flex-col items-end gap-4 pointer-events-auto select-none">
      {/* Nút 1: Tạo [Aa] */}
      <button
        type="button"
        onClick={() => {
          playTactileClickSound();
          if (onSwitchToTextMode) onSwitchToTextMode();
        }}
        className="group flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all"
        title="Tạo chữ / Trạng thái"
      >
        <span className="text-[12px] text-white/95 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Tạo</span>
        <div className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black shadow-lg">
          <span className="font-serif font-bold text-base leading-none">Aa</span>
        </div>
      </button>

      {/* Nút 2: Boomerang [∞] */}
      <button
        type="button"
        onClick={() => {
          playTactileClickSound();
          if (onToggleDualCam) onToggleDualCam();
        }}
        className="group flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all"
        title="Boomerang"
      >
        <span className="text-[12px] text-white/95 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Boomerang</span>
        <div className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center shadow-lg transition-all ${
          isDualCam
            ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.6)]'
            : 'bg-black/45 border-white/20 text-white group-hover:bg-white group-hover:text-black'
        }`}>
          <i className="bi bi-infinity text-lg leading-none"></i>
        </div>
      </button>

      {/* Nút 3: Hiệu ứng [✿] */}
      <button
        type="button"
        onClick={() => {
          playTactileClickSound();
          if (onNextFilter) onNextFilter();
        }}
        className="group flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all"
        title="Hiệu ứng"
      >
        <span className="text-[12px] text-white/95 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Hiệu ứng</span>
        <div className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black shadow-lg">
          <i className="bi bi-flower1 text-lg leading-none"></i>
        </div>
      </button>

      {/* Danh sách mở rộng: Nhạc MP3 & Sticker */}
      {isToolbarExpanded && (
        <>
          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              if (onOpenMusicPicker) onOpenMusicPicker();
            }}
            className="group flex items-center gap-2.5 cursor-pointer animate-in fade-in duration-200 active:scale-95 transition-all"
            title="Gắn nhạc MP3"
          >
            <span className="text-[12px] text-white/95 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] truncate max-w-[80px]">
              {selectedSong ? selectedSong.title : 'Nhạc'}
            </span>
            <div className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center shadow-lg transition-all ${
              selectedSong
                ? 'bg-[#FF2A85] text-white border-[#FF2A85] shadow-[0_0_14px_rgba(255,42,133,0.6)] animate-pulse'
                : 'bg-black/45 border-white/20 text-white group-hover:bg-white group-hover:text-black'
            }`}>
              <i className="bi bi-music-note-beamed text-base leading-none"></i>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              if (onOpenStickerPicker) onOpenStickerPicker();
            }}
            className="group flex items-center gap-2.5 cursor-pointer animate-in fade-in duration-200 active:scale-95 transition-all"
            title="Nhãn dán"
          >
            <span className="text-[12px] text-white/95 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Nhãn dán</span>
            <div className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black shadow-lg">
              <i className="bi bi-emoji-smile text-base leading-none"></i>
            </div>
          </button>
        </>
      )}

      {/* Nút Mũi tên mở rộng [⌄] / [⌃] */}
      <button
        type="button"
        onClick={() => {
          playTactileClickSound();
          if (onToggleExpand) onToggleExpand();
        }}
        className="w-7 h-7 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white cursor-pointer active:scale-90 transition-all mr-1.5"
        title={isToolbarExpanded ? "Thu gọn" : "Mở rộng"}
      >
        <i className={`bi ${isToolbarExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} text-xs`}></i>
      </button>
    </div>
  );
}

