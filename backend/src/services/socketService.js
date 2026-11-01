import { Server } from 'socket.io';
import { dbService } from './dbService.js';
import { dbStore } from './dbStore.js';
import { notificationService } from './notificationService.js';

// Mapping: userId → Set<socketId> (hỗ trợ 1 user nhiều tab/thiết bị)
const userSockets = new Map();
let ioInstance = null;

/**
 * Khởi tạo Socket.IO Server và đăng ký toàn bộ sự kiện realtime.
 * Thay thế hoàn toàn cơ chế HTTP Polling 3.5s.
 */
export function initSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    pingInterval: 10000,
    pingTimeout: 20000
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    // Đăng ký socket vào mapping
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    console.log(`[Socket.IO] ✅ ${userId} connected (socket: ${socket.id}, total sockets: ${userSockets.get(userId).size})`);

    // Thông báo cho tất cả client khác biết user này đang online
    socket.broadcast.emit('user:online', {
      userId,
      timestamp: Date.now()
    });

    // ================================================================
    // GPS REALTIME: Nhận toạ độ từ client, lưu vào DB và broadcast
    // ================================================================
    socket.on('gps:update', async (data) => {
      try {
        const { lat, lng, customStatus, name, avatar, userCode, phone } = data;
        if (lat == null || lng == null) return;

        const result = await dbService.updateGps(userId, lat, lng, customStatus, name, avatar, userCode, phone);
        if (result && !result.is_guest) {
          // Broadcast vị trí mới cho tất cả client khác
          socket.broadcast.emit('gps:peer-update', {
            id: userId,
            lat: Number(lat),
            lng: Number(lng),
            full_name: result.full_name || result.name || name,
            name: result.name || result.full_name || name,
            avatar_url: result.avatar_url || result.avatar || avatar,
            avatar: result.avatar || result.avatar_url || avatar,
            user_code: result.user_code || userCode,
            custom_status: result.custom_status || customStatus,
            phone: result.phone || phone || '',
            battery: result.battery || '95%',
            is_online: true,
            last_seen_at: result.last_seen_at || new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('[Socket.IO] GPS update error:', err.message);
      }
    });

    // ================================================================
    // Yêu cầu lấy danh sách profiles (fallback polling)
    // ================================================================
    socket.on('profiles:request', async () => {
      try {
        const profiles = await dbService.getProfiles();
        socket.emit('profiles:list', profiles || []);
      } catch (err) {
        socket.emit('profiles:list', []);
      }
    });

    // ================================================================
    // Yêu cầu lấy danh sách bạn bè
    // ================================================================
    socket.on('friends:request', async () => {
      try {
        const friends = await dbService.getFriendsList(userId);
        socket.emit('friends:list', friends || []);
      } catch (err) {
        socket.emit('friends:list', []);
      }
    });

    // ================================================================
    // Yêu cầu lấy danh sách stories
    // ================================================================
    socket.on('stories:request', async () => {
      try {
        const stories = await dbService.getStories();
        socket.emit('stories:list', stories || []);
      } catch (err) {
        socket.emit('stories:list', []);
      }
    });

    // ================================================================
    // Yêu cầu lấy danh sách lời mời kết bạn
    // ================================================================
    socket.on('friend-requests:request', async () => {
      try {
        const reqs = await dbService.getFriendRequests(userId);
        socket.emit('friend-requests:list', reqs || { received: [], sent: [] });
      } catch (err) {
        socket.emit('friend-requests:list', { received: [], sent: [] });
      }
    });

    // ================================================================
    // CHAT REALTIME: Nhận tin nhắn và chuyển tiếp
    // ================================================================
    socket.on('chat:send', async (data) => {
      try {
        const msg = await dbService.sendMessage({
          ...data,
          sender: userId,
          sender_name: data.senderName || 'Tôi'
        });

        // Gửi tin nhắn đến tất cả socket của người nhận
        const recipientId = data.recipientId;
        if (recipientId) {
          emitToUser(recipientId, 'chat:message', {
            ...msg,
            conversationId: data.conversation_id || data.conversationId
          });
        }

        // Confirm cho người gửi
        socket.emit('chat:sent', { success: true, message: msg });
      } catch (err) {
        socket.emit('chat:error', { error: err.message });
      }
    });

    // Yêu cầu lấy tin nhắn của conversation
    socket.on('chat:get-messages', async (data) => {
      try {
        const msgs = await dbService.getMessages(data.conversationId);
        socket.emit('chat:messages', {
          conversationId: data.conversationId,
          messages: msgs || []
        });
      } catch (err) {
        socket.emit('chat:messages', { conversationId: data.conversationId, messages: [] });
      }
    });

    // ================================================================
    // SPATIAL BUMP (CỤM LY 3D NGOÀI ĐỜI THỰC < 15M)
    // ================================================================
    socket.on('spatial:bump-initiate', async (data) => {
      try {
        const { targetUserId, senderName, senderAvatar, lat, lng } = data;
        if (!targetUserId) return;

        console.log(`[Socket.IO] 🥂 Spatial Bump initiated by ${userId} to ${targetUserId}`);

        // 1. Tự động tạo bài đăng Story Đôi (Joint Story)
        let jointStory = null;
        try {
          const jointTitle = `🎉 ${senderName || 'Bạn'} & ${data.targetName || 'Bạn bè'} đang vi vu cùng nhau!`;
          jointStory = await dbService.createStory({
            host_id: userId,
            host_name: senderName || 'Tôi',
            host_avatar: senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            partner_id: targetUserId,
            partner_name: data.targetName || '',
            partner_avatar: data.targetAvatar || '',
            title: jointTitle,
            description: `Vừa cụm ly gặp gỡ ngoài đời thực tại tọa độ ${Number(lat || 10.7769).toFixed(4)}, ${Number(lng || 106.7009).toFixed(4)}!`,
            category: 'hangout',
            lat: Number(lat || 10.7769),
            lng: Number(lng || 106.7009),
            is_joint: true,
            expiry_hours: 6
          });
        } catch (storyErr) {
          console.warn('[Socket.IO] Joint story creation warning:', storyErr.message);
        }

        // 2. Gửi sự kiện trigger bump 3D tới cả 2 người
        const bumpPayload = {
          initiatorId: userId,
          initiatorName: senderName || 'Tôi',
          initiatorAvatar: senderAvatar,
          targetUserId,
          targetName: data.targetName,
          targetAvatar: data.targetAvatar,
          lat,
          lng,
          story: jointStory,
          timestamp: Date.now()
        };

        // Gửi cho người nhận
        emitToUser(targetUserId, 'spatial:bump-trigger', bumpPayload);
        // Gửi xác nhận cho người gửi
        socket.emit('spatial:bump-trigger', bumpPayload);

        // Broadcast story mới cho toàn thể client trên map
        if (jointStory) {
          ioInstance.emit('stories:new', jointStory);
        }
      } catch (err) {
        console.warn('[Socket.IO] spatial:bump-initiate error:', err.message);
      }
    });

    // ================================================================
    // FRIEND REQUEST EVENTS
    // ================================================================
    socket.on('friend:send-request', async (data) => {
      try {
        const result = await dbService.sendFriendRequest(userId, data.targetUserId);

        // Tạo thông báo cho người nhận (Idempotent: khóa chống trùng theo requestId)
        notificationService.createFriendRequestNotification({
          fromUserId: userId,
          toUserId: data.targetUserId,
          requestId: result.id,
          senderName: result.sender_name,
          senderAvatar: result.sender_avatar
        });

        // Gửi sự kiện realtime cho người nhận
        emitToUser(data.targetUserId, 'friend-request:incoming', result);

        // Confirm cho người gửi
        socket.emit('friend:request-sent', { success: true, request: result });
      } catch (err) {
        socket.emit('friend:request-error', { error: err.message });
      }
    });

    socket.on('friend:accept-request', async (data) => {
      try {
        const result = await dbService.acceptFriendRequest(data.requestId, userId);
        const req = result.request;

        // Thông báo cho NGƯỜI GỬI lời mời rằng đã được chấp nhận (Idempotent)
        notificationService.createFriendAcceptedNotification({
          toUserId: req.sender_id,
          fromUserId: userId,
          friendshipId: result.friendshipId,
          partnerName: req.receiver_name,
          partnerAvatar: req.receiver_avatar,
          isSender: true
        });

        // Thông báo cho NGƯỜI NHẬN (chính mình)
        notificationService.createFriendAcceptedNotification({
          toUserId: userId,
          fromUserId: req.sender_id,
          friendshipId: result.friendshipId,
          partnerName: req.sender_name,
          partnerAvatar: req.sender_avatar,
          isSender: false
        });

        emitToUser(req.sender_id, 'friend:accepted', { request: req, friendshipId: result.friendshipId });
        socket.emit('friend:accept-success', { success: true, request: req, friendshipId: result.friendshipId });
      } catch (err) {
        socket.emit('friend:accept-error', { error: err.message });
      }
    });

    socket.on('friend:reject-request', async (data) => {
      try {
        await dbService.rejectFriendRequest(data.requestId, userId);
        socket.emit('friend:reject-success', { success: true, requestId: data.requestId });
      } catch (err) {
        socket.emit('friend:reject-error', { error: err.message });
      }
    });

    socket.on('friend:cancel-request', async (data) => {
      try {
        await dbService.cancelFriendRequest(data.requestId, userId);
        socket.emit('friend:cancel-success', { success: true, requestId: data.requestId });
      } catch (err) {
        socket.emit('friend:cancel-error', { error: err.message });
      }
    });

    socket.on('friend:unfriend', async (data) => {
      try {
        await dbService.unfriend(userId, data.targetUserId);
        emitToUser(data.targetUserId, 'friend:unfriended', { userId });
        socket.emit('friend:unfriend-success', { success: true });
      } catch (err) {
        socket.emit('friend:unfriend-error', { error: err.message });
      }
    });

    // ================================================================
    // NOTIFICATIONS: Lấy và đánh dấu đã đọc
    // ================================================================
    socket.on('notifications:request', () => {
      const notifs = notificationService.getNotifications(userId);
      socket.emit('notifications:list', notifs);
    });

    socket.on('notification:read', (data) => {
      notificationService.markNotificationRead(data.notificationId);
      socket.emit('notification:read-success', { id: data.notificationId });
    });

    socket.on('notifications:read-all', () => {
      notificationService.markAllNotificationsRead(userId);
      socket.emit('notifications:read-all-success', {});
    });

    // ================================================================
    // Tín hiệu chủ động ngắt kết nối (beforeunload)
    // ================================================================
    socket.on('user:going-offline', () => {
      handleUserDisconnect(socket, userId, io);
    });

    // ================================================================
    // DISCONNECT: Xử lý khi user đóng tab/thoát link
    // ================================================================
    socket.on('disconnect', (reason) => {
      handleUserDisconnect(socket, userId, io);
      console.log(`[Socket.IO] ❌ ${userId} disconnected (reason: ${reason})`);
    });
  });

  console.log('[Socket.IO] ✅ Server đã khởi tạo thành công');
  return io;
}

