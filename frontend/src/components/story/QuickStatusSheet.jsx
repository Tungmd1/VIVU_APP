import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import MusicPickerModal from './MusicPickerModal';
import { storyAudioPlayer } from '../../data/trendingSongs';
import { playTactileClickSound } from './storyAudioEffects';

/**
 * QuickStatusSheet - Bottom Sheet Chuyên Biệt Cập Nhật Trạng Thái Suy Nghĩ
 * - Nhập suy nghĩ ngắn 60 ký tự
 * - Gắn bài hát online hát thật 100% từ Apple Music
 * - Hiển thị trực tiếp dạng Bong bóng suy nghĩ trên Ghim Giọt Nước
 * - 100% Bootstrap Icons (Rule 5), < 450 dòng (Rule 7)
 */
export default function QuickStatusSheet({
  isOpen,
  onClose,
  userCustomStatus = '',
  userCustomSong = null,
  userAvatar = '',
  onSelectStatus
}) {
  const [customInput, setCustomInput] = useState('');
  const [selectedSong, setSelectedSong] = useState(null);
  const [isMusicPickerOpen, setIsMusicPickerOpen] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCustomInput(userCustomStatus || '');
      setSelectedSong(userCustomSong || null);
      setIsPlayingPreview(false);
    } else {
      storyAudioPlayer.stop();
      setIsPlayingPreview(false);
      setIsMusicPickerOpen(false);
    }
  }, [isOpen, userCustomStatus, userCustomSong]);

  if (!isOpen) return null;

  const handleTogglePlaySong = (e) => {
    e.stopPropagation();
    if (!selectedSong) return;
    const isPlaying = storyAudioPlayer.togglePlay(selectedSong, { loop: true });
    setIsPlayingPreview(isPlaying);
  };

  const handleRemoveSong = (e) => {
    e.stopPropagation();
    storyAudioPlayer.stop();
    setIsPlayingPreview(false);
    setSelectedSong(null);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    playTactileClickSound();
    storyAudioPlayer.stop();
    setIsPlayingPreview(false);

    if (onSelectStatus) {
      onSelectStatus(customInput.trim(), selectedSong);
    }

    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.8 },
        zIndex: 9999
      });
    } catch {}

    onClose();
  };

  const handleClearStatus = () => {
    playTactileClickSound();
    storyAudioPlayer.stop();
    setIsPlayingPreview(false);
    setCustomInput('');
    setSelectedSong(null);

    if (onSelectStatus) {
      onSelectStatus('', null);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-md flex items-end justify-center p-0 sm:p-4 select-none font-sans animate-in fade-in duration-200">
      {/* Vùng bấm ngoài để đóng */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Khung Sheet chính */}
      <div className="relative z-10 w-full max-w-md bg-[#0F121C]/95 border border-white/15 rounded-t-[32px] sm:rounded-3xl p-5 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl space-y-4 animate-in slide-in-from-bottom-8 duration-300 text-white">
        
        {/* Thanh gạt đỉnh */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-1" />

        {/* Header Sheet */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.4)]"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#10FFA0] border-2 border-[#0F121C]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>Trạng Thái Suy Nghĩ</span>
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              </h3>
              <p className="text-[11px] text-white/50">Hiển thị nổi trên Ghim Giọt Nước Bản đồ</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>
        </div>

        {/* KHUNG NHẬP SUY NGHĨ & BÀI HÁT */}
        <form onSubmit={handleSave} className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3 shadow-inner">
          {/* Ô nhập suy nghĩ */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-white/60 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <i className="bi bi-chat-quote-fill text-[#00E5FF]"></i>
                <span>Bạn đang nghĩ gì thế?</span>
              </span>
              <span className={`font-mono ${customInput.length > 50 ? 'text-[#FF2A85] font-bold' : 'text-white/40'}`}>
                {customInput.length}/60
              </span>
            </div>
            <input
              type="text"
              maxLength={60}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Chia sẻ suy nghĩ ngắn của bạn..."
              className="w-full bg-[#151619] border border-white/10 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/30 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none transition-all placeholder-white/30"
              autoFocus
            />
          </div>

          {/* Thẻ hiển thị bài hát đã chọn */}
          {selectedSong ? (
            <div className="p-2.5 rounded-xl bg-[#1A1A24] border border-[#FF2A85]/40 flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/20 shadow-xs">
                  <img src={selectedSong.cover} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleTogglePlaySong}
                    className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all cursor-pointer"
                    title={isPlayingPreview ? 'Dừng phát' : 'Nghe thử'}
                  >
                    <i className={`bi ${isPlayingPreview ? 'bi-pause-fill text-[#10FFA0]' : 'bi-play-fill text-white'} text-sm`}></i>
                  </button>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                    <i className="bi bi-music-note-beamed text-[#FF2A85] text-[10px]"></i>
                    <span className="truncate">{selectedSong.title}</span>
                  </div>
                  <p className="text-[10px] text-white/50 truncate">{selectedSong.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMusicPickerOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Đổi
                </button>
                <button
                  type="button"
                  onClick={handleRemoveSong}
                  className="w-6 h-6 rounded-lg bg-white/10 hover:bg-rose-500/30 text-white/60 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                  title="Gỡ bài hát"
                >
                  <i className="bi bi-x text-sm"></i>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsMusicPickerOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-white/20 hover:border-[#FF2A85]/60 hover:bg-[#FF2A85]/5 text-white/70 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <i className="bi bi-music-note-beamed text-[#FF2A85] text-sm group-hover:scale-110 transition-transform"></i>
              <span>Gắn Bài Hát Yêu Thích (Apple Music Hát Thật)</span>
            </button>
          )}

          {/* Cặp nút hành động: Gỡ & Lưu */}
          <div className="flex gap-2 pt-1">
            {(userCustomStatus || userCustomSong) && (
              <button
                type="button"
                onClick={handleClearStatus}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-white/60 hover:text-rose-300 font-bold text-xs transition-colors cursor-pointer"
                title="Xóa trạng thái hiện tại"
              >
                Gỡ bỏ
              </button>
            )}
            <button
              type="submit"
              disabled={!customInput.trim() && !selectedSong}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#10FFA0] hover:brightness-110 disabled:opacity-40 text-[#08202E] font-bold text-xs shadow-[0_0_16px_rgba(0,229,255,0.4)] active:scale-98 transition-all cursor-pointer"
            >
              Lưu Lên Bản Đồ
            </button>
          </div>
        </form>

      </div>

      {/* Sub-Modal: Chọn Nhạc Apple Music Hát Thật */}
      {isMusicPickerOpen && (
        <MusicPickerModal
          isOpen={isMusicPickerOpen}
          onClose={() => setIsMusicPickerOpen(false)}
          selectedSong={selectedSong}
          onSelectSong={(song) => {
            setSelectedSong(song);
            setIsMusicPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

