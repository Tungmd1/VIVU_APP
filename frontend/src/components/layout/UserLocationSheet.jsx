import React, { useState } from 'react';
import VivuButton from '../common/VivuButton';

/**
 * UserLocationSheet - Bảng quản lý vị trí & trạng thái của bạn phong cách F1 Glass Bottom Sheet
 * docs/getdesign.md Quy chuẩn Lewis Hamilton / Silverstone F1 Hero
 * Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 7 (< 450 dòng), Rule 11 (GPS an toàn)
 */
export default function UserLocationSheet({ 
  isOpen, 
  userLat, 
  userLng, 
  locationAccuracy, 
  userCustomStatus, 
  userAvatar,
  onClose, 
  onOpenCreateStory, 
  onSelectStatus, 
  onRequestLocation,
  onOpenProfile
}) {
  const [customInput, setCustomInput] = useState(userCustomStatus || '');

  if (!isOpen) return null;

  const safeLat = userLat != null ? Number(userLat).toFixed(5) : '10.77690';
  const safeLng = userLng != null ? Number(userLng).toFixed(5) : '106.70090';

  const handleSaveStatus = (e) => {
    e.preventDefault();
    if (customInput.trim()) {
      onSelectStatus(customInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-center items-end animate-in fade-in duration-200 select-none font-sans">
      <div className="w-full max-w-md bg-[rgba(20,20,30,0.94)] text-white rounded-t-[32px] p-5 shadow-[0_-20px_60px_rgba(0,0,0,0.85)] border-t border-white/15 backdrop-blur-2xl space-y-4 animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Thanh kéo handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-1"></div>

        {/* Header thông tin cá nhân */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-13 h-13 rounded-full border-2 border-[#FF2A85] shadow-[0_0_15px_rgba(255,42,133,0.4)] overflow-hidden bg-white/5">
                <img 
                  src={userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
                  alt="My Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#FF2A85] border-2 border-[#0a0e1c] rounded-full flex items-center justify-center shadow-[0_0_8px_#FF2A85]">
                <i className="bi bi-check text-[10px] text-white font-black"></i>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Vị trí của bạn</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#FF2A85]/20 text-[#FF2A85] font-bold font-mono rounded-full border border-[#FF2A85]/30">
                  GPS
                </span>
              </h3>
              <div className="text-xs text-white/60 font-mono mt-0.5">
                {safeLat}° N, {safeLng}° E (±{locationAccuracy || 10}m)
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15"
          >
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>

        {/* Nút hành động chính: ĐĂNG STORY TẠI ĐÂY */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF2A85]/15 border border-[#FF2A85]/30 text-[#FF2A85] flex items-center justify-center shrink-0 font-bold shadow-xs">
              <i className="bi bi-megaphone-fill text-sm"></i>
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Chia sẻ khoảnh khắc với mọi người quanh đây</h4>
              <p className="text-[11px] text-white/60">Story sẽ được gắn ghim trực tiếp tại tọa độ GPS của bạn</p>
            </div>
          </div>

          <VivuButton
            variant="primary"
            size="md"
            pill={true}
            glow={true}
            icon="bi-plus-circle-fill"
            onClick={() => {
              onClose();
              onOpenCreateStory();
            }}
            className="w-full font-bold text-sm"
          >
            Đăng Story khoảnh khắc ngay
          </VivuButton>

          <VivuButton
            variant="secondary"
            size="md"
            pill={true}
            icon="bi-person-gear"
            onClick={() => {
              onClose();
              if (onOpenProfile) onOpenProfile();
            }}
            className="w-full font-semibold text-xs"
          >
            Xem Trang Cá Nhân &amp; Cài Đặt
          </VivuButton>
        </div>

        {/* Nhập trực tiếp tâm trạng trên ghim */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <i className="bi bi-chat-quote-fill text-[#FF2A85]"></i>
            <span>Tâm trạng hiển thị trên Giọt Nước của bạn:</span>
          </label>
          <form onSubmit={handleSaveStatus} className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Nhập trạng thái hiển thị trên map..."
              maxLength={60}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF2A85] focus:ring-1 focus:ring-[#FF2A85]/40 text-white text-xs placeholder-white/40 outline-none font-medium"
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

        {/* Tiện ích vị trí (Bootstrap Buttons) */}
        <div className="pt-2 border-t border-white/10 flex gap-2">
          <VivuButton
            variant="secondary"
            size="sm"
            pill={true}
            icon="bi-cursor-fill"
            onClick={() => {
              if (onRequestLocation) onRequestLocation();
            }}
            className="flex-1 font-bold text-xs"
          >
            Cập nhật vị trí GPS
          </VivuButton>

          <VivuButton
            variant="outline-secondary"
            size="sm"
            pill={true}
            onClick={onClose}
            className="px-5 font-bold text-xs"
          >
            Đóng
          </VivuButton>
        </div>

      </div>
    </div>
  );
}
