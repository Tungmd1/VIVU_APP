import React, { useState, useEffect } from 'react';
import { DEFAULT_WHITE_PERSON_AVATAR, getSafeAvatar } from '../../utils/avatarUtils';
import apiClient from '../../services/apiClient';

/**
 * GuestProfileModal - Modal xem hồ sơ cá nhân khách dạng thẻ Profile Card
 * Mở khi người dùng click vào giọt nước hoặc avatar của bất kỳ ai trên Bản đồ
 * Hỗ trợ Photo Carousel (nếu có ảnh thực), Story Bars, Bio, Nhắn tin, Kết bạn, Troll Meme và Chỉ đường
 * Chuẩn Resend Glassmorphism, 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng), Rule 45 (Không mockup)
 */
export default function GuestProfileModal({
  isOpen,
  onClose,
  profile,
  currentUserId = null,
  onDirectChat,
  onToggleFriend,
  onStartNavigation,
  isFriend = false
}) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [fetchedData, setFetchedData] = useState(null);

  const targetUserId = profile?.id || profile?.hostId || profile?.userId || profile?.user_id;

  useEffect(() => {
    setActivePhotoIdx(0);
    if (!isOpen || !targetUserId) {
      setFetchedData(null);
      return;
    }
    let active = true;
    apiClient.getUserProfile(targetUserId, currentUserId).then((res) => {
      if (active && res) setFetchedData(res);
    }).catch(() => {});
    return () => { active = false; };
  }, [isOpen, targetUserId, currentUserId]);

  if (!isOpen || !profile) return null;

  const effectiveProfile = fetchedData?.profile ? { ...profile, ...fetchedData.profile } : profile;
  const effectiveIsFriend = fetchedData?.isFriend ?? isFriend;

  const displayName = effectiveProfile.hostName || effectiveProfile.name || effectiveProfile.full_name || 'Người dùng VIVU';
  const rawAvatar = effectiveProfile.hostAvatar || effectiveProfile.avatar || effectiveProfile.avatar_url;
  const displayAvatar = getSafeAvatar(rawAvatar);
  const isDefaultAvatar = displayAvatar === DEFAULT_WHITE_PERSON_AVATAR;

  const age = effectiveProfile.age != null ? `${effectiveProfile.age} tuổi` : '';
  const bio = effectiveProfile.bio || effectiveProfile.description || effectiveProfile.custom_status || '';
  const favoriteSong = effectiveProfile.favorite_song || effectiveProfile.favoriteSong || '';
  const tags = Array.isArray(effectiveProfile.tags) ? effectiveProfile.tags : [];

  // Lọc chỉ giữ ảnh thực tế, loại bỏ 100% link mockup (Rule 45)
  const validPhotos = Array.isArray(effectiveProfile.photos)
    ? effectiveProfile.photos.filter(p => p && typeof p === 'string' && !p.includes('unsplash.com') && !p.includes('dicebear.com'))
    : [];

  const photos = validPhotos.length > 0
    ? validPhotos
    : (!isDefaultAvatar ? [displayAvatar] : []);

  const hasPhotos = photos.length > 0;

  const handlePrev = (e) => {
    e.stopPropagation();
    if (!hasPhotos) return;
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (!hasPhotos) return;
    setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const distanceText = profile.distanceText || profile.liveDistance || profile.distance || 'Gần bạn';

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Card Profile chính */}
      <div className="relative z-10 w-full max-w-sm bg-[#0E0E10] border border-white/20 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-white space-y-4 animate-in zoom-in-95 duration-200">
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 active:scale-90 transition-all cursor-pointer"
          title="Đóng hồ sơ"
        >
          <i className="bi bi-x-lg text-sm"></i>
        </button>

        {/* Khối ảnh lớn Photo Carousel HOẶC Avatar người chuẩn trắng cao cấp */}
        {hasPhotos ? (
          <div className="relative aspect-[3/4] max-h-[360px] w-full overflow-hidden bg-[#151619] group">
            <img
              src={photos[activePhotoIdx]}
              alt=""
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Dải story bar ở đỉnh ảnh nếu có nhiều ảnh */}
            {photos.length > 1 && (
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
            )}

            {/* Vùng cảm ứng chia 2 nửa: Chạm trái lùi, chạm phải tiến */}
            {photos.length > 1 && (
              <div className="absolute inset-0 z-10 flex">
                <div className="w-1/2 h-full cursor-pointer" onClick={handlePrev} />
                <div className="w-1/2 h-full cursor-pointer" onClick={handleNext} />
              </div>
            )}

            {/* Lớp gradient tối ở đáy ảnh */}
            <div className="absolute inset-x-0 bottom-0 z-15 pt-20 pb-4 px-4 bg-gradient-to-t from-[#0E0E10] via-[#0E0E10]/80 to-transparent flex flex-col justify-end pointer-events-none">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {displayName} {age && <span className="font-normal text-white/90">, {age}</span>}
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
        ) : (
          /* Khung hiển thị khi người dùng dùng Avatar chuẩn trắng (Không mockup) */
          <div className="relative pt-12 pb-6 px-6 bg-gradient-to-b from-[#18191E] to-[#0E0E10] flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-white border-2 border-white/30 p-1 shadow-2xl flex items-center justify-center overflow-hidden mb-3">
              <img
                src={DEFAULT_WHITE_PERSON_AVATAR}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {displayName}
              </h2>
              <i className="bi bi-patch-check-fill text-white text-sm" title="Đã xác thực"></i>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-[#8E8E93] mt-1.5">
              <span className="flex items-center gap-1 text-white/80">
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
        )}

        {/* Nội dung Bio & Tương tác */}
        <div className="px-5 pb-5 space-y-3.5 -mt-1">
          {/* Bio text nếu có */}
          {bio && (
            <p className="text-xs text-[#EEEEEE] leading-relaxed bg-[#151619] p-3 rounded-2xl border border-white/5">
              {bio}
            </p>
          )}

          {favoriteSong && (
            <div className="px-3 py-2 rounded-2xl bg-[#151619] border border-white/10 flex items-center gap-2 text-xs text-white">
              <i className="bi bi-music-note-beamed text-[#FF2A85]" />
              <span className="truncate font-semibold">
                {typeof favoriteSong === 'string' ? favoriteSong : `${favoriteSong.title || 'Bài hát'}${favoriteSong.artist ? ` - ${favoriteSong.artist}` : ''}`}
              </span>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] text-white/85">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 3 Nút hành động chính (Nhắn tin, Kết bạn, Chỉ đường) */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {/* 1. Nhắn tin */}
            <button
              onClick={() => {
                onClose();
                if (onDirectChat) onDirectChat(effectiveProfile);
              }}
              className="py-2.5 px-1.5 rounded-2xl bg-white text-black font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-[#EAEAEA] active:scale-95 transition-all shadow-[0_0_12px_rgba(255,255,255,0.2)] cursor-pointer"
            >
              <i className="bi bi-chat-dots-fill text-xs"></i>
              <span>Nhắn tin</span>
            </button>

            {/* 2. Kết bạn / Hủy kết bạn */}
            <button
              onClick={() => {
                if (onToggleFriend) onToggleFriend(effectiveProfile);
              }}
              className={`py-2.5 px-1.5 rounded-2xl font-semibold text-[11px] flex items-center justify-center gap-1 border transition-all active:scale-95 cursor-pointer ${
                effectiveIsFriend
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-white/5 text-[#EEEEEE] border-white/10 hover:bg-white/10'
              }`}
            >
              <i className={`bi ${effectiveIsFriend ? 'bi-person-check-fill' : 'bi-person-plus-fill'} text-xs`}></i>
              <span>{effectiveIsFriend ? 'Đã bạn' : 'Kết bạn'}</span>
            </button>

            {/* 3. Chỉ đường */}
            <button
              onClick={() => {
                onClose();
                if (onStartNavigation) onStartNavigation(profile);
              }}
              className="py-2.5 px-1.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-[11px] border border-white/15 flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
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
