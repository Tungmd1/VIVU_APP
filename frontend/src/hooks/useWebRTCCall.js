import { useState, useEffect, useRef, useCallback } from 'react';
import { webrtcManager } from '../services/webrtcManager';

/**
 * useWebRTCCall.js
 * Custom hook quản lý toàn bộ vòng đời cuộc gọi WebRTC phong cách Facebook Messenger
 * Tách biệt logic tín hiệu Socket.IO, MediaStream và trạng thái hiển thị
 * Tuân thủ Rule 7 (< 250 dòng) và quy chuẩn Zero-Crash
 */
export function useWebRTCCall({ socket, currentUserId, currentUserName, currentUserAvatar }) {
  const [activeCallSession, setActiveCallSession] = useState(null);
  const [incomingCallSession, setIncomingCallSession] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [localMediaStream, setLocalMediaStream] = useState(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState(null);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isCallVideoOff, setIsCallVideoOff] = useState(false);

  const durationTimerRef = useRef(null);
  const activeCallRef = useRef(null);
  activeCallRef.current = activeCallSession;

  const incomingCallRef = useRef(null);
  incomingCallRef.current = incomingCallSession;

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
    webrtcManager.destroy();
    setActiveCallSession(null);
    setIncomingCallSession(null);
    setCallDuration(0);
    setIsCallMinimized(false);
    setLocalMediaStream(null);
    setRemoteMediaStream(null);
    setIsCallMuted(false);
    setIsCallVideoOff(false);
  }, [stopDurationTimer]);

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
      alert(err.message || 'Không thể truy cập Camera/Microphone.');
      cleanupCall();
    }
  }, [socket, currentUserName, currentUserAvatar, cleanupCall]);

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
        name: session.callerName,
        avatar: session.callerAvatar,
        status: 'connecting',
        isCaller: false
      };
      setActiveCallSession(activeSession);

      // Tạo RTCPeerConnection để sẵn sàng nhận Offer từ Caller
      webrtcManager.createPeerConnection({
        onRemoteStream: (rStream) => setRemoteMediaStream(rStream),
        onIceCandidate: (candidate) => {
          socket.emit('call:signal', { targetUserId: session.callerId, signal: { type: 'candidate', candidate } });
        },
        onConnectionStateChange: (state) => {
          if (state === 'connected') {
            startDurationTimer();
            setActiveCallSession((prev) => (prev ? { ...prev, status: 'active' } : null));
          } else if (state === 'disconnected' || state === 'failed') {
            cleanupCall();
          }
        }
      });

      socket.emit('call:accept', { callerId: session.callerId });
    } catch (err) {
      console.warn('[useWebRTCCall] acceptCall error:', err.message);
      alert(err.message || 'Không thể truy cập Camera/Microphone.');
      cleanupCall();
    }
  }, [socket, startDurationTimer, cleanupCall]);

  // Từ chối cuộc gọi đến
  const declineCall = useCallback(() => {
    if (incomingCallRef.current && socket) {
      socket.emit('call:reject', { callerId: incomingCallRef.current.callerId, reason: 'declined' });
    }
    setIncomingCallSession(null);
  }, [socket]);

  // Kết thúc cuộc gọi
  const endCall = useCallback(() => {
    if (socket) {
      socket.emit('call:end', { reason: 'hangup' });
    }
    cleanupCall();
  }, [socket, cleanupCall]);

  // Bật/Tắt Mic
  const toggleMute = useCallback(() => {
    const nextState = webrtcManager.toggleAudio();
    setIsCallMuted(!nextState);
  }, []);

  // Bật/Tắt Video
  const toggleVideo = useCallback(() => {
    const nextState = webrtcManager.toggleVideo();
    setIsCallVideoOff(!nextState);
  }, []);

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
        socket.emit('call:reject', { callerId: session.callerId, reason: 'busy' });
        return;
      }
      setIncomingCallSession(session);
    };

    const onRinging = (session) => {
      setActiveCallSession((prev) => (prev ? { ...prev, status: 'ringing' } : null));
    };

    const onAccepted = async (session) => {
      setActiveCallSession((prev) => (prev ? { ...prev, status: 'connecting' } : null));

      // Phía Caller tạo RTCPeerConnection và gửi Offer
      try {
        const peer = webrtcManager.createPeerConnection({
          onRemoteStream: (rStream) => setRemoteMediaStream(rStream),
          onIceCandidate: (candidate) => {
            const targetId = activeCallRef.current?.targetUserId;
            if (targetId) {
              socket.emit('call:signal', { targetUserId: targetId, signal: { type: 'candidate', candidate } });
            }
          },
          onConnectionStateChange: (state) => {
            if (state === 'connected') {
              startDurationTimer();
              setActiveCallSession((prev) => (prev ? { ...prev, status: 'active' } : null));
            } else if (state === 'disconnected' || state === 'failed') {
              cleanupCall();
            }
          }
        });

        const offer = await webrtcManager.createOffer();
        const targetId = activeCallRef.current?.targetUserId;
        if (targetId) {
          socket.emit('call:signal', { targetUserId: targetId, signal: offer });
        }
      } catch (err) {
        console.warn('[useWebRTCCall] onAccepted createOffer error:', err.message);
      }
    };

    const onSignal = async ({ fromUserId, signal }) => {
      try {
        if (signal.type === 'offer') {
          const answer = await webrtcManager.handleOfferAndCreateAnswer(signal);
          socket.emit('call:signal', { targetUserId: fromUserId, signal: answer });
        } else if (signal.type === 'answer') {
          await webrtcManager.handleAnswer(signal);
        } else if (signal.type === 'candidate' && signal.candidate) {
          await webrtcManager.addIceCandidate(signal.candidate);
        }
      } catch (err) {
        console.warn('[useWebRTCCall] onSignal error:', err.message);
      }
    };

    const onRejected = ({ reason, message }) => {
      alert(message || 'Cuộc gọi đã bị từ chối.');
      cleanupCall();
    };

    const onEnded = () => {
      cleanupCall();
    };

    socket.on('call:incoming', onIncoming);
    socket.on('call:ringing', onRinging);
    socket.on('call:accepted', onAccepted);
    socket.on('call:signal', onSignal);
    socket.on('call:rejected', onRejected);
    socket.on('call:ended', onEnded);

    return () => {
      socket.off('call:incoming', onIncoming);
      socket.off('call:ringing', onRinging);
      socket.off('call:accepted', onAccepted);
      socket.off('call:signal', onSignal);
      socket.off('call:rejected', onRejected);
      socket.off('call:ended', onEnded);
    };
  }, [socket, startDurationTimer, cleanupCall]);

  return {
    activeCallSession,
    incomingCallSession,
    callDuration,
    isCallMinimized,
    localMediaStream,
    remoteMediaStream,
    isCallMuted,
    isCallVideoOff,
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
