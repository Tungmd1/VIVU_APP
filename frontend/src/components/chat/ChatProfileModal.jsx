import React from 'react';

/**
 * ChatProfileModal - Modal xem hồ sơ chi tiết của bạn chat khi chạm vào Avatar/Header
 * Chuẩn Luminous Solar-Cyber HUD (White Cyberpunk), 100% Bootstrap Icons
 */
export default function ChatProfileModal({
  isOpen,
  onClose,
  conversation,
  friend,
  userLat,
  userLng,
  onStartCall,
  onOpenMap
}) {
  if (!isOpen || !conversation) return null;

  const displayName = friend?.name || conversation.name;
  const displayAvatar = friend?.avatar || conversation.avatar;
  const isGroup = conversation.type === 'group';
  const memberCount = (conversation.memberIds?.length || 0) + 1;
  const messageCount = conversation.messages?.length || 0;
  const streakLevel = Math.max(1, Math.floor(messageCount / 3));

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 select-none font-sans">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm bg-white border border-[#D2D9F4] rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] text-[#131315] space-y-4 animate-in zoom-in-95 duration-200">
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F2F3FF] hover:bg-[#E6E7F6] text-[#70787E] hover:text-[#131315] flex items-center justify-center transition-all active:scale-90 border border-[#D2D9F4]"
        >
          <i className="bi bi-x-lg text-xs"></i>
        </button>

        {/* Avatar & Tên & Huy hiệu */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="relative w-20 h-20 rounded-full p-0.5 border-2 border-[#10FFA0] shadow-[0_0_20px_rgba(16,255,160,0.4)] mb-3">
            <img
              src={displayAvatar}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#10FFA0] border-2 border-white"></span>
          </div>

          <h3 className="font-bold text-lg text-[#131315] font-display flex items-center gap-1.5">
            <span>{displayName}</span>
            <i className="bi bi-patch-check-fill text-[#00838F] text-sm"></i>
          </h3>

          <p className="text-xs text-[#70787E] mt-0.5">
            {isGroup ? `Nhóm trò chuyện • ${memberCount} thành viên` : 'Bạn bè đã kết nối trên VIVU'}
          </p>

          {/* Huy hiệu Chuỗi thân thiết nếu có */}
          {!isGroup && messageCount >= 3 && (
            <div className="mt-2.5 px-3 py-1 rounded-full bg-[rgba(255,170,0,0.15)] border border-[rgba(255,170,0,0.4)] text-[#B06000] text-xs font-bold flex items-center gap-1.5">
              <i className="bi bi-fire text-[#FFAA00]"></i>
              <span>Chuỗi thân thiết: Cấp {streakLevel} ({messageCount} tin nhắn)</span>
            </div>
          )}
        </div>

        {/* Thông tin cự ly & vị trí */}
        <div className="bg-[#FAFAFF] rounded-2xl p-3.5 space-y-2 border border-[#D2D9F4] text-xs">
          <div className="flex items-center justify-between text-[#70787E]">
            <span>Trạng thái:</span>
            <span className="text-[#00838F] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10FFA0] animate-pulse"></span>
              <span>Đang trực tuyến</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-[#70787E]">
            <span>Cự ly hiện tại:</span>
            <span className="text-[#131315] font-mono font-medium">
              {friend?.liveDistance || friend?.distance || 'Khoảng 420m'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#70787E]">
            <span>Mức pin thiết bị:</span>
            <span className="text-[#00838F] font-mono font-medium">
              {friend?.battery || '94%'}
            </span>
          </div>
        </div>

        {/* Các nút hành động nhanh */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => {
              onClose();
              if (onStartCall) onStartCall(conversation, 'voice');
            }}
            className="py-2.5 px-2 rounded-2xl bg-[#F2F3FF] hover:bg-[#E6E7F6] border border-[#D2D9F4] text-[#131315] text-xs font-semibold flex flex-col items-center gap-1 active:scale-95 transition-all shadow-xs"
          >
            <i className="bi bi-telephone-fill text-base text-[#00838F]"></i>
            <span>Gọi thoại</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onStartCall) onStartCall(conversation, 'video');
            }}
            className="py-2.5 px-2 rounded-2xl bg-[#F2F3FF] hover:bg-[#E6E7F6] border border-[#D2D9F4] text-[#131315] text-xs font-semibold flex flex-col items-center gap-1 active:scale-95 transition-all shadow-xs"
          >
            <i className="bi bi-camera-video-fill text-base text-[#00B4D8]"></i>
            <span>Gọi video</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onOpenMap) onOpenMap(friend);
            }}
            className="py-2.5 px-2 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] text-xs font-bold font-display flex flex-col items-center gap-1 active:scale-95 transition-all border border-[#00F0FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]"
          >
            <i className="bi bi-geo-alt-fill text-base"></i>
            <span>Xem Map</span>
          </button>
        </div>

      </div>
    </div>
  );
}
