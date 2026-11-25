import React, { useState, useRef, useEffect } from 'react';
import EditProfileModal from './EditProfileModal';
import ProfileStoryHighlights from './ProfileStoryHighlights';
import ProfileDetailsSection from './ProfileDetailsSection';
import ProfileMediaSection from './ProfileMediaSection';
import { PhotoViewerModal } from './ProfileModals';
import { playProfileChime, triggerProfileHaptic } from './profileAudioEffects';
import { compressAvatar } from '../../utils/imageCompressor';
import { apiClient } from '../../services/apiClient';

/**
 * ProfilePageView - Giao Diện Hồ Sơ Cá Nhân Chuẩn Mực (Full Features, Zero-Mockup)
 * - Header Avatar nền trắng với icon người xám (nếu chưa tải avatar)
 * - Tải avatar nén Canvas tự động (256x256 ~30KB), chống lỗi QuotaExceededError
 * - Nút xóa ảnh đại diện quay về mặc định
 * - Thư viện ảnh cá nhân thực tế (Thêm ảnh thật từ máy, xem ảnh, xóa ảnh)
 * - Kho Lưu Trữ Story khoảnh khắc
 * - Chi tiết thông tin cá nhân (Họ tên, SĐT, Tuổi, Nghề nghiệp, Bio, Sở thích)
 * - 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng)
 */
