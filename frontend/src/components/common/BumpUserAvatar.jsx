import React, { useState, useEffect } from 'react';
import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';

/**
 * BumpUserAvatar - Ảnh đại diện độc lập phong cách Cyberpunk Pink & Blue
 * - Đồng bộ thời gian thực: Hiển thị 100% Avatar thật của người dùng
 * - Khi chưa thêm ảnh đại diện: 100% hiển thị Avatar hình người nền trắng (White Silhouette)
 * - Tuyệt đối không dùng avatar AI mockup (Dicebear, Unsplash)
 * - 100% Bootstrap Icons, Rule 7 (< 450 dòng)
 */
export default function BumpUserAvatar({
  userAvatar,
  userName = 'Bạn',
  userCode = '',
  onClick
}) {
  const [imageError, setImageError] = useState(false);

  // Khi userAvatar thay đổi từ props ngoài, reset lỗi để nạp ảnh mới ngay lập tức
  useEffect(() => {
    setImageError(false);
  }, [userAvatar]);

  const hasRealAvatar = Boolean(
    userAvatar &&
    !imageError &&
    !userAvatar.includes('unsplash.com') &&
    !userAvatar.includes('dicebear.com')
  );

  return (
    <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-40 pointer-events-auto select-none font-sans">
      <button
        type="button"
        onClick={onClick}
        title="Bấm để mở Tùy chọn Hồ sơ & Đăng Story"
        aria-label="Tùy chọn tài khoản"
        className="group relative block p-0 rounded-full bg-transparent border-0 outline-none active:scale-95 transition-transform duration-150 cursor-pointer"
      >
        {/* Khung tròn chuẩn Cyberpunk với viền ánh kim và bóng đổ sâu */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2.5px] bg-[#0a0e1c] border-2 border-white/20 group-hover:border-[#FF2A85] shadow-[0_8px_32px_rgba(0,0,0,0.8)] group-hover:shadow-[0_0_24px_rgba(255,42,133,0.5)] transition-all duration-200">
          <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
            {hasRealAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <img
                src={DEFAULT_WHITE_PERSON_AVATAR}
                alt="Chưa có avatar"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Chấm trạng thái Hồng Neon GPS */}
          <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#FF2A85] border-2 border-[#0a0e1c] shadow-[0_0_8px_#FF2A85]" title="GPS Đang phát sóng trực tiếp"></div>
        </div>
      </button>
    </div>
  );
}
