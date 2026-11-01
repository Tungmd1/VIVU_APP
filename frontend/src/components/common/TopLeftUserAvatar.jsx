import React, { useState } from 'react';

/**
 * TopLeftUserAvatar - Ảnh đại diện người dùng ở góc trái màn hình trên nền trong suốt
 * - Nền phía sau hoàn toàn trong suốt, không có card hay mảng màu đè lên trang
 * - Cắt hình tỉ lệ 1:1 hoàn hảo, có chấm báo online phát sáng
 * - Xử lý fallback an toàn khi link ảnh lỗi hoặc chưa có ảnh
 * - Hỗ trợ đầy đủ phím Enter/Space, aria-label, focus visible
 * - Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 12 (Resend Dark Monochrome)
 */
export default function TopLeftUserAvatar({
  userAvatar,
  userName = 'Người dùng VIVU',
  userCode,
  isOnline = true,
  onClick
}) {
  const [imageError, setImageError] = useState(false);
  const displaySrc = (!imageError && userAvatar) ? userAvatar : null;

  return (
    <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-40 pointer-events-auto select-none">
      <button
        type="button"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        aria-label={`Hồ sơ của ${userName}${userCode ? ` (${userCode})` : ''} - Bấm để mở menu`}
        className="group relative flex items-center gap-2.5 p-1 rounded-full bg-transparent border-0 outline-none focus-visible:ring-2 focus-visible:ring-white/80 active:scale-95 transition-all cursor-pointer"
      >
        {/* Khung avatar tròn hoàn hảo trên nền trong suốt */}
        <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full p-[2px] bg-transparent border-2 border-white/30 group-hover:border-accent group-hover:scale-105 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          {displaySrc ? (
            <img
              src={displaySrc}
              alt={userName}
              onError={() => setImageError(true)}
              className="w-full h-full rounded-full object-cover bg-black/40"
            />
          ) : (
            /* Avatar nền trắng, icon người xám nhạt */
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-neutral-400 shadow-inner">
              <i className="bi bi-person-fill text-xl"></i>
            </div>
          )}

          {/* Chấm trực tuyến (Online Dot) */}
          {isOnline && (
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black animate-pulse"
              title="Đang trực tuyến"
            />
          )}
        </div>

        {/* Nhãn tên & mã hiển thị tinh tế trên Desktop (vẫn giữ nền trong suốt với text shadow) */}
        <div className="hidden md:flex flex-col items-start text-left pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          <span className="text-xs font-extrabold text-white tracking-tight group-hover:text-accent transition-colors flex items-center gap-1">
            <span>{userName}</span>
            <i className="bi bi-chevron-down text-[9px] text-white/60 group-hover:text-white transition-colors"></i>
          </span>
          {userCode && (
            <span className="text-[10px] text-neutral-300 font-mono tracking-tight">
              {userCode}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
