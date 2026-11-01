import { dbStore } from './dbStore.js';
import { emitToUser } from './socketService.js';

export const notificationService = {
  /**
   * Tạo thông báo tin nhắn mới gộp theo cuộc trò chuyện (Aggregated Conversation Notification)
   * Khóa chống trùng: notif-conv-${toUserId}-${conversationId}
   * Ngăn chặn lặp unread count qua last_processed_message_id
   */
  createMessageNotification({ toUserId, fromUserId, conversationId, message, senderName, senderAvatar }) {
    if (!toUserId || !conversationId || !message) return null;

    if (!Array.isArray(dbStore.data.notifications)) {
      dbStore.data.notifications = [];
    }

    const notifId = `notif-conv-${toUserId}-${conversationId}`;
    const existing = dbStore.data.notifications.find(n => n.id === notifId);

    const messagePreview = message.text 
      ? message.text 
      : message.image 
        ? 'Đã gửi cho bạn một hình ảnh' 
        : message.video 
          ? 'Đã gửi cho bạn một video' 
          : message.is_location 
            ? 'Đã chia sẻ vị trí GPS' 
            : 'Tin nhắn mới';

    // 1. Nếu đã có thông báo cho conversation này
    if (existing) {
      // Chống lặp tin nhắn khi client retry hoặc realtime reconnect
      if (existing.last_processed_message_id === message.id) {
        return existing;
      }

      // Cập nhật thông báo gộp
      if (existing.read) {
        existing.read = false;
        existing.unread_count = 1;
      } else {
        existing.unread_count = (existing.unread_count || 1) + 1;
      }

      existing.from_user_id = fromUserId;
      existing.title = senderName ? `${senderName}` : 'Tin nhắn mới';
      existing.body = messagePreview;
      if (senderAvatar) existing.avatar = senderAvatar;
      existing.last_processed_message_id = message.id;
      existing.created_at = new Date().toISOString();
      existing.action_data = {
        conversationId,
        messageId: message.id
      };

      // Đưa thông báo lên đầu danh sách
      dbStore.data.notifications = [
        existing,
        ...dbStore.data.notifications.filter(n => n.id !== notifId)
      ];
      dbStore.scheduleSave();

      // Phát realtime cho người nhận
      try {
        emitToUser(toUserId, 'notification:new', existing);
      } catch (e) {
        console.warn('[Notification] emitToUser failed:', e.message);
      }
      return existing;
    }

    // 2. Chưa có thông báo -> Tạo mới
    const notif = {
      id: notifId,
      type: 'new_message',
      from_user_id: fromUserId,
      to_user_id: toUserId,
      title: senderName || 'Tin nhắn mới',
      body: messagePreview,
      avatar: senderAvatar || '',
      read: false,
      unread_count: 1,
      last_processed_message_id: message.id,
      action_data: {
        conversationId,
        messageId: message.id
      },
      created_at: new Date().toISOString()
    };

    dbStore.data.notifications.unshift(notif);
    if (dbStore.data.notifications.length > 500) {
      dbStore.data.notifications = dbStore.data.notifications.slice(0, 500);
    }
    dbStore.scheduleSave();

    try {
      emitToUser(toUserId, 'notification:new', notif);
    } catch (e) {
      console.warn('[Notification] emitToUser failed:', e.message);
    }

    return notif;
  },

  /**
   * Tạo thông báo lời mời kết bạn (Friend Request)
   * Khóa chống trùng: notif-freq-${toUserId}-${requestId}
   */
  createFriendRequestNotification({ toUserId, fromUserId, requestId, senderName, senderAvatar }) {
    if (!toUserId || !requestId) return null;

    if (!Array.isArray(dbStore.data.notifications)) {
      dbStore.data.notifications = [];
    }

    const notifId = `notif-freq-${toUserId}-${requestId}`;
    const existing = dbStore.data.notifications.find(
      n => n.id === notifId || (n.type === 'friend_request' && n.action_data?.requestId === requestId && n.to_user_id === toUserId)
    );

    if (existing) {
      return existing; // Idempotent: Không tạo bản ghi trùng
    }

    const notif = {
      id: notifId,
      type: 'friend_request',
      from_user_id: fromUserId,
      to_user_id: toUserId,
      title: 'Lời mời kết bạn',
      body: `${senderName || 'Người dùng VIVU'} muốn kết bạn với bạn`,
      avatar: senderAvatar || '',
      read: false,
      status: 'pending',
      action_data: { requestId },
      created_at: new Date().toISOString()
    };

    dbStore.data.notifications.unshift(notif);
    if (dbStore.data.notifications.length > 500) {
      dbStore.data.notifications = dbStore.data.notifications.slice(0, 500);
    }
    dbStore.scheduleSave();

    try {
      emitToUser(toUserId, 'notification:new', notif);
    } catch (e) {
      console.warn('[Notification] emitToUser failed:', e.message);
    }

    return notif;
  },

  /**
   * Tạo thông báo kết bạn thành công (Friend Accepted)
   * Khóa chống trùng: notif-faccept-${toUserId}-${friendshipId}
   */
  createFriendAcceptedNotification({ toUserId, fromUserId, friendshipId, partnerName, partnerAvatar, isSender }) {
    if (!toUserId || !friendshipId) return null;

    if (!Array.isArray(dbStore.data.notifications)) {
      dbStore.data.notifications = [];
    }

    const notifId = `notif-faccept-${toUserId}-${friendshipId}`;
    const existing = dbStore.data.notifications.find(n => n.id === notifId);
    if (existing) return existing;

    const notif = {
      id: notifId,
      type: 'friend_accepted',
      from_user_id: fromUserId,
      to_user_id: toUserId,
      title: 'Kết bạn thành công!',
      body: isSender 
        ? `${partnerName} đã chấp nhận lời mời kết bạn của bạn` 
        : `Bạn và ${partnerName} đã trở thành bạn bè`,
      avatar: partnerAvatar || '',
      read: false,
      action_data: { friendshipId },
      created_at: new Date().toISOString()
    };

    dbStore.data.notifications.unshift(notif);
    if (dbStore.data.notifications.length > 500) {
      dbStore.data.notifications = dbStore.data.notifications.slice(0, 500);
    }
    dbStore.scheduleSave();

    try {
      emitToUser(toUserId, 'notification:new', notif);
    } catch (e) {
      console.warn('[Notification] emitToUser failed:', e.message);
    }

    return notif;
  },

  /**
   * Xử lý khi lời mời kết bạn được giải quyết (Chấp nhận, Từ chối, hoặc Thu hồi)
   * Theo yêu cầu thống nhất: Từ chối hoặc Thu hồi sẽ XÓA HẲN thông báo khỏi database
   */
  handleFriendRequestResolved({ requestId, status }) {
    if (!requestId || !Array.isArray(dbStore.data.notifications)) return;

    if (status === 'accepted') {
      const notif = dbStore.data.notifications.find(
        n => n.type === 'friend_request' && n.action_data?.requestId === requestId
      );
      if (notif) {
        notif.status = 'accepted';
        notif.read = true;
        dbStore.scheduleSave();
        try {
          emitToUser(notif.to_user_id, 'notification:sync', notif);
        } catch (e) {
          console.warn('[Notification] emit sync failed:', e.message);
        }
      }
      return;
    }

    if (status === 'rejected' || status === 'cancelled') {
      const targetNotifs = dbStore.data.notifications.filter(
        n => n.type === 'friend_request' && n.action_data?.requestId === requestId
      );

      if (targetNotifs.length > 0) {
        dbStore.data.notifications = dbStore.data.notifications.filter(
          n => !(n.type === 'friend_request' && n.action_data?.requestId === requestId)
        );
        dbStore.scheduleSave();

        targetNotifs.forEach(n => {
          try {
            emitToUser(n.to_user_id, 'notification:deleted', { id: n.id, requestId });
          } catch (e) {
            console.warn('[Notification] emit deleted failed:', e.message);
          }
        });
      }
    }
  },

  /**
   * Tạo thông báo lời mời tham gia nhóm (Group Invite Notification)
   * Khóa chống trùng: notif-group-invite-${toUserId}-${circleId}
   */
  createGroupInviteNotification({ toUserId, fromUserId, circleId, circleName, circleAvatar, inviterName }) {
    if (!toUserId || !circleId) return null;

    if (!Array.isArray(dbStore.data.notifications)) {
      dbStore.data.notifications = [];
    }

    const notifId = `notif-group-invite-${toUserId}-${circleId}`;
    const existing = dbStore.data.notifications.find(n => n.id === notifId);
    if (existing) {
      if (existing.status === 'pending') return existing;
      existing.status = 'pending';
      existing.read = false;
      existing.created_at = new Date().toISOString();
      dbStore.scheduleSave();
      try {
        emitToUser(toUserId, 'notification:new', existing);
      } catch (e) {
        console.warn('[Notification] emitToUser failed:', e.message);
      }
      return existing;
    }

    const notif = {
      id: notifId,
      type: 'group_invite',
      from_user_id: fromUserId,
      to_user_id: toUserId,
      title: 'Lời mời tham gia nhóm',
      body: `${inviterName || 'Một người bạn'} đã mời bạn tham gia nhóm "${circleName}"`,
      avatar: circleAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(circleName || 'group')}`,
      read: false,
      status: 'pending',
      action_data: {
        circleId,
        circleName,
        inviterId: fromUserId,
        inviterName
      },
      created_at: new Date().toISOString()
    };

    dbStore.data.notifications.unshift(notif);
    if (dbStore.data.notifications.length > 500) {
      dbStore.data.notifications = dbStore.data.notifications.slice(0, 500);
    }
    dbStore.scheduleSave();

    try {
      emitToUser(toUserId, 'notification:new', notif);
    } catch (e) {
      console.warn('[Notification] emitToUser failed:', e.message);
    }

    return notif;
  },

  /**
   * Cập nhật trạng thái thông báo lời mời nhóm khi được chấp nhận hoặc từ chối
   */
  handleGroupInviteResolved({ userId, circleId, status }) {
    if (!userId || !circleId || !Array.isArray(dbStore.data.notifications)) return;

    const notifId = `notif-group-invite-${userId}-${circleId}`;
    const notif = dbStore.data.notifications.find(
      n => n.id === notifId || (n.type === 'group_invite' && n.action_data?.circleId === circleId && n.to_user_id === userId)
    );

    if (notif) {
      if (status === 'accepted') {
        notif.status = 'accepted';
        notif.read = true;
        notif.body = `Bạn đã tham gia nhóm "${notif.action_data?.circleName || 'Nhóm'}"`;
        dbStore.scheduleSave();
        try {
          emitToUser(userId, 'notification:sync', notif);
        } catch (e) {
          console.warn('[Notification] emit sync failed:', e.message);
        }
      } else if (status === 'declined' || status === 'rejected') {
        notif.status = 'declined';
        notif.read = true;
        dbStore.scheduleSave();
        try {
          emitToUser(userId, 'notification:sync', notif);
        } catch (e) {
          console.warn('[Notification] emit sync failed:', e.message);
        }
      }
    }
  },

  /**
   * Đánh dấu toàn bộ thông báo của một cuộc trò chuyện là đã đọc
   * Đồng bộ realtime tới tất cả thiết bị của người dùng
   */
  markConversationNotificationsRead(conversationId, userId) {
    if (!conversationId || !userId || !Array.isArray(dbStore.data.notifications)) return;

    let updated = false;
    dbStore.data.notifications.forEach(n => {
      if (
        n.type === 'new_message' &&
        n.action_data?.conversationId === conversationId &&
        n.to_user_id === userId &&
        (!n.read || (n.unread_count && n.unread_count > 0))
      ) {
        n.read = true;
        n.unread_count = 0;
        updated = true;
        try {
          emitToUser(userId, 'notification:sync', n);
        } catch (e) {
          console.warn('[Notification] emit sync failed:', e.message);
        }
      }
    });

    if (updated) {
      dbStore.scheduleSave();
    }
  },

  /**
   * Thông báo chung có hỗ trợ kiểm tra chống trùng lặp theo idempotencyKey
   */
  createNotification({ type, fromUserId, toUserId, title, body, avatar, actionData, idempotencyKey }) {
    if (!Array.isArray(dbStore.data.notifications)) {
      dbStore.data.notifications = [];
    }

    const notifId = idempotencyKey || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const existing = dbStore.data.notifications.find(n => n.id === notifId);
    if (existing) return existing;

    const notif = {
      id: notifId,
      type,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      title,
      body,
      avatar: avatar || '',
      read: false,
      action_data: actionData || {},
      created_at: new Date().toISOString()
    };

    dbStore.data.notifications.unshift(notif);
    if (dbStore.data.notifications.length > 500) {
      dbStore.data.notifications = dbStore.data.notifications.slice(0, 500);
    }
    dbStore.scheduleSave();

    try {
      emitToUser(toUserId, 'notification:new', notif);
    } catch (e) {
      console.warn('[Notification] emitToUser failed:', e.message);
    }

    return notif;
  },

  getNotifications(userId) {
    if (!Array.isArray(dbStore.data.notifications)) return [];
    return dbStore.data.notifications
      .filter(n => n.to_user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50);
  },

  markNotificationRead(notifId) {
    if (!Array.isArray(dbStore.data.notifications)) return false;
    const notif = dbStore.data.notifications.find(n => n.id === notifId);
    if (notif) {
      notif.read = true;
      notif.unread_count = 0;
      dbStore.scheduleSave();
      try {
        emitToUser(notif.to_user_id, 'notification:sync', notif);
      } catch (e) {}
      return true;
    }
    return false;
  },

  markAllNotificationsRead(userId) {
    if (!Array.isArray(dbStore.data.notifications)) return 0;
    let count = 0;
    dbStore.data.notifications.forEach(n => {
      if (n.to_user_id === userId && !n.read) {
        n.read = true;
        n.unread_count = 0;
        count++;
        try {
          emitToUser(userId, 'notification:sync', n);
        } catch (e) {}
      }
    });
    if (count > 0) dbStore.scheduleSave();
    return count;
  },

  deleteNotification(notifId) {
    if (!Array.isArray(dbStore.data.notifications)) return false;
    const initLen = dbStore.data.notifications.length;
    const target = dbStore.data.notifications.find(n => n.id === notifId);
    dbStore.data.notifications = dbStore.data.notifications.filter(n => n.id !== notifId);
    if (dbStore.data.notifications.length < initLen) {
      dbStore.scheduleSave();
      if (target) {
        try {
          emitToUser(target.to_user_id, 'notification:deleted', { id: notifId });
        } catch (e) {}
      }
      return true;
    }
    return false;
  }
};
