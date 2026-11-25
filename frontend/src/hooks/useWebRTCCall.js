import { useState, useEffect, useRef, useCallback } from 'react';
import { webrtcManager } from '../services/webrtcManager';

/**
 * useWebRTCCall.js
 * Custom hook quản lý toàn bộ vòng đời cuộc gọi WebRTC phong cách Facebook Messenger
 * Tách biệt logic tín hiệu Socket.IO, MediaStream và trạng thái hiển thị
 * Đảm bảo:
 * 1. Khắc phục hoàn toàn lỗi Double Offer Glare: Caller tạo Offer, Callee chỉ Answer.
 * 2. Đảm bảo trạng thái active và bắt đầu đếm giờ CHỈ KHI đồng thời:
 *    connectionState === 'connected' VÀ remoteStream.getTracks().some(t => t.readyState === 'live').
 * 3. Loại bỏ 100% hộp thoại chặn luồng trình duyệt, dùng notification / toast in-app không gây nghẽn JS thread.
 * 4. Tự động gửi call:reject (permission_denied) khi Callee bị từ chối quyền truy cập camera/mic.
 */
export function useWebRTCCall({
  socket,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onToast
}) {
  const [activeCallSession, setActiveCallSession] = useState(null);
  const [incomingCallSession, setIncomingCallSession] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [localMediaStream, setLocalMediaStream] = useState(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState(null);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isCallVideoOff, setIsCallVideoOff] = useState(false);
  const [remoteMediaState, setRemoteMediaState] = useState({ isMuted: false, isVideoOff: false });

  const durationTimerRef = useRef(null);
  const activeCallRef = useRef(null);
  activeCallRef.current = activeCallSession;

  const incomingCallRef = useRef(null);
  incomingCallRef.current = incomingCallSession;

  const connectionStateRef = useRef('new');
  const remoteStreamRef = useRef(null);

  // Helper thông báo không block JS thread (thay thế hoàn toàn alert)
  const notify = useCallback((message, type = 'info') => {
    if (typeof onToast === 'function') {
      onToast({ message, type });
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vivu:toast', { detail: { message, type } }));
    }
  }, [onToast]);

  // Xóa timer đếm thời gian
  const stopDurationTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  // Bắt đầu timer đếm thời gian
  const startDurationTimer = useCallback(() => {
    stopDurationTimer();
    setCallDuration(0);
    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }, [stopDurationTimer]);

  // Dọn dẹp phiên gọi
  const cleanupCall = useCallback(() => {
    stopDurationTimer();
    connectionStateRef.current = 'closed';
    remoteStreamRef.current = null;
    webrtcManager.destroy();
    setActiveCallSession(null);
    setIncomingCallSession(null);
    setCallDuration(0);
    setIsCallMinimized(false);
    setLocalMediaStream(null);
    setRemoteMediaStream(null);
    setIsCallMuted(false);
    setIsCallVideoOff(false);
    setRemoteMediaState({ isMuted: false, isVideoOff: false });
  }, [stopDurationTimer]);

  // Kiểm tra điều kiện kép trước khi kích hoạt trạng thái active & đếm giờ
  const checkAndActivateCall = useCallback((connState, rStream) => {
    const currentState = connState !== undefined ? connState : connectionStateRef.current;
    const currentStream = rStream !== undefined ? rStream : remoteStreamRef.current;

    const isConnected = currentState === 'connected';
    const hasLiveTracks = Boolean(
      currentStream &&
      currentStream.getTracks().length > 0 &&
      currentStream.getTracks().some((t) => t.readyState === 'live')
    );

    if (isConnected && hasLiveTracks) {
      if (activeCallRef.current && activeCallRef.current.status !== 'active') {
        startDurationTimer();
        setActiveCallSession((prev) => (prev ? { ...prev, status: 'active' } : null));
      }
    }
  }, [startDurationTimer]);

  // Khởi tạo PeerConnection gắn kèm callbacks
  const initPeerConnection = useCallback((targetUserId) => {
    return webrtcManager.createPeerConnection({
      onRemoteStream: (rStream) => {
        remoteStreamRef.current = rStream;
        setRemoteMediaStream(rStream);
        rStream.getTracks().forEach((track) => {
          track.onended = () => checkAndActivateCall();
          track.onmute = () => checkAndActivateCall();
          track.onunmute = () => checkAndActivateCall();
        });
        checkAndActivateCall(undefined, rStream);
      },
      onIceCandidate: (candidate) => {
        const destId = targetUserId || activeCallRef.current?.targetUserId || activeCallRef.current?.callerId;
        if (destId) {
          socket.emit('call:signal', { targetUserId: destId, signal: { type: 'candidate', candidate } });
        }
      },
      onConnectionStateChange: (state) => {
        connectionStateRef.current = state;
        if (state === 'connected') {
          checkAndActivateCall(state, undefined);
        } else if (state === 'disconnected' || state === 'failed') {
          cleanupCall();
        }
      }
    });
  }, [socket, checkAndActivateCall, cleanupCall]);

  // Khởi tạo cuộc gọi đi (Caller)
  const startCall = useCallback(async ({ targetUserId, targetName, targetAvatar, callType = 'video' }) => {
    if (!targetUserId || !socket) return;
    if (activeCallRef.current) return;

    try {
      const isVideo = callType === 'video';
      const stream = await webrtcManager.startLocalStream({ isVideo });
      setLocalMediaStream(stream);

      const session = {
        targetUserId,
        name: targetName || 'Bạn bè',
        avatar: targetAvatar || '',
        callType,
        status: 'ringing',
        isCaller: true
      };
      setActiveCallSession(session);
      setIsCallMinimized(false);

      // Gửi tín hiệu gọi qua Socket.IO
      socket.emit('call:initiate', {
        targetUserId,
        callType,
        callerName: currentUserName,
        callerAvatar: currentUserAvatar
      });
    } catch (err) {
      console.warn('[useWebRTCCall] startCall error:', err.message);
      notify(err.message || 'Không thể truy cập Microphone/Camera.', 'error');
      cleanupCall();
    }
  }, [socket, currentUserName, currentUserAvatar, notify, cleanupCall]);

  // Nhận cuộc gọi đến (Callee)
  const acceptCall = useCallback(async () => {
    if (!incomingCallRef.current || !socket) return;
    const session = incomingCallRef.current;
    setIncomingCallSession(null);

    try {
      const isVideo = session.callType === 'video';
      const stream = await webrtcManager.startLocalStream({ isVideo });
      setLocalMediaStream(stream);

      const activeSession = {
        ...session,
        targetUserId: session.callerId,
        name: session.callerName,
        avatar: session.callerAvatar,
        status: 'connecting',
        isCaller: false
      };
      setActiveCallSession(activeSession);

      // Callee CHỈ khởi tạo PeerConnection và lắng nghe, KHÔNG tạo offer
      initPeerConnection(session.callerId);

      socket.emit('call:accept', { callerId: session.callerId });
    } catch (err) {
      console.warn('[useWebRTCCall] acceptCall error:', err.message);
      if (socket && session?.callerId) {
        // Tự động emit call:reject với lý do permission_denied để Caller không bị treo
        socket.emit('call:reject', {
          callerId: session.callerId,
          targetUserId: session.callerId,
          reason: 'permission_denied',
          message: 'Đối phương không thể cấp quyền truy cập Microphone/Camera.'
        });
      }
      notify(err.message || 'Không thể truy cập Microphone/Camera.', 'error');
      cleanupCall();
    }
  }, [socket, initPeerConnection, notify, cleanupCall]);

  // Từ chối cuộc gọi đến
  const declineCall = useCallback(() => {
    if (incomingCallRef.current && socket) {
      socket.emit('call:reject', {
        callerId: incomingCallRef.current.callerId,
        targetUserId: incomingCallRef.current.callerId,
        reason: 'declined',
        message: 'Cuộc gọi đã bị từ chối.'
      });
    }
    setIncomingCallSession(null);
  }, [socket]);

  // Kết thúc cuộc gọi
  const endCall = useCallback(() => {
    if (socket) {
      const targetId = activeCallRef.current?.targetUserId || activeCallRef.current?.callerId;
      socket.emit('call:end', { targetUserId: targetId, reason: 'hangup' });
    }
    cleanupCall();
  }, [socket, cleanupCall]);

  // Bật/Tắt Mic
  const toggleMute = useCallback(() => {
    const nextState = webrtcManager.toggleAudio();
    const nextMuted = !nextState;
    setIsCallMuted(nextMuted);
    const targetId = activeCallRef.current?.targetUserId || activeCallRef.current?.callerId;
    if (socket && targetId) {
      socket.emit('call:media_state', { targetUserId: targetId, isMuted: nextMuted, isVideoOff: isCallVideoOff });
    }
  }, [socket, isCallVideoOff]);

  // Bật/Tắt Video
  const toggleVideo = useCallback(() => {
    const nextState = webrtcManager.toggleVideo();
    const nextVideoOff = !nextState;
    setIsCallVideoOff(nextVideoOff);
    const targetId = activeCallRef.current?.targetUserId || activeCallRef.current?.callerId;
    if (socket && targetId) {
      socket.emit('call:media_state', { targetUserId: targetId, isMuted: isCallMuted, isVideoOff: nextVideoOff });
    }
  }, [socket, isCallMuted]);

  // Lật Camera
  const switchCamera = useCallback(async () => {
    const newStream = await webrtcManager.switchCamera();
    if (newStream) setLocalMediaStream(newStream);
  }, []);

  const minimizeCall = useCallback(() => setIsCallMinimized(true), []);
  const maximizeCall = useCallback(() => setIsCallMinimized(false), []);

  // Lắng nghe các sự kiện Socket.IO
  useEffect(() => {
    if (!socket) return;

    const onIncoming = (session) => {
      // Nếu đang trong cuộc gọi khác thì tự động báo bận
      if (activeCallRef.current) {
        socket.emit('call:reject', {
          callerId: session.callerId,
          targetUserId: session.callerId,
          reason: 'busy',
          message: 'Người dùng đang bận trong một cuộc gọi khác.'
        });
        return;
      }
      setIncomingCallSession(session);
    };

    const onRinging = () => {
      setActiveCallSession((prev) => (prev ? { ...prev, status: 'ringing' } : null));
    };

    const onAccepted = async () => {
      // CHỈ Caller mới tạo Offer và gửi qua signaling
      if (!activeCallRef.current?.isCaller) {
        setActiveCallSession((prev) => (prev ? { ...prev, status: 'connecting' } : null));
        return;
      }

      setActiveCallSession((prev) => (prev ? { ...prev, status: 'connecting' } : null));

      try {
        const targetId = activeCallRef.current?.targetUserId;
        initPeerConnection(targetId);

        const offer = await webrtcManager.createOffer();
        if (targetId) {
          socket.emit('call:signal', { targetUserId: targetId, signal: offer });
        }
      } catch (err) {
        console.warn('[useWebRTCCall] onAccepted createOffer error:', err.message);
      }
    };

    const onSignal = async ({ fromUserId, signal }) => {
      try {
        if (!signal) return;

        if (signal.type === 'offer') {
          // Callee nhận Offer từ Caller -> Tạo Answer và gửi lại
          const answer = await webrtcManager.handleOfferAndCreateAnswer(signal);
          socket.emit('call:signal', { targetUserId: fromUserId, signal: answer });
        } else if (signal.type === 'answer') {
          // Caller nhận Answer từ Callee -> Hoàn tất SDP handshake
          await webrtcManager.handleAnswer(signal);
        } else if (signal.type === 'candidate' && signal.candidate) {
          // Xử lý ICE candidate (được buffer an toàn bên trong webrtcManager)
          await webrtcManager.addIceCandidate(signal.candidate);
        }
      } catch (err) {
        console.warn('[useWebRTCCall] onSignal error:', err.message);
      }
    };

    const onRejected = ({ reason, message }) => {
      let friendlyMsg = 'Cuộc gọi đã bị từ chối.';
      if (reason === 'busy') friendlyMsg = 'Người dùng đang bận trong một cuộc gọi khác.';
      else if (reason === 'offline') friendlyMsg = 'Người dùng hiện đang ngoại tuyến.';
      else if (reason === 'permission_denied') friendlyMsg = 'Đối phương không thể cấp quyền Microphone/Camera.';
      else if (reason === 'timeout') friendlyMsg = 'Cuộc gọi không có phản hồi và đã kết thúc sau 45 giây.';

      notify(message || friendlyMsg, 'warning');
      cleanupCall();
    };

    const onEnded = ({ reason, message } = {}) => {
      if (reason === 'timeout') {
        notify(message || 'Cuộc gọi không có phản hồi và đã kết thúc sau 45 giây.', 'warning');
      } else if (reason === 'disconnected') {
        notify('Đối phương đã bị ngắt kết nối mạng.', 'warning');
      }
      cleanupCall();
    };

    const onMediaState = (payload) => {
      if (payload) {
        setRemoteMediaState({
          isMuted: Boolean(payload.isMuted),
          isVideoOff: Boolean(payload.isVideoOff)
        });
      }
    };

    socket.on('call:incoming', onIncoming);
    socket.on('call:ringing', onRinging);
    socket.on('call:accepted', onAccepted);
    socket.on('call:signal', onSignal);
    socket.on('call:rejected', onRejected);
    socket.on('call:ended', onEnded);
    socket.on('call:media_state', onMediaState);

    return () => {
      socket.off('call:incoming', onIncoming);
      socket.off('call:ringing', onRinging);
      socket.off('call:accepted', onAccepted);
      socket.off('call:signal', onSignal);
      socket.off('call:rejected', onRejected);
      socket.off('call:ended', onEnded);
      socket.off('call:media_state', onMediaState);
    };
  }, [socket, initPeerConnection, notify, cleanupCall]);

  return {
    activeCallSession,
    incomingCallSession,
    callDuration,
    isCallMinimized,
    localMediaStream,
    remoteMediaStream,
    isCallMuted,
    isCallVideoOff,
    remoteMediaState,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,
    minimizeCall,
    maximizeCall
  };
}