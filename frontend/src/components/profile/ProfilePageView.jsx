import React, { useState, useRef, useEffect } from 'react';
import EditProfileModal from './EditProfileModal';
import ProfileStoryHighlights from './ProfileStoryHighlights';
import { playProfileChime, triggerProfileHaptic } from './profileAudioEffects';

/**
 * ProfilePageView - Giao Diện Hồ Sơ Cá Nhân Chuẩn Mực (Full Features, Zero-Mockup)
 * - Header Avatar nền trắng với icon người xám (nếu chưa tải avatar)
 * - Tải avatar trực tiếp từ thiết bị (có nút xóa avatar)
 * - Thư viện ảnh cá nhân thực tế (Thêm ảnh thật từ máy, xem ảnh, xóa ảnh)
 * - Chi tiết thông tin cá nhân (Họ tên, SĐT, Tuổi, Nghề nghiệp, Bio, Sở thích)
 * - Nút Đăng Xuất nổi bật có hộp thoại xác nhận
 * - 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng)
 */
export default function ProfilePageView({
  user,
  isAuthenticated = false,
  onOpenLogin,
  onLogout,
  onUpdateAvatar,
  userCustomStatus = 'Đang vi vu dạo phố quanh đây',
  userCode,
  onBackToMap,
  onOpenStoryHighlight
}) {
  const userId = user?.id || 'guest';
  const meta = user?.user_metadata || {};
  const currentAvatar = meta.avatar_url || user?.avatar || user?.avatar_url || null;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState(null);

  const fileInputRef = useRef(null);
  const multiPhotoInputRef = useRef(null);

  // Bộ sưu tập ảnh thật do người dùng tải lên (lưu theo userId trong localStorage)
  const photoStorageKey = `vivu_real_user_photos_${userId}`;
  const [photos, setPhotos] = useState(() => {
    try {
      const saved = localStorage.getItem(photoStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Tab chuyển đổi: 'photos' (Thư viện ảnh thật) | 'archive' (Kho lưu trữ story đã đăng)
  const [mediaTab, setMediaTab] = useState('photos');
  const archiveStorageKey = `vivu_user_story_archive_${userId}`;
  const [archiveItems, setArchiveItems] = useState(() => {
    try {
      const saved = localStorage.getItem(archiveStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Xóa khoảnh khắc khỏi Kho Lưu Trữ
  const handleRemoveArchiveItem = (archiveId, e) => {
    e?.stopPropagation();
    if (window.confirm('Xóa vĩnh viễn khoảnh khắc này khỏi Kho Lưu Trữ?')) {
      const updated = archiveItems.filter(item => item.id !== archiveId);
      setArchiveItems(updated);
      try {
        localStorage.setItem(archiveStorageKey, JSON.stringify(updated));
      } catch {}
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(photoStorageKey, JSON.stringify(photos));
    } catch {}
  }, [photos, photoStorageKey]);

  // Xử lý thêm ảnh mới vào bộ sưu tập cá nhân
  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        alert('Kích thước ảnh tối đa 8MB mỗi ảnh');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos((prev) => [reader.result, ...prev]);
        playProfileChime();
        triggerProfileHaptic([30, 20]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Xóa 1 ảnh khỏi bộ sưu tập
  const handleRemovePhoto = (indexToRemove, e) => {
    e?.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa bức ảnh này khỏi hồ sơ?')) {
      setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    }
  };

  // Thay đổi ảnh đại diện nhanh bằng input ẩn
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa 8MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const newAvatar = reader.result;
      if (onUpdateAvatar) onUpdateAvatar(newAvatar, photos);
      playProfileChime();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const displayName = meta.full_name || user?.name || (isAuthenticated ? 'Thành viên VIVU' : 'Khách Vãng Lai');
  const displayCode = userCode || meta.user_code || 'VU-EXPLORER';
  const bio = meta.bio || 'Chưa cập nhật tiểu sử giới thiệu.';
  const job = meta.job || 'Chưa cập nhật nghề nghiệp';
  const age = meta.age ? `${meta.age} tuổi` : 'Chưa cập nhật';
  const phone = meta.phone || 'Chưa cập nhật SĐT';
  const tags = Array.isArray(meta.tags) && meta.tags.length > 0 ? meta.tags : ['DạoPhố', 'VIVU'];

  return (
    <div className="fixed inset-0 z-40 bg-[#0B0D14] text-white flex flex-col font-sans select-none overflow-y-auto no-scrollbar pb-24">
      {/* 1. Header Top Bar Cố Định */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0B0D14]/90 backdrop-blur-xl border-b border-white/10">
        <button
          type="button"
          onClick={onBackToMap}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white transition-all cursor-pointer"
        >
          <i className="bi bi-chevron-left text-xs" />
          <span>Về Bản Đồ</span>
        </button>

        <span className="text-xs font-black tracking-wider uppercase text-white/80">
          Hồ Sơ Của Tôi
        </span>

        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white text-sm transition-all"
          title="Chỉnh sửa hồ sơ"
        >
          <i className="bi bi-pencil-fill text-xs" />
        </button>
      </div>

      <div className="p-4 max-w-lg mx-auto w-full space-y-4">
        {/* 2. Card Thông Tin Cá Nhân Chính */}
        <div className="relative p-5 rounded-3xl bg-[#121520] border border-white/10 shadow-xl flex flex-col items-center text-center">
          {/* Avatar nền trắng icon người (nếu chưa có ảnh) */}
          <div className="relative group mb-3">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#FF2A85] to-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                {currentAvatar ? (
                  <img src={currentAvatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white flex items-center justify-center text-neutral-400">
                    <i className="bi bi-person-fill text-5xl" />
                  </div>
                )}
              </div>
            </div>

            {/* Nút bấm tải/đổi avatar */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#00E5FF] hover:bg-[#00c8e0] text-[#08202E] flex items-center justify-center text-sm font-bold shadow-lg active:scale-90 transition-transform"
              title="Đổi ảnh đại diện"
            >
              <i className="bi bi-camera-fill" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
          </div>

          {/* Tên & Mã định danh */}
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
            <span>{displayName}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30">
              {displayCode}
            </span>
          </h1>

          <p className="text-xs text-white/60 mt-1 italic font-medium">"{userCustomStatus}"</p>

          {/* Nút hành động nhanh: Sửa hồ sơ */}
          <div className="flex items-center gap-2 mt-4 w-full">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <i className="bi bi-sliders text-sm text-[#00E5FF]" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="py-2.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <i className="bi bi-box-arrow-right text-sm" />
                <span>Đăng xuất</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <i className="bi bi-box-arrow-in-right text-sm" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>

        {/* 2.5 Section Tin Nổi Bật (Highlights) */}
        <ProfileStoryHighlights userId={userId} onOpenHighlight={onOpenStoryHighlight} />

        {/* 3. Section Thư Viện Ảnh Thật & Kho Lưu Trữ Khoảnh Khắc */}
        <div className="p-4 rounded-3xl bg-[#121520] border border-white/10 space-y-3">
          {/* Tab Switcher: Thư Viện Ảnh <---> Kho Lưu Trữ */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMediaTab('photos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  mediaTab === 'photos'
                    ? 'bg-[#FF2A85]/20 text-[#FF529D] border border-[#FF2A85]/40 shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <i className="bi bi-images" />
                <span>Thư Viện Ảnh ({photos.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaTab('archive')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  mediaTab === 'archive'
                    ? 'bg-[#10FFA0]/20 text-[#10FFA0] border border-[#10FFA0]/40 shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <i className="bi bi-archive-fill" />
                <span>Kho Lưu Trữ ({archiveItems.length})</span>
              </button>
            </div>

            {mediaTab === 'photos' && (
              <button
                type="button"
                onClick={() => multiPhotoInputRef.current?.click()}
                className="px-3 py-1 rounded-full bg-[#FF2A85]/20 hover:bg-[#FF2A85]/30 text-[#FF529D] border border-[#FF2A85]/40 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <i className="bi bi-plus-lg" />
                <span>Thêm ảnh</span>
              </button>
            )}
            <input type="file" ref={multiPhotoInputRef} onChange={handleAddPhotos} accept="image/*" multiple className="hidden" />
          </div>

          {/* Nội dung Tab 1: Thư Viện Ảnh Thật */}
          {mediaTab === 'photos' && (
            photos.length === 0 ? (
              <div
                onClick={() => multiPhotoInputRef.current?.click()}
                className="p-8 rounded-2xl border-2 border-dashed border-white/15 bg-white/5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-white/30 transition-colors"
              >
                <i className="bi bi-cloud-arrow-up text-3xl text-white/40 mb-2" />
                <p className="text-xs font-bold text-white/80">Chưa có ảnh nào được tải lên</p>
                <p className="text-[11px] text-white/40 mt-0.5">Chạm vào đây để chọn ảnh từ máy thiết bị của bạn</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((imgSrc, idx) => (
                  <div
                    key={idx}
                    onClick={() => setViewingPhoto(imgSrc)}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10 group cursor-pointer"
                  >
                    <img src={imgSrc} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    
                    {/* Nút xóa ảnh */}
                    <button
                      type="button"
                      onClick={(e) => handleRemovePhoto(idx, e)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center text-xs opacity-80 group-hover:opacity-100 transition-all"
                      title="Xóa ảnh này"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Nội dung Tab 2: Kho Lưu Trữ Khoảnh Khắc (Story Media Archive) */}
          {mediaTab === 'archive' && (
            archiveItems.length === 0 ? (
              <div className="p-8 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center">
                <i className="bi bi-archive text-3xl text-white/30 mb-2" />
                <p className="text-xs font-bold text-white/80">Kho Lưu Trữ Đang Trống</p>
                <p className="text-[11px] text-white/40 mt-1 max-w-xs">
                  Khi bạn đăng Story hoặc gỡ Story khỏi Bản đồ, khoảnh khắc sẽ tự động được lưu trữ an toàn tại đây để xem lại hoặc đưa lên Tin Nổi Bật.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {archiveItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => setViewingPhoto(item.image)}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-black/50 border border-white/10 group cursor-pointer shadow-md"
                  >
                    <img src={item.image} alt={item.title || 'Archived'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    
                    {/* Badge thời gian khoảnh khắc */}
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-mono text-[#10FFA0] flex items-center gap-1 border border-white/10">
                      <i className="bi bi-clock-history text-[8px]" />
                      <span>{new Date(item.created_at || Date.now()).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                    </div>

                    {/* Nút xóa vĩnh viễn khỏi kho */}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveArchiveItem(item.id, e)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center text-xs opacity-80 group-hover:opacity-100 transition-all shadow-md"
                      title="Xóa vĩnh viễn khỏi Kho Lưu Trữ"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* 4. Section Thông Tin Chi Tiết Cá Nhân */}
        <div className="p-4 rounded-3xl bg-[#121520] border border-white/10 space-y-3 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <i className="bi bi-card-text text-[#00E5FF] text-base" />
            <span className="font-bold text-white uppercase tracking-wider">Thông Tin Cá Nhân</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-white/50 block font-semibold">Tuổi</span>
              <span className="text-xs font-bold text-white mt-0.5 block">{age}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] text-white/50 block font-semibold">Nghề nghiệp</span>
              <span className="text-xs font-bold text-white mt-0.5 block truncate">{job}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-white/50 block font-semibold">Số điện thoại</span>
            <span className="text-xs font-bold text-white mt-0.5 block">{phone}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-white/50 block font-semibold mb-1">Tiểu sử giới thiệu</span>
            <p className="text-xs text-white/80 leading-relaxed font-normal">{bio}</p>
          </div>

          {/* Tags sở thích */}
          <div>
            <span className="text-[10px] text-white/50 block font-semibold mb-1.5">Sở thích & Phong cách</span>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-medium text-white/90">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Modal Chỉnh Sửa Hồ Sơ */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={user}
        currentStatus={userCustomStatus}
        onSaveProfile={async (profileData) => {
          if (onUpdateAvatar && profileData.avatarUrl !== undefined) {
            onUpdateAvatar(profileData.avatarUrl, photos);
          }
        }}
      />

      {/* 6. Hộp Thoại Xác Nhận Đăng Xuất */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-xs w-full bg-[#121520] border border-white/15 rounded-3xl p-5 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center text-xl">
              <i className="bi bi-box-arrow-right" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Xác nhận đăng xuất?</h3>
              <p className="text-xs text-white/60 mt-1">Bạn sẽ quay trở lại chế độ Khách của VIVU.</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold active:scale-95 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  if (onLogout) onLogout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Popup Xem Phóng To Ảnh Thật */}
      {viewingPhoto && (
        <div
          onClick={() => setViewingPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-lg w-full max-h-[85vh] rounded-3xl overflow-hidden bg-black shadow-2xl">
            <img src={viewingPhoto} alt="Phóng to ảnh" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => setViewingPhoto(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center text-sm border border-white/20"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
