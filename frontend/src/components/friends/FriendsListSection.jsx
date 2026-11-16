import React from 'react';
import { getSafeAvatar } from '../../utils/avatarUtils';

/**
 * FriendsListSection - Danh Sách Bạn Bè (Trực Tuyến & Ngoại Tuyến)
 * Chuẩn Luminous Solar-Cyber HUD (White Cyberpunk), 100% Bootstrap Icons
 */
export default function FriendsListSection({
  sortedFriends = [],
  onlineFriendsCount = 0,
  onLocateFriend,
  onStartChatWithUser,
  onClose
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#70787E] uppercase tracking-wider flex items-center gap-1.5 font-display">
          <i className="bi bi-person-check-fill text-[#00838F] text-xs"></i>
          <span>Bạn bè của bạn</span>
        </span>
        <span className="text-[10px] text-[#00838F] font-mono font-bold">
          {onlineFriendsCount}/{sortedFriends.length} online
        </span>
      </div>

      {sortedFriends.length === 0 ? (
        <div className="py-4 px-3 rounded-2xl bg-white border border-[#D2D9F4] text-center text-xs text-[#70787E]">
          Chưa có bạn bè nào. Hãy gửi lời mời kết bạn bên dưới!
        </div>
      ) : (
        <div className="space-y-2">
          {sortedFriends.map((friend) => {
            const isFriendOnline = Boolean(friend.isOnline || friend.is_online);
            const safeAvatar = getSafeAvatar(friend.avatar || friend.avatar_url);
            const friendName = friend.name || friend.full_name || 'Bạn bè VIVU';
            const friendCode = friend.user_code || '';
            const hasCoords = (friend.lat != null && friend.lng != null) || (friend.realLat != null && friend.realLng != null);

            return (
              <div
                key={friend.id}
                className={`p-2.5 rounded-2xl bg-white border transition-all flex items-center justify-between gap-2 shadow-xs ${
                  isFriendOnline
                    ? 'border-[#D2D9F4] hover:border-[rgba(0,229,255,0.4)]'
                    : 'border-neutral-200/90 bg-neutral-50/50 opacity-85'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <img
                      src={safeAvatar}
                      alt={friendName}
                      className={`w-9 h-9 rounded-full object-cover ${
                        isFriendOnline ? 'border-2 border-[#10FFA0]' : 'border-2 border-neutral-300'
                      }`}
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        isFriendOnline
                          ? 'bg-[#10FFA0] shadow-[0_0_6px_#10FFA0]'
                          : 'bg-neutral-400'
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#131315] font-display truncate">
                        {friendName}
                      </span>
                      {isFriendOnline ? (
                        <span className="text-[9px] font-semibold text-[#00838F] bg-[rgba(0,229,255,0.12)] px-1.5 py-0.2 rounded-full shrink-0">
                          Online
                        </span>
                      ) : (
                        <span className="text-[9px] text-[#70787E] bg-neutral-100 px-1.5 py-0.2 rounded-full shrink-0 font-medium">
                          Offline
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#70787E] truncate font-mono mt-0.5">
                      {friendCode ? `${friendCode} • ` : ''}
                      {friend.custom_status || (isFriendOnline ? 'Đang hoạt động' : 'Ngoại tuyến')}
                    </div>
                  </div>
                </div>

                {/* Cụm nút hành động: Nhắn tin & Định vị bản đồ */}
                <div className="flex items-center gap-1 shrink-0">
                  {hasCoords && (
                    <button
                      type="button"
                      onClick={() => onLocateFriend(friend)}
                      className="w-7 h-7 rounded-xl bg-[#F2F3FF] hover:bg-[#E6E7F6] text-[#00838F] border border-[#D2D9F4] flex items-center justify-center text-xs active:scale-90 transition-all cursor-pointer shadow-xs"
                      title="Định vị trên bản đồ"
                      aria-label={`Định vị ${friendName} trên bản đồ`}
                    >
                      <i className="bi bi-geo-alt-fill text-xs text-rose-500"></i>
                    </button>
                  )}

                  {onStartChatWithUser && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose?.();
                        onStartChatWithUser(friend);
                      }}
                      className="w-7 h-7 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] border border-[#00F0FF] flex items-center justify-center text-xs active:scale-90 transition-all cursor-pointer shadow-xs"
                      title="Nhắn tin"
                      aria-label={`Nhắn tin với ${friendName}`}
                    >
                      <i className="bi bi-chat-dots-fill text-xs"></i>
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

