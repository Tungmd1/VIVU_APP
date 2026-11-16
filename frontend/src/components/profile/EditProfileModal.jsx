import React, { useState, useEffect, useRef } from 'react';
import { TRENDING_SONGS } from '../../data/trendingSongs';
import { compressAvatar } from '../../utils/imageCompressor';

// Danh sách gợi ý các sở thích VIVU phong phú
const SUGGESTED_TAGS = [
  'CafeĐêm', 'ĂnUống', 'DạoPhố', 'XemPhim', 'ChụpẢnhFilm', 
  'DuLịch', 'ÂmNhạcLofi', 'ThểThao', 'ChơiGame', 'ĐọcSách'
];

/**
 * EditProfileModal - Modal Chỉnh Sửa Hồ Sơ Cá Nhân Toàn Diện
 * Chuẩn Resend Dark Monochrome, 100% Bootstrap Icons
 * Hỗ trợ tải avatar trực tiếp từ thiết bị (nén 256x256 WebP/JPEG), nhập họ tên, tuổi, nghề nghiệp, bio, sđt, bài hát yêu thích, sở thích
 */
export default function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  currentStatus,
  onSaveProfile,
  isSubmitting
}) {
  const fileInputRef = useRef(null);
  const prevIsOpenRef = useRef(false);

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [customStatus, setCustomStatus] = useState('');
  const [age, setAge] = useState('');
  const [job, setJob] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteSong, setFavoriteSong] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);
  const [privacyAge, setPrivacyAge] = useState('public');
  const [privacyPhone, setPrivacyPhone] = useState('friends');
  const [privacyTags, setPrivacyTags] = useState('public');

  // Chỉ khởi tạo state khi modal chuyển từ đóng sang mở, chống re-render đè avatar vừa chọn
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const meta = currentUser?.user_metadata || {};
      const currentAvatar = meta.avatar_url || currentUser?.avatar || currentUser?.avatar_url || '';
      setFullName(meta.full_name || currentUser?.name || currentUser?.fullName || '');
      setAvatarUrl(currentAvatar);
      setCustomStatus(meta.custom_status || currentStatus || '');
      setAge(meta.age || '');
      setJob(meta.job || '');
      setPhone(meta.phone || '');
      setBio(meta.bio || '');
      setFavoriteSong(meta.favorite_song || TRENDING_SONGS[0]?.title || '');
      setSelectedTags(Array.isArray(meta.tags) ? meta.tags : ['CafeĐêm', 'DạoPhố']);
      setPrivacyAge(meta.privacy_age || currentUser?.privacy_age || 'public');
      setPrivacyPhone(meta.privacy_phone || currentUser?.privacy_phone || 'friends');
      setPrivacyTags(meta.privacy_tags || currentUser?.privacy_tags || 'public');
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, currentUser, currentStatus]);

  if (!isOpen) return null;

  // Xử lý tải ảnh đại diện từ thiết bị với nén Canvas tự động
  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa 15MB');
      return;
    }
    setIsCompressingAvatar(true);
    try {
      const compressedDataUrl = await compressAvatar(file, 256, 256, 0.85);
      setAvatarUrl(compressedDataUrl);
    } catch (err) {
      console.warn('Lỗi nén ảnh, fallback sang FileReader:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingAvatar(false);
      e.target.value = '';
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAddNewTag = (e) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim().replace(/^#/, '');
    if (!selectedTags.includes(clean)) {
      setSelectedTags(prev => [...prev, clean]);
    }
    setNewTagInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanProfile = {
      fullName: fullName.trim() || 'Người dùng VIVU',
      avatarUrl: avatarUrl || null,
      customStatus: customStatus.trim() || 'Đang vivu dạo phố',
      age: age ? Number(age) : null,
      job: job.trim() || '',
      phone: phone.trim() || '',
      bio: bio.trim() || '',
      favorite_song: favoriteSong || '',
      privacy_age: privacyAge,
      privacy_phone: privacyPhone,
      privacy_tags: privacyTags,
      tags: selectedTags
    };

    // 1. Lưu ngay lập tức vào bộ nhớ cục bộ chống mất mát thông tin
    const targetUserId = currentUser?.id || localStorage.getItem('vivu_client_user_id');
    try {
      const scopedKey = targetUserId && targetUserId !== 'guest' ? `vivu_user_profile_data_${targetUserId}` : null;
      const existingRaw = localStorage.getItem('vivu_user_profile_data');
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      const payload = { ...existing, ...cleanProfile };
      localStorage.setItem('vivu_user_profile_data', JSON.stringify(payload));
      if (scopedKey) {
        localStorage.setItem(scopedKey, JSON.stringify(payload));
      }
    } catch (saveErr) {
      console.warn('Lỗi lưu local storage:', saveErr);
    }

    // 2. Lập tức thoát modal theo yêu cầu trải nghiệm
    onClose();

    // 3. Đồng bộ lên state hệ thống và backend
    if (onSaveProfile) {
      Promise.resolve(onSaveProfile({ ...cleanProfile, userId: targetUserId })).catch(err => {
        console.warn('Lỗi khi lưu profile:', err);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none font-sans">
      <div className="w-full max-w-md bg-[#0E0E10] rounded-3xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-[90vh] flex flex-col text-white overflow-hidden">
        
        {/* Ẩn file input tải avatar */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarFile}
          accept="image/*"
          className="hidden"
        />

        {/* Header Modal - Cố định ở đỉnh */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center text-sm border border-white/15">
              <i className="bi bi-person-gear text-base"></i>
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Chỉnh Sửa Hồ Sơ</h2>
              <p className="text-[10px] text-[#8E8E93]">Tất cả thông tin do bạn toàn quyền quyết định</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#8E8E93] hover:text-white flex items-center justify-center transition-colors"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>
        </div>

        {/* Form Nhập Liệu với Thanh Nút Bấm Cố Định Dưới Cùng */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          
          <div className="p-5 overflow-y-auto no-scrollbar flex-1 space-y-4">
            {/* 1. Ảnh Đại Diện: Xem trước & Nút Tải Lên */}
          <div className="flex items-center gap-4 bg-[#151619] p-3 rounded-2xl border border-white/10">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shrink-0 bg-white flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <i className="bi bi-person-fill text-3xl text-neutral-400"></i>
              )}
              {isCompressingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <i className="bi bi-arrow-repeat text-lg text-[#00E5FF] animate-spin"></i>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <span className="text-xs font-bold text-white block">Ảnh đại diện</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressingAvatar}
                  className="px-3 py-1.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="bi bi-upload"></i>
                  <span>{isCompressingAvatar ? 'Đang nén ảnh...' : 'Tải ảnh từ máy'}</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 text-rose-400 hover:bg-white/20 text-xs cursor-pointer"
                    title="Xóa avatar"
                  >
                    <i className="bi bi-trash3"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. Họ và tên & Tuổi */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-medium text-[#8E8E93]">Họ và tên *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập tên hiển thị..."
                required
                className="w-full bg-[#151619] border border-white/10 focus:border-white/40 rounded-xl px-3 py-2 text-xs text-white placeholder-[#8E8E93] outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-[#8E8E93]">Tuổi</label>
                <select
                  value={privacyAge}
                  onChange={(e) => setPrivacyAge(e.target.value)}
                  className="bg-transparent text-[10px] text-[#00E5FF] font-medium outline-none cursor-pointer border-b border-[#00E5FF]/30 pb-0.5"
                  title="Quyền riêng tư tuổi"
                >
                  <option value="public" className="bg-[#151619] text-white">Công khai</option>
                  <option value="friends" className="bg-[#151619] text-white">Bạn bè</option>
                  <option value="private" className="bg-[#151619] text-white">Chỉ tôi</option>
                </select>
              </div>
              <input
                type="number"
                min={13}
                max={99}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="VD: 22"
                className="w-full bg-[#151619] border border-white/10 focus:border-white/40 rounded-xl px-3 py-2 text-xs text-white placeholder-[#8E8E93] outline-none"
              />
            </div>
          </div>

          {/* 3. Nghề nghiệp & Số điện thoại */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#8E8E93]">Nghề nghiệp / Trường học</label>
              <input
                type="text"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="VD: Sinh viên ĐH Bách Khoa..."
                className="w-full bg-[#151619] border border-white/10 focus:border-white/40 rounded-xl px-3 py-2 text-xs text-white placeholder-[#8E8E93] outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-[#8E8E93]">Số điện thoại</label>
                <select
                  value={privacyPhone}
                  onChange={(e) => setPrivacyPhone(e.target.value)}
                  className="bg-transparent text-[10px] text-[#00E5FF] font-medium outline-none cursor-pointer border-b border-[#00E5FF]/30 pb-0.5"
                  title="Quyền riêng tư số điện thoại"
                >
                  <option value="friends" className="bg-[#151619] text-white">Bạn bè</option>
                  <option value="public" className="bg-[#151619] text-white">Công khai</option>
                  <option value="private" className="bg-[#151619] text-white">Chỉ tôi</option>
                </select>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xx xxx xxx"
                className="w-full bg-[#151619] border border-white/10 focus:border-white/40 rounded-xl px-3 py-2 text-xs text-white placeholder-[#8E8E93] outline-none"
              />
            </div>
          </div>

          {/* 4. Trạng thái ngắn (Tâm trạng) */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[#8E8E93]">Trạng thái tâm trạng hôm nay</label>
            <input
              type="text"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              placeholder="VD: Đang vivu dạo phố cuối tuần..."
              className="w-full bg-[#151619] border border-white/10 focus:border-white/40 rounded-xl px-3 py-2 text-xs text-white placeholder-[#8E8E93] outline-none"
            />
          </div>

          {/* 5. Giới thiệu bản thân (Bio) */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[#8E8E93]">Tiểu sử / Giới thiệu bản thân (Bio)</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Chia sẻ đôi nét về tính cách, đam mê, gu âm nhạc của bạn..."
              className="w-full bg-[#151619] border border-white/10 focus:border-white/40 rounded-xl p-3 text-xs text-white placeholder-[#8E8E93] outline-none resize-none"
            />
          </div>

          {/* 6. Bài hát yêu thích (Chọn từ Kho 21 bài hát thịnh hành) */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[#8E8E93]">Bài hát yêu thích</label>
            <select
              value={favoriteSong}
              onChange={(e) => setFavoriteSong(e.target.value)}
              className="w-full bg-[#151619] border border-white/10 focus:border-white/40 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
            >
              <option value="">-- Chọn bài hát từ kho thịnh hành --</option>
              {TRENDING_SONGS.map(s => (
                <option key={s.id} value={`${s.title} (${s.artist})`} className="bg-[#111111] text-white">
                  {s.title} - {s.artist}
                </option>
              ))}
            </select>
          </div>

          {/* 7. Danh sách Sở thích Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#8E8E93]">Sở thích &amp; Phong cách của bạn</span>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-[10px]">Đã chọn {selectedTags.length}</span>
                <select
                  value={privacyTags}
                  onChange={(e) => setPrivacyTags(e.target.value)}
                  className="bg-transparent text-[10px] text-[#00E5FF] font-medium outline-none cursor-pointer border-b border-[#00E5FF]/30 pb-0.5"
                  title="Quyền riêng tư sở thích"
                >
                  <option value="public" className="bg-[#151619] text-white">Công khai</option>
                  <option value="friends" className="bg-[#151619] text-white">Bạn bè</option>
                  <option value="private" className="bg-[#151619] text-white">Chỉ tôi</option>
                </select>
              </div>
            </div>

            {/* Các tag gợi ý */}
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                      isSelected
                        ? 'bg-white text-black font-bold shadow-xs'
                        : 'bg-[#151619] border border-white/10 text-[#8E8E93] hover:text-white'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>

            {/* Thêm tag tùy ý */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Thêm sở thích khác (VD: #NhiepAnh)..."
                className="flex-1 bg-[#151619] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#8E8E93] outline-none"
              />
              <button
                type="button"
                onClick={handleAddNewTag}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>

          {/* Nút Submit Cố Định Dưới Cùng (Sticky Footer) */}
          <div className="p-4 bg-[#0E0E10] border-t border-white/10 flex gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-white text-black text-xs font-extrabold hover:bg-[#EAEAEA] active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin"></i>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check2"></i>
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
