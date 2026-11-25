import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';
import CallCanvasFilterOverlay, { AR_FILTERS } from './CallCanvasFilterOverlay';

/**
 * MessengerActiveCallModal - Giao diện Cuộc gọi 3 tầng chống đè (Top Header -> Stage -> Bottom Dock)
 * - Hỗ trợ chuyển đổi chế độ PiP và Chia đôi màn hình 50/50 (Dual Split) cho Video Call 2 chiều
 * - Gắn muted trên <video> đối phương (âm thanh phát qua <audio>) để tránh browser chặn autoplay
 * - 100% Bootstrap Icons (Rule 5) | Tailwind v3.4.17 classes | < 360 dòng (Rule 7)
 */
export default function MessengerActiveCallModal({
  callSession,
  localStream,
  remoteStream,
  duration = 0,
  isMuted = false,
  isVideoOff = false,
  remoteMediaState = null,
  onToggleMute,
  onToggleVideo,
  onSwitchCamera,
  onMinimize,
  onEndCall
}) {
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [isFilterTrayOpen, setIsFilterTrayOpen] = useState(false);
  const [isSelfViewEnlarged, setIsSelfViewEnlarged] = useState(false);
  const [isDualSplit, setIsDualSplit] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const isVideo = callSession?.callType === 'video';
  const name = callSession?.name || callSession?.callerName || 'Người dùng VIVU';
  const avatar = callSession?.avatar || callSession?.callerAvatar || DEFAULT_WHITE_PERSON_AVATAR;
  const status = callSession?.status || 'ringing';

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play?.().catch(() => {});
    }
  }, [localStream, isVideoOff, isDualSplit, isSelfViewEnlarged]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play?.().catch(() => {});
    }
  }, [remoteStream, remoteMediaState?.isVideoOff, isDualSplit]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play?.().catch(() => {});
    }
  }, [remoteStream]);

  if (!callSession) return null;

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (status === 'active') return formatDuration(duration);
    if (status === 'connecting') return 'Đang thiết lập kết nối mã hóa...';
    return 'Đang đổ chuông...';
  };

  const remoteHasVideo = Boolean(
    remoteStream &&
    remoteStream.getVideoTracks().some(t => t.readyState === 'live' && t.enabled) &&
    !remoteMediaState?.isVideoOff
  );

  const renderRemoteTile = (compact = false) => (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#1A1C24] to-[#0A0B10] ${compact ? 'rounded-2xl border border-white/15' : 'rounded-3xl border border-white/10'}`}>
      {isVideo && remoteStream && remoteHasVideo ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="relative flex items-center justify-center">
            <div className={`${compact ? 'w-28 h-28' : 'w-40 h-40 sm:w-44 sm:h-44'} absolute rounded-full bg-[#00E5FF]/15 animate-ping duration-1000`} />
            <div className={`${compact ? 'w-20 h-20' : 'w-28 h-28 sm:w-32 sm:h-32'} rounded-full p-1 bg-gradient-to-tr from-[#00E5FF] to-[#FF2A85] shadow-[0_0_40px_rgba(0,229,255,0.4)] relative z-10`}>
              <img src={avatar} alt={name} className="w-full h-full object-cover rounded-full bg-black/60" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className={`${compact ? 'text-base' : 'text-xl sm:text-2xl'} font-bold font-display text-white`}>{name}</h2>
            <p className="text-xs sm:text-sm font-mono text-[#00E5FF]">{getStatusText()}</p>
          </div>
        </div>
      )}

      {/* Nhãn đối phương & trạng thái mic/cam từ remoteMediaState */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-10">
        <span className="px-2 py-0.5 rounded-lg bg-black/65 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white">
          {name}
        </span>
        {remoteMediaState?.isMuted && (
          <span className="px-1.5 py-0.5 rounded-lg bg-[#EF4444]/85 text-[10px] font-bold text-white flex items-center gap-1" title="Đối phương đang tắt mic">
            <i className="bi bi-mic-mute-fill" />
          </span>
        )}
        {isVideo && remoteMediaState?.isVideoOff && (
          <span className="px-1.5 py-0.5 rounded-lg bg-black/75 border border-white/15 text-[10px] text-white/80 flex items-center gap-1" title="Đối phương đang tắt camera">
            <i className="bi bi-camera-video-off-fill text-[#EF4444]" />
          </span>
        )}
      </div>
    </div>
  );

  const renderLocalTile = (isSplitTile = false) => (
    <div
      onClick={() => { if (!isSplitTile) setIsSelfViewEnlarged(!isSelfViewEnlarged); }}
      className={
        isSplitTile
          ? 'relative w-full h-full rounded-2xl overflow-hidden border border-white/20 bg-black/80'
          : `z-20 rounded-2xl overflow-hidden border-2 border-white/25 shadow-2xl transition-all duration-300 cursor-pointer bg-black/85 ${
              isSelfViewEnlarged
                ? 'absolute inset-3'
                : 'absolute bottom-3 right-3 w-[108px] h-[152px] sm:w-[144px] sm:h-[204px]'
            }`
      }
      title={isSplitTile ? 'Camera của bạn' : 'Nhấn để phóng to / thu nhỏ'}
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
            className="w-full h-full object-cover transform -scale-x-100"
          />
          <CallCanvasFilterOverlay filterType={selectedFilter} />
        </div>
      )}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/65 border border-white/10 text-[10px] font-bold text-white/90 flex items-center gap-1">
        <span>Bạn</span>
        {isMuted && <i className="bi bi-mic-mute-fill text-[#EF4444]" />}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[90] h-[100dvh] bg-[#08090C] flex flex-col justify-between overflow-hidden select-none animate-fadeIn text-white">
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      {/* TẦNG 1: THANH ĐỈNH ĐẦU (KHÔNG CHỒNG LẤN PIP HAY DOCK) */}
      <div className="shrink-0 z-30 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] flex items-center justify-between gap-2 bg-[#0B0D14]/90 border-b border-white/10 backdrop-blur-xl">
        <button
          type="button"
          onClick={onMinimize}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer shrink-0"
          title="Thu nhỏ cuộc gọi (PiP)"
        >
          <i className="bi bi-chevron-down text-lg text-white" />
        </button>

        <div className="text-center min-w-0 flex-1 px-1">
          <p className="text-[11px] uppercase tracking-wider text-white/75 font-semibold font-display truncate">
            {isVideo ? 'Gọi Video' : 'Gọi Thoại'} • {name}
          </p>
          <p className="text-xs sm:text-sm font-mono font-bold text-[#00E5FF] truncate">
            {getStatusText()}
          </p>
        </div>

        {isVideo ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsDualSplit(v => !v);
                setIsSelfViewEnlarged(false);
              }}
              className={`h-10 px-2.5 rounded-full flex items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                isDualSplit
                  ? 'bg-[#00E5FF] text-[#08202E] shadow-[0_0_14px_rgba(0,229,255,0.4)]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isDualSplit ? 'Chế độ PiP nổi' : 'Chia đôi màn hình 2 chiều'}
            >
              <i className="bi bi-layout-split text-sm" />
              <span className="hidden sm:inline">Chia đôi</span>
            </button>
            <button
              type="button"
              onClick={onSwitchCamera}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
              title="Đổi camera"
            >
              <i className="bi bi-camera-reverse text-lg text-white" />
            </button>
          </div>
        ) : (
          <div className="w-10 shrink-0" />
        )}
      </div>

      {/* TẦNG 2: VÙNG HIỂN THỊ VIDEO LINH HOẠT */}
      <div className="flex-1 min-h-0 relative p-2.5 sm:p-4 overflow-hidden">
        {isVideo && isDualSplit ? (
          <div className="w-full h-full grid grid-cols-1 grid-rows-2 sm:grid-cols-2 sm:grid-rows-1 gap-2.5 sm:gap-3">
            {renderRemoteTile(true)}
            {renderLocalTile(true)}
          </div>
        ) : (
          <div className="relative w-full h-full">
            {renderRemoteTile(false)}
            {isVideo && renderLocalTile(false)}
          </div>
        )}
      </div>

      {/* TẦNG 3: KHAY AR FILTER & DOCK ĐIỀU KHIỂN ĐÁY */}
      <div className="shrink-0 z-30 bg-[#0B0D14]/92 border-t border-white/10 backdrop-blur-xl">
        {isVideo && isFilterTrayOpen && (
          <div className="mx-3 mt-2.5 p-2.5 rounded-2xl bg-black/75 border border-white/15 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-[#00E5FF] flex items-center gap-1.5 font-display">
                <i className="bi bi-stars" />
                Bộ lọc Canvas AR VIVU
              </span>
              <button
                type="button"
                onClick={() => setIsFilterTrayOpen(false)}
                className="text-xs text-white/60 hover:text-white cursor-pointer"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {AR_FILTERS.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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

        <div className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] flex items-center justify-center gap-4 md:gap-6">
          {isVideo && (
            <button
              type="button"
              onClick={() => setIsFilterTrayOpen(!isFilterTrayOpen)}
              className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isFilterTrayOpen || selectedFilter !== 'none'
                  ? 'bg-[#00E5FF] text-[#08202E] shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title="Bộ lọc AR"
            >
              <i className="bi bi-stars text-xl" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              isMuted
                ? 'bg-[#EF4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title={isMuted ? 'Bật Mic' : 'Tắt Mic'}
          >
            <i className={`bi ${isMuted ? 'bi-mic-mute-fill' : 'bi-mic-fill'} text-xl`} />
          </button>

          {isVideo && (
            <button
              type="button"
              onClick={onToggleVideo}
              className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isVideoOff
                  ? 'bg-[#EF4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title={isVideoOff ? 'Bật Camera' : 'Tắt Camera'}
            >
              <i className={`bi ${isVideoOff ? 'bi-camera-video-off-fill' : 'bi-camera-video-fill'} text-xl`} />
            </button>
          )}

          <button
            type="button"
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#EF4444] to-[#F87171] text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.55)] hover:scale-105 active:scale-90 transition-all cursor-pointer"
            title="Kết thúc cuộc gọi"
          >
            <i className="bi bi-telephone-x-fill text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
}
