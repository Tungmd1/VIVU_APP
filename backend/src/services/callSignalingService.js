/**
 * callSignalingService.js
 * Quản lý vòng đời và định tuyến tín hiệu WebRTC P2P qua Socket.IO (Signaling Layer)
 * Phong cách Facebook Messenger: Hỗ trợ gọi thoại & gọi video, báo bận, đổ chuông và ngắt máy an toàn.
 */

// Mapping: userId -> callSession
const activeCalls = new Map();

export const callSignalingService = {
  getActiveCall(userId) {
    return activeCalls.get(String(userId)) || null;
  },

  handleCallInitiate(socket, userId, data, { emitToUser, isUserOnline }) {
    try {
      const { targetUserId, callType = 'video', callerName = 'Người dùng VIVU', callerAvatar = '' } = data;
      if (!targetUserId) {
        socket.emit('call:rejected', { reason: 'invalid_target', message: 'Không tìm thấy người nhận cuộc gọi.' });
        return;
      }

      if (String(targetUserId) === String(userId)) {
        socket.emit('call:rejected', { reason: 'self_call', message: 'Bạn không thể tự gọi cho chính mình.' });
        return;
      }

      // 1. Kiểm tra đối phương có online hay không
      if (!isUserOnline(targetUserId)) {
        socket.emit('call:rejected', {
          targetUserId,
          reason: 'offline',
          message: 'Người dùng hiện đang ngoại tuyến.'
        });
        return;
      }

      // 2. Kiểm tra đối phương có đang bận trong cuộc gọi khác không
      if (activeCalls.has(String(targetUserId))) {
        socket.emit('call:rejected', {
          targetUserId,
          reason: 'busy',
          message: 'Người dùng đang bận trong một cuộc gọi khác.'
        });
        return;
      }

      // 3. Khởi tạo phiên gọi
      const callSession = {
        callId: `call-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        callerId: String(userId),
        targetUserId: String(targetUserId),
        callType, // 'voice' | 'video'
        callerName,
        callerAvatar,
        status: 'ringing',
        startTime: Date.now()
      };

      activeCalls.set(String(userId), callSession);
      activeCalls.set(String(targetUserId), callSession);

      // 4. Phát tín hiệu cuộc gọi đến cho đối phương
      emitToUser(targetUserId, 'call:incoming', callSession);

      // 5. Báo lại cho người gọi rằng đang đổ chuông
      socket.emit('call:ringing', callSession);
    } catch (err) {
      console.warn('[CallSignaling] Initiate error:', err.message);
      socket.emit('call:rejected', { reason: 'server_error', message: err.message });
    }
  },

  handleCallAccept(socket, userId, data, { emitToUser }) {
    try {
      const session = activeCalls.get(String(userId));
      if (!session) {
        socket.emit('call:ended', { reason: 'session_expired', message: 'Cuộc gọi đã kết thúc hoặc không tồn tại.' });
        return;
      }

      session.status = 'active';
      session.connectedAt = Date.now();

      const peerId = session.callerId === String(userId) ? session.targetUserId : session.callerId;

      // Thông báo cho cả 2 bên cuộc gọi đã được chấp nhận
      emitToUser(peerId, 'call:accepted', session);
      socket.emit('call:accepted', session);
    } catch (err) {
      console.warn('[CallSignaling] Accept error:', err.message);
    }
  },

  handleCallReject(socket, userId, data, { emitToUser }) {
    try {
      const session = activeCalls.get(String(userId));
      const reason = data?.reason || 'declined';
      const message = data?.message || 'Cuộc gọi đã bị từ chối.';

      if (session) {
        const peerId = session.callerId === String(userId) ? session.targetUserId : session.callerId;
        activeCalls.delete(String(session.callerId));
        activeCalls.delete(String(session.targetUserId));

        emitToUser(peerId, 'call:rejected', { reason, message, callId: session.callId });
      }

      socket.emit('call:ended', { reason, message });
    } catch (err) {
      console.warn('[CallSignaling] Reject error:', err.message);
    }
  },

  handleCallEnd(socket, userId, data, { emitToUser }) {
    try {
      const session = activeCalls.get(String(userId));
      if (session) {
        const peerId = session.callerId === String(userId) ? session.targetUserId : session.callerId;
        activeCalls.delete(String(session.callerId));
        activeCalls.delete(String(session.targetUserId));

        const endPayload = {
          callId: session.callId,
          duration: session.connectedAt ? Math.floor((Date.now() - session.connectedAt) / 1000) : 0,
          reason: data?.reason || 'ended',
          message: 'Cuộc gọi đã kết thúc.'
        };

        emitToUser(peerId, 'call:ended', endPayload);
        socket.emit('call:ended', endPayload);
      } else {
        socket.emit('call:ended', { reason: 'ended', message: 'Cuộc gọi đã kết thúc.' });
      }
    } catch (err) {
      console.warn('[CallSignaling] End error:', err.message);
    }
  },

  handleCallSignal(socket, userId, data, { emitToUser }) {
    try {
      const { targetUserId, signal } = data;
      if (!targetUserId || !signal) return;

      // Chuyển tiếp SDP Offer/Answer hoặc ICE Candidate tới đúng đối phương
      emitToUser(targetUserId, 'call:signal', {
        fromUserId: String(userId),
        signal
      });
    } catch (err) {
      console.warn('[CallSignaling] Signal error:', err.message);
    }
  },

  handleUserCallDisconnect(userId, { emitToUser }) {
    try {
      const session = activeCalls.get(String(userId));
      if (session) {
        const peerId = session.callerId === String(userId) ? session.targetUserId : session.callerId;
        activeCalls.delete(String(session.callerId));
        activeCalls.delete(String(session.targetUserId));

        emitToUser(peerId, 'call:ended', {
          callId: session.callId,
          reason: 'disconnected',
          message: 'Đối phương đã bị ngắt kết nối mạng.'
        });
      }
    } catch (err) {
      console.warn('[CallSignaling] Disconnect clean warning:', err.message);
    }
  }
};