export default function ProfilePageView({
  user,
  isAuthenticated = false,
  onOpenLogin,
  onLogout,
  onOpenEditProfile,
  onOpenSettings,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onUpdateAvatar,
  onUpdateProfile,
  userCustomStatus = 'Đang vi vu dạo phố quanh đây',
  userCode,
  onBackToMap,
  onOpenStoryHighlight
}) {
  const userId = user?.id || 'guest';
  const profileStorageKey = userId && userId !== 'guest' ? `vivu_user_profile_data_${userId}` : null;
  const loadSavedProfile = () => {
    try {
      if (profileStorageKey) {
        const s = localStorage.getItem(profileStorageKey);
        if (s) { const p = JSON.parse(s); if (p.id === userId || p.userId === userId) return p; }
      }
      const g = localStorage.getItem('vivu_user_profile_data');
      if (g) return JSON.parse(g);
    } catch {}
    return {};
  };
  const [localProfile, setLocalProfile] = useState(loadSavedProfile);
  useEffect(() => { setLocalProfile(loadSavedProfile()); }, [userId, profileStorageKey]);

  // Tự động kéo dữ liệu hồ sơ mới nhất từ Database Server chống mất thông tin sau loading
  useEffect(() => {
    let isCancelled = false;
    if (userId && (userId.startsWith('user-') || userId.startsWith('client-'))) {
      apiClient.getMe(userId).then(serverUser => {
        if (isCancelled || !serverUser) return;
        setLocalProfile(prev => {
          const targetAv = serverUser.avatar_url || serverUser.avatar || prev.avatarUrl || prev.avatar_url || null;
          const currentBio = (serverUser.bio && String(serverUser.bio).trim()) || (prev.bio && String(prev.bio).trim()) || '';
          const currentJob = (serverUser.job && String(serverUser.job).trim()) || (prev.job && String(prev.job).trim()) || '';
          const currentPhone = (serverUser.phone && String(serverUser.phone).trim()) || (prev.phone && String(prev.phone).trim()) || '';
          const currentAge = serverUser.age != null ? serverUser.age : (prev.age != null ? prev.age : null);
          const currentTags = (Array.isArray(serverUser.tags) && serverUser.tags.length > 0) ? serverUser.tags : ((Array.isArray(prev.tags) && prev.tags.length > 0) ? prev.tags : ['CafeĐêm', 'DạoPhố']);
          const currentSong = serverUser.favorite_song || prev.favorite_song || '';

          const updated = {
            ...prev, ...serverUser, userId: serverUser.id || userId, id: serverUser.id || userId,
            fullName: serverUser.full_name || serverUser.name || prev.fullName || prev.full_name || '',
            avatarUrl: targetAv, avatar_url: targetAv, bio: currentBio, job: currentJob, phone: currentPhone, age: currentAge, tags: currentTags, favorite_song: currentSong
          };
          if (profileStorageKey) {
            try {
              localStorage.setItem(profileStorageKey, JSON.stringify(updated));
              if (targetAv) localStorage.setItem(`vivu_user_avatar_${userId}`, targetAv);
            } catch {}
          }
          return updated;
        });
      }).catch(err => console.warn('[ProfileView] Lỗi getMe:', err));
    }
    return () => { isCancelled = true; };
  }, [userId, profileStorageKey]);

  const currentAvatar = user?.user_metadata?.avatar_url || user?.avatar || user?.avatar_url || localProfile.avatarUrl || localProfile.avatar_url || null;
  const canonicalFullName = user?.user_metadata?.full_name || user?.full_name || user?.name || (localProfile.fullName && localProfile.fullName.trim()) || (localProfile.full_name && localProfile.full_name.trim()) || (isAuthenticated ? 'Thành viên VIVU' : 'Khách Vãng Lai');
  const meta = {
    ...user, ...user?.user_metadata, ...localProfile,
    full_name: canonicalFullName, avatar_url: currentAvatar,
    bio: (localProfile.bio && String(localProfile.bio).trim()) || user?.user_metadata?.bio || user?.bio || '',
    job: (localProfile.job && String(localProfile.job).trim()) || user?.user_metadata?.job || user?.job || '',
    age: localProfile.age || user?.user_metadata?.age || user?.age || null,
    phone: (localProfile.phone && String(localProfile.phone).trim()) || user?.user_metadata?.phone || user?.phone || '',
    tags: (Array.isArray(localProfile.tags) && localProfile.tags.length > 0) ? localProfile.tags : ((Array.isArray(user?.user_metadata?.tags) && user.user_metadata.tags.length > 0) ? user.user_metadata.tags : (Array.isArray(user?.tags) && user.tags.length > 0 ? user.tags : ['CafeĐêm', 'DạoPhố'])),
    privacy_age: localProfile.privacy_age || user?.user_metadata?.privacy_age || user?.privacy_age || 'public',
    privacy_phone: localProfile.privacy_phone || user?.user_metadata?.privacy_phone || user?.privacy_phone || 'friends',
    privacy_tags: localProfile.privacy_tags || user?.user_metadata?.privacy_tags || user?.privacy_tags || 'public',
    favorite_song: (localProfile.favorite_song && String(localProfile.favorite_song).trim()) || user?.user_metadata?.favorite_song || user?.favorite_song || ''
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState(null), [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [photoActionError, setPhotoActionError] = useState('');
  const [confirmDeletePhotoIdx, setConfirmDeletePhotoIdx] = useState(null);
  const [confirmDeleteArchiveId, setConfirmDeleteArchiveId] = useState(null);
  const fileInputRef = useRef(null), multiPhotoInputRef = useRef(null);

  // Bộ sưu tập ảnh thật do người dùng tải lên
  const photoStorageKey = `vivu_real_user_photos_${userId}`;
  const [photos, setPhotos] = useState(() => {
    try { const saved = localStorage.getItem(photoStorageKey); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [mediaTab, setMediaTab] = useState('photos');
  const archiveStorageKey = `vivu_user_story_archive_${userId}`;
  const [archiveItems, setArchiveItems] = useState(() => {
    try { const saved = localStorage.getItem(archiveStorageKey); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  useEffect(() => {
    try {
      const p = localStorage.getItem(photoStorageKey);
      const localList = p ? JSON.parse(p) : [];
      const remoteList = Array.isArray(user?.photos) ? user.photos : (Array.isArray(user?.user_metadata?.photos) ? user.user_metadata.photos : []);
      setPhotos(remoteList.length > 0 ? remoteList : (Array.isArray(localList) ? localList : []));
    } catch { setPhotos([]); }
    try { const a = localStorage.getItem(archiveStorageKey); setArchiveItems(a ? JSON.parse(a) : []); } catch { setArchiveItems([]); }
  }, [userId, photoStorageKey, archiveStorageKey, user?.photos, user?.user_metadata?.photos]);

  const handleRemoveArchiveItem = (archiveId, e) => {
    e?.stopPropagation();
    if (confirmDeleteArchiveId !== archiveId) {
      setConfirmDeleteArchiveId(archiveId);
      return;
    }
    setConfirmDeleteArchiveId(null);
    const updated = archiveItems.filter(item => item.id !== archiveId);
    setArchiveItems(updated);
    try { localStorage.setItem(archiveStorageKey, JSON.stringify(updated)); } catch {}
  };

  useEffect(() => {
    try { localStorage.setItem(photoStorageKey, JSON.stringify(photos)); } catch {}
  }, [photos, photoStorageKey]);

  // Thêm ảnh mới vào bộ sưu tập cá nhân và đồng bộ lên server
  const handleAddPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPhotoActionError('');

    const addedUrls = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setPhotoActionError('Kích thước ảnh tối đa 10MB');
        continue;
      }
      try {
        let finalUrl = '';
        try {
          const uploaded = await apiClient.uploadMedia(file, 'stories');
          if (uploaded?.url) finalUrl = uploaded.url;
        } catch {}
        if (!finalUrl) {
          finalUrl = await compressAvatar(file, 800, 800, 0.85);
        }
        addedUrls.push(finalUrl);
        playProfileChime();
        triggerProfileHaptic([30, 20]);
      } catch (err) { console.warn('Lỗi thêm ảnh:', err); }
    }
    if (addedUrls.length > 0) {
      const nextPhotos = [...addedUrls, ...photos];
      setPhotos(nextPhotos);
      if (onUpdateProfile && userId !== 'guest') {
        onUpdateProfile({ photos: nextPhotos, userId }).catch(() => {});
      }
    }
    e.target.value = '';
  };

  const handleRemovePhoto = (indexToRemove, e) => {
    e?.stopPropagation();
    if (confirmDeletePhotoIdx !== indexToRemove) {
      setConfirmDeletePhotoIdx(indexToRemove);
      return;
    }
    setConfirmDeletePhotoIdx(null);
    const nextPhotos = photos.filter((_, idx) => idx !== indexToRemove);
    setPhotos(nextPhotos);
    if (onUpdateProfile && userId !== 'guest') {
      onUpdateProfile({ photos: nextPhotos, userId }).catch(() => {});
    }
  };

  // Thay đổi ảnh đại diện với bộ nén Canvas
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const compressed = await compressAvatar(file, 256, 256, 0.85);
      setLocalProfile(prev => {
        const next = { ...prev, avatarUrl: compressed, avatar_url: compressed, userId, id: userId };
        if (profileStorageKey) {
          try {
            localStorage.setItem(profileStorageKey, JSON.stringify(next));
            if (userId && userId !== 'guest') localStorage.setItem(`vivu_user_avatar_${userId}`, compressed);
          } catch {}
        }
        return next;
      });
      if (onUpdateAvatar) await onUpdateAvatar(compressed, photos);
      playProfileChime();
      triggerProfileHaptic([40, 20]);
    } catch (err) {
      alert(err.message || 'Lỗi khi nén ảnh đại diện');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  // Xóa ảnh đại diện quay về mặc định
  const handleRemoveAvatar = () => {
    if (window.confirm('Đặt lại ảnh đại diện về icon người chuẩn mặc định?')) {
      setLocalProfile(prev => {
        const next = { ...prev, avatarUrl: null, avatar_url: null, userId, id: userId };
        if (profileStorageKey) {
          try {
            localStorage.setItem(profileStorageKey, JSON.stringify(next));
            if (userId && userId !== 'guest') localStorage.removeItem(`vivu_user_avatar_${userId}`);
          } catch {}
        }
        return next;
      });
      if (onUpdateAvatar) onUpdateAvatar(null, photos);
      playProfileChime();
    }
  };

  const displayName = meta.full_name || user?.name || (isAuthenticated ? 'Thành viên VIVU' : 'Khách Vãng Lai');
  const displayCode = userCode || meta.user_code || 'VU-EXPLORER';
  const bio = meta.bio || 'Chưa cập nhật tiểu sử giới thiệu.', job = meta.job || 'Chưa cập nhật nghề nghiệp', age = meta.age ? `${meta.age} tuổi` : 'Chưa cập nhật', phone = meta.phone || 'Chưa cập nhật SĐT', tags = Array.isArray(meta.tags) && meta.tags.length > 0 ? meta.tags : ['DạoPhố', 'VIVU'];

  return (
    <div className="fixed inset-0 z-40 bg-[#0B0D14] text-white flex flex-col font-sans select-none overflow-y-auto no-scrollbar pb-24">
      {/* 1. Header Top Bar Cố Định */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0B0D14]/90 backdrop-blur-xl border-b border-white/10">
        <button type="button" onClick={onBackToMap} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white transition-all cursor-pointer">
          <i className="bi bi-chevron-left text-xs" />
          <span>Về Bản Đồ</span>
        </button>
        <span className="text-xs font-black tracking-wider uppercase text-white/80">Hồ Sơ Của Tôi</span>
        <div className="flex items-center gap-2">
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              aria-label="Mở thông báo"
              title="Thông báo"
              className="relative w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white text-sm transition-all cursor-pointer"
            >
              <i className="bi bi-bell-fill text-xs" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#FF2A85] text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
          )}
          <button type="button" onClick={() => setIsEditModalOpen(true)} aria-label="Chỉnh sửa hồ sơ" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white text-sm transition-all cursor-pointer" title="Chỉnh sửa hồ sơ">
            <i className="bi bi-pencil-fill text-xs" />
          </button>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto w-full space-y-4">
        {/* 2. Card Thông Tin Cá Nhân Chính */}
        <div className="relative p-5 rounded-3xl bg-[#121520] border border-white/10 shadow-xl flex flex-col items-center text-center">
          {/* Avatar nền trắng icon người với khung nén */}
          <div className="relative group mb-3">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#FF2A85] to-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center relative">
                {currentAvatar ? (
                  <img src={currentAvatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white flex items-center justify-center text-neutral-400">
                    <i className="bi bi-person-fill text-5xl" />
                  </div>
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <i className="bi bi-arrow-repeat text-xl text-[#00E5FF] animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Nút bấm tải/đổi avatar */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#00E5FF] hover:bg-[#00c8e0] text-[#08202E] flex items-center justify-center text-sm font-bold shadow-lg active:scale-90 transition-transform cursor-pointer"
              title="Đổi ảnh đại diện từ thiết bị"
            >
              <i className="bi bi-camera-fill" />
            </button>

            {/* Nút xóa avatar nếu đã có ảnh */}
            {currentAvatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute top-0 right-0 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-[10px] shadow-md active:scale-90 transition-transform cursor-pointer"
                title="Xóa avatar quay về mặc định"
              >
                <i className="bi bi-trash3" />
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" aria-label="Thay đổi ảnh đại diện cá nhân" className="hidden" />
          </div>

          {/* Tên & Mã định danh */}
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
            <span>{displayName}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30">
              {displayCode}
            </span>
          </h1>

          <p className="text-xs text-white/60 mt-1 italic font-medium">"{userCustomStatus}"</p>

          {/* Nút hành động nhanh: Sửa hồ sơ & Đăng xuất */}
          <div className="flex items-center gap-2 mt-4 w-full">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <i className="bi bi-sliders text-sm text-[#00E5FF]" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => onOpenSettings?.()}
                className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                aria-label="Mở cài đặt tài khoản"
              >
                <i className="bi bi-gear-fill text-sm text-white/80" />
                <span>Cài đặt</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <i className="bi bi-box-arrow-in-right text-sm" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>

        {/* 2.5 Section Tin Nổi Bật (Highlights) */}
        <ProfileStoryHighlights userId={userId} onOpenHighlight={onOpenStoryHighlight} />

        {/* 3. Section Thư Viện Ảnh Thật & Kho Lưu Trữ Khoảnh Khắc (Tách module < 450 dòng) */}
        <ProfileMediaSection
          mediaTab={mediaTab}
          setMediaTab={setMediaTab}
          photos={photos}
          archiveItems={archiveItems}
          multiPhotoInputRef={multiPhotoInputRef}
          handleAddPhotos={handleAddPhotos}
          handleRemovePhoto={handleRemovePhoto}
          handleRemoveArchiveItem={handleRemoveArchiveItem}
          photoActionError={photoActionError}
          setPhotoActionError={setPhotoActionError}
          confirmDeletePhotoIdx={confirmDeletePhotoIdx}
          confirmDeleteArchiveId={confirmDeleteArchiveId}
          setViewingPhoto={setViewingPhoto}
        />

        {/* 4. Section Thông Tin Chi Tiết Cá Nhân (Tách module) */}
        <ProfileDetailsSection
          age={age}
          job={job}
          phone={phone}
          bio={bio}
          favoriteSong={meta.favorite_song || meta.favoriteSong || localProfile.favorite_song || user?.favorite_song}
          tags={tags}
          isOwner={true}
          privacyAge={meta.privacy_age || meta.privacyAge || 'public'}
          privacyPhone={meta.privacy_phone || meta.privacyPhone || 'friends'}
          privacyTags={meta.privacy_tags || meta.privacyTags || 'public'}
        />
      </div>

      {/* 5. Modal Chỉnh Sửa Hồ Sơ */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={{ ...user, user_metadata: meta }}
        currentStatus={userCustomStatus}
        onSaveProfile={async (profileData) => {
          setLocalProfile(prev => {
            const updated = { ...prev, ...profileData, userId, id: userId };
            if (profileStorageKey) {
              try { localStorage.setItem(profileStorageKey, JSON.stringify(updated)); } catch {}
            }
            return updated;
          });
          if (onUpdateProfile) await onUpdateProfile({ ...profileData, userId });
        }}
      />

      {/* 6. Popup Xem Phóng To Ảnh Thật */}
      <PhotoViewerModal
        photoUrl={viewingPhoto}
        onClose={() => setViewingPhoto(null)}
      />
    </div>
  );
}
