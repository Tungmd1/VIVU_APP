import React, { useState, useEffect } from 'react';
import { playTactileClickSound } from '../storyAudioEffects';

/**
 * StoryFullscreenLightbox
 * Chế độ xem ảnh Story toàn màn hình tràn viền (Edge-to-Edge Fullscreen).
 * Hỗ trợ Zoom In/Out, Reset, Pan/Kéo khi zoom và đóng bằng phím ESC.
 * Tuân thủ 100% Bootstrap Icons & Dark Monochrome theme.
 */
export default function StoryFullscreenLightbox({
  imageSrc,
  title,
  filterCss,
  onClose
}) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Lắng nghe phím ESC để đóng nhanh
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleZoomIn = (e) => {
    e?.stopPropagation();
    playTactileClickSound();
    setScale(prev => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = (e) => {
    e?.stopPropagation();
    playTactileClickSound();
    setScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = (e) => {
    e?.stopPropagation();
    playTactileClickSound();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Xử lý kéo thả (Pan) khi ảnh đang phóng to > 1
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-2xl flex items-center justify-center select-none overflow-hidden animate-in fade-in duration-200"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={onClose}
    >
      {/* Nút Đóng & Tiêu đề thanh công cụ phía trên */}
      <div
        className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#10FFA0]/10 border border-[#10FFA0]/30 flex items-center justify-center text-[#10FFA0]">
            <i className="bi bi-arrows-fullscreen text-sm"></i>
          </div>
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-[#10FFA0] font-semibold">
              Toàn màn hình
            </span>
            <p className="text-sm text-white/90 font-medium truncate max-w-[200px] md:max-w-md">
              {title || 'Khoảnh khắc VIVU'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Đóng */}
          <button
            onClick={() => {
              playTactileClickSound();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-[#1A1A1E]/80 border border-white/10 hover:border-white/30 text-white flex items-center justify-center transition-colors active:scale-95 shadow-lg"
            title="Đóng (ESC)"
          >
            <i className="bi bi-x-lg text-base"></i>
          </button>
        </div>
      </div>

      {/* Vùng hiển thị ảnh chính */}
      <div
        className="relative w-full h-full flex items-center justify-center p-2 md:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={imageSrc}
          alt={title || 'Story'}
          className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out pointer-events-none select-none drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            filter: filterCss || 'none'
          }}
          draggable={false}
        />
      </div>

      {/* Thanh công cụ Zoom ở đáy màn hình */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-[#151619]/90 backdrop-blur-md border border-white/15 flex items-center gap-3 shadow-2xl pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleZoomOut}
          disabled={scale <= 1}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-white/5 text-white flex items-center justify-center transition-all active:scale-95"
          title="Thu nhỏ"
        >
          <i className="bi bi-dash text-lg"></i>
        </button>

        <span className="text-xs font-mono font-bold text-white/90 min-w-[45px] text-center">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          disabled={scale >= 3.5}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-white/5 text-white flex items-center justify-center transition-all active:scale-95"
          title="Phóng to"
        >
          <i className="bi bi-plus text-lg"></i>
        </button>

        {scale > 1 && (
          <button
            onClick={handleResetZoom}
            className="px-2.5 py-1 rounded-full bg-[#10FFA0]/10 hover:bg-[#10FFA0]/20 text-[#10FFA0] text-xs font-mono font-medium flex items-center gap-1 transition-all"
            title="Đặt lại zoom"
          >
            <i className="bi bi-arrow-counterclockwise text-xs"></i>
            <span>1:1</span>
          </button>
        )}
      </div>
    </div>
  );
}
