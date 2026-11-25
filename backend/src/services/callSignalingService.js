/**
 * callSignalingService.js
 * Quản lý vòng đời và định tuyến tín hiệu WebRTC P2P qua Socket.IO (Signaling Layer)
 * Phong cách Facebook Messenger: Hỗ trợ gọi thoại & gọi video, báo bận, đổ chuông và ngắt máy an toàn.
 */

// Mapping: userId -> callSession (serializable data only)
const activeCalls = new Map();
// Mapping: callId -> Timeout handle (kept outside callSession to avoid circular serialization crash)
const callTimers = new Map();

export const CALL_TIMEOUT_MS = 45000; // 45 giây timeout cho cuộc gọi chưa được phản hồi

function clearSessionTimeout(session) {
  if (!session?.callId) return;
  const timer = callTimers.get(session.callId);
  if (timer) {
    clearTimeout(timer);
    callTimers.delete(session.callId);
  }
}

function toPublicCallSession(session) {
  if (!session) return null;
  return {
    callId: session.callId,
    callerId: session.callerId,
    targetUserId: session.targetUserId,
    callType: session.callType,
    isVideo: session.callType === 'video',
    callerName: session.callerName,
    callerAvatar: session.callerAvatar,
    status: session.status,
    startTime: session.startTime,
    connectedAt: session.connectedAt || null
  };
}

export const callSignalingService = {
  getActiveCall(userId) {
    return activeCalls.get(String(userId)) || null;
  },

  handleCallInitiate(socket, userId, data, { emitToUser, isUserOnline }) {
    try {
      let { targetUserId, callType = 'video', callerName = 'Người dùng VIVU', callerAvatar = '' } = data;

      // Chuẩn hóa targetUserId nếu client truyền room ID conv-direct-...
      if (typeof targetUserId === 'string' && targetUserId.startsWith('conv-direct-')) {
        const parts = targetUserId.replace('conv-direct-', '').split('--');
        const resolved = parts.find(p => String(p) !== String(userId));
        if (resolved) {
          targetUserId = resolved;
        }
      }

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

      // 3. Khởi tạo phiên gọi (chỉ lưu numeric timeoutId trên session, giữ Timeout object ở Map tách biệt)
      const callSession = {
        callId: `call-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        callerId: String(userId),
        targetUserId: String(targetUserId),
        callType, // 'voice' | 'video'
        isVideo: callType === 'video',
        callerName,
        callerAvatar,
        status: 'ringing',
        startTime: Date.now(),
        timeoutId: null
      };

      // Thiết lập timeout 45s trong Map tách biệt: nếu sau 45s chưa accept/ended, tự động hủy phiên
      const timeoutHandle = setTimeout(() => {
        callTimers.delete(callSession.callId);
        const currentSession = activeCalls.get(String(userId));
        if (currentSession && currentSession.callId === callSession.callId && currentSession.status === 'ringing') {
          activeCalls.delete(String(callSession.callerId));
          activeCalls.delete(String(callSession.targetUserId));
          const timeoutPayload = {
            callId: callSession.callId,
            duration: 0,
            reason: 'timeout',
            message: 'Cuộc gọi không có phản hồi và đã kết thúc sau 45 giây.'
          };
          emitToUser(callSession.callerId, 'call:ended', timeoutPayload);
          emitToUser(callSession.targetUserId, 'call:ended', timeoutPayload);
        }
      }, CALL_TIMEOUT_MS);

      if (timeoutHandle?.unref) {
        timeoutHandle.unref();
      }
      callTimers.set(callSession.callId, timeoutHandle);
      callSession.timeoutId = Number(timeoutHandle) || callSession.callId;

      activeCalls.set(String(userId), callSession);
      activeCalls.set(String(targetUserId), callSession);

      const publicSession = toPublicCallSession(callSession);

      // 4. Phát tín hiệu cuộc gọi đến cho đối phương
      emitToUser(targetUserId, 'call:incoming', publicSession);

      // 5. Báo lại cho người gọi rằng đang đổ chuông
      socket.emit('call:ringing', publicSession);
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

      clearSessionTimeout(session);
      session.status = 'active';
      session.connectedAt = Date.now();

      const peerId = session.callerId === String(userId) ? session.targetUserId : session.callerId;
      const publicSession = toPublicCallSession(session);

      // Thông báo cho cả 2 bên cuộc gọi đã được chấp nhận
      emitToUser(peerId, 'call:accepted', publicSession);
      socket.emit('call:accepted', publicSession);
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
        clearSessionTimeout(session);
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
        clearSessionTimeout(session);
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

  handleCallMediaState(socket, userId, data, { emitToUser }) {
    try {
      const session = activeCalls.get(String(userId));
      const targetId = data?.targetUserId || (session ? (session.callerId === String(userId) ? session.targetUserId : session.callerId) : null);
      if (!targetId) return;
      emitToUser(targetId, 'call:media_state', {
        fromUserId: String(userId),
        isMuted: Boolean(data?.isMuted),
        isVideoOff: Boolean(data?.isVideoOff)
      });
    } catch (err) {
      console.warn('[CallSignaling] MediaState error:', err.message);
    }
  },

  handleUserCallDisconnect(userId, { emitToUser }) {
    try {
      const session = activeCalls.get(String(userId));
      if (session) {
        clearSessionTimeout(session);
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
  },

  // Dành riêng cho testing kiểm tra timeout 45s mà không cần chờ wall-clock
  _triggerTimeout(userId, { emitToUser }) {
    const session = activeCalls.get(String(userId));
    if (session && session.status === 'ringing') {
      clearSessionTimeout(session);
      activeCalls.delete(String(session.callerId));
      activeCalls.delete(String(session.targetUserId));
      const timeoutPayload = {
        callId: session.callId,
        duration: 0,
        reason: 'timeout',
        message: 'Cuộc gọi không có phản hồi và đã kết thúc sau 45 giây.'
      };
      emitToUser(session.callerId, 'call:ended', timeoutPayload);
      emitToUser(session.targetUserId, 'call:ended', timeoutPayload);
      return true;
    }
    return false;
  }
};
