import { Server } from 'socket.io';
import { dbService, setSocketPresenceChecker } from './dbService.js';
import { dbStore } from './dbStore.js';
import { notificationService } from './notificationService.js';
import { callSignalingService } from './callSignalingService.js';

// Mapping: userId → Set<socketId> (hỗ trợ 1 user nhiều tab/thiết bị)
const userSockets = new Map();
const activeBumpSessions = new Map();
const getBumpSessionKey = (u1, u2) => [String(u1), String(u2)].sort().join(':');
let ioInstance = null;

/**
 * Kiểm tra xem một người dùng có ít nhất một kết nối Socket.IO đang hoạt động hay không
 */
export function isUserSocketConnected(userId) {
  if (!userId) return false;
  const s = userSockets.get(userId) || userSockets.get(String(userId));
  return Boolean(s && s.size > 0);
}

// Đăng ký bộ kiểm tra presence cho dbService để xác định trạng thái online chính xác
setSocketPresenceChecker(isUserSocketConnected);

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
    pingInterval: 8000,
    pingTimeout: 16000
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId;
    if (!userId) {
      socket.disconnect(false);
      return;
    }

    // Đăng ký socket vào mapping
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Đồng bộ trạng thái trực tuyến ngay khi có kết nối WebSocket
    const pIdx = dbStore.profiles.findIndex(p => p.id === userId);
    if (pIdx >= 0) {
      dbStore.profiles[pIdx].is_online = true;
      dbStore.profiles[pIdx].last_seen_at = new Date().toISOString();
    }
    const uIdx = dbStore.users.findIndex(u => u.id === userId);
    if (uIdx >= 0) {
      dbStore.users[uIdx].last_seen_at = new Date().toISOString();
    }

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
    // LIVE LOCATION STREAMING (THEO DÕI VỊ TRÍ TRỰC TIẾP KHÔNG GIÁN ĐOẠN)
    // ================================================================
    socket.on('live_location:update', async (data) => {
      try {
        const { conversationId, targetUserId, lat, lng, speed, heading, accuracy, messageId } = data || {};
        if (lat == null || lng == null) return;

        const numLat = Number(lat);
        const numLng = Number(lng);
        const numSpeed = speed != null ? Number(speed) : 0;
        const nowIso = new Date().toISOString();

        // 1. Cập nhật profile & user last_seen_at ngay lập tức trong bộ nhớ
        const pIdx = dbStore.profiles.findIndex(p => p.id === userId);
        if (pIdx >= 0) {
          dbStore.profiles[pIdx].lat = numLat;
          dbStore.profiles[pIdx].lng = numLng;
          dbStore.profiles[pIdx].speed = numSpeed;
          dbStore.profiles[pIdx].is_online = true;
          dbStore.profiles[pIdx].last_seen_at = nowIso;
        }
        const uIdx = dbStore.users.findIndex(u => u.id === userId);
        if (uIdx >= 0) {
          dbStore.users[uIdx].last_seen_at = nowIso;
        }

        const payload = {
          conversationId,
          userId,
          messageId,
          lat: numLat,
          lng: numLng,
          speed: numSpeed,
          heading: heading != null ? Number(heading) : null,
          accuracy: accuracy != null ? Number(accuracy) : null,
          timestamp: Date.now()
        };

        // 2. Relay tức thì không độ trễ tới người nhận
        if (targetUserId) {
          emitToUser(targetUserId, 'live_location:update', payload);
          emitToUser(targetUserId, 'chat:live_location_update', payload);
        } else if (conversationId) {
          const conv = dbStore.conversations.find(c => c.id === conversationId);
          if (conv && Array.isArray(conv.participants)) {
            conv.participants.forEach(pid => {
              if (pid !== userId) {
                emitToUser(pid, 'live_location:update', payload);
                emitToUser(pid, 'chat:live_location_update', payload);
              }
            });
          }
        }

        // Cập nhật toạ độ vào tin nhắn chia sẻ vị trí live nếu có messageId
        if (messageId) {
          const msg = dbStore.messages.find(m => m.id === messageId || m.client_msg_id === messageId);
          if (msg && msg.live_status !== 'stopped') {
            msg.lat = numLat;
            msg.lng = numLng;
            msg.speed = numSpeed;
            msg.updated_at = nowIso;
          }
        }
      } catch (err) {
        console.warn('[Socket.IO] live_location:update error:', err.message);
      }
    });

    socket.on('live_location:stop', async (data) => {
      try {
        const { messageId, conversationId, targetUserId } = data || {};
        if (messageId) {
          try {
            await dbService.stopLiveLocation(messageId, userId);
          } catch (dbErr) {
            console.warn('[Socket.IO] live_location:stop db notice:', dbErr.message);
          }
        }
        const stopPayload = {
          conversationId,
          userId,
          messageId,
          stopped_at: new Date().toISOString()
        };
        if (targetUserId) {
          emitToUser(targetUserId, 'live_location:stopped', stopPayload);
          emitToUser(targetUserId, 'chat:live_location_stopped', stopPayload);
        } else if (conversationId) {
          const conv = dbStore.conversations.find(c => c.id === conversationId);
          if (conv && Array.isArray(conv.participants)) {
            conv.participants.forEach(pid => {
              if (pid !== userId) {
                emitToUser(pid, 'live_location:stopped', stopPayload);
                emitToUser(pid, 'chat:live_location_stopped', stopPayload);
              }
            });
          }
        }
      } catch (err) {
        console.warn('[Socket.IO] live_location:stop error:', err.message);
      }
    });

    // ================================================================
    // SPATIAL BUMP (CỤNG LY 3D NGOÀI ĐỜI THỰC < 15M - MUTUAL HANDSHAKE)
    // ================================================================
    socket.on('spatial:bump-initiate', async (data) => {
      try {
        const { targetUserId, senderName, senderAvatar, lat, lng } = data;
        if (!targetUserId || targetUserId === userId) return;

        console.log(`[Socket.IO] 🥂 Spatial Bump initiated by ${userId} to ${targetUserId}`);

        // Xác thực vị trí GPS: Người dùng BẮT BUỘC phải có vị trí thực tế hợp lệ mới được cụng ly
        const hasInputCoords = lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng));
        let validLat = null;
        let validLng = null;

        if (hasInputCoords) {
          validLat = Number(lat);
          validLng = Number(lng);
        } else {
          const myProfile = dbStore.profiles.find(p => p.id === userId);
          if (myProfile && myProfile.lat != null && myProfile.lng != null && !isNaN(Number(myProfile.lat)) && !isNaN(Number(myProfile.lng))) {
            validLat = Number(myProfile.lat);
            validLng = Number(myProfile.lng);
          }
        }

        if (validLat == null || validLng == null) {
          console.warn(`[Socket.IO] ⚠️ Spatial Bump rejected: User ${userId} has no valid GPS location`);
          socket.emit('spatial:bump-error', { message: 'Vị trí GPS không khả dụng để cụng ly' });
          return;
        }

        const sessionKey = getBumpSessionKey(userId, targetUserId);
        activeBumpSessions.set(sessionKey, {
          user1: userId,
          user2: targetUserId,
          initiatorId: userId,
          initiatorName: senderName || 'Tôi',
          initiatorAvatar: senderAvatar,
          targetUserId,
          targetName: data.targetName || 'Bạn bè',
          targetAvatar: data.targetAvatar,
          lat: validLat,
          lng: validLng,
          readyUsers: new Set(),
          createdAt: Date.now()
        });

        const bumpPayload = {
          sessionKey,
          initiatorId: userId,
          initiatorName: senderName || 'Tôi',
          initiatorAvatar: senderAvatar,
          targetUserId,
          targetName: data.targetName || 'Bạn bè',
          targetAvatar: data.targetAvatar,
          lat: validLat,
          lng: validLng,
          timestamp: Date.now()
        };

        // Gửi sự kiện trigger mở modal 3D cho CẢ 2 BÊN
        emitToUser(targetUserId, 'spatial:bump-trigger', bumpPayload);
        socket.emit('spatial:bump-trigger', bumpPayload);

        // Gửi thông báo nổi Toast qua notificationService cho targetUser
        try {
          notificationService.createNotification({
            type: 'spatial_bump',
            fromUserId: userId,
            toUserId: targetUserId,
            title: '🥂 Cụng Ly Ngoài Đời Thực!',
            body: `${senderName || 'Bạn bè'} đang ở cận kề và muốn cụng ly chúc mừng cùng bạn!`,
            avatar: senderAvatar || '',
            actionData: {
              bumpData: bumpPayload
            }
          });
        } catch (notifErr) {
          console.warn('[Socket.IO] Bump notification warning:', notifErr.message);
        }
      } catch (err) {
        console.warn('[Socket.IO] spatial:bump-initiate error:', err.message);
      }
    });

    socket.on('spatial:bump-ready', async (data) => {
      try {
        const { targetUserId } = data;
        if (!targetUserId) return;
        const sessionKey = getBumpSessionKey(userId, targetUserId);
        let session = activeBumpSessions.get(sessionKey);

        if (!session) {
          const myProfile = dbStore.profiles.find(p => p.id === userId);
          const pLat = myProfile?.lat != null && !isNaN(Number(myProfile.lat)) ? Number(myProfile.lat) : null;
          const pLng = myProfile?.lng != null && !isNaN(Number(myProfile.lng)) ? Number(myProfile.lng) : null;
          if (pLat == null || pLng == null) {
            console.warn(`[Socket.IO] ⚠️ spatial:bump-ready rejected: no session and no valid GPS for ${userId}`);
            return;
          }
          session = {
            user1: userId,
            user2: targetUserId,
            initiatorId: userId,
            targetUserId,
            lat: pLat,
            lng: pLng,
            readyUsers: new Set(),
            createdAt: Date.now()
          };
          activeBumpSessions.set(sessionKey, session);
        }

        session.readyUsers.add(userId);

        // Báo cho đối phương biết bên này đã sẵn sàng
        emitToUser(targetUserId, 'spatial:bump-peer-ready', {
          fromUserId: userId,
          timestamp: Date.now()
        });

        // Kiểm tra xem CẢ 2 BÊN đã sẵn sàng chưa (Phương án B: Bắt tay 2 chiều)
        const isBothReady = session.readyUsers.has(userId) && session.readyUsers.has(targetUserId);

        if (isBothReady) {
          console.log(`[Socket.IO] 🥂 CẢ 2 BÊN ĐÃ SẴN SÀNG CỤNG LY: ${userId} & ${targetUserId}`);

          // Tạo bài đăng Story Đôi kỷ niệm cuộc gặp
          let jointStory = null;
          try {
            const jointTitle = `🎉 ${session.initiatorName || 'Bạn'} & ${session.targetName || 'Bạn bè'} vừa cụng ly chúc mừng cùng nhau!`;
            const hasSessionCoords = session.lat != null && session.lng != null && !isNaN(Number(session.lat)) && !isNaN(Number(session.lng));
            const jointDesc = hasSessionCoords
              ? `Vừa cụng ly chúc mừng ngoài đời thực tại tọa độ ${Number(session.lat).toFixed(4)}, ${Number(session.lng).toFixed(4)}!`
              : `Vừa cụng ly chúc mừng ngoài đời thực cùng nhau!`;

            jointStory = await dbService.createStory({
              host_id: session.initiatorId || userId,
              host_name: session.initiatorName || 'Tôi',
              host_avatar: session.initiatorAvatar || null,
              partner_id: targetUserId,
              partner_name: session.targetName || '',
              partner_avatar: session.targetAvatar || '',
              title: jointTitle,
              description: jointDesc,
              category: 'hangout',
              lat: hasSessionCoords ? Number(session.lat) : null,
              lng: hasSessionCoords ? Number(session.lng) : null,
              is_joint: true,
              expiry_hours: 6
            });
          } catch (storyErr) {
            console.warn('[Socket.IO] Joint story creation warning:', storyErr.message);
          }

          const clinkPayload = {
            sessionKey,
            story: jointStory,
            timestamp: Date.now()
          };

          // Gửi sự kiện cụng ly CLINK đồng thời tới CẢ 2 BÊN!
          emitToUser(targetUserId, 'spatial:bump-clink', clinkPayload);
          socket.emit('spatial:bump-clink', clinkPayload);

          if (jointStory) {
            ioInstance.emit('stories:new', jointStory);
          }

          activeBumpSessions.delete(sessionKey);
        }
      } catch (err) {
        console.warn('[Socket.IO] spatial:bump-ready error:', err.message);
      }
    });

    socket.on('spatial:bump-cancel', (data) => {
      try {
        const { targetUserId } = data;
        if (!targetUserId) return;
        const sessionKey = getBumpSessionKey(userId, targetUserId);
        activeBumpSessions.delete(sessionKey);
        emitToUser(targetUserId, 'spatial:bump-peer-cancelled', { fromUserId: userId });
      } catch (err) {}
    });

    // ================================================================
    // TROLL / MEME REALTIME EVENTS
    // ================================================================
    socket.on('troll:send', async (data) => {
      try {
        const { targetUserId, meme, quote, senderName, senderAvatar } = data || {};
        if (!targetUserId || !meme) return;

        const payload = {
          senderId: userId,
          senderName: senderName || 'Một người bạn',
          senderAvatar: senderAvatar || '',
          senderUser: {
            id: userId,
            name: senderName || 'Một người bạn',
            avatar: senderAvatar || ''
          },
          meme,
          quote: quote || meme.caption || '',
          timestamp: Date.now()
        };

        // 1. Gửi trực tiếp hiệu ứng Screen Takeover tới client đối phương
        emitToUser(targetUserId, 'troll:receive', payload);
        emitToUser(targetUserId, 'meme_troll', payload);

        // 2. Tạo thông báo trong ứng dụng cho người nhận
        try {
          notificationService.createNotification({
            type: 'troll',
            fromUserId: userId,
            toUserId: targetUserId,
            title: `😜 ${senderName || 'Bạn bè'} vừa trêu bạn!`,
            body: `Đã ném ${meme.name || 'vũ khí'}: "${quote || meme.caption || ''}"`,
            avatar: senderAvatar || '',
            actionData: payload
          });
        } catch (notifErr) {
          console.warn('[Socket.IO] Troll notification warning:', notifErr.message);
        }
      } catch (err) {
        console.warn('[Socket.IO] troll:send error:', err.message);
      }
    });

    socket.on('meme_troll', async (data) => {
      try {
        const targetUserId = data?.targetId || data?.targetUserId;
        if (!targetUserId) return;
        const payload = {
          senderId: userId,
          senderName: data.senderName || 'Một người bạn',
          senderAvatar: data.senderAvatar || '',
          senderUser: {
            id: userId,
            name: data.senderName || 'Một người bạn',
            avatar: data.senderAvatar || ''
          },
          meme: data.meme,
          quote: data.quote || data.meme?.caption || '',
          timestamp: Date.now()
        };
        emitToUser(targetUserId, 'troll:receive', payload);
        emitToUser(targetUserId, 'meme_troll', payload);
      } catch (err) {
        console.warn('[Socket.IO] meme_troll error:', err.message);
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
    // WEBRTC CALL SIGNALING: Cuộc gọi thoại & video phong cách Messenger
    // ================================================================
    socket.on('call:initiate', (data) => {
      callSignalingService.handleCallInitiate(socket, userId, data, { emitToUser, isUserOnline });
    });

    socket.on('call:accept', (data) => {
      callSignalingService.handleCallAccept(socket, userId, data, { emitToUser });
    });

    socket.on('call:reject', (data) => {
      callSignalingService.handleCallReject(socket, userId, data, { emitToUser });
    });

    socket.on('call:end', (data) => {
      callSignalingService.handleCallEnd(socket, userId, data, { emitToUser });
    });

    socket.on('call:signal', (data) => {
      callSignalingService.handleCallSignal(socket, userId, data, { emitToUser });
    });

    socket.on('call:media_state', (data) => {
      callSignalingService.handleCallMediaState(socket, userId, data, { emitToUser });
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
    // Dọn dẹp phiên gọi nếu người dùng ngắt kết nối
    callSignalingService.handleUserCallDisconnect(userId, { emitToUser });
    if (sockets.size === 0) {
      userSockets.delete(userId);

      const now10mAgo = new Date(Date.now() - 600000).toISOString();
      // Đánh dấu offline trong profile và user
      const profileIdx = dbStore.profiles.findIndex(p => p.id === userId);
      if (profileIdx >= 0) {
        dbStore.profiles[profileIdx].is_online = false;
        dbStore.profiles[profileIdx].last_seen_at = now10mAgo;
      }
      const userIdx = dbStore.users.findIndex(u => u.id === userId);
      if (userIdx >= 0) {
        dbStore.users[userIdx].last_seen_at = now10mAgo;
      }
      dbStore.persist();

      // Broadcast cho TẤT CẢ client còn lại biết user này đã offline
      io.emit('user:offline', {
        userId,
        timestamp: Date.now()
      });
    }
  }
}

/**
 * Ngắt kết nối cưỡng chế và chuyển tài khoản sang offline ngay lập tức
 */
export function forceUserOffline(userId) {
  if (!userId) return;
  const sockets = userSockets.get(userId) || userSockets.get(String(userId));
  if (sockets && sockets.size > 0) {
    sockets.forEach(socketId => {
      const s = ioInstance?.sockets?.sockets?.get(socketId);
      if (s) {
        try { s.disconnect(false); } catch (_) {}
      }
    });
  }
  userSockets.delete(userId);
  userSockets.delete(String(userId));

  const now10mAgo = new Date(Date.now() - 600000).toISOString();
  const profileIdx = dbStore.profiles.findIndex(p => String(p.id) === String(userId));
  if (profileIdx >= 0) {
    dbStore.profiles[profileIdx].is_online = false;
    dbStore.profiles[profileIdx].last_seen_at = now10mAgo;
  }
  const userIdx = dbStore.users.findIndex(u => String(u.id) === String(userId));
  if (userIdx >= 0) {
    dbStore.users[userIdx].last_seen_at = now10mAgo;
  }
  dbStore.persist();

  if (ioInstance) {
    ioInstance.emit('user:offline', {
      userId,
      timestamp: Date.now()
    });
  }
}

/**
 * Gửi event đến userId cụ thể (tất cả tab/thiết bị)
 */
export function emitToUser(userId, event, data) {
  if (!ioInstance || !userId) return false;
  const sockets = userSockets.get(userId) || userSockets.get(String(userId));
  if (sockets && sockets.size > 0) {
    sockets.forEach(socketId => {
      ioInstance.to(socketId).emit(event, data);
    });
    return true;
  }
  return false;
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
  if (!userId) return false;
  const sockets = userSockets.get(userId) || userSockets.get(String(userId));
  return Boolean(sockets && sockets.size > 0);
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
