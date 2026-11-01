import React, { useState } from 'react';

/**
 * BumpUserAvatar - Ảnh đại diện độc lập phong cách Cyberpunk Pink & Blue
 * - Khung tròn Cyber Dark #0a0e1c, viền đôi ánh kim border-white/20, hover viền Hồng Neon #FF2A85
 * - Chấm định vị Hồng Neon #FF2A85 biểu thị trạng thái đang phát sóng GPS
 * - 100% Bootstrap Icons, Rule 7 (< 450 dòng)
 */
export default function BumpUserAvatar({
  userAvatar,
  userName = 'Bạn',
  onClick
}) {
  const [imageError, setImageError] = useState(false);
  const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250';
  const displaySrc = (!imageError && userAvatar) ? userAvatar : defaultAvatar;
  const initial = userName ? userName.trim().charAt(0).toUpperCase() : 'V';

  return (
    <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-40 pointer-events-auto select-none font-sans">
      <button
        type="button"
        onClick={onClick}
        title="Bấm để mở Hồ sơ cá nhân"
        aria-label="Mở hồ sơ cá nhân"
        className="group relative block p-0 rounded-full bg-transparent border-0 outline-none active:scale-95 transition-transform duration-150 cursor-pointer"
      >
        {/* Khung tròn chuẩn Cyberpunk với viền ánh kim và bóng đổ sâu */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] bg-[#0a0e1c] border-2 border-white/20 group-hover:border-[#FF2A85] shadow-[0_8px_32px_rgba(0,0,0,0.8)] group-hover:shadow-[0_0_24px_rgba(255,42,133,0.5)] transition-all duration-200">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#14141e] flex items-center justify-center">
            {displaySrc && !imageError ? (
              <img
                src={displaySrc}
                alt={userName}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xl text-[#FF2A85] bg-[#FF2A85]/10">
                {initial}
              </div>
            )}
          </div>

          {/* Chấm trạng thái Hồng Neon GPS */}
          <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#FF2A85] border-2 border-[#0a0e1c] shadow-[0_0_8px_#FF2A85]" title="GPS Đang phát sóng trực tiếp"></div>
        </div>
      </button>
    </div>
  );
}
