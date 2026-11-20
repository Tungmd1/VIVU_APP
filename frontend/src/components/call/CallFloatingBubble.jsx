import React from 'react';
import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';

/**
 * CallFloatingBubble - Bong bóng nổi thu nhỏ cuộc gọi (Messenger Picture-in-Picture)
 * Cho phép người dùng vừa gọi điện vừa xem bản đồ, lướt chat mà không bị gián đoạn
 * 100% Bootstrap Icons (Rule 5) | Tối ưu < 150 dòng (Rule 7)
 */
export default function CallFloatingBubble({
  callSession,
  duration = 0,
  onExpand,
  onEndCall
}) {
  if (!callSession) return null;

  const isVideo = callSession.callType === 'video';
  const avatar = callSession.callerAvatar || callSession.avatar || DEFAULT_WHITE_PERSON_AVATAR;
  const name = callSession.callerName || callSession.name || 'VIVU Call';

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-24 right-4 z-60 animate-in slide-in-from-bottom-5 duration-300 select-none">
      <div className="relative group">
        {/* Main Floating Bubble Container */}
        <div
          onClick={onExpand}
          className="w-20 h-24 rounded-2xl bg-[#12131C]/90 border border-[#00E5FF]/40 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl p-1.5 flex flex-col items-center justify-between cursor-pointer hover:scale-105 active:scale-95 transition-all overflow-hidden"
        >
          {/* Status Header Dot & Icon */}
          <div className="w-full flex items-center justify-between px-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <i className={`bi ${isVideo ? 'bi-camera-video-fill text-[#00E5FF]' : 'bi-telephone-fill text-[#10B981]'} text-[10px]`} />
          </div>

          {/* Mini Avatar / Video Preview */}
          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 relative shadow-inner">
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          </div>

          {/* Call Duration Counter */}
          <span className="text-[10px] font-mono font-bold text-[#00E5FF] tracking-tight">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Nút ngắt máy nhanh góc trên bong bóng */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEndCall();
          }}
          className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#EF4444] text-white flex items-center justify-center text-xs shadow-md hover:bg-[#DC2626] active:scale-90 transition-all cursor-pointer"
          title="Kết thúc cuộc gọi"
        >
          <i className="bi bi-x" />
        </button>
      </div>
    </div>
  );
}
