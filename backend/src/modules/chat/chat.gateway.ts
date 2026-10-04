import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { ENV } from '../../config/env';

export class ChatGateway {
  public static init(io: Server): void {
    // 0. Setup Redis Adapter (chỉ bật khi có biến môi trường USE_REDIS)
    if (process.env.USE_REDIS === 'true') {
      try {
        const redisUrl = ENV.REDIS_URL || 'redis://localhost:6379';
        const pubClient = new Redis(redisUrl, { maxRetriesPerRequest: null });
        const subClient = pubClient.duplicate();
        io.adapter(createAdapter(pubClient, subClient));
        console.log('✅ Socket.io Redis Adapter initialized');
      } catch (e) {
        console.warn('⚠️ Could not initialize Redis Adapter, using default in-memory adapter');
      }
    } else {
      console.log('⚡ Socket.io sử dụng default in-memory adapter (ổn định cho môi trường dev).');
    }

    // Middleware for Auth
    io.use((socket: Socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
        (socket as any).userId = decoded.userId;
        (socket as any).userName = decoded.name;
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      console.log(`🔌 WebSocket Client kết nối: ${socket.id} (User: ${userId})`);

      // 1. Tham gia phòng chat
      socket.on('join_room', async (roomId: string, callback?: (res: any) => void) => {
        try {
          // Kiểm tra quyền
          const membership = await prisma.conversationMember.findUnique({
            where: { conversationId_userId: { conversationId: roomId, userId } }
          });
          if (!membership) {
            if (callback) callback({ success: false, message: 'Bạn không phải là thành viên nhóm này.' });
            return;
          }
          socket.join(roomId);
          console.log(`Client ${socket.id} đã vào phòng: ${roomId}`);
          if (callback) callback({ success: true });
        } catch (error) {
          if (callback) callback({ success: false, message: 'Lỗi server' });
        }
      });

      // 2. Gửi tin nhắn thời gian thực
      socket.on('send_message', async (data: { roomId: string; text: string; mediaUrl?: string }) => {
        try {
          const membership = await prisma.conversationMember.findUnique({
            where: { conversationId_userId: { conversationId: data.roomId, userId } }
          });
          if (!membership) return;

          const savedMessage = await prisma.message.create({
            data: {
              conversationId: data.roomId,
              senderId: userId,
              text: data.text,
              mediaUrl: data.mediaUrl,
            },
            include: { sender: { include: { profile: true } } }
          });

          // Update conversation updatedAt for sorting
          await prisma.conversation.update({
            where: { id: data.roomId },
            data: { updatedAt: new Date() }
          });

          const messagePayload = {
            id: savedMessage.id,
            roomId: data.roomId,
            senderId: userId,
            senderName: savedMessage.sender.profile?.fullName || savedMessage.sender.identifier,
            senderAvatar: savedMessage.sender.profile?.avatarUrl,
            text: savedMessage.text,
            mediaUrl: savedMessage.mediaUrl,
            timestamp: savedMessage.createdAt.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            createdAt: savedMessage.createdAt,
            isBot: savedMessage.isBot,
            isRead: savedMessage.isRead,
          };

          io.to(data.roomId).emit('new_message', messagePayload);

          // Tự động kích hoạt bot ViVi nếu có từ khóa
          const textLower = data.text.toLowerCase();
          if (textLower.includes('đi ăn không') || textLower.includes('quán nào') || textLower.includes('rủ')) {
            setTimeout(async () => {
              const botMsg = await prisma.message.create({
                data: {
                  conversationId: data.roomId,
                  senderId: userId, // Using user's ID to satisfy FK constraint but marked as bot
                  text: '✨ ViVi gợi ý: Quán Bánh tráng thịt heo Đại Lộc ở Hải Châu đang được chấm 4.8⭐. Các bạn có muốn mình tạo cuộc hẹn nhóm tại đây không?',
                  isBot: true,
                },
                include: { sender: { include: { profile: true } } }
              });

              const botPayload = {
                id: botMsg.id,
                roomId: data.roomId,
                senderId: 'vivi_bot',
                senderName: 'ViVi (Trợ lý)',
                senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
                text: botMsg.text,
                timestamp: botMsg.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                createdAt: botMsg.createdAt,
                isBot: true,
              };
              io.to(data.roomId).emit('new_message', botPayload);
            }, 1200);
          }

        } catch (error) {
          console.error('Error sending message:', error);
        }
      });

      // 3. Sự kiện đang nhập tin nhắn
      socket.on('typing', (data: { roomId: string; isTyping: boolean }) => {
        socket.to(data.roomId).emit('user_typing', {
          roomId: data.roomId,
          userName: (socket as any).userName,
          isTyping: data.isTyping
        });
      });

      socket.on('disconnect', () => {
        console.log(`❌ Client ngắt kết nối: ${socket.id}`);
      });
    });
  }
}
