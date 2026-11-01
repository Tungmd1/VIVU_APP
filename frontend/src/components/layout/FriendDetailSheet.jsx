import React from 'react';
import VivuButton from '../common/VivuButton';

/**
 * FriendDetailSheet - Tấm Bottom Sheet hiển thị thông tin bạn bè phong cách F1 Glass Bottom Sheet
 * docs/getdesign.md Quy chuẩn Lewis Hamilton / Silverstone F1 Hero
 * Tuân thủ Rule 5 (Anti-Emoji & 100% Bootstrap Icons), Rule 11 (GPS Coalescing an toàn), Rule 7 (< 450 dòng)
 */
export default function FriendDetailSheet({ 
  friend, 
  userLat, 
  userLng, 
  onClose, 
  onOpenDirectChat, 
  onStartNavigation,
  onOpenMemeTroll 
}) {
  if (!friend) return null;

  // Rule 11: Fallback GPS an toàn đa tầng
  const safeFriendLat = friend.realLat ?? (userLat + (friend.latOffset || 0.002));
  const safeFriendLng = friend.realLng ?? (userLng + (friend.lngOffset || 0.002));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-center items-end animate-in fade-in duration-200 select-none font-sans">
      {/* Vùng click ngoài để đóng */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Khung Sheet chính F1 Glass */}
      <div className="relative z-10 w-full max-w-md bg-[rgba(20,20,30,0.94)] text-white rounded-t-[32px] p-5 shadow-[0_-20px_60px_rgba(0,0,0,0.85)] border-t border-white/15 backdrop-blur-2xl space-y-4 animate-in slide-in-from-bottom-6 duration-300">
        
        {/* Thanh gạt nhỏ ở đỉnh */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-1"></div>
        
        {/* Thông tin Avatar & Tên & Nút đóng */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={friend.avatar} 
                alt={friend.name} 
                className="w-14 h-14 rounded-full object-cover border-2 border-[#FF2A85] shadow-[0_0_15px_rgba(255,42,133,0.4)]" 
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#FF2A85] border-2 border-[#0a0e1c] shadow-[0_0_6px_#FF2A85]"></span>
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                <span>{friend.name}</span>
                <i className="bi bi-patch-check-fill text-[#00E5FF] text-xs" title="Bạn bè đã kết nối"></i>
              </h3>
              <div className="flex items-center gap-2 text-xs mt-0.5">
                <span className="text-[#00E5FF] font-mono font-bold flex items-center gap-1">
                  <i className="bi bi-battery-charging text-xs"></i>
                  <span>Pin {friend.battery || '90%'}</span>
                </span>
                <span className="text-white/30">•</span>
                <span className="text-white/60 font-mono flex items-center gap-1">
                  <i className="bi bi-geo-alt-fill text-[11px] text-[#FF2A85]"></i>
                  <span>Cách bạn {friend.liveDistance || friend.distance || 'Gần đây'}</span>
                </span>
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-sm btn-secondary rounded-full w-8 h-8 p-0 cursor-pointer"
            title="Đóng"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>
        </div>

        {/* Hộp thông tin vị trí & Tọa độ GPS */}
        <div className="bg-white/5 rounded-2xl p-3.5 text-xs space-y-2 border border-white/10">
          <div className="flex items-center gap-2.5 text-white">
            <i className="bi bi-geo-alt-fill text-sm text-[#FF2A85] shrink-0"></i>
            <span className="font-medium truncate">{friend.lastSeenLocation || 'Đang di chuyển trên tuyến đường'}</span>
          </div>

          <div className="flex items-center gap-2.5 text-white/60">
            <i className="bi bi-clock-fill text-xs text-white/40 shrink-0"></i>
            <span>{friend.onlineStatus || 'Vừa mới hoạt động'}</span>
          </div>

          {/* Rule 11: Tọa độ GPS an toàn */}
          <div className="flex items-center gap-2 text-[11px] text-white/50 font-mono pt-2 border-t border-white/10">
            <i className="bi bi-crosshair text-[#00E5FF] shrink-0"></i>
            <span>Tọa độ GPS: {Number(safeFriendLat).toFixed(5)}° N, {Number(safeFriendLng).toFixed(5)}° E</span>
          </div>
        </div>

        {/* Cặp nút hành động: Chỉ đường & Nhắn tin (Bootstrap VivuButtons) */}
        <div className="pt-1 flex gap-2">
          {/* Nút Ném Meme Troll */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenMemeTroll) onOpenMemeTroll(friend);
            }}
            className="w-10 h-10 rounded-full bg-[#FF2A85]/20 hover:bg-[#FF2A85]/30 border border-[#FF2A85]/40 text-[#FF529D] flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-[0_0_12px_rgba(255,42,133,0.3)]"
            title="Ném Meme Troll bạn bè"
          >
            <i className="bi bi-fire text-base" />
          </button>

          {/* Nút Chỉ đường */}
          <VivuButton
            variant="secondary"
            size="md"
            pill={true}
            icon="bi-cursor-fill"
            onClick={() => {
              onClose();
              if (onStartNavigation) onStartNavigation(friend);
            }}
            className="flex-1 font-bold text-xs"
            title="Bật chỉ đường đến chỗ bạn bè"
          >
            Chỉ đường
          </VivuButton>

          {/* Nút Nhắn tin */}
          <VivuButton
            variant="primary"
            size="md"
            pill={true}
            glow={true}
            icon="bi-chat-dots-fill"
            onClick={() => {
              onClose();
              if (onOpenDirectChat) onOpenDirectChat(friend);
            }}
            className="flex-1 font-bold text-xs"
          >
            Nhắn tin
          </VivuButton>
        </div>
      </div>
    </div>
  );
}
