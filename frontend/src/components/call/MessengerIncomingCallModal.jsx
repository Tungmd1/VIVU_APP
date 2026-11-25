import React from 'react';
import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';

/**
 * MessengerIncomingCallModal - Màn hình Cuộc gọi đến chuẩn phong cách Facebook Messenger
 * - Avatar tỏa sóng Cyberpunk neon
 * - 2 nút cảm ứng lớn: Từ chối (Đỏ) và Trả lời (Xanh)
 * - 100% Bootstrap Icons (Rule 5) | Tối ưu < 180 dòng (Rule 7)
 */
export default function MessengerIncomingCallModal({
  incomingCall,
  onAccept,
  onDecline
}) {
  if (!incomingCall) return null;

  const isVideo = incomingCall.callType === 'video';
  const callerAvatar = incomingCall.callerAvatar || DEFAULT_WHITE_PERSON_AVATAR;
  const callerName = incomingCall.callerName || 'Người dùng VIVU';

  return (
    <div className="fixed inset-0 z-[90] bg-gradient-to-b from-[#0B0C10]/95 via-[#12131C]/95 to-[#050608]/98 backdrop-blur-2xl flex flex-col justify-between items-center py-14 px-6 select-none animate-fadeIn text-white">
      {/* Top Header Information */}
      <div className="text-center space-y-2 mt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
          <i className={`bi ${isVideo ? 'bi-camera-video-fill text-[#00E5FF]' : 'bi-telephone-fill text-[#10FFA0]'} text-xs animate-pulse`} />
          <span className="text-xs font-semibold text-white/90 uppercase tracking-wider font-display">
            {isVideo ? 'Cuộc gọi video VIVU' : 'Cuộc gọi thoại VIVU'}
          </span>
        </div>

        <h2 className="text-3xl font-extrabold text-white font-display tracking-tight drop-shadow-md">
          {callerName}
        </h2>

        <p className="text-sm font-medium text-[#00E5FF] font-mono animate-pulse">
          Đang đổ chuông...
        </p>
      </div>

      {/* Center Avatar with Pulsing Cyberpunk Waves */}
      <div className="relative my-auto flex items-center justify-center">
        {/* Pulsing Ripple Waves */}
        <div className="absolute w-48 h-48 rounded-full bg-[#00E5FF]/20 animate-ping duration-1000" />
        <div className="absolute w-56 h-56 rounded-full bg-[#FF2A85]/15 animate-pulse duration-700" />

        {/* Circular Avatar Container */}
        <div className="relative w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-[#00E5FF] via-white to-[#FF2A85] shadow-[0_0_50px_rgba(0,229,255,0.45)] z-10">
          <img
            src={callerAvatar}
            alt={callerName}
            className="w-full h-full object-cover rounded-full bg-black/80"
          />
        </div>
      </div>

      {/* Bottom Action Buttons (Decline / Accept) */}
      <div className="w-full max-w-sm flex items-center justify-around mb-6 px-4">
        {/* Nút Từ chối (Đỏ) */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onDecline}
            className="w-[72px] h-[72px] rounded-full bg-gradient-to-tr from-[#EF4444] to-[#F87171] text-white flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:scale-105 active:scale-90 transition-all cursor-pointer"
            title="Từ chối cuộc gọi"
          >
            <i className="bi bi-telephone-x-fill text-2xl" />
          </button>
          <span className="text-xs text-white/70 font-medium">Từ chối</span>
        </div>

        {/* Nút Trả lời (Xanh) */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onAccept}
            className="w-[72px] h-[72px] rounded-full bg-gradient-to-tr from-[#10B981] to-[#34D399] text-white flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.55)] hover:scale-105 active:scale-90 transition-all cursor-pointer animate-bounce"
            title="Nhận cuộc gọi"
          >
            <i className="bi bi-telephone-fill text-2xl" />
          </button>
          <span className="text-xs text-[#34D399] font-bold">Trả lời</span>
        </div>
      </div>
    </div>
  );
}
