import React from 'react';
import { playTactileClickSound } from '../storyAudioEffects';

/**
 * MUSIC_STICKER_STYLES - Danh sách 3 kiểu nhãn dán nhạc hiển thị trên Story
 */
export const MUSIC_STICKER_STYLES = [
  {
    id: 'VINYL',
    name: 'Đĩa than xoay tròn',
    tag: 'Classic Vinyl',
    icon: 'bi-disc',
    gradient: 'from-[#FF2A85] to-[#7928CA]',
    desc: 'Đĩa than cổ điển xoay tròn 360° theo nhạc, tâm đĩa là ảnh bìa album'
  },
  {
    id: 'ALBUM_CARD',
    name: 'Khung bìa Album',
    tag: 'Album Glass Card',
    icon: 'bi-file-earmark-music-fill',
    gradient: 'from-[#00E5FF] to-[#7928CA]',
    desc: 'Khung kính mờ sang trọng với ảnh bìa sắc nét, tên bài hát và cột sóng âm'
  },
  {
    id: 'EQUALIZER',
    name: 'Sóng âm Equalizer',
    tag: 'Neon Waveform',
    icon: 'bi-soundwave',
    gradient: 'from-[#10FFA0] to-[#00E5FF]',
    desc: 'Dải sóng âm neon tối giản hiện đại nhảy theo nhịp điệu bài hát'
  }
];

/**
 * MusicStyleOptionsModal - Bảng tùy chọn phong cách nhãn dán nhạc & quản lý bài hát
 * Rule 5 (100% Bootstrap Icons), Rule 7 (< 450 dòng)
 */
