import React from 'react';
import { playTactileClickSound } from '../storyAudioEffects';

/**
 * StoryMusicStickerOverlay - Hiển thị nhãn dán nhạc theo 3 phong cách (Đĩa than, Bìa Album, Sóng âm)
 * kèm thanh chuyển nhanh 3 kiểu và nút mở bảng tùy chọn chi tiết.
 * Rule 5 (100% Bootstrap Icons), Rule 7 (< 250 dòng)
 */
export default function StoryMusicStickerOverlay({
  selectedSong,
  musicStickerStyle = 'VINYL',
  onChangeMusicStickerStyle,
  isPlayingMusic,
  onTogglePlaySong,
  onOpenMusicOptions,
  onOpenMusicPicker
}) {
  if (!selectedSong) {
    return (
      <div className="relative z-30 mx-4 mb-6 pointer-events-auto self-center">
        <button
          type="button"
          onClick={() => {
            playTactileClickSound();
            if (onOpenMusicPicker) onOpenMusicPicker();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/20 hover:border-[#FF2A85]/60 text-white text-xs shadow-xl transition-all active:scale-95 group cursor-pointer"
          title="Thêm nhạc nền vào Story"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF2A85] to-[#7928CA] flex items-center justify-center text-white text-[10px] group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,42,133,0.5)]">
            <i className="bi bi-music-note-beamed"></i>
          </div>
          <span className="font-semibold text-white/90 group-hover:text-white">Thêm nhạc nền</span>
          <i className="bi bi-plus text-xs text-white/60 group-hover:text-white"></i>
        </button>
      </div>
    );
  }

  // Xoay vòng kiểu khi chạm vào nhãn dán
  const handleCycleStyle = () => {
    playTactileClickSound();
    if (!onChangeMusicStickerStyle) return;
    const styles = ['VINYL', 'ALBUM_CARD', 'EQUALIZER'];
    const nextIdx = (styles.indexOf(musicStickerStyle) + 1) % styles.length;
    onChangeMusicStickerStyle(styles[nextIdx]);
  };

  return (
    <div className="relative z-30 mx-4 mb-5 pointer-events-auto flex flex-col items-center space-y-2.5">
      {/* 1. HIỂN THỊ KIỂU ĐĨA THAN XOAY TRÒN (VINYL) */}
      {musicStickerStyle === 'VINYL' && (
        <div
          onClick={handleCycleStyle}
          className="relative group cursor-pointer flex flex-col items-center"
          title="Chạm vào nhãn dán để đổi kiểu tiếp theo"
        >
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 shadow-2xl active:scale-95 transition-all">
            <div
              className={`relative w-10 h-10 rounded-full bg-[#111] border-2 border-white/20 shadow-lg flex items-center justify-center shrink-0 ${isPlayingMusic ? 'animate-spin' : ''}`}
              style={{ animationDuration: '4s' }}
            >
              <div className="absolute inset-1 rounded-full border border-white/10"></div>
              <div className="absolute inset-2 rounded-full border border-dashed border-white/15"></div>
              <div className="w-4.5 h-4.5 rounded-full overflow-hidden border border-white/50 z-10 shadow">
                <img src={selectedSong.coverUrl || selectedSong.cover} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute w-1.5 h-1.5 rounded-full bg-white z-20 shadow"></div>
            </div>
            <div className="text-left min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white truncate max-w-[130px] leading-tight">{selectedSong.title}</span>
                <i className="bi bi-patch-check-fill text-[10px] text-cyan-400"></i>
              </div>
              <span className="text-white/60 text-[10px] truncate max-w-[110px] block leading-tight">{selectedSong.artist}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playTactileClickSound();
                onTogglePlaySong();
              }}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-[#FF2A85] text-white flex items-center justify-center text-xs transition-colors shrink-0 cursor-pointer"
              title={isPlayingMusic ? "Tạm dừng" : "Phát"}
            >
              <i className={`bi ${isPlayingMusic ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
            </button>
          </div>
        </div>
      )}

      {/* 2. HIỂN THỊ KIỂU KHUNG BÌA ALBUM (ALBUM_CARD) */}
      {musicStickerStyle === 'ALBUM_CARD' && (
        <div
          onClick={handleCycleStyle}
          className="relative group cursor-pointer"
          title="Chạm vào nhãn dán để đổi kiểu tiếp theo"
        >
          <div className="flex items-center gap-3 p-2 px-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-cyan-400/40 shadow-[0_8px_32px_rgba(0,229,255,0.2)] active:scale-95 transition-all">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-md shrink-0 border border-white/20">
              <img src={selectedSong.coverUrl || selectedSong.cover} alt="" className="w-full h-full object-cover" />
              {isPlayingMusic && (
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-3 bg-cyan-300 animate-pulse rounded-full"></span>
                    <span className="w-0.5 h-2 bg-pink-300 animate-pulse delay-75 rounded-full"></span>
                    <span className="w-0.5 h-3 bg-purple-300 animate-pulse delay-150 rounded-full"></span>
                  </div>
                </div>
              )}
            </div>
            <div className="text-left min-w-0 pr-1">
              <p className="font-bold text-xs text-white truncate max-w-[125px] leading-tight">{selectedSong.title}</p>
              <p className="text-white/60 text-[10px] truncate max-w-[105px] leading-tight">{selectedSong.artist}</p>
              <div className="flex items-center gap-1 mt-0.5 text-[9px] text-cyan-300 font-mono">
                <i className="bi bi-music-note-beamed"></i>
                <span>Apple Music</span>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playTactileClickSound();
                onTogglePlaySong();
              }}
              className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF2A85] to-[#7928CA] text-white flex items-center justify-center text-xs shadow-md shrink-0 cursor-pointer"
            >
              <i className={`bi ${isPlayingMusic ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
            </button>
          </div>
        </div>
      )}

      {/* 3. HIỂN THỊ KIỂU SÓNG ÂM EQUALIZER (EQUALIZER) */}
      {musicStickerStyle === 'EQUALIZER' && (
        <div
          onClick={handleCycleStyle}
          className="relative group cursor-pointer"
          title="Chạm vào nhãn dán để đổi kiểu tiếp theo"
        >
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-xl border border-emerald-400/50 shadow-[0_4px_24px_rgba(16,255,160,0.25)] active:scale-95 transition-all">
            <div className="flex items-end gap-1 h-3.5 px-0.5 shrink-0">
              <span className={`w-1 rounded-full bg-emerald-400 ${isPlayingMusic ? 'h-3.5 animate-pulse' : 'h-1.5'}`}></span>
              <span className={`w-1 rounded-full bg-cyan-400 ${isPlayingMusic ? 'h-2.5 animate-pulse delay-75' : 'h-2'}`}></span>
              <span className={`w-1 rounded-full bg-teal-300 ${isPlayingMusic ? 'h-3.5 animate-pulse delay-150' : 'h-2.5'}`}></span>
              <span className={`w-1 rounded-full bg-emerald-300 ${isPlayingMusic ? 'h-2 animate-pulse delay-200' : 'h-1'}`}></span>
            </div>
            <div className="text-left min-w-0 pr-1">
              <span className="font-bold text-xs text-white truncate max-w-[140px] block leading-tight">{selectedSong.title}</span>
              <span className="text-emerald-300 text-[10px] truncate max-w-[110px] block leading-tight">{selectedSong.artist}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playTactileClickSound();
                onTogglePlaySong();
              }}
              className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-bold shrink-0 cursor-pointer"
            >
              <i className={`bi ${isPlayingMusic ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
            </button>
          </div>
        </div>
      )}

      {/* THANH CHỌN NHANH 3 KIỂU NHÃN DÁN + NÚT TÙY CHỌN CHI TIẾT */}
      <div className="flex items-center gap-1 bg-black/85 backdrop-blur-xl p-1 rounded-full border border-white/20 shadow-2xl">
        <button
          type="button"
          onClick={() => {
            playTactileClickSound();
            if (onChangeMusicStickerStyle) onChangeMusicStickerStyle('VINYL');
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
            musicStickerStyle === 'VINYL'
              ? 'bg-gradient-to-r from-[#FF2A85] to-[#7928CA] text-white shadow-md'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Đĩa than xoay tròn"
        >
          <i className="bi bi-disc"></i>
          <span>Đĩa than</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTactileClickSound();
            if (onChangeMusicStickerStyle) onChangeMusicStickerStyle('ALBUM_CARD');
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
            musicStickerStyle === 'ALBUM_CARD'
              ? 'bg-gradient-to-r from-[#00E5FF] to-[#7928CA] text-white shadow-md'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Khung bìa album"
        >
          <i className="bi bi-file-earmark-music"></i>
          <span>Bìa Album</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTactileClickSound();
            if (onChangeMusicStickerStyle) onChangeMusicStickerStyle('EQUALIZER');
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
            musicStickerStyle === 'EQUALIZER'
              ? 'bg-gradient-to-r from-[#10FFA0] to-[#00E5FF] text-black shadow-md font-black'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Sóng âm Equalizer"
        >
          <i className="bi bi-soundwave"></i>
          <span>Sóng âm</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTactileClickSound();
            if (onOpenMusicOptions) onOpenMusicOptions();
          }}
          className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 text-white/90 hover:text-white flex items-center justify-center text-[10px] transition-all cursor-pointer ml-0.5"
          title="Mở bảng tùy chọn nhạc chi tiết"
        >
          <i className="bi bi-gear-fill"></i>
        </button>
      </div>
    </div>
  );
}
