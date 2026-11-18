import React, { useRef, useState, useEffect } from 'react';
import { playTactileClickSound } from '../storyAudioEffects';

/**
 * StoryMusicStickerOverlay - Nhãn dán nhạc kéo thả tự do (Free Drag & Drop)
 * - Tự do di chuyển nhãn dán khắp ảnh bằng cảm ứng (Touch) hoặc chuột (Mouse)
 * - Tự động giới hạn trong khung ảnh (16% <= x <= 84%, 12% <= y <= 82%)
 * - Thanh công cụ đáy cố định: 3 kiểu nhãn dán + Nút [↺ Đặt lại] tâm + Nút [⚙️ Tùy chọn]
 * Rule 5 (100% Bootstrap Icons), Rule 7 (< 300 dòng)
 */
export default function StoryMusicStickerOverlay({
  selectedSong,
  musicStickerStyle = 'VINYL',
  onChangeMusicStickerStyle,
  musicStickerPosition = { x: 50, y: 70 },
  onChangeMusicStickerPosition,
  isPlayingMusic,
  onTogglePlaySong,
  onOpenMusicOptions,
  onOpenMusicPicker
}) {
  const [isDragging, setIsDragging] = useState(false);
  const activePositionRef = useRef(musicStickerPosition);

  useEffect(() => {
    activePositionRef.current = musicStickerPosition;
  }, [musicStickerPosition]);

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

  // Xoay vòng kiểu nhãn dán khi chạm nhanh (tap)
  const handleCycleStyle = () => {
    playTactileClickSound();
    if (!onChangeMusicStickerStyle) return;
    const styles = ['VINYL', 'ALBUM_CARD', 'EQUALIZER'];
    const nextIdx = (styles.indexOf(musicStickerStyle) + 1) % styles.length;
    onChangeMusicStickerStyle(styles[nextIdx]);
  };

  // Đặt lại vị trí tâm đáy ban đầu
  const handleResetPosition = () => {
    playTactileClickSound();
    const defaultPos = { x: 50, y: 70 };
    activePositionRef.current = defaultPos;
    if (onChangeMusicStickerPosition) {
      onChangeMusicStickerPosition(defaultPos);
    }
  };

  // Bắt đầu kéo thả (Pointer Down)
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (e.target.closest('button')) return;

    if (e.cancelable) e.preventDefault();
    e.stopPropagation();

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    const startPosX = activePositionRef.current?.x ?? 50;
    const startPosY = activePositionRef.current?.y ?? 70;
    let hasMoved = false;

    const container = e.currentTarget.closest('.story-canvas-root') || document.body;
    const rect = container.getBoundingClientRect();
    const containerW = rect.width || 380;
    const containerH = rect.height || 680;

    setIsDragging(true);

    const onPointerMove = (moveEvt) => {
      if (moveEvt.cancelable) moveEvt.preventDefault();
      moveEvt.stopPropagation();

      const deltaX = moveEvt.clientX - startPointerX;
      const deltaY = moveEvt.clientY - startPointerY;
      const dist = Math.hypot(deltaX, deltaY);

      if (dist > 4) {
        hasMoved = true;
      }

      const deltaPercentX = (deltaX / containerW) * 100;
      const deltaPercentY = (deltaY / containerH) * 100;

      // Giới hạn an toàn trong khung ảnh (16% <= x <= 84%, 12% <= y <= 82%)
      const clampedX = Math.max(16, Math.min(84, startPosX + deltaPercentX));
      const clampedY = Math.max(12, Math.min(82, startPosY + deltaPercentY));

      const newPos = {
        x: Math.round(clampedX * 10) / 10,
        y: Math.round(clampedY * 10) / 10
      };

      activePositionRef.current = newPos;

      if (onChangeMusicStickerPosition) {
        onChangeMusicStickerPosition(newPos);
      }
    };

    const onPointerUp = (upEvt) => {
      upEvt.stopPropagation();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      setIsDragging(false);

      // Nếu chỉ chạm nhanh mà không kéo -> Xoay vòng kiểu
      if (!hasMoved) {
        handleCycleStyle();
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const currentX = musicStickerPosition?.x ?? 50;
  const currentY = musicStickerPosition?.y ?? 70;

  return (
    <>
      {/* 1. LỚP NHÃN DÁN NHẠC DI CHUYỂN TỰ DO TRÊN TOÀN KHUNG ẢNH */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden select-none">
        <div
          style={{
            position: 'absolute',
            left: `${currentX}%`,
            top: `${currentY}%`,
            transform: 'translate(-50%, -50%)',
            touchAction: 'none'
          }}
          onPointerDown={handlePointerDown}
          className={`pointer-events-auto transition-transform ${
            isDragging
              ? 'scale-105 cursor-grabbing shadow-[0_0_25px_rgba(255,42,133,0.6)] ring-2 ring-[#FF2A85]/80 rounded-full'
              : 'cursor-grab active:scale-95'
          }`}
          title="Chạm giữ & Kéo thả đến bất kỳ vị trí nào trên ảnh • Chạm nhanh để đổi kiểu"
        >
          {/* KIỂU ĐĨA THAN XOAY TRÒN (VINYL) */}
          {musicStickerStyle === 'VINYL' && (
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-white/20 shadow-2xl">
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
          )}

          {/* KIỂU KHUNG BÌA ALBUM (ALBUM_CARD) */}
          {musicStickerStyle === 'ALBUM_CARD' && (
            <div className="flex items-center gap-3 p-2 px-3 rounded-2xl bg-black/85 backdrop-blur-xl border border-cyan-400/40 shadow-[0_8px_32px_rgba(0,229,255,0.25)]">
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
          )}

          {/* KIỂU SÓNG ÂM EQUALIZER (EQUALIZER) */}
          {musicStickerStyle === 'EQUALIZER' && (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-xl border border-emerald-400/50 shadow-[0_4px_24px_rgba(16,255,160,0.25)]">
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
          )}
        </div>
      </div>

      {/* 2. THANH CÔNG CỤ ĐÁY CỐ ĐỊNH: 3 KIỂU + ĐẶT LẠI (RESET) + TÙY CHỌN */}
      <div className="relative z-30 mx-4 mb-4 pointer-events-auto flex items-center justify-center select-none">
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

          {/* Nút Đặt lại vị trí tâm (Reset Position) */}
          <button
            type="button"
            onClick={handleResetPosition}
            className="px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            title="Đặt lại vị trí ban đầu"
          >
            <i className="bi bi-arrow-counterclockwise"></i>
            <span>Đặt lại</span>
          </button>

          {/* Nút Mở Modal Tùy chọn chi tiết */}
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
    </>
  );
}
