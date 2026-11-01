import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook quản lý vòng đời kết nối Socket.IO realtime
 * Tự động kết nối, tự động phát tín hiệu offline khi đóng tab/chuyển trang
 */
export function useSocket(userId) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Xác định socket endpoint (cùng origin với frontend, được Vite proxy sang backend)
    const socket = io(window.location.origin, {
      path: '/socket.io',
      auth: { userId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[Socket.IO Client] ✅ Đã kết nối với server (socketId: ${socket.id})`);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO Client] ⚠️ Mất kết nối (reason: ${reason})`);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO Client] Lỗi kết nối:', err.message);
      setIsConnected(false);
    });

    // Bắt sự kiện beforeunload / pagehide khi người dùng thoát hoặc đóng tab
    const handleBeforeUnload = () => {
      try {
        if (socket && socket.connected) {
          socket.emit('user:going-offline', { userId });
        }
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify({ userId })], { type: 'application/json' });
          navigator.sendBeacon('/api/gps/offline', blob);
        }
      } catch (_) {}
    };

    // Bắt sự kiện ẩn tab / khóa màn hình điện thoại -> Offline ngay lập tức theo yêu cầu người dùng
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        try {
          if (socket && socket.connected) {
            socket.emit('user:going-offline', { userId });
          }
          if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify({ userId })], { type: 'application/json' });
            navigator.sendBeacon('/api/gps/offline', blob);
          }
        } catch (_) {}
      } else if (document.visibilityState === 'visible') {
        try {
          if (socket && !socket.connected) {
            socket.connect();
          }
        } catch (_) {}
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (socket) {
        socket.emit('user:going-offline', { userId });
        socket.disconnect();
      }
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [userId]);

  return { socketRef, isConnected };
}
