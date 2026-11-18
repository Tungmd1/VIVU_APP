import React from 'react';
import { playTactileClickSound } from '../storyAudioEffects';

/**
 * StoryMusicStickerDisplay - Hiển thị nhãn dán nhạc sống động trên màn hình xem Story
 * Hỗ trợ 3 kiểu nhãn dán: Đĩa than xoay tròn (VINYL), Khung bìa Album (ALBUM_CARD), Sóng âm Equalizer (EQUALIZER)
 * Rule 5 (100% Bootstrap Icons), Rule 7 (< 200 dòng)
 */
export default function StoryMusicStickerDisplay({
  music,
  stickerStyle = 'VINYL',
  isPlayingMusic,
  onToggleMusic
}) {
  if (!music) return null;

  const handleToggle = (e) => {
    e.stopPropagation();
    playTactileClickSound();
    if (onToggleMusic) onToggleMusic();
  };

  return (
    <div className="absolute bottom-28 left-4 right-4 z-30 pointer-events-none flex justify-center animate-fadeIn select-none">
      <div className="pointer-events-auto">
        
        {/* 1. KIỂU ĐĨA THAN XOAY TRÒN (VINYL) */}
        {stickerStyle === 'VINYL' && (
          <div
            onClick={handleToggle}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 shadow-2xl active:scale-95 transition-all cursor-pointer group"
            title={isPlayingMusic ? "Chạm để tạm dừng nhạc" : "Chạm để phát nhạc"}
          >
            <div
              className={`relative w-10 h-10 rounded-full bg-[#111] border-2 border-white/20 shadow-lg flex items-center justify-center shrink-0 ${isPlayingMusic ? 'animate-spin' : ''}`}
              style={{ animationDuration: '4s' }}
            >
              <div className="absolute inset-1 rounded-full border border-white/10"></div>
              <div className="absolute inset-2 rounded-full border border-dashed border-white/15"></div>
              <div className="w-4.5 h-4.5 rounded-full overflow-hidden border border-white/50 z-10 shadow">
                <img src={music.coverUrl || music.cover} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute w-1.5 h-1.5 rounded-full bg-white z-20 shadow"></div>
            </div>
            <div className="text-left min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white truncate max-w-[130px] leading-tight">{music.title}</span>
                <i className="bi bi-patch-check-fill text-[10px] text-cyan-400"></i>
              </div>
              <span className="text-white/60 text-[10px] truncate max-w-[110px] block leading-tight">{music.artist}</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#FF2A85] text-white flex items-center justify-center text-xs transition-colors shrink-0">
              <i className={`bi ${isPlayingMusic ? 'bi-pause-fill text-amber-300' : 'bi-play-fill text-white'}`}></i>
            </div>
          </div>
        )}

        {/* 2. KIỂU KHUNG BÌA ALBUM (ALBUM_CARD) */}
        {stickerStyle === 'ALBUM_CARD' && (
          <div
            onClick={handleToggle}
            className="flex items-center gap-3 p-2 px-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-cyan-400/40 shadow-[0_8px_32px_rgba(0,229,255,0.25)] active:scale-95 transition-all cursor-pointer group"
            title={isPlayingMusic ? "Chạm để tạm dừng nhạc" : "Chạm để phát nhạc"}
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-md shrink-0 border border-white/20">
              <img src={music.coverUrl || music.cover} alt="" className="w-full h-full object-cover" />
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
              <p className="font-bold text-xs text-white truncate max-w-[125px] leading-tight">{music.title}</p>
              <p className="text-white/60 text-[10px] truncate max-w-[105px] leading-tight">{music.artist}</p>
              <div className="flex items-center gap-1 mt-0.5 text-[9px] text-cyan-300 font-mono">
                <i className="bi bi-music-note-beamed"></i>
                <span>Apple Music</span>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF2A85] to-[#7928CA] text-white flex items-center justify-center text-xs shadow-md shrink-0 group-hover:scale-105 transition-transform">
              <i className={`bi ${isPlayingMusic ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
            </div>
          </div>
        )}

        {/* 3. KIỂU SÓNG ÂM EQUALIZER (EQUALIZER) */}
        {stickerStyle === 'EQUALIZER' && (
          <div
            onClick={handleToggle}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-xl border border-emerald-400/50 shadow-[0_4px_24px_rgba(16,255,160,0.25)] active:scale-95 transition-all cursor-pointer group"
            title={isPlayingMusic ? "Chạm để tạm dừng nhạc" : "Chạm để phát nhạc"}
          >
            <div className="flex items-end gap-1 h-3.5 px-0.5 shrink-0">
              <span className={`w-1 rounded-full bg-emerald-400 ${isPlayingMusic ? 'h-3.5 animate-pulse' : 'h-1.5'}`}></span>
              <span className={`w-1 rounded-full bg-cyan-400 ${isPlayingMusic ? 'h-2.5 animate-pulse delay-75' : 'h-2'}`}></span>
              <span className={`w-1 rounded-full bg-teal-300 ${isPlayingMusic ? 'h-3.5 animate-pulse delay-150' : 'h-2.5'}`}></span>
              <span className={`w-1 rounded-full bg-emerald-300 ${isPlayingMusic ? 'h-2 animate-pulse delay-200' : 'h-1'}`}></span>
            </div>
            <div className="text-left min-w-0 pr-1">
              <span className="font-bold text-xs text-white truncate max-w-[140px] block leading-tight">{music.title}</span>
              <span className="text-emerald-300 text-[10px] truncate max-w-[110px] block leading-tight">{music.artist}</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-bold shrink-0 group-hover:scale-105 transition-transform">
              <i className={`bi ${isPlayingMusic ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
