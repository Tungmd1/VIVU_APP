import React from 'react';
import ProfilePlaceMapWidget from './ProfilePlaceMapWidget';
import { 
  playTactileClickSound, 
  playProfileChime, 
  triggerProfileHaptic, 
  triggerConfettiBurst 
} from './profileAudioEffects';

/**
 * ProfileBentoWidgets - Hệ thống Bento Grid không gian chuẩn Luminous Solar-Cyber HUD (White Cyberpunk)
 * Căn cứ kỹ thuật: DESIGN.md & get_design.md (Nút 4.7, 4.8, 4.9, 4.10, 4.11)
 * 100% Bootstrap Icons (Zero Unicode Emoji), Rule 7 (< 450 dòng)
 */
export default function ProfileBentoWidgets({
  user,
  photos = [],
  activePhotoIndex = 0,
  setActivePhotoIndex,
  onAddPhoto,
  onRemovePhoto,
  onUpdateAvatar,
  friends = [],
  stories = [],
  customCircles = [],
  location,
  userCode,
  onOpenCreateCircle,
  onSelectCircleOnMap,
  onRequestLocation,
  onOpenRightFriendshipPanel,
  onDirectChat,
  onOpenEditProfile,
  onOpenSettings,
  onLogout,
  onStartNavigation,
  onBackToMap,
  fileInputRef
}) {
  const meta = user?.user_metadata || {};
  const userBio = meta.bio || 'Thích vivu khám phá thành phố, kết nối bạn bè quanh đây và lưu giữ những khoảnh khắc đẹp...';
  const userTags = Array.isArray(meta.tags) && meta.tags.length > 0 ? meta.tags : ['Cafe', 'Phượt đêm', 'Công nghệ', 'Acoustic'];
  const displayCode = userCode || meta.user_code || 'VU-0001';

  const handleShareProfile = () => {
    playProfileChime();
    triggerProfileHaptic([50, 30, 80]);
    triggerConfettiBurst();

    if (navigator.share) {
      navigator.share({
        title: `Hồ sơ VIVU của ${meta.full_name || 'VIVU Member'}`,
        text: `Kết nối với tôi trên VIVU! Mã cá nhân: ${displayCode}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${window.location.origin}/#${displayCode}`);
      alert(`Đã sao chép link hồ sơ và mã cá nhân: ${displayCode}!`);
    }
  };

  const safeLat = location?.lat ?? location?.latitude ?? 10.7769;
  const safeLng = location?.lng ?? location?.longitude ?? 106.7009;

  return (
    <div className="space-y-4 px-3 sm:px-0">
      
      {/* 1. CẶP NÚT ACTION ĐÁY (NÚT 4.10 MÃ QR RADAR & NÚT 4.11 CHIA SẺ HỒ SƠ) */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => { playTactileClickSound(); onOpenSettings?.(); }}
          className="h-12 rounded-2xl bg-white border border-[#D2D9F4] hover:bg-[#F2F3FF] text-[#131315] font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <i className="bi bi-qr-code-scan text-base text-[#00838F]"></i>
          <span>Mã QR Radar</span>
        </button>

        <button
          type="button"
          onClick={handleShareProfile}
          className="h-12 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] border border-[#00F0FF] text-[#08202E] font-display font-black text-xs sm:text-sm hover:opacity-95 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(0,229,255,0.40)] cursor-pointer tracking-wide"
        >
          <i className="bi bi-share-fill text-sm"></i>
          <span>Chia sẻ Hộ Chiếu</span>
        </button>
      </div>

      {/* 2. CHỈ SỐ KHÁM PHÁ VẾT CHÂN ZENLY (3 METRIC CARDS NỀN TRẮNG VIỀN CYAN/PINK/LIME) */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#D2D9F4] text-center shadow-xs hover:border-[#00E5FF] transition-all">
          <div className="text-[11px] text-[#70787E] flex items-center justify-center gap-1.5 mb-1">
            <i className="bi bi-map-fill text-[#00838F]"></i>
            <span className="font-medium">Bản đồ</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-[#131315] font-mono">14.8%</div>
          <div className="text-[10px] text-[#00838F] truncate font-semibold mt-0.5">TP. Đà Nẵng</div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#D2D9F4] text-center shadow-xs hover:border-[#FF2A85] transition-all">
          <div className="text-[11px] text-[#70787E] flex items-center justify-center gap-1.5 mb-1">
            <i className="bi bi-compass-fill text-[#FF2A85]"></i>
            <span className="font-medium">Vết chân</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-[#131315] font-mono">24.5 km</div>
          <div className="text-[10px] text-[#FF2A85] truncate font-semibold mt-0.5">Đã di chuyển</div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#D2D9F4] text-center shadow-xs hover:border-[#10FFA0] transition-all">
          <div className="text-[11px] text-[#70787E] flex items-center justify-center gap-1.5 mb-1">
            <i className="bi bi-trophy-fill text-[#10FFA0]"></i>
            <span className="font-medium">Huy hiệu</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-[#131315] font-mono">Tier 3</div>
          <div className="text-[10px] text-[#10FFA0] truncate font-semibold mt-0.5">Dân Phố Cổ</div>
        </div>
      </div>

      {/* 2.5 HỘ CHIẾU SỞ THÍCH: MINI MAP & ĐỊA ĐIỂM CHECK-IN GẮN SAO */}
      <ProfilePlaceMapWidget
        userId={user?.id || 'default'}
        location={location}
        onStartNavigation={onStartNavigation}
        onBackToMap={onBackToMap}
      />

      {/* 3. BENTO GRID 2 CỘT HIỆN ĐẠI (WHITE CYBERPUNK THEME) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        
        {/* CỘT TRÁI: BỘ SƯU TẬP ẢNH & GPS PHẦN CỨNG */}
        <div className="space-y-3.5">
          {/* Bộ sưu tập ảnh (Nút 4.7 & Nút 4.8) */}
          <div className="bg-white rounded-3xl p-4 border border-[#D2D9F4] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="bi bi-images text-[#00838F]"></i>
                <h3 className="font-bold text-xs sm:text-sm text-[#131315] font-display tracking-tight">
                  Ảnh trong hồ sơ ({photos.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { playTactileClickSound(); fileInputRef.current?.click(); }}
                className="h-7 px-3 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] border border-[#00F0FF] text-[#08202E] font-display text-[11px] font-bold hover:opacity-95 active:scale-95 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <i className="bi bi-plus-lg font-bold"></i>
                <span>Thêm ảnh</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {photos.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => { playTactileClickSound(); setActivePhotoIndex(idx); }}
                  className={`relative aspect-square rounded-2xl overflow-hidden border cursor-pointer transition-all ${
                    idx === activePhotoIndex
                      ? 'border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.35)] scale-105'
                      : 'border-[#D2D9F4] opacity-85 hover:opacity-100 hover:border-[#00E5FF]'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  
                  <button
                    type="button"
                    onClick={(e) => onRemovePhoto(e, idx)}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 hover:bg-[#EF4444] text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                    title="Gỡ ảnh"
                  >
                    <i className="bi bi-x text-[10px] font-bold"></i>
                  </button>

                  {idx === 0 ? (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-[#10FFA0] text-[#08202E] text-[8px] font-black flex items-center gap-0.5 shadow-xs">
                      <i className="bi bi-star-fill text-[6px]"></i>
                      <span>Avatar</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playProfileChime();
                        triggerProfileHaptic([30, 20, 50]);
                        const reordered = [img, ...photos.filter((_, i) => i !== idx)];
                        setActivePhotoIndex(0);
                        if (onUpdateAvatar) onUpdateAvatar(img, reordered);
                      }}
                      className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-white/90 border border-[#D2D9F4] text-[#131315] hover:bg-[#00E5FF] hover:text-[#08202E] text-[8px] font-bold transition-all flex items-center gap-0.5 shadow-xs active:scale-95 cursor-pointer"
                      title="Đặt làm avatar"
                    >
                      <i className="bi bi-geo-alt-fill text-[6px] text-[#00838F]"></i>
                      <span>Đặt avatar</span>
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => { playTactileClickSound(); fileInputRef.current?.click(); }}
                className="aspect-square rounded-2xl border border-dashed border-[#00E5FF] hover:border-[#00838F] flex flex-col items-center justify-center text-[#00838F] hover:bg-[#ECEDFB] transition-all bg-[#F2F3FF] active:scale-95 cursor-pointer shadow-xs"
                title="Tải ảnh lên từ máy"
              >
                <i className="bi bi-camera-fill text-lg"></i>
                <span className="text-[10px] font-mono font-bold mt-0.5">Tải lên</span>
              </button>
            </div>
          </div>

          {/* Tọa độ GPS phần cứng & Bảo mật */}
          <div className="bg-white rounded-3xl p-4 border border-[#D2D9F4] space-y-3 shadow-xs">
            <h3 className="font-bold text-xs sm:text-sm text-[#131315] font-display flex items-center gap-1.5">
              <i className="bi bi-broadcast text-[#00838F]"></i>
              <span>Tọa độ GPS phần cứng</span>
            </h3>
            <div className="p-3 bg-[#FAFAFF] rounded-2xl flex items-center justify-between border border-[#D2D9F4]">
              <div>
                <div className="text-xs font-mono font-medium text-[#131315]">
                  {Number(safeLat).toFixed(5)}° N, {Number(safeLng).toFixed(5)}° E
                </div>
                <div className="text-[10px] text-[#70787E]">Độ chính xác cao • Phát sóng thời gian thực</div>
              </div>
              <button 
                type="button"
                onClick={() => { playTactileClickSound(); onRequestLocation?.(); }}
                className="px-3 py-1 bg-[#F2F3FF] border border-[#D2D9F4] rounded-full text-[11px] font-semibold text-[#131315] hover:bg-[#E6E7F6] transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                Làm mới
              </button>
            </div>

            {/* Hộp Đăng Xuất */}
            <div className="p-3 bg-[#FFE8F0] rounded-2xl border border-[#FFB8D2] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#FF2A85] font-display">Đăng xuất tài khoản</div>
                <div className="text-[10px] text-[#70787E]">Kết thúc phiên làm việc</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playTactileClickSound();
                  if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi VIVU?')) {
                    if (onLogout) onLogout();
                  }
                }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#EF4444] hover:bg-[#DC2626] text-white active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs font-display"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: KÈO ĐI CHƠI (HINGE PROMPT) & BẠN BÈ / NHÓM RIÊNG */}
        <div className="space-y-3.5">
          {/* Hinge Prompt & Sở thích (Nút 4.9) */}
          <div className="bg-white rounded-3xl p-4 border border-[#D2D9F4] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-[#131315] font-display flex items-center gap-1.5">
                <i className="bi bi-chat-heart-fill text-[#FF2A85]"></i>
                <span>Kèo đi chơi lý tưởng (Hinge Prompt)</span>
              </h3>
              <button 
                type="button"
                onClick={() => { playTactileClickSound(); onOpenEditProfile?.(); }} 
                className="h-6 px-2.5 rounded-md bg-[#F2F3FF] border border-[#D2D9F4] text-[#131315] hover:bg-[#E6E7F6] flex items-center gap-1 font-semibold text-[11px] transition-all cursor-pointer shadow-xs"
              >
                <i className="bi bi-pencil text-[#00838F] text-[10px]"></i>
                <span>Sửa</span>
              </button>
            </div>
            
            <p className="text-xs text-[#40484D] leading-relaxed bg-[#FAFAFF] p-3 rounded-2xl border border-[#D2D9F4] whitespace-pre-wrap">
              {userBio}
            </p>

            <div className="pt-1">
              <div className="text-[11px] text-[#70787E] mb-1.5 font-medium">Huy hiệu sở thích</div>
              <div className="flex flex-wrap gap-1.5">
                {userTags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-[#F2F3FF] border border-[#D2D9F4] text-xs text-[#00838F] font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bạn bè quanh đây */}
          <div className="bg-white rounded-3xl p-4 border border-[#D2D9F4] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-[#131315] font-display flex items-center gap-1.5">
                <i className="bi bi-people-fill text-[#00838F]"></i>
                <span>Bạn bè quanh đây ({friends.length})</span>
              </h3>
              {onOpenRightFriendshipPanel && (
                <button 
                  type="button"
                  onClick={() => { playTactileClickSound(); onOpenRightFriendshipPanel(); }}
                  className="text-xs font-semibold text-[#00838F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Kết bạn mới</span>
                  <i className="bi bi-chevron-right text-[10px]"></i>
                </button>
              )}
            </div>

            {friends.length === 0 ? (
              <div className="p-3.5 rounded-2xl bg-[#FAFAFF] border border-dashed border-[#D2D9F4] text-center space-y-2">
                <p className="text-xs text-[#70787E]">Chưa có bạn bè nào trong danh bạ.</p>
                {onOpenRightFriendshipPanel && (
                  <button
                    type="button"
                    onClick={() => { playTactileClickSound(); onOpenRightFriendshipPanel(); }}
                    className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] border border-[#00F0FF] text-[#08202E] font-display font-bold text-xs active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <i className="bi bi-person-plus-fill"></i>
                    <span>Tìm bạn bè quanh đây</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {friends.slice(0, 8).map(f => (
                  <div 
                    key={f.id}
                    onClick={() => { playTactileClickSound(); if (onDirectChat) onDirectChat(f); }}
                    className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                    title={`Nhắn tin với ${f.name}`}
                  >
                    <div className="relative">
                      <img 
                        src={f.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(f.name)}`}
                        alt={f.name}
                        className="w-12 h-12 rounded-full object-cover border border-[#D2D9F4] group-hover:border-[#00E5FF] transition-colors"
                      />
                      {f.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10FFA0] border-2 border-white shadow-[0_0_6px_#10FFA0]"></span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#40484D] max-w-[56px] truncate group-hover:text-[#00838F] transition-colors">
                      {f.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nhóm riêng của bạn */}
          <div className="bg-white rounded-3xl p-4 border border-[#D2D9F4] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-[#131315] font-display flex items-center gap-1.5">
                <i className="bi bi-collection-fill text-[#00838F]"></i>
                <span>Nhóm riêng của bạn ({customCircles.length})</span>
              </h3>
              <button 
                type="button"
                onClick={() => { playTactileClickSound(); onOpenCreateCircle?.(); }}
                className="text-xs font-semibold text-[#00838F] hover:underline flex items-center gap-1 cursor-pointer font-display"
              >
                <i className="bi bi-plus-lg"></i>
                <span>Tạo nhóm</span>
              </button>
            </div>

            <div className="space-y-2">
              {customCircles.length === 0 ? (
                <div className="p-3 rounded-2xl bg-[#FAFAFF] text-center text-xs text-[#70787E] border border-dashed border-[#D2D9F4]">
                  Chưa có nhóm riêng nào.
                </div>
              ) : (
                customCircles.map(c => {
                  const count = c.member_ids?.length || c.memberIds?.length || (Array.isArray(c.members) ? c.members.filter(m => m.status === 'accepted').length : 1);
                  const isOwner = c.isOwner || c.owner_id === user?.id;
                  return (
                    <div key={c.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAFAFF] border border-[#D2D9F4] hover:border-[rgba(0,229,255,0.4)] transition-all">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={c.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(c.name || 'group')}`} 
                          alt="" 
                          className="w-9 h-9 rounded-xl object-cover border border-[#D2D9F4] shrink-0" 
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-[#131315] font-display truncate max-w-[130px]">{c.name}</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-bold shrink-0 ${
                              isOwner ? 'bg-[rgba(255,170,0,0.15)] text-[#B06000] border border-[rgba(255,170,0,0.4)]' : 'bg-[#F2F3FF] text-[#70787E] border border-[#D2D9F4]'
                            }`}>
                              {isOwner ? 'Trưởng nhóm' : 'Thành viên'}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#70787E] flex items-center gap-1 mt-0.5">
                            <span className="text-[#40484D] font-medium">{count} thành viên</span>
                            <span>•</span>
                            <span>Đồng bộ 3D</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => { playTactileClickSound(); onSelectCircleOnMap(c); }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-[rgba(0,229,255,0.15)] hover:bg-[rgba(0,229,255,0.25)] text-[#00667A] border border-[rgba(0,229,255,0.4)] transition-all active:scale-95 cursor-pointer shrink-0"
                      >
                        Xem Map
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
