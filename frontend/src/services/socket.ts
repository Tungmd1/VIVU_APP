import { Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:5005' : 'http://localhost:5005');

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  public connect(userId: string = 'u_current_user') {
    if (this.socket && this.isConnected) return this.socket;

    try {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        query: { userId },
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('✅ Đã kết nối Socket.io Real-time Server thành công:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('❌ Ngắt kết nối Socket.io');
      });

      this.socket.on('connect_error', (err) => {
        this.isConnected = false;
        // Im lặng fallback offline khi server chưa chạy
      });
    } catch {
      // Fallback offline
    }

    return this.socket;
  }

  public joinRoom(roomId: string, user: { id: string; name: string }) {
    if (!this.socket) this.connect(user.id);
    this.socket?.emit('join_room', { roomId, ...user });
  }

  public leaveRoom(roomId: string) {
    this.socket?.emit('leave_room', { roomId });
  }

  public sendMessage(roomId: string, senderId: string, senderName: string, text: string) {
    this.socket?.emit('send_message', {
      roomId,
      senderId,
      senderName,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  public onReceiveMessage(callback: (msg: any) => void) {
    this.socket?.on('receive_message', callback);
  }

  public offReceiveMessage() {
    this.socket?.off('receive_message');
  }

  public emitTyping(roomId: string, userName: string, isTyping: boolean) {
    this.socket?.emit('typing', { roomId, userName, isTyping });
  }

  public onTyping(callback: (data: { userName: string; isTyping: boolean }) => void) {
    this.socket?.on('user_typing', callback);
  }

  public offTyping() {
    this.socket?.off('user_typing');
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const socketService = new SocketService();
