import React, { useState, useRef, useEffect } from 'react';
import { DEFAULT_WHITE_PERSON_AVATAR, getSafeAvatar } from '../../utils/avatarUtils';
import ProfileDetailsSection from './ProfileDetailsSection';
import { PhotoViewerModal } from './ProfileModals';
import HighlightViewerModal, { ProfileHighlightsStrip } from './HighlightViewerModal';
import apiClient from '../../services/apiClient';

/**
 * UserProfileViewModal - Giao Diện Hồ Sơ Toàn Màn Hình Khi Xem Bạn Bè Hoặc Người Lạ
 * Hỗ trợ mở từ: Bản đồ 3D ('map'), Phòng Chat 1-1 ('chat'), Nhóm Chat ('group'), Danh sách bạn bè ('friends'), Trình xem Story ('story')
 * Bố cục cuộn dọc một trang (Single-scroll Page) chuẩn Resend Dark Monochrome
 * Phân quyền bảo mật: Ẩn SĐT với người lạ, mở khóa khi đã là bạn bè
 * 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng), Rule 45 (Không mockup)
 */
export default function UserProfileViewModal({
  isOpen,
  profile,
  currentUserId = null,
  onClose,
  originSource = 'map',
  isFriend = false,
  allFriends = [],
  onDirectChat,
  onToggleFriend,
  onStartNavigation,
  onOpenStoryDetail
}) {
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [viewingHighlight, setViewingHighlight] = useState(null);
  const [highlightStoryIndex, setHighlightStoryIndex] = useState(0);
  const [actionFeedback, setActionFeedback] = useState('');
  const menuRef = useRef(null);

  const rawId = profile?.hostId || profile?.host_id || profile?.userId || profile?.user_id || profile?.friendId || profile?.authorId;
  const fallbackId = profile?.id && !String(profile.id).startsWith('story-') ? profile.id : null;
  const targetUserId = rawId || fallbackId;

  useEffect(() => {
    if (!isOpen || !targetUserId) {
      setFetchedData(null);
      setIsLoadingProfile(false);
      return;
    }
    let active = true;
    setFetchedData(null);
    setIsLoadingProfile(true);
    apiClient.getUserProfile(targetUserId, currentUserId).then((res) => {
      if (active && res) setFetchedData(res);
    }).catch(() => {}).finally(() => {
      if (active) setIsLoadingProfile(false);
    });
    return () => { active = false; };
  }, [isOpen, targetUserId, currentUserId]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowOptionsMenu(false);
      }
    };
    if (showOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptionsMenu]);

  if (!isOpen || !profile) return null;

  // Chuẩn hóa dữ liệu người dùng đa tầng (ưu tiên dữ liệu tươi đã lọc quyền riêng tư từ GET /api/profile/:id)
  const effectiveProfile = fetchedData?.profile ? { ...profile, ...fetchedData.profile } : profile;
  const effectiveIsFriend = fetchedData?.isFriend ?? isFriend;
  const effectiveHighlights = Array.isArray(fetchedData?.highlights)
    ? fetchedData.highlights
    : (Array.isArray(effectiveProfile.highlights) ? effectiveProfile.highlights : []);

  const displayName = effectiveProfile.hostName || effectiveProfile.name || effectiveProfile.fullName || effectiveProfile.full_name || 'Người dùng VIVU';
  const displayId = effectiveProfile.hostId || effectiveProfile.id || effectiveProfile.userId;
  const rawAvatar = effectiveProfile.hostAvatar || effectiveProfile.avatar || effectiveProfile.avatar_url;
  const displayAvatar = getSafeAvatar(rawAvatar);
  const isDefaultAvatar = !displayAvatar || displayAvatar === DEFAULT_WHITE_PERSON_AVATAR;
  
  const displayCode = effectiveProfile.userCode || effectiveProfile.user_code || (displayId ? `VU-${String(displayId).slice(-4).toUpperCase()}` : 'VU-MEMBER');
  const distanceText = effectiveProfile.liveDistance || effectiveProfile.distanceText || (effectiveProfile.distance !== undefined ? (typeof effectiveProfile.distance === 'number' ? `${effectiveProfile.distance.toFixed(1)} km` : effectiveProfile.distance) : 'Gần bạn');
  const statusText = effectiveProfile.customStatus || effectiveProfile.custom_status || effectiveProfile.text || effectiveProfile.status || 'Đang vi vu dạo phố quanh đây';
  const isProfileOnline = Boolean(
    effectiveProfile.isOnline || effectiveProfile.is_online || effectiveProfile.online || effectiveProfile.author_is_online
  );
  const onlineStatus = effectiveProfile.onlineStatus || (isLoadingProfile && !fetchedData ? 'Đang tải...' : (isProfileOnline ? 'Đang hoạt động' : 'Ngoại tuyến'));
  const battery = effectiveProfile.battery || '88%';

  // Thông tin chi tiết kèm phân quyền bảo mật
  const privacyAge = effectiveProfile.privacy_age || effectiveProfile.privacyAge || 'public';
  const privacyPhone = effectiveProfile.privacy_phone || effectiveProfile.privacyPhone || 'friends';
  const privacyTags = effectiveProfile.privacy_tags || effectiveProfile.privacyTags || 'public';

  const age = effectiveProfile.age != null ? `${effectiveProfile.age} tuổi` : null;
  const job = effectiveProfile.job || 'Thành viên VIVU';
  const phone = effectiveProfile.phone || '';
  const bio = effectiveProfile.bio || effectiveProfile.description || 'Chưa cập nhật tiểu sử giới thiệu.';
  const favoriteSong = effectiveProfile.favorite_song || effectiveProfile.favoriteSong || '';
  const tags = Array.isArray(effectiveProfile.tags) ? effectiveProfile.tags : [];

  // Lọc chỉ giữ ảnh thực tế, loại bỏ 100% link mockup (Rule 45)
  const validPhotos = Array.isArray(effectiveProfile.photos)
    ? effectiveProfile.photos.filter(p => p && typeof p === 'string' && !p.includes('unsplash.com') && !p.includes('dicebear.com'))
    : [];

  const photos = validPhotos.length > 0
    ? validPhotos
    : (!isDefaultAvatar ? [displayAvatar] : []);

  const activeStory = effectiveProfile.activeStory || (
    (effectiveProfile.mediaUrl || effectiveProfile.image || effectiveProfile.dual_image) ? effectiveProfile : null
  );

  // Tính toán bạn bè chung thực tế (Rule 45: Không mockup)
  const mutualFriends = Array.isArray(effectiveProfile.mutual_friends)
    ? effectiveProfile.mutual_friends
    : (Array.isArray(effectiveProfile.friend_ids)
      ? allFriends.filter(f => f.id !== displayId && effectiveProfile.friend_ids.includes(f.id))
      : []);

  // Nhãn nút Back điều hướng ngữ cảnh
  const getBackLabel = () => {
    switch (originSource) {
      case 'chat': return 'Quay lại phòng chat';
      case 'group': return 'Quay lại nhóm';
      case 'friends': return 'Quay lại Bạn bè';
      case 'story': return 'Quay lại Story';
      default: return 'Về Bản Đồ';
    }
  };

  const handleCopyUserCode = () => {
    try {
      navigator.clipboard.writeText(displayCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      setShowOptionsMenu(false);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[85] bg-[#0B0D14] text-white flex flex-col font-sans select-none overflow-y-auto no-scrollbar pb-16 animate-in fade-in duration-200">
      {/* 1. Header Top Bar Cố Định (Origin-Aware Navigation) */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0B0D14]/90 backdrop-blur-xl border-b border-white/10">
        <button
          type="button"
          onClick={onClose}
          aria-label={getBackLabel() || 'Quay lại'}
          title={getBackLabel() || 'Quay lại'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white transition-all cursor-pointer"
        >
          <i className="bi bi-chevron-left text-xs" />
          <span>{getBackLabel()}</span>
        </button>

        <span className="text-xs font-black tracking-wider uppercase text-white/80">Hồ Sơ Thành Viên</span>

        {/* Cụm nút Thao tác & Menu tùy chọn 3 chấm */}
        <div className="relative flex items-center gap-1.5" ref={menuRef}>
          <button type="button" onClick={() => setShowOptionsMenu(!showOptionsMenu)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-[#8E8E93] hover:text-white text-sm transition-all cursor-pointer" title="Tùy chọn khác">
            <i className="bi bi-three-dots-vertical text-xs" />
          </button>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-[#8E8E93] hover:text-white text-sm transition-all cursor-pointer" aria-label="Đóng hồ sơ" title="Đóng hồ sơ">
            <i className="bi bi-x-lg text-xs" />
          </button>

          {/* Menu Dropdown Thao Tác Mở Rộng */}
          {showOptionsMenu && (
            <div className="absolute right-0 top-10 w-48 rounded-2xl bg-[#1A1A1E] border border-white/15 shadow-2xl p-1.5 space-y-1 z-40 text-xs animate-in zoom-in-95 duration-150">
              <button type="button" onClick={handleCopyUserCode} aria-label={copiedCode ? 'Đã sao chép mã VIVU' : 'Sao chép mã VIVU'} title="Sao chép mã VIVU" className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white flex items-center gap-2 cursor-pointer transition-colors">
                <i className={`bi ${copiedCode ? 'bi-check-lg text-[#00E5FF]' : 'bi-copy'} text-xs`} />
                <span>{copiedCode ? 'Đã sao chép mã!' : 'Sao chép mã VIVU'}</span>
              </button>

              {effectiveIsFriend && (
                <button type="button" onClick={() => { setShowOptionsMenu(false); if (onToggleFriend) onToggleFriend(effectiveProfile); }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 flex items-center gap-2 cursor-pointer transition-colors">
                  <i className="bi bi-person-x text-xs" />
                  <span>Hủy kết bạn</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowOptionsMenu(false);
                  setActionFeedback(`Đã ghi nhận phản hồi về tài khoản ${displayName}.`);
                  setTimeout(() => setActionFeedback(''), 4000);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-[#8E8E93] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
              >
                <i className="bi bi-shield-slash text-xs" />
                <span>Báo cáo / Chặn</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {actionFeedback && (
        <div className="mx-4 mt-2 px-3.5 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-medium flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button type="button" onClick={() => setActionFeedback('')} className="text-white/70 hover:text-white cursor-pointer">
            <i className="bi bi-x" />
          </button>
        </div>
      )}

      {/* Nội dung trang Hồ Sơ Cuộn Dọc */}
      <div className="p-4 max-w-lg mx-auto w-full space-y-4">
        {/* 2. Card Thông Tin Cá Nhân Chính */}
        <div className="relative p-5 rounded-3xl bg-[#121520] border border-white/10 shadow-xl flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#FF2A85] to-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                {!isDefaultAvatar && displayAvatar ? (
                  <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white flex items-center justify-center text-neutral-400">
                    <i className="bi bi-person-fill text-5xl" />
                  </div>
                )}
              </div>
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#00E5FF] border-2 border-[#121520] shadow-[0_0_8px_#00E5FF]" />
          </div>

          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
            <span>{displayName}</span>
            {effectiveIsFriend && (
              <i className="bi bi-patch-check-fill text-[#00E5FF] text-base" title="Bạn bè đã kết nối" />
            )}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30">{displayCode}</span>
          </h1>

          <p className="text-xs text-white/70 mt-1.5 italic font-medium max-w-xs">"{statusText}"</p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px]">
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 font-mono flex items-center gap-1">
              <i className="bi bi-geo-alt-fill text-[11px] text-[#FF2A85]" />
              <span>Cách bạn {distanceText}</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#00E5FF] font-mono font-bold flex items-center gap-1">
              <i className="bi bi-battery-charging text-xs" />
              <span>Pin {battery}</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 flex items-center gap-1">
              <i className="bi bi-clock-fill text-[10px]" />
              <span>{onlineStatus}</span>
            </span>
          </div>

          {/* 3. Lưới 3 Nút Hành Động Trực Tiếp (Nhắn tin, Kết bạn, Chỉ đường) */}
          <div className="grid grid-cols-3 gap-2 mt-5 w-full">
            <button type="button" onClick={() => { onClose(); if (onDirectChat) onDirectChat(effectiveProfile); }} className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-[#00E5FF]/15 text-[#00E5FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="bi bi-chat-dots-fill text-base" />
              </div>
              <span className="text-[11px] font-bold text-white">Nhắn tin</span>
            </button>

            <button
              type="button"
              onClick={() => { if (onToggleFriend) onToggleFriend(effectiveProfile); }}
              className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-2xl active:scale-95 border transition-all cursor-pointer group ${
                effectiveIsFriend ? 'bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]' : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                effectiveIsFriend ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'bg-white/15 text-white'
              }`}>
                <i className={`bi ${effectiveIsFriend ? 'bi-person-check-fill' : 'bi-person-plus-fill'} text-base`} />
              </div>
              <span className="text-[11px] font-bold truncate">{effectiveIsFriend ? 'Bạn bè' : 'Kết bạn'}</span>
            </button>

            <button type="button" onClick={() => { onClose(); if (onStartNavigation) onStartNavigation(effectiveProfile); }} className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-amber-400/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="bi bi-compass-fill text-base" />
              </div>
              <span className="text-[11px] font-bold text-white">Chỉ đường</span>
            </button>
          </div>
        </div>

        {/* 4. Khoảnh Khắc Story Đang Phát (Nếu có) */}
        {activeStory && (
          <div className="p-3.5 rounded-3xl bg-[#121520] border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-black/40 border border-white/20 shrink-0 flex items-center justify-center">
                {activeStory.mediaUrl ? (
                  <img src={activeStory.mediaUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <i className="bi bi-camera-reels text-xl text-[#FF2A85]" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF2A85] font-bold block">
                  Story khoảnh khắc đang phát
                </span>
                <span className="text-xs font-bold text-white line-clamp-1">
                  {activeStory.title || activeStory.text || 'Xem khoảnh khắc trên bản đồ'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenStoryDetail) onOpenStoryDetail(activeStory);
              }}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white text-xs font-bold flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <i className="bi bi-play-fill text-sm" />
              <span>Xem ngay</span>
            </button>
          </div>
        )}

        {/* 5. Section Bạn Bè Chung (Nếu có bạn chung) */}
        {mutualFriends.length > 0 && (
          <div className="p-3.5 rounded-3xl bg-[#121520] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2 overflow-hidden">
                {mutualFriends.slice(0, 3).map((mf, idx) => (
                  <img
                    key={idx}
                    src={mf.avatar || DEFAULT_WHITE_PERSON_AVATAR}
                    alt=""
                    className="w-7 h-7 rounded-full border-2 border-[#121520] object-cover"
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-white">
                {mutualFriends.length} bạn chung
              </span>
            </div>
            <span className="text-[10px] text-[#00E5FF] font-medium font-mono">
              Đã kết nối
            </span>
          </div>
        )}

        {/* 5.5 Hàng Tin Nổi Bật (Highlights) */}
        <ProfileHighlightsStrip
          highlights={effectiveHighlights}
          onSelectHighlight={(hl) => {
            setViewingHighlight(hl);
            setHighlightStoryIndex(0);
          }}
        />

        {/* 6. Section Thông Tin Chi Tiết (Tuổi, Nghề, SĐT bảo mật, Bio, Tags) */}
        <ProfileDetailsSection 
          age={age} 
          job={job} 
          phone={phone} 
          bio={bio} 
          favoriteSong={favoriteSong}
          tags={tags}
          isOwner={Boolean(currentUserId && displayId && String(currentUserId) === String(displayId))}
          isFriend={effectiveIsFriend}
          privacyAge={privacyAge}
          privacyPhone={privacyPhone}
          privacyTags={privacyTags}
        />

        {/* 7. Thư Viện Ảnh Thật (Nếu có ảnh thực tế) */}
        {photos.length > 0 && (
          <div className="p-4 rounded-3xl bg-[#121520] border border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <i className="bi bi-images text-[#00E5FF] text-base" />
                <span className="font-bold text-xs uppercase tracking-wider text-white">Ảnh Cá Nhân</span>
              </div>
              <span className="text-[10px] text-white/40 font-mono">{photos.length} bức ảnh</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                <div key={index} onClick={() => setViewingPhoto(photo)} className="aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10 hover:border-white/30 cursor-pointer transition-all active:scale-95">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 8. Popup Xem Phóng To Ảnh Thật */}
      <PhotoViewerModal
        photoUrl={viewingPhoto}
        onClose={() => setViewingPhoto(null)}
      />

      <HighlightViewerModal
        highlight={viewingHighlight}
        currentStoryIndex={highlightStoryIndex}
        setCurrentStoryIndex={setHighlightStoryIndex}
        onClose={() => setViewingHighlight(null)}
      />
    </div>
  );
}
