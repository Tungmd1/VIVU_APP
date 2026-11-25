import React from 'react';
import VivuButton from '../common/VivuButton';

/**
 * LiveLocationCard - Thẻ Tin Nhắn Vị Trí Trực Tiếp Trong Chat
 * Hiển thị khoảng cách, thời gian cập nhật, tốc độ, nút dừng chia sẻ
 * 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng)
 */
export default function LiveLocationCard({
  msg,
  isMe,
  currentUserLat,
  currentUserLng,
  onOpenMap,
  onStartNavigation,
  onStopShare
}) {
  const isStopped = msg.live_status === 'stopped';
  const isExpired = msg.live_expires_at && new Date(msg.live_expires_at).getTime() < Date.now();
  const isActive = !isStopped && !isExpired;

  // Tính khoảng cách Haversine
  const calcDist = () => {
    if (currentUserLat == null || currentUserLng == null || msg.lat == null || msg.lng == null) {
      return null;
    }
    const R = 6371;
    const dLat = (Number(msg.lat) - Number(currentUserLat)) * Math.PI / 180;
    const dLon = (Number(msg.lng) - Number(currentUserLng)) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(Number(currentUserLat) * Math.PI / 180) *
      Math.cos(Number(msg.lat) * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (distKm < 1) {
      return `${Math.round(distKm * 1000)} m`;
    }
    return `${distKm.toFixed(1)} km`;
  };

  const distText = calcDist();

  // Tốc độ di chuyển nếu đáng tin cậy
  const speedVal = msg.speed != null ? Number(msg.speed) : null;
  const speedText = (speedVal != null && speedVal > 1) 
    ? `${Math.round(speedVal)} km/h` 
    : (speedVal === 0 ? 'Đang dừng' : null);

  return (
    <div className={`p-3.5 rounded-2xl border space-y-2.5 max-w-[260px] text-white shadow-md select-none ${
      isActive 
        ? 'bg-gradient-to-br from-[#121c24] to-[#0d141e] border-[#00FF66]/30 shadow-[0_4px_20px_rgba(0,255,102,0.15)]' 
        : 'bg-[#151619] border-white/10 opacity-80'
    }`}>
      {/* Header trạng thái */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="relative flex h-2.5 w-2.5">
            {isActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isActive ? 'bg-[#00FF66]' : 'bg-neutral-500'}`}></span>
          </div>
          <span className="text-xs font-bold text-white tracking-tight">Vị Trí Trực Tiếp</span>
        </div>

        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
          isActive 
            ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/30 font-bold' 
            : 'bg-white/10 text-white/50'
        }`}>
          {isActive ? 'TRỰC TIẾP' : (isStopped ? 'ĐÃ DỪNG' : 'HẾT HẠN')}
        </span>
      </div>

      {/* Thông số vị trí & khoảng cách */}
      <div className="space-y-1.5 text-xs">
        {distText && (
          <div className="flex items-center justify-between text-white/80">
            <span className="text-[11px] text-white/50 flex items-center gap-1">
              <i className="bi bi-geo-alt text-[#00E5FF]"></i>
              <span>Khoảng cách:</span>
            </span>
            <span className="font-bold font-mono text-[#00E5FF] text-[11px]">
              {distText}
            </span>
          </div>
        )}

        {speedText && (
          <div className="flex items-center justify-between text-white/80">
            <span className="text-[11px] text-white/50 flex items-center gap-1">
              <i className="bi bi-speedometer2 text-amber-400"></i>
              <span>Tốc độ:</span>
            </span>
            <span className="font-bold font-mono text-amber-400 text-[11px]">
              {speedText}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-white/40 pt-0.5">
          <span>Thời gian:</span>
          <span>{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}</span>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="space-y-1.5 pt-1">
        <div className="grid grid-cols-2 gap-1.5">
          <VivuButton
            size="sm"
            variant="secondary"
            pill={true}
            onClick={() => onOpenMap?.(msg)}
            icon="bi-map-fill"
            className="text-[11px] py-1 font-bold w-full"
          >
            Bản Đồ
          </VivuButton>

          <VivuButton
            size="sm"
            variant="primary"
            pill={true}
            onClick={() => {
              if (msg.lat == null || msg.lng == null) return;
              onStartNavigation?.({
                realLat: Number(msg.lat),
                realLng: Number(msg.lng),
                lat: Number(msg.lat),
                lng: Number(msg.lng),
                name: msg.sender_name || msg.senderName || 'Vị trí trực tiếp',
                targetUserId: msg.sender_id || (msg.sender && msg.sender !== 'me' && msg.sender !== 'them' ? msg.sender : null),
                speed: msg.speed ?? null
              });
            }}
            icon="bi-cursor-fill"
            className="text-[11px] py-1 font-bold w-full"
          >
            Đường Đi
          </VivuButton>
        </div>

        {/* Nút Dừng chia sẻ (chỉ hiển thị cho người gửi khi đang active) */}
        {isMe && isActive && (
          <button
            type="button"
            onClick={() => onStopShare?.(msg.id || msg.client_msg_id)}
            className="w-full py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <i className="bi bi-stop-circle-fill"></i>
            <span>Dừng Chia Sẻ Vị Trí</span>
          </button>
        )}
      </div>
    </div>
  );
}