/**
 * Xử lý khi user disconnect - xóa socket, kiểm tra còn tab nào không,
 * nếu không còn tab nào → broadcast offline
 */
function handleUserDisconnect(socket, userId, io) {
  const sockets = userSockets.get(userId);
  if (sockets) {
    sockets.delete(socket.id);
    if (sockets.size === 0) {
      userSockets.delete(userId);

      // Đánh dấu offline trong profile
      const profileIdx = dbStore.profiles.findIndex(p => p.id === userId);
      if (profileIdx >= 0) {
        dbStore.profiles[profileIdx].is_online = false;
        dbStore.profiles[profileIdx].last_seen_at = new Date(Date.now() - 600000).toISOString();
        dbStore.persist();
      }

      // Broadcast cho TẤT CẢ client còn lại biết user này đã offline
      io.emit('user:offline', {
        userId,
        timestamp: Date.now()
      });
    }
  }
}

/**
 * Gửi event đến userId cụ thể (tất cả tab/thiết bị)
 */
export function emitToUser(userId, event, data) {
  if (!ioInstance) return;
  const sockets = userSockets.get(userId);
  if (sockets && sockets.size > 0) {
    sockets.forEach(socketId => {
      ioInstance.to(socketId).emit(event, data);
    });
  }
}

/**
 * Broadcast event đến tất cả client đang kết nối
 */
export function broadcastEvent(event, data) {
  if (!ioInstance) return;
  ioInstance.emit(event, data);
}

/**
 * Kiểm tra user có đang online (có socket kết nối) hay không
 */
export function isUserOnline(userId) {
  const sockets = userSockets.get(userId);
  return sockets && sockets.size > 0;
}

/**
 * Lấy danh sách userId đang online
 */
export function getOnlineUserIds() {
  return Array.from(userSockets.keys());
}

// NOTIFICATION HELPERS (Ủy quyền cho notificationService)
function createNotification(params) {
  return notificationService.createNotification(params);
}

function getNotifications(userId) {
  return notificationService.getNotifications(userId);
}

function markNotificationRead(notifId) {
  return notificationService.markNotificationRead(notifId);
}

function markAllNotificationsRead(userId) {
  return notificationService.markAllNotificationsRead(userId);
}

export { createNotification, getNotifications };