export default function MusicStyleOptionsModal({
  isOpen,
  onClose,
  selectedSong,
  currentStyle = 'VINYL',
  onSelectStyle,
  onOpenMusicPicker,
  onRemoveSong,
  isPlayingMusic,
  onTogglePlayMusic
}) {
  if (!isOpen || !selectedSong) return null;

  return (
    <div className="fixed inset-0 z-[85] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none font-sans animate-fadeIn">
      <div className="w-full max-w-md bg-[#0F121C] border border-white/15 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-white">
        
        {/* HEADER MODAL */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#131724]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF2A85] to-[#7928CA] flex items-center justify-center text-white text-sm shadow-md">
              <i className="bi bi-music-note-list"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Tùy Chọn Nhãn Dán Nhạc</h3>
              <p className="text-[11px] text-white/50">Tùy biến phong cách hiển thị trên Story</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Đóng"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>
        </div>

        {/* THÔNG TIN BÀI HÁT ĐANG CHỌN */}
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/60 border border-white/10 shadow-inner">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg shrink-0 border border-white/10">
                <img
                  src={selectedSong.coverUrl || selectedSong.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120'}
                  alt={selectedSong.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playTactileClickSound();
                    onTogglePlayMusic();
                  }}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-base hover:bg-black/60 transition-colors cursor-pointer"
                  title={isPlayingMusic ? "Tạm dừng" : "Phát thử"}
                >
                  <i className={`bi ${isPlayingMusic ? 'bi-pause-fill text-amber-300' : 'bi-play-fill text-white'}`}></i>
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-white truncate">{selectedSong.title}</p>
                <p className="text-xs text-white/60 truncate">{selectedSong.artist}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] text-emerald-300 font-medium">Apple Music 100% bản quyền</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <button
                type="button"
                onClick={() => {
                  playTactileClickSound();
                  onOpenMusicPicker();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Chọn bài hát khác"
              >
                <i className="bi bi-arrow-repeat text-xs"></i>
                <span>Đổi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playTactileClickSound();
                  onRemoveSong();
                  onClose();
                }}
                className="w-8 h-8 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white flex items-center justify-center text-xs transition-all cursor-pointer"
                title="Gỡ bỏ bài hát"
              >
                <i className="bi bi-trash3-fill"></i>
              </button>
            </div>
          </div>
        </div>

        {/* DANH SÁCH 3 PHONG CÁCH NHÃN DÁN */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[46vh]">
          <p className="text-xs font-bold uppercase tracking-wider text-white/60 px-1">
            Chọn kiểu hiển thị trên Story
          </p>

          <div className="space-y-3">
            {MUSIC_STICKER_STYLES.map((style) => {
              const isSelected = currentStyle === style.id;
              return (
                <div
                  key={style.id}
                  onClick={() => {
                    playTactileClickSound();
                    onSelectStyle(style.id);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-white/10 border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.25)]'
                      : 'bg-black/40 border-white/10 hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${style.gradient} flex items-center justify-center text-white text-lg shadow-md group-hover:scale-105 transition-transform`}>
                        <i className={`bi ${style.icon}`}></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{style.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
                            {style.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/60 mt-0.5 leading-snug">{style.desc}</p>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/40'
                          : 'border border-white/30 text-transparent'
                      }`}>
                        <i className="bi bi-check-lg text-sm font-black"></i>
                      </div>
                    </div>
                  </div>

                  {/* MINI DEMO PREVIEW BÊN TRONG THẺ */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-center">
                    {style.id === 'VINYL' && (
                      <div className="flex items-center gap-3 py-1 px-3 rounded-full bg-black/60 border border-white/10">
                        <div className={`w-8 h-8 rounded-full bg-black border-2 border-white/20 flex items-center justify-center shadow-md relative ${isPlayingMusic ? 'animate-spin' : ''}`}>
                          <div className="w-4 h-4 rounded-full overflow-hidden border border-white/40">
                            <img src={selectedSong.coverUrl || selectedSong.cover} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute inset-0 rounded-full border border-dashed border-white/20"></div>
                        </div>
                        <span className="text-xs font-bold text-white truncate max-w-[150px]">{selectedSong.title}</span>
                      </div>
                    )}

                    {style.id === 'ALBUM_CARD' && (
                      <div className="flex items-center gap-2.5 py-1 px-3 rounded-xl bg-gradient-to-r from-black/80 to-purple-950/60 border border-cyan-400/40 shadow-md">
                        <img src={selectedSong.coverUrl || selectedSong.cover} alt="" className="w-7 h-7 rounded-lg object-cover shadow" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-white truncate max-w-[120px]">{selectedSong.title}</p>
                          <p className="text-[10px] text-white/50 truncate max-w-[100px]">{selectedSong.artist}</p>
                        </div>
                        <div className="flex items-end gap-0.5 h-3 pl-1">
                          <span className="w-0.5 h-3 bg-cyan-400 animate-pulse rounded-full"></span>
                          <span className="w-0.5 h-2 bg-pink-400 animate-pulse delay-75 rounded-full"></span>
                          <span className="w-0.5 h-3.5 bg-purple-400 animate-pulse delay-150 rounded-full"></span>
                        </div>
                      </div>
                    )}

                    {style.id === 'EQUALIZER' && (
                      <div className="flex items-center gap-2 py-1 px-3.5 rounded-full bg-black/70 border border-emerald-400/40 shadow-md">
                        <div className="flex items-end gap-1 h-3.5">
                          <span className="w-1 h-3 bg-emerald-400 animate-pulse rounded-full"></span>
                          <span className="w-1 h-2 bg-cyan-400 animate-pulse delay-100 rounded-full"></span>
                          <span className="w-1 h-3.5 bg-teal-300 animate-pulse delay-200 rounded-full"></span>
                          <span className="w-1 h-1.5 bg-emerald-300 animate-pulse delay-300 rounded-full"></span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-200 truncate max-w-[150px]">
                          {selectedSong.title} - {selectedSong.artist}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="p-4 border-t border-white/10 bg-[#131724] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              onOpenMusicPicker();
            }}
            className="text-xs text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <i className="bi bi-search"></i>
            <span>Tìm kiếm bài khác</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              onClose();
            }}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[#FF2A85] to-[#7928CA] text-white text-xs font-bold shadow-lg shadow-pink-500/25 active:scale-95 hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Áp dụng kiểu này</span>
            <i className="bi bi-check2 text-sm font-bold"></i>
          </button>
        </div>

      </div>
    </div>
  );
}
