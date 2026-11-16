import React from 'react';
import { getSafeAvatar } from '../../utils/avatarUtils';

/**
 * NearbyPeersSection - Gợi Ý Người Dùng Quanh Đây (GPS Thực Tế)
 * Chuẩn Luminous Solar-Cyber HUD (White Cyberpunk), 100% Bootstrap Icons
 */
export default function NearbyPeersSection({
  nearbyPeers = [],
  sortedFriends = [],
  sentRequests = [],
  loadingActionId,
  onSendRequest,
  onStartChatWithUser
}) {
  return (
    <div className="space-y-2.5 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#70787E] uppercase tracking-wider flex items-center gap-1.5 font-display">
          <i className="bi bi-geo-alt-fill text-[#00838F] text-xs"></i>
          <span>Người ở gần bạn</span>
        </span>
        <span className="text-[10px] text-[#00838F] font-mono font-bold">
          {nearbyPeers.length} trực tuyến
        </span>
      </div>

      {nearbyPeers.length === 0 ? (
        <div className="py-3 px-3 rounded-2xl bg-white border border-[#D2D9F4] text-center text-xs text-[#70787E]">
          Chưa phát hiện người dùng ở gần.
        </div>
      ) : (
        <div className="space-y-2">
          {nearbyPeers.slice(0, 8).map((peer) => {
            const peerName = peer.full_name || peer.name || 'Người dùng VIVU';
            const peerAvatar = getSafeAvatar(peer.avatar_url || peer.avatar);
            const peerCode = peer.user_code || '';
            const isAlreadyFriend = sortedFriends.some(f => (peer.id && f.id === peer.id) || f.name === peerName) || peer.is_friend || peer.relationshipStatus === 'friends';
            const isPendingSent = sentRequests.some(r => r.receiver_id === peer.id) || peer.friendship_status === 'pending_sent';

            return (
              <div
                key={peer.id}
                className="p-2.5 rounded-2xl bg-white border border-[#D2D9F4] flex items-center justify-between gap-2 hover:border-[rgba(0,229,255,0.4)] transition-all group shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <img
                      src={peerAvatar}
                      alt={peerName}
                      className="w-9 h-9 rounded-full object-cover border border-[#D2D9F4]"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10FFA0] border-2 border-white shadow-[0_0_6px_#10FFA0]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#131315] font-display truncate group-hover:text-[#00838F] transition-colors">
                      {peerName}
                    </div>
                    <div className="text-[10px] text-[#70787E] truncate font-mono">
                      {peerCode ? `(${peerCode}) • ` : ''}Gần bạn
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onStartChatWithUser && (
                    <button
                      type="button"
                      onClick={() => onStartChatWithUser(peer)}
                      className="w-7 h-7 rounded-xl bg-[#F2F3FF] hover:bg-[#E6E7F6] text-[#00838F] border border-[#D2D9F4] flex items-center justify-center text-xs active:scale-90 transition-all cursor-pointer shadow-xs"
                      title="Nhắn tin"
                      aria-label={`Nhắn tin với ${peerName}`}
                    >
                      <i className="bi bi-chat-dots-fill text-xs"></i>
                    </button>
                  )}

                  {isAlreadyFriend ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#F2F3FF] text-[#00838F] border border-[#D2D9F4] text-[10px] font-semibold flex items-center gap-1">
                      <i className="bi bi-check-circle-fill text-[#10FFA0] text-[9px]"></i>
                      <span>Bạn bè</span>
                    </span>
                  ) : isPendingSent ? (
                    <span className="px-2.5 py-1 rounded-full bg-[rgba(255,170,0,0.15)] text-[#B06000] border border-[rgba(255,170,0,0.4)] text-[10px] font-semibold flex items-center gap-1">
                      <i className="bi bi-hourglass-split text-[9px]"></i>
                      <span>Đã gửi</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={loadingActionId === peer.id}
                      onClick={() => onSendRequest(peer.id, peerName)}
                      className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] border border-[#00F0FF] hover:opacity-95 active:scale-95 text-[10px] font-display font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {loadingActionId === peer.id ? (
                        <i className="bi bi-arrow-repeat animate-spin"></i>
                      ) : (
                        <i className="bi bi-person-plus-fill"></i>
                      )}
                      <span>Kết bạn</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

