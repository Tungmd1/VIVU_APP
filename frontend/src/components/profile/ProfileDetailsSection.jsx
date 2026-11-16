import React from 'react';

/**
 * ProfileDetailsSection - Bảng hiển thị thông tin chi tiết (Tuổi, Nghề, SĐT, Bio, Tags)
 * Hỗ trợ phân quyền riêng tư per-field: Công khai | Bạn bè | Chỉ tôi
 * Tách module chuẩn Rule 7 (< 450 dòng) và 100% Bootstrap Icons (Rule 5)
 */
export default function ProfileDetailsSection({
  age,
  job,
  phone,
  bio,
  tags = [],
  isOwner = false,
  isFriend = false,
  privacyAge = 'public',
  privacyPhone = 'friends',
  privacyTags = 'public'
}) {
  const canSeeAge = isOwner || privacyAge === 'public' || (privacyAge === 'friends' && isFriend);
  const canSeePhone = isOwner || privacyPhone === 'public' || (privacyPhone === 'friends' && isFriend);
  const canSeeTags = isOwner || privacyTags === 'public' || (privacyTags === 'friends' && isFriend);

  const displayAge = canSeeAge ? (age || 'Chưa cập nhật') : 'Riêng tư';
  const displayPhone = canSeePhone 
    ? (phone || 'Chưa cập nhật') 
    : (privacyPhone === 'friends' ? 'Chỉ bạn bè mới xem được' : 'Riêng tư');

  return (
    <div className="p-4 rounded-3xl bg-[#121520] border border-white/10 space-y-3 text-xs select-none">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <i className="bi bi-card-text text-[#00E5FF] text-base" />
          <span className="font-bold text-white uppercase tracking-wider">Thông Tin Cá Nhân</span>
        </div>
        {isOwner && (
          <span className="text-[10px] text-white/40 font-mono">Hồ sơ của bạn</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/50 block font-semibold">Tuổi</span>
            {!canSeeAge && <i className="bi bi-lock-fill text-[10px] text-white/40" title="Đã ẩn riêng tư" />}
          </div>
          <span className={`text-xs font-bold mt-0.5 block ${!canSeeAge ? 'text-white/40 italic' : 'text-white'}`}>
            {displayAge}
          </span>
        </div>
        <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
          <span className="text-[10px] text-white/50 block font-semibold">Nghề nghiệp</span>
          <span className="text-xs font-bold text-white mt-0.5 block truncate">
            {job || 'Chưa cập nhật'}
          </span>
        </div>
      </div>

      <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/50 block font-semibold">Số điện thoại</span>
          {!canSeePhone && <i className="bi bi-shield-lock-fill text-[10px] text-white/40" title="Bảo mật riêng tư" />}
        </div>
        <span className={`text-xs font-bold mt-0.5 block ${!canSeePhone ? 'text-white/40 italic' : 'text-white'}`}>
          {displayPhone}
        </span>
      </div>

      <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
        <span className="text-[10px] text-white/50 block font-semibold mb-1">Tiểu sử giới thiệu</span>
        <p className="text-xs text-white/80 leading-relaxed font-normal">
          {bio || 'Chưa cập nhật tiểu sử giới thiệu.'}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-white/50 block font-semibold">Sở thích &amp; Phong cách</span>
          {!canSeeTags && <i className="bi bi-lock-fill text-[10px] text-white/40" title="Đã ẩn riêng tư" />}
        </div>
        {canSeeTags ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-medium text-white/90">
                  #{tag}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-white/40 italic">Chưa chọn sở thích</span>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-white/40 italic">Sở thích được đặt ở chế độ riêng tư</span>
        )}
      </div>
    </div>
  );
}
