import React, { useState } from 'react';

/**
 * NotificationDrawer - Khay thông báo trượt từ phải sang
 * Chuẩn phong cách Luminous Solar-Cyber HUD (White Cyberpunk), Bootstrap Icons 100%
 */
export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onAcceptGroupInvite,
  onRejectGroupInvite,
  onDeleteNotification,
  onOpenChat,
  onOpenFriendRequests,
  onOpenConversation
}) {
  const [processingId, setProcessingId] = useState(null);
  const [acceptedIds, setAcceptedIds] = useState(new Set());

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (isoString) => {
    if (!isoString) return 'Vừa xong';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ngày trước`;
    } catch {
      return 'Vừa xong';
    }
  };

  const handleAccept = async (notif) => {
    const requestId = notif.action_data?.requestId;
    if (!requestId) return;
    setProcessingId(notif.id);
    try {
      if (onAcceptFriendRequest) {
        await onAcceptFriendRequest(requestId, notif.from_user_id);
      }
      setAcceptedIds(prev => new Set(prev).add(notif.id));
      if (onMarkRead) onMarkRead(notif.id);
    } catch (err) {
      console.warn('Accept error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (notif) => {
    const requestId = notif.action_data?.requestId;
    if (!requestId) return;
    setProcessingId(notif.id);
    try {
      if (onRejectFriendRequest) {
        await onRejectFriendRequest(requestId);
      }
      if (onMarkRead) onMarkRead(notif.id);
    } catch (err) {
      console.warn('Reject error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAcceptGroup = async (notif) => {
    const circleId = notif.action_data?.circleId;
    if (!circleId) return;
    setProcessingId(notif.id);
    try {
      if (onAcceptGroupInvite) {
        await onAcceptGroupInvite(circleId, notif);
      }
      setAcceptedIds(prev => new Set(prev).add(notif.id));
      if (onMarkRead) onMarkRead(notif.id);
    } catch (err) {
      console.warn('Accept group error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectGroup = async (notif) => {
    const circleId = notif.action_data?.circleId;
    if (!circleId) return;
    setProcessingId(notif.id);
    try {
      if (onRejectGroupInvite) {
        await onRejectGroupInvite(circleId, notif);
      }
      if (onMarkRead) onMarkRead(notif.id);
    } catch (err) {
      console.warn('Reject group error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'group_invite':
        return 'bi-people-fill text-[#00838F]';
      case 'friend_request':
        return 'bi-person-plus-fill text-[#00E5FF]';
      case 'friend_accepted':
        return 'bi-person-check-fill text-[#10FFA0]';
      case 'new_story':
        return 'bi-camera-fill text-[#FF2A85]';
      case 'new_message':
        return 'bi-chat-dots-fill text-[#00B4D8]';
      default:
        return 'bi-bell-fill text-[#00838F]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#D2D9F4] shadow-2xl flex flex-col text-[#131315]">
          {/* Header */}
          <div className="p-4 border-b border-[#D2D9F4] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[rgba(0,229,255,0.12)] border border-[#00E5FF]/40 flex items-center justify-center text-[#00838F] shadow-xs">
                <i className="bi bi-bell-fill text-sm" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#131315] font-display flex items-center gap-2">
                  Thông Báo
                  {unreadCount > 0 && (
                    <span className="bg-[#FFE8F0] text-[#FF2A85] border border-[#FFB8D2] text-[10px] px-2 py-0.5 rounded-full font-bold font-mono">
                      {unreadCount} mới
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-[#70787E]">Cập nhật bạn bè và tương tác</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  title="Đánh dấu tất cả đã đọc"
                  className="px-2.5 py-1.5 text-xs text-[#70787E] hover:text-[#131315] rounded-lg hover:bg-[#F2F3FF] transition-all flex items-center gap-1 cursor-pointer font-medium"
                >
                  <i className="bi bi-check2-all" />
                  <span className="hidden sm:inline text-[11px]">Đã đọc hết</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#70787E] hover:text-[#131315] hover:bg-[#F2F3FF] transition-all cursor-pointer"
              >
                <i className="bi bi-x-lg text-sm" />
              </button>
            </div>
          </div>

          {/* Body / List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-[#FAFAFF]">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#70787E]">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#D2D9F4] flex items-center justify-center mb-3 shadow-xs">
                  <i className="bi bi-bell-slash text-2xl text-[#00838F]" />
                </div>
                <p className="text-sm font-bold text-[#131315] font-display">Không có thông báo nào</p>
                <p className="text-xs text-[#70787E] mt-1 max-w-xs">
                  Khi có lời mời kết bạn hoặc tương tác mới, bạn sẽ nhận được thông báo tại đây tức thì.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isAccepted = acceptedIds.has(notif.id);
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.read && onMarkRead) onMarkRead(notif.id);
                      if (notif.type === 'new_message') {
                        if (onOpenConversation && notif.action_data?.conversationId) {
                          onOpenConversation(notif.action_data.conversationId);
                        } else if (onOpenChat && notif.from_user_id) {
                          onOpenChat(notif.from_user_id);
                        }
                        onClose();
                      } else if (notif.type === 'friend_request') {
                        if (onOpenFriendRequests) {
                          onOpenFriendRequests();
                          onClose();
                        }
                      } else if (notif.type === 'group_invite') {
                        if (onOpenConversation && notif.action_data?.circleId) {
                          onOpenConversation(notif.action_data.circleId);
                        }
                        onClose();
                      }
                    }}
                    className={`p-3 rounded-2xl transition-all duration-200 flex gap-3 relative group cursor-pointer border ${
                      !notif.read
                        ? 'bg-white border-[#D2D9F4] hover:border-[#00E5FF] shadow-xs'
                        : 'bg-white/70 hover:bg-white border-[#EBEFFA] hover:border-[#D2D9F4]'
                    }`}
                  >
                    {/* Avatar with type badge */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={notif.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt=""
                        className="w-11 h-11 rounded-2xl object-cover border border-[#D2D9F4] bg-[#F2F3FF]"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-[#D2D9F4] flex items-center justify-center shadow-xs">
                        <i className={`bi ${getIconForType(notif.type)} text-[10px]`} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-xs font-bold text-[#131315] font-display truncate">{notif.title}</p>
                          {notif.unread_count > 1 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-[rgba(0,229,255,0.15)] text-[#00838F] text-[10px] font-bold border border-[#00B4D8]/30 shrink-0 font-mono">
                              +{notif.unread_count}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#70787E] whitespace-nowrap font-mono">
                          {formatTime(notif.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-[#40484D] leading-relaxed break-words">{notif.body}</p>

                      {/* Interactive Buttons for Friend Request */}
                      {notif.type === 'friend_request' && (
                        <div className="mt-2.5 flex items-center gap-2">
                          {isAccepted || notif.status === 'accepted' ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E8FBF0] border border-[#A7F3D0] text-[#059669] text-xs font-semibold">
                              <i className="bi bi-check-circle-fill text-[11px]" />
                              Đã trở thành bạn bè
                            </div>
                          ) : notif.status === 'rejected' ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F2F3FF] border border-[#D2D9F4] text-[#70787E] text-xs font-medium">
                              <i className="bi bi-x-circle text-[11px]" />
                              Đã từ chối
                            </div>
                          ) : notif.status === 'cancelled' ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F2F3FF] border border-[#D2D9F4] text-[#70787E] text-xs font-medium">
                              <i className="bi bi-dash-circle text-[11px]" />
                              Lời mời đã thu hồi
                            </div>
                          ) : (
                            <>
                              <button
                                disabled={processingId === notif.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAccept(notif);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-bold font-display text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 border border-[#00F0FF] shadow-xs cursor-pointer"
                              >
                                {processingId === notif.id ? (
                                  <span className="inline-block w-3 h-3 border-2 border-[#08202E] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <i className="bi bi-check-lg text-sm" />
                                )}
                                Chấp nhận
                              </button>
                              <button
                                disabled={processingId === notif.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReject(notif);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#F2F3FF] hover:bg-[#FFE8E8] text-[#70787E] hover:text-[#EF4444] text-xs font-semibold border border-[#D2D9F4] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Interactive Buttons for Group Invite */}
                      {notif.type === 'group_invite' && (
                        <div className="mt-2.5 flex items-center gap-2">
                          {isAccepted || notif.status === 'accepted' ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E8FBF0] border border-[#A7F3D0] text-[#059669] text-xs font-semibold">
                              <i className="bi bi-check-circle-fill text-[11px]" />
                              Đã tham gia nhóm
                            </div>
                          ) : notif.status === 'declined' || notif.status === 'rejected' ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F2F3FF] border border-[#D2D9F4] text-[#70787E] text-xs font-medium">
                              <i className="bi bi-x-circle text-[11px]" />
                              Đã từ chối lời mời
                            </div>
                          ) : (
                            <>
                              <button
                                disabled={processingId === notif.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcceptGroup(notif);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-bold font-display text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 border border-[#00F0FF] shadow-xs cursor-pointer"
                              >
                                {processingId === notif.id ? (
                                  <span className="inline-block w-3 h-3 border-2 border-[#08202E] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <i className="bi bi-check-lg text-sm" />
                                )}
                                Tham gia nhóm
                              </button>
                              <button
                                disabled={processingId === notif.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectGroup(notif);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#F2F3FF] hover:bg-[#FFE8E8] text-[#70787E] hover:text-[#EF4444] text-xs font-semibold border border-[#D2D9F4] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Action for Friend Accepted */}
                      {notif.type === 'friend_accepted' && onOpenChat && (
                        <div className="mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenChat(notif.from_user_id);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(0,229,255,0.12)] hover:bg-[rgba(0,229,255,0.22)] text-[#00838F] text-xs font-semibold border border-[#00B4D8]/30 transition-all active:scale-95 cursor-pointer"
                          >
                            <i className="bi bi-chat-dots-fill text-xs" />
                            Nhắn tin ngay
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Unread indicator */}
                    {!notif.read && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                    )}

                    {/* Delete button on hover */}
                    {onDeleteNotification && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification(notif.id);
                        }}
                        title="Xóa thông báo"
                        className="opacity-0 group-hover:opacity-100 absolute bottom-3 right-3 w-6 h-6 rounded-lg bg-white border border-[#D2D9F4] hover:bg-[#FFE8E8] text-[#70787E] hover:text-[#EF4444] flex items-center justify-center transition-all shadow-xs cursor-pointer"
                      >
                        <i className="bi bi-trash text-xs" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
