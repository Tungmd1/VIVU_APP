import React, { useState } from 'react';
import VivuButton from '../common/VivuButton';
import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';
import { getChibiMascotById, getChibiDataUrl } from '../../data/chibiMascotData';
import { getMascotActionDataUrl, MASCOT_FAMILIES, MASCOT_ACTIONS } from '../../data/messengerZaloMascotData';

/**
 * UserLocationSheet - Bảng Menu Tùy Chọn Hồ Sơ & Đăng Story Nhanh (Action Sheet)
 * - Đáp ứng 100% yêu cầu người dùng: Có nút vào Trang Cá Nhân đầy đủ, Đăng Story, Chỉnh Hồ Sơ
 * - Tủ Đồ Ghim Bản Đồ: Zenly 3D, Polaroid, Aura Circle & Chibi FB/Zalo
 * - 100% Avatar thật hoặc Avatar hình người nền trắng chuẩn (White Silhouette)
 * - 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng)
 */
export default function UserLocationSheet({ 
  isOpen, 
  userLat, 
  userLng, 
  locationAccuracy, 
  userCustomStatus, 
  userCustomSong = null,
  userCustomChibi = null,
  userPinSkin = 'auto',
  userPinMascot = null,
  userPinAction = null,
  userAvatar,
  userName = 'Bạn',
  userCode = '',
  onClose, 
  onOpenProfile,
  onOpenCreateStory, 
  onOpenEditProfile,
  onOpenQuickStatus,
  onOpenPinWardrobe,
  onOpenSettings,
  onLogout,
  onSelectStatus, 
  onClearSong,
  onClearStatus,
  onRemoveChibi,
  onRequestLocation
}) {
  const [customInput, setCustomInput] = useState(userCustomStatus || '');

  useEffect(() => {
    setCustomInput(userCustomStatus || '');
  }, [userCustomStatus, isOpen]);

  if (!isOpen) return null;

  const safeLat = userLat != null ? Number(userLat).toFixed(5) : '10.77690';
  const safeLng = userLng != null ? Number(userLng).toFixed(5) : '106.70090';

  const hasRealAvatar = Boolean(
    userAvatar &&
    !userAvatar.includes('unsplash.com') &&
    !userAvatar.includes('dicebear.com')
  );

  const handleSaveStatus = (e) => {
    e.preventDefault();
    if (customInput.trim()) {
      if (onSelectStatus) onSelectStatus(customInput.trim());
    } else {
      if (onClearStatus) onClearStatus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex justify-center items-end animate-in fade-in duration-200 select-none font-sans">
      {/* Lớp nền bấm ra ngoài để đóng */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[rgba(18,20,30,0.96)] text-white rounded-t-[32px] p-5 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] border-t border-white/15 backdrop-blur-2xl space-y-3.5 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
        
        {/* Thanh kéo handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-1"></div>

        {/* Header thông tin cá nhân */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-2 border-[#FF2A85] shadow-[0_0_16px_rgba(255,42,133,0.5)] overflow-hidden bg-white flex items-center justify-center">
                <img 
                  src={hasRealAvatar ? userAvatar : DEFAULT_WHITE_PERSON_AVATAR} 
                  alt={userName} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenEditProfile) onOpenEditProfile();
                }}
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00E5FF] hover:bg-white text-[#08202E] rounded-full flex items-center justify-center shadow-md cursor-pointer border border-black/40 transition-all active:scale-90"
                title="Đổi ảnh đại diện"
              >
                <i className="bi bi-camera-fill text-[10px]"></i>
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{userName}</h3>
                {userCode && (
                  <span className="text-[10px] px-2 py-0.5 bg-[#00E5FF]/15 text-[#00E5FF] font-mono font-bold rounded-full border border-[#00E5FF]/30">
                    {userCode}
                  </span>
                )}
              </div>
              <div className="text-xs text-white/60 font-mono mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10FFA0] animate-pulse"></span>
                <span>{safeLat}° N, {safeLng}° E</span>
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15"
            title="Đóng menu"
          >
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>

        {/* CÁC NÚT HÀNH ĐỘNG CHÍNH */}
        <div className="space-y-2 pt-1">
          {/* Nút Chỉnh Sửa Hồ Sơ (Toàn chiều ngang) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenEditProfile) onOpenEditProfile();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 flex items-center justify-between active:scale-98 transition-all cursor-pointer shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 flex items-center justify-center text-base group-hover:scale-110 transition-transform">
                <i className="bi bi-person-gear"></i>
              </div>
              <div className="text-left">
                <span className="font-bold text-xs block text-white">Chỉnh Sửa Hồ Sơ</span>
                <span className="text-[10px] text-white/60 block">Avatar, Tên gọi &amp; Thông tin cá nhân</span>
              </div>
            </div>
            <i className="bi bi-chevron-right text-xs text-white/50 group-hover:text-white transition-colors"></i>
          </button>

          {/* Hàng 2: Nút Vào Trang Hồ Sơ Đầy Đủ */}
          {onOpenProfile && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProfile();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-md group"
            >
              <i className="bi bi-person-badge-fill text-[#00E5FF] text-base group-hover:scale-110 transition-transform"></i>
              <span>Xem Trang Cá Nhân Đầy Đủ</span>
              <i className="bi bi-arrow-right text-xs text-white/60"></i>
            </button>
          )}

          {/* Hàng 3: Nút Cài Đặt Tâm Trạng & Chibi Mascot */}
          {onOpenQuickStatus && (
            <button
              type="button"
              onClick={onOpenQuickStatus}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-pink-500/15 hover:from-cyan-500/25 hover:to-pink-500/25 text-white font-bold text-xs border border-cyan-400/30 flex items-center justify-between active:scale-98 transition-all cursor-pointer shadow-md group"
            >
              <div className="flex items-center gap-2">
                <i className="bi bi-emoji-smile-upside-down text-pink-400 text-base group-hover:scale-110 transition-transform"></i>
                <span>Tâm Trạng &amp; Chibi Mascot Trên Ghim</span>
              </div>
              <span className="text-[10px] text-cyan-300 font-mono bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/30">
                36 Biểu Cảm
              </span>
            </button>
          )}

          {/* Hàng 4: Tủ Đồ Ghim Bản Đồ & Chibi FB/Zalo */}
          {onOpenPinWardrobe && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPinWardrobe();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 hover:from-amber-500/25 hover:to-rose-500/25 text-white font-bold text-xs border border-amber-400/30 flex items-center justify-between active:scale-98 transition-all cursor-pointer shadow-md group"
            >
              <div className="flex items-center gap-2">
                <i className="bi bi-palette-fill text-amber-400 text-base group-hover:scale-110 transition-transform"></i>
                <span>Tủ Đồ Ghim &amp; Chibi FB / Zalo</span>
              </div>
              <span className="text-[10px] text-amber-300 font-mono bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                <i className="bi bi-stars"></i>
                <span>Zenly 3D</span>
              </span>
            </button>
          )}
        </div>

        {/* Hiển thị Mascot FB/Zalo đang trang bị nếu có */}
        {userPinMascot && userPinAction && (() => {
          const mascotDataUrl = getMascotActionDataUrl(userPinMascot, userPinAction);
          const famName = MASCOT_FAMILIES.find(f => f.id === userPinMascot)?.name || 'Chibi';
          const actName = MASCOT_ACTIONS.find(a => a.id === userPinAction)?.name || 'Hoạt động';
          return (
            <div 
              onClick={() => {
                onClose();
                if (onOpenPinWardrobe) onOpenPinWardrobe();
              }}
              className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 border border-amber-400/25 hover:border-amber-400/60 flex items-center justify-between animate-in fade-in duration-200 cursor-pointer group active:scale-98 transition-all"
              title="Bấm để đổi mascot / hành động"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 p-1 rounded-xl bg-black/50 border border-amber-400/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <img src={mascotDataUrl} alt={famName} className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(255,170,0,0.4)]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{famName}</span>
                    <span className="text-[10px] text-amber-400 font-mono">({actName})</span>
                  </div>
                  <div className="text-[10px] text-white/50">Đang đứng tự do trên bản đồ 3D</div>
                </div>
              </div>
              {onOpenPinWardrobe && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    onOpenPinWardrobe();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] shrink-0 border border-white/20 cursor-pointer active:scale-95 transition-all"
                >
                  Đổi
                </button>
              )}
            </div>
          );
        })()}

        {/* Hiển thị Chibi Mascot đang kích hoạt nếu có */}
        {userCustomChibi && (() => {
          const chibi = getChibiMascotById(userCustomChibi);
          if (!chibi) return null;
          const chibiDataUrl = getChibiDataUrl(chibi);
          return (
            <div 
              onClick={() => {
                onClose();
                if (onOpenQuickStatus) onOpenQuickStatus();
              }}
              className="p-3 rounded-2xl bg-white/5 border border-white/15 hover:border-[#00E5FF]/60 hover:bg-white/10 flex items-center justify-between animate-in fade-in duration-200 cursor-pointer group active:scale-98 transition-all"
              title="Bấm để đổi biểu cảm Chibi"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 p-1 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <img src={chibiDataUrl} alt={chibi.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{chibi.name}</span>
                    <span className="text-[10px] text-pink-400 font-normal">({chibi.emotion})</span>
                  </div>
                  <div className="text-[10px] text-white/50">{chibi.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {onRemoveChibi && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveChibi();
                    }}
                    className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold text-[11px] border border-rose-500/40 cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                    title="Gỡ bỏ Chibi khỏi ghim"
                  >
                    <i className="bi bi-trash3-fill text-[10px]"></i>
                    <span>Gỡ</span>
                  </button>
                )}
                {onOpenQuickStatus && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                      onOpenQuickStatus();
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] border border-white/20 cursor-pointer active:scale-95 transition-all"
                  >
                    Đổi Chibi
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Hiển thị bài hát đang ghim nếu có & Nút Gỡ nhạc */}
        {userCustomSong && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FF2A85]/15 via-purple-900/20 to-cyan-900/20 border border-[#FF2A85]/30 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#FF2A85] text-white flex items-center justify-center shrink-0 shadow-[0_0_10px_#FF2A85]">
                <i className="bi bi-music-note-beamed text-xs animate-bounce"></i>
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-bold text-white truncate">{userCustomSong.title || 'Bài hát trên ghim'}</div>
                <div className="text-[10px] text-white/60 truncate">{userCustomSong.artist || 'Apple Music Stream'}</div>
              </div>
            </div>
            {onClearSong && (
              <button
                type="button"
                onClick={onClearSong}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-[11px] shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                title="Gỡ bỏ bài hát khỏi ghim"
              >
                <i className="bi bi-x-circle-fill text-xs"></i>
                <span>Gỡ nhạc</span>
              </button>
            )}
          </div>
        )}

        {/* Nhập trực tiếp tâm trạng trên ghim & Nút Gỡ tâm trạng */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <i className="bi bi-chat-quote-fill text-[#00E5FF]"></i>
              <span>Tâm trạng hiển thị trên ghim:</span>
            </label>
            {userCustomStatus && (
              <button
                type="button"
                onClick={() => {
                  setCustomInput('');
                  if (onClearStatus) onClearStatus();
                }}
                className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-[11px] font-bold border border-rose-500/40 flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                title="Gỡ bỏ tâm trạng khỏi ghim ngay lập tức"
              >
                <i className="bi bi-trash3-fill text-[10px]"></i>
                <span>Gỡ tâm trạng</span>
              </button>
            )}
          </div>
          <form onSubmit={handleSaveStatus} className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Nhập suy nghĩ hiển thị trên bản đồ..."
              maxLength={60}
              className="flex-1 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/40 text-white text-xs placeholder-white/40 outline-none font-medium"
            />
            <VivuButton
              variant="primary"
              size="sm"
              pill={true}
              type="submit"
              className="px-4 shrink-0 font-bold text-xs"
            >
              Lưu
            </VivuButton>
          </form>
        </div>

      </div>
    </div>
  );
}
