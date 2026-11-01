import React, { useState } from 'react';

/**
 * GuestProfileModal - Modal xem hồ sơ cá nhân khách dạng thẻ Tinder Card
 * Mở khi người dùng click vào giọt nước hoặc avatar của bất kỳ ai trên Bản đồ
 * Hỗ trợ Photo Carousel, Story Bars, Bio, Sở thích, Nhắn tin, Kết bạn và Chỉ đường
 * Chuẩn Resend Glassmorphism, 100% Bootstrap Icons
 */
export default function GuestProfileModal({
  isOpen,
  onClose,
  profile,
  onDirectChat,
  onToggleFriend,
  onStartNavigation,
  onOpenMemeTroll,
  isFriend = false
}) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!isOpen || !profile) return null;

  const displayName = profile.hostName || profile.name || 'Người dùng VIVU';
  const displayAvatar = profile.hostAvatar || profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600';
  const age = profile.age ? `${profile.age} tuổi` : '';
  const bio = profile.bio || profile.description || '';
  
  // Bộ ảnh cá nhân thực tế của người dùng
  const photos = Array.isArray(profile.photos) && profile.photos.length > 0
    ? profile.photos
    : (displayAvatar ? [displayAvatar] : []);

  const handlePrev = (e) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const distanceText = profile.distanceText || profile.liveDistance || profile.distance || 'Cách bạn 450m';

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Card Tinder chính */}
      <div className="relative z-10 w-full max-w-sm bg-[#0E0E10] border border-white/20 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-white space-y-4 animate-in zoom-in-95 duration-200">
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 active:scale-90 transition-all"
        >
          <i className="bi bi-x-lg text-sm"></i>
        </button>

        {/* Khối ảnh lớn Photo Carousel */}
        <div className="relative aspect-[3/4] max-h-[360px] w-full overflow-hidden bg-[#151619] group">
          <img
            src={photos[activePhotoIdx]}
            alt=""
            className="w-full h-full object-cover transition-all duration-300"
          />

          {/* Dải story bar ở đỉnh ảnh */}
          <div className="absolute top-3 inset-x-3 z-20 flex items-center gap-1.5">
            {photos.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  idx === activePhotoIdx
                    ? 'bg-white shadow-[0_0_8px_white]'
                    : idx < activePhotoIdx
                    ? 'bg-white/70'
                    : 'bg-white/25'
                }`}
              />
            ))}
          </div>

          {/* Vùng cảm ứng chia 2 nửa: Chạm trái lùi, chạm phải tiến */}
          <div className="absolute inset-0 z-10 flex">
            <div className="w-1/2 h-full cursor-pointer" onClick={handlePrev} />
            <div className="w-1/2 h-full cursor-pointer" onClick={handleNext} />
          </div>

          {/* Lớp gradient tối ở đáy ảnh */}
          <div className="absolute inset-x-0 bottom-0 z-15 pt-20 pb-4 px-4 bg-gradient-to-t from-[#0E0E10] via-[#0E0E10]/80 to-transparent flex flex-col justify-end pointer-events-none">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {displayName}, <span className="font-normal text-white/90">{age}</span>
              </h2>
              <i className="bi bi-patch-check-fill text-white text-base" title="Đã xác thực"></i>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8E8E93] mt-1">
              <span className="flex items-center gap-1 text-white/90">
                <i className="bi bi-geo-alt-fill text-xs text-rose-400"></i>
                <span>{distanceText}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Trực tuyến</span>
              </span>
            </div>
          </div>
        </div>

        {/* Nội dung Bio & Sở thích */}
        <div className="px-5 pb-5 space-y-3.5 -mt-2">
          {/* Bio text */}
          <p className="text-xs text-[#EEEEEE] leading-relaxed bg-[#151619] p-3 rounded-2xl border border-white/5">
            {bio}
          </p>

          {/* Tags sở thích */}
          <div className="flex flex-wrap gap-1.5">
            {['#CafeChill', '#DuLich', '#AmThuc', '#AmNhac', '#ChupAnh'].map(tag => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-[#8E8E93]">
                {tag}
              </span>
            ))}
          </div>

          {/* 4 Nút hành động chính */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {/* 1. Nhắn tin */}
            <button
              onClick={() => {
                onClose();
                if (onDirectChat) onDirectChat(profile);
              }}
              className="py-2.5 px-1.5 rounded-2xl bg-white text-black font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-[#EAEAEA] active:scale-95 transition-all shadow-[0_0_12px_rgba(255,255,255,0.2)]"
            >
              <i className="bi bi-chat-dots-fill text-xs"></i>
              <span>Nhắn tin</span>
            </button>

            {/* 2. Kết bạn / Hủy kết bạn */}
            <button
              onClick={() => {
                if (onToggleFriend) onToggleFriend(profile);
              }}
              className={`py-2.5 px-1.5 rounded-2xl font-semibold text-[11px] flex items-center justify-center gap-1 border transition-all active:scale-95 ${
                isFriend
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-white/5 text-[#EEEEEE] border-white/10 hover:bg-white/10'
              }`}
            >
              <i className={`bi ${isFriend ? 'bi-person-check-fill' : 'bi-person-plus-fill'} text-xs`}></i>
              <span>{isFriend ? 'Đã bạn' : 'Kết bạn'}</span>
            </button>

            {/* 3. Ném Meme Troll */}
            <button
              onClick={() => {
                onClose();
                if (onOpenMemeTroll) onOpenMemeTroll(profile);
              }}
              className="py-2.5 px-1.5 rounded-2xl bg-[#FF2A85]/20 hover:bg-[#FF2A85]/30 text-[#FF529D] font-bold text-[11px] border border-[#FF2A85]/40 flex items-center justify-center gap-1 active:scale-95 transition-all shadow-[0_0_10px_rgba(255,42,133,0.25)]"
              title="Ném Meme Troll bạn bè"
            >
              <i className="bi bi-fire text-xs"></i>
              <span>Troll</span>
            </button>

            {/* 4. Chỉ đường */}
            <button
              onClick={() => {
                onClose();
                if (onStartNavigation) onStartNavigation(profile);
              }}
              className="py-2.5 px-1.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-[11px] border border-white/15 flex items-center justify-center gap-1 active:scale-95 transition-all"
            >
              <i className="bi bi-cursor-fill text-xs text-sky-400"></i>
              <span>Chỉ đường</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
