import React, { useState, useEffect, useMemo } from 'react';
import { getPersonalityRadar } from '../../utils/personalityAnalytics';

/**
 * CinematicPersonaDeck - Giao diện Hồ Sơ Cá Nhân Thế Hệ Mới
 * Tập trung 100% vào Ngoại hình & Tính cách đo từ hành vi thực tế
 * Không dùng emoji, 100% Bootstrap Icons
 */
export default function CinematicPersonaDeck({
  user,
  currentUserId,
  userDistanceKm = null,
  userCity = 'Đà Nẵng',
  isSelf = false,
  onClose,
  onDirectChat,
  onStartNavigation,
  onStartCall,
  onTriggerBump,
  onEditProfile,
  onOpenMemeTroll
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showSheet, setShowSheet] = useState(false);
  const [activeTab, setActiveTab] = useState('radar'); // 'radar' | 'bio'

  // Thu thập danh sách ảnh profile
  const photoGallery = useMemo(() => {
    const list = [];
    if (user?.avatar) list.push(user.avatar);
    if (Array.isArray(user?.photos) && user.photos.length > 0) {
      user.photos.forEach(p => {
        if (p && !list.includes(p)) list.push(p);
      });
    }
    // Nếu chưa có ảnh phụ, bổ sung ảnh outfit chất lượng cao mẫu
    if (list.length === 1) {
      list.push(
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600'
      );
    }
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'];
  }, [user]);

  // Lấy dữ liệu phân tích tính cách thực tế
  const personality = useMemo(() => {
    return getPersonalityRadar(user?.id || currentUserId);
  }, [user?.id, currentUserId]);

  const displayName = user?.name || user?.displayName || 'Thành viên VIVU';
  const userCode = user?.userCode || user?.id?.substring(0, 6)?.toUpperCase() || 'VU-8899';
  const statusNote = user?.status || user?.customStatus || 'Đang vi vu dạo phố quanh đây';

  // Điều hướng xem ảnh dạng Story Tap (nửa trái xem trước, nửa phải xem tiếp)
  const handlePhotoTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width / 2) {
      setPhotoIndex(prev => (prev > 0 ? prev - 1 : photoGallery.length - 1));
    } else {
      setPhotoIndex(prev => (prev < photoGallery.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col justify-between overflow-hidden select-none animate-fadeIn font-sans">
      {/* 1. KHU VỰC 70% ẢNH TOÀN MÀN HÌNH (Cinematic Full-bleed Viewport) */}
      <div className="relative w-full h-[72vh] sm:h-[75vh] cursor-pointer" onClick={handlePhotoTap}>
        {/* Ảnh nền chất lượng cao */}
        <img
          src={photoGallery[photoIndex]}
          alt={displayName}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Lớp phủ Gradient mờ tinh tế */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b11] via-transparent to-black/60 pointer-events-none" />

        {/* Thanh Story Progress Bar trên đỉnh */}
        <div className="absolute top-3 left-4 right-4 z-20 flex gap-1.5 pointer-events-none">
          {photoGallery.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 rounded-full bg-white/25 overflow-hidden backdrop-blur-xs">
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  idx === photoIndex ? 'w-full bg-gradient-to-r from-[#FF2A85] to-[#00E5FF]' : idx < photoIndex ? 'w-full' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Top Header Actions */}
        <div className="absolute top-7 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
          {/* Nút Quay lại / Đóng */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onClose) onClose();
            }}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
          >
            <i className="bi bi-chevron-left text-lg" />
          </button>

          {/* Badge Khoảng cách GPS thực tế */}
          <div className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-xs font-semibold text-white/90 shadow-lg">
            <i className="bi bi-geo-alt-fill text-[#FF2A85]" />
            <span>{isSelf ? 'Vị trí của bạn' : userDistanceKm ? `Cách bạn ${Number(userDistanceKm).toFixed(1)} km` : `Tại ${userCity}`}</span>
          </div>

          {/* Nút Phụ / Ném Meme hoặc Cài đặt */}
          {!isSelf ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenMemeTroll) onOpenMemeTroll(user);
              }}
              className="w-10 h-10 rounded-full bg-[#FF2A85]/80 hover:bg-[#FF2A85] backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg shadow-[#FF2A85]/30"
              title="Ném Meme Troll bạn bè"
            >
              <i className="bi bi-fire text-lg" />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onEditProfile) onEditProfile();
              }}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
            >
              <i className="bi bi-gear-fill text-lg" />
            </button>
          )}
        </div>

        {/* Thông tin nhanh nổi trên ảnh (Overlay Info) */}
        <div className="absolute bottom-4 left-5 right-5 z-20 pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
              {displayName}
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-[11px] font-bold">
              {userCode}
            </span>
          </div>

          {/* Danh hiệu Phong cách sống từ hành vi */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF2A85]/20 border border-[#FF2A85]/40 text-[#FF529D] text-xs font-bold mb-2 shadow-sm">
            <i className="bi bi-lightning-charge-fill" />
            <span>{personality?.title || 'Chúa Hề Thần Tốc'}</span>
          </div>

          {/* Dòng trạng thái Vibe */}
          <p className="text-sm text-white/80 line-clamp-2 drop-shadow-sm font-medium">
            "{statusNote}"
          </p>
        </div>
      </div>

      {/* 2. KHU VỰC TÍNH CÁCH THỰC TẾ & KẾT NỐI VIVU (Interaction Sheet 28vh) */}
      <div className="relative flex-1 bg-[#090b11] border-t border-white/10 px-5 pt-3 pb-5 flex flex-col justify-between z-30">
        {/* Tab Switcher: Biểu đồ Radar vs Giới thiệu */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeTab === 'radar'
                  ? 'bg-gradient-to-r from-[#FF2A85] to-[#00E5FF] text-white shadow-md'
                  : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              <i className="bi bi-radar mr-1.5" />
              Năng Lượng Tính Cách
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bio')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeTab === 'bio'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              <i className="bi bi-person-badge mr-1.5" />
              Về Tôi
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowSheet(!showSheet)}
            className="text-[11px] text-white/60 hover:text-white flex items-center gap-1"
          >
            <span>{showSheet ? 'Thu gọn' : 'Xem chi tiết'}</span>
            <i className={`bi ${showSheet ? 'bi-chevron-down' : 'bi-chevron-up'}`} />
          </button>
        </div>

        {/* Nội dung Tab */}
        {activeTab === 'radar' ? (
          /* Biểu đồ 5 trục năng lượng tính cách hành vi */
          <div className="grid grid-cols-5 gap-2 py-2">
            <div className="text-center p-1.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-white/50 block mb-0.5">Tốc Độ Rep</span>
              <span className="text-sm font-black text-[#00E5FF]">{personality.speed}%</span>
              <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
                <div className="bg-[#00E5FF] h-full" style={{ width: `${personality.speed}%` }} />
              </div>
            </div>

            <div className="text-center p-1.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-white/50 block mb-0.5">Độ Nhây Troll</span>
              <span className="text-sm font-black text-[#FF2A85]">{personality.troll}%</span>
              <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
                <div className="bg-[#FF2A85] h-full" style={{ width: `${personality.troll}%` }} />
              </div>
            </div>

            <div className="text-center p-1.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-white/50 block mb-0.5">Cục Súc</span>
              <span className="text-sm font-black text-amber-400">{personality.blunt}%</span>
              <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
                <div className="bg-amber-400 h-full" style={{ width: `${personality.blunt}%` }} />
              </div>
            </div>

            <div className="text-center p-1.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-white/50 block mb-0.5">Ấm Áp</span>
              <span className="text-sm font-black text-emerald-400">{personality.warmth}%</span>
              <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
                <div className="bg-emerald-400 h-full" style={{ width: `${personality.warmth}%` }} />
              </div>
            </div>

            <div className="text-center p-1.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-white/50 block mb-0.5">Vi Vu Phố</span>
              <span className="text-sm font-black text-purple-400">{personality.spatial}%</span>
              <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
                <div className="bg-purple-400 h-full" style={{ width: `${personality.spatial}%` }} />
              </div>
            </div>
          </div>
        ) : (
          /* Giới thiệu sở thích & phong cách */
          <div className="py-2 text-xs text-white/80 leading-relaxed space-y-1">
            <p><i className="bi bi-music-note-beamed text-[#FF2A85] mr-1.5" /> Thích nghe nhạc Indie, Lofi lúc vi vu dạo phố đêm.</p>
            <p><i className="bi bi-compass text-[#00E5FF] mr-1.5" /> Thường la cà các quán cafe acoustic và view ngắm hoàng hôn.</p>
          </div>
        )}

        {/* 4 NÚT HÀNH ĐỘNG KẾT NỐI TÍNH NĂNG CỐT LÕI VIVU */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          {!isSelf ? (
            <>
              {/* Nút 1: Nhắn tin 1-1 */}
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  if (onDirectChat) onDirectChat(user);
                }}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#FF2A85] to-[#FF529D] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF2A85]/30 active:scale-95 transition-all"
              >
                <i className="bi bi-chat-dots-fill text-sm" />
                <span>Nhắn tin</span>
              </button>

              {/* Nút 2: Định vị trên Bản đồ 3D */}
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  if (onStartNavigation) onStartNavigation(user);
                }}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/40 text-[#00E5FF] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <i className="bi bi-pin-map-fill text-sm" />
                <span>Bản đồ 3D</span>
              </button>

              {/* Nút 3: Gọi điện thoại */}
              <button
                type="button"
                onClick={() => {
                  if (onStartCall) onStartCall(user);
                }}
                className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-emerald-400 flex items-center justify-center text-base active:scale-95 transition-all"
                title="Gọi thoại trực tiếp"
              >
                <i className="bi bi-telephone-fill" />
              </button>

              {/* Nút 4: Chạm máy Bump kết bạn */}
              <button
                type="button"
                onClick={() => {
                  if (onTriggerBump) onTriggerBump(user);
                }}
                className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-amber-400 flex items-center justify-center text-base active:scale-95 transition-all"
                title="Chạm máy Bump kết bạn"
              >
                <i className="bi bi-broadcast-pin" />
              </button>
            </>
          ) : (
            <>
              {/* Nút dành cho chính mình: Đổi ảnh & Sửa hồ sơ */}
              <button
                type="button"
                onClick={onEditProfile}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF2A85] to-[#00E5FF] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF2A85]/20 active:scale-95 transition-all"
              >
                <i className="bi bi-camera-fill text-sm" />
                <span>Thêm góc ảnh mới</span>
              </button>
              <button
                type="button"
                onClick={onEditProfile}
                className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <i className="bi bi-pencil-square text-sm" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

