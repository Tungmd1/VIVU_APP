import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';
import CallCanvasFilterOverlay, { AR_FILTERS } from './CallCanvasFilterOverlay';

/**
 * MessengerActiveCallModal - Giao diện Cuộc gọi Đang diễn ra chuẩn phong cách Facebook Messenger
 * - Video đối phương toàn màn hình (Full-bleed immersive)
 * - Khung video bản thân (Self-view) thu nhỏ góc màn hình kèm bộ lọc AR tương tác
 * - Thanh công cụ nổi: Thu nhỏ PiP, Lật Camera, Đổi Bộ lọc AR, Tắt Mic, Tắt Cam, Ngắt máy
 * - 100% Bootstrap Icons (Rule 5) | Tối ưu < 400 dòng (Rule 7)
 */
export default function MessengerActiveCallModal({
  callSession,
  localStream,
  remoteStream,
  duration = 0,
  isMuted = false,
  isVideoOff = false,
  onToggleMute,
  onToggleVideo,
  onSwitchCamera,
  onMinimize,
  onEndCall
}) {
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [isFilterTrayOpen, setIsFilterTrayOpen] = useState(false);
  const [isSelfViewEnlarged, setIsSelfViewEnlarged] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const isVideo = callSession?.callType === 'video';
  const name = callSession?.name || callSession?.callerName || 'Người dùng VIVU';
  const avatar = callSession?.avatar || callSession?.callerAvatar || DEFAULT_WHITE_PERSON_AVATAR;
  const status = callSession?.status || 'ringing';

  // Gắn stream vào các thẻ video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoOff]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!callSession) return null;

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-65 bg-[#08090C] flex flex-col justify-between overflow-hidden select-none animate-fadeIn text-white">
      {/* 1. KHUNG HÌNH CHÍNH (REMOTE VIDEO HOẶC AVATAR) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-radial from-[#1A1C24] to-[#0A0B10]">
        {isVideo && remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          /* Cuộc gọi Thoại hoặc Camera đối phương tắt: Hiển thị Avatar Cyberpunk */
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-44 h-44 rounded-full bg-[#00E5FF]/15 animate-ping duration-1000" />
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#00E5FF] to-[#FF2A85] shadow-[0_0_40px_rgba(0,229,255,0.4)] relative z-10">
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover rounded-full bg-black/60"
                />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold font-display text-white">{name}</h2>
              <p className="text-sm font-mono text-[#00E5FF]">
                {status === 'active' ? formatDuration(duration) : 'Đang kết nối...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. KHUNG HÌNH BẢN THÂN THU NHỎ (SELF-VIEW PIP) CÓ AR FILTER */}
      {isVideo && (
        <div
          onClick={() => setIsSelfViewEnlarged(!isSelfViewEnlarged)}
          className={`absolute z-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transition-all duration-300 cursor-pointer bg-black/80 ${
            isSelfViewEnlarged
              ? 'top-20 left-4 right-4 h-72'
              : 'top-20 right-4 w-28 h-40 md:w-36 md:h-52'
          }`}
          title="Nhấn để đổi kích thước"
        >
          {isVideoOff ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#15161E] text-white/50 gap-2">
              <i className="bi bi-camera-video-off-fill text-2xl text-[#EF4444]" />
              <span className="text-[10px] font-medium">Camera tắt</span>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100" // Lật gương tự nhiên
              />
              {/* Lớp phủ Canvas AR Filter */}
              <CallCanvasFilterOverlay filterType={selectedFilter} />
            </div>
          )}

          {/* Nhãn bạn */}
          <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] font-bold text-white/90">
            Bạn
          </div>
        </div>
      )}

      {/* 3. THANH ĐỈNH ĐẦU (TOP BAR) */}
      <div className="relative z-30 p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Nút Thu nhỏ PiP */}
        <button
          onClick={onMinimize}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
          title="Thu nhỏ cuộc gọi (PiP)"
        >
          <i className="bi bi-chevron-down text-lg text-white" />
        </button>

        {/* Thông tin cuộc gọi & Đồng hồ đếm giờ */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-white/70 font-semibold font-display">
            {isVideo ? 'Gọi Video' : 'Gọi Thoại'} • {name}
          </p>
          <p className="text-sm font-mono font-bold text-[#00E5FF]">
            {status === 'active' ? formatDuration(duration) : 'Đang đổ chuông...'}
          </p>
        </div>

        {/* Nút Đổi Camera trước / sau */}
        {isVideo ? (
          <button
            onClick={onSwitchCamera}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
            title="Đổi camera"
          >
            <i className="bi bi-camera-reverse text-lg text-white" />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* 4. KHAY CHỌN BỘ LỌC AR (FILTER TRAY TỰ ĐỘNG BẬT KHI NHẤN NÚT SAO) */}
      {isVideo && isFilterTrayOpen && (
        <div className="relative z-30 mx-4 mb-3 p-3 rounded-2xl bg-black/75 border border-white/15 backdrop-blur-2xl animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-[#00E5FF] flex items-center gap-1.5 font-display">
              <i className="bi bi-stars" />
              Bộ lọc Canvas AR VIVU
            </span>
            <button
              onClick={() => setIsFilterTrayOpen(false)}
              className="text-xs text-white/60 hover:text-white"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {AR_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <i className={`bi ${f.icon} text-sm`} />
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. DOCK ĐIỀU KHIỂN NỔI (BOTTOM CONTROL DOCK PHONG CÁCH MESSENGER) */}
      <div className="relative z-30 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-center gap-4 md:gap-6">
        {/* Nút Bộ lọc AR (Chỉ cho Video Call) */}
        {isVideo && (
          <button
            onClick={() => setIsFilterTrayOpen(!isFilterTrayOpen)}
            className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              isFilterTrayOpen || selectedFilter !== 'none'
                ? 'bg-[#00E5FF] text-[#08202E] shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title="Bộ lọc AR"
          >
            <i className="bi bi-stars text-xl" />
          </button>
        )}

        {/* Nút Bật / Tắt Microphone */}
        <button
          onClick={onToggleMute}
          className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            isMuted
              ? 'bg-[#EF4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
              : 'bg-white/15 text-white hover:bg-white/25'
          }`}
          title={isMuted ? 'Bật Mic' : 'Tắt Mic'}
        >
          <i className={`bi ${isMuted ? 'bi-mic-mute-fill' : 'bi-mic-fill'} text-xl`} />
        </button>

        {/* Nút Bật / Tắt Video Camera (Chỉ cho Video Call) */}
        {isVideo && (
          <button
            onClick={onToggleVideo}
            className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              isVideoOff
                ? 'bg-[#EF4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title={isVideoOff ? 'Bật Camera' : 'Tắt Camera'}
          >
            <i className={`bi ${isVideoOff ? 'bi-camera-video-off-fill' : 'bi-camera-video-fill'} text-xl`} />
          </button>
        )}

        {/* Nút Kết Thúc Cuộc Gọi (Đỏ nổi bật) */}
        <button
          onClick={onEndCall}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#EF4444] to-[#F87171] text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.55)] hover:scale-105 active:scale-90 transition-all cursor-pointer"
          title="Kết thúc cuộc gọi"
        >
          <i className="bi bi-telephone-x-fill text-2xl" />
        </button>
      </div>
    </div>
  );
}
