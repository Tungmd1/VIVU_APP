import React from 'react';

/**
 * MessengerToolsDrawer - Khay Công Cụ Mở Rộng Trong Phòng Trò Chuyện (Rule 7 Anti-Monolith)
 * - 100% Bootstrap Icons (Rule 5)
 * - Các nút: Gửi Ảnh, Gửi Video, Gửi Vị Trí, Vị Trí Trực Tiếp (Live GPS), Bình Chọn
 */
export default function MessengerToolsDrawer({
  isOpen,
  onClose,
  chatFileInputRef,
  chatVideoInputRef,
  onSendLocation,
  onOpenLiveLocation,
  onOpenCreatePoll,
  activeConversation
}) {
  if (!isOpen) return null;

  return (
    <div className="mx-3 mb-2 p-3 bg-[rgba(20,20,30,0.96)] backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] grid grid-cols-5 gap-2 animate-in slide-in-from-bottom-3 duration-200 z-30 select-none">
      {/* 1. Gửi Ảnh */}
      <button
        type="button"
        onClick={() => chatFileInputRef?.current?.click()}
        className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white active:scale-95 transition-all cursor-pointer shadow-sm"
        title="Gửi hình ảnh"
      >
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#FF2A85] text-lg border border-white/10">
          <i className="bi bi-image"></i>
        </div>
        <span className="text-[10px] font-semibold">Gửi Ảnh</span>
      </button>

      {/* 2. Gửi Video */}
      <button
        type="button"
        onClick={() => chatVideoInputRef?.current?.click()}
        className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white active:scale-95 transition-all cursor-pointer shadow-sm"
        title="Gửi video ngắn"
      >
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#00E5FF] text-lg border border-white/10">
          <i className="bi bi-camera-video-fill"></i>
        </div>
        <span className="text-[10px] font-semibold">Gửi Video</span>
      </button>

      {/* 3. Gửi Vị Trí Tĩnh */}
      <button
        type="button"
        onClick={onSendLocation}
        className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white active:scale-95 transition-all cursor-pointer shadow-sm"
        title="Gửi tọa độ GPS hiện tại"
      >
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#00FF66] text-lg border border-white/10">
          <i className="bi bi-geo-alt-fill"></i>
        </div>
        <span className="text-[10px] font-semibold">Gửi Tọa Độ</span>
      </button>

      {/* 4. Vị Trí Trực Tiếp (Live GPS) */}
      <button
        type="button"
        onClick={() => {
          onClose();
          if (onOpenLiveLocation) onOpenLiveLocation();
        }}
        className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-[#00FF66]/10 hover:bg-[#00FF66]/20 border border-[#00FF66]/30 text-white active:scale-95 transition-all cursor-pointer shadow-sm"
        title="Chia sẻ vị trí trực tiếp theo thời gian thực"
      >
        <div className="w-10 h-10 rounded-full bg-[#00FF66]/20 flex items-center justify-center text-[#00FF66] text-lg border border-[#00FF66]/40 relative">
          <i className="bi bi-broadcast-pin"></i>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-ping" />
        </div>
        <span className="text-[10px] font-bold text-[#00FF66]">Trực Tiếp</span>
      </button>

      {/* 5. Tạo Bình Chọn */}
      <button
        type="button"
        onClick={() => {
          onClose();
          if (onOpenCreatePoll) onOpenCreatePoll();
        }}
        className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white active:scale-95 transition-all cursor-pointer shadow-sm group"
        title="Tạo bình chọn nhanh"
      >
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#FFD700] text-lg border border-white/10 group-hover:scale-105 transition-transform">
          <i className="bi bi-bar-chart-steps"></i>
        </div>
        <span className="text-[10px] font-semibold text-white/90">Bình Chọn</span>
      </button>
    </div>
  );
}
