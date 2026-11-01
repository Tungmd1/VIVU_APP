import { dbService } from '../services/dbService.js';
import { emitToUser } from '../services/socketService.js';
import { notificationService } from '../services/notificationService.js';

export const chatController = {
  async getInbox(req, res, next) {
    try {
      const { userId } = req.params;
      const messages = await dbService.getInboxMessages(userId);
      res.json({ success: true, data: messages });
    } catch (err) {
      next(err);
    }
  },

  async getUserConversations(req, res, next) {
    try {
      const { userId } = req.params;
      const conversations = await dbService.getUserConversations(userId);
      res.json({ success: true, data: conversations });
    } catch (err) {
      next(err);
    }
  },

  async getMessagesByConversation(req, res, next) {
    try {
      const { conversationId } = req.params;
      const requesterId = req.query.userId || req.headers['x-user-id'] || null;
      const messages = await dbService.getMessages(conversationId, requesterId);
      res.json({ success: true, data: messages });
    } catch (err) {
      if (err.statusCode === 403) {
        return res.status(403).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const { conversationId, conversation_id, text, image, video, isLocation, is_location, isHeart, is_heart, lat, lng, sender, sender_name, client_msg_id, clientMsgId } = req.body;
      const targetConvId = conversationId || conversation_id;
      if (!targetConvId) {
        return res.status(400).json({ success: false, message: 'conversationId là bắt buộc' });
      }
      const message = await dbService.sendMessage({
        conversation_id: targetConvId,
        client_msg_id: client_msg_id || clientMsgId || null,
        text,
        image,
        video,
        is_location: Boolean(isLocation || is_location),
        is_heart: Boolean(isHeart || is_heart || text === '❤️'),
        lat: (lat != null && !isNaN(Number(lat))) ? Number(lat) : null,
        lng: (lng != null && !isNaN(Number(lng))) ? Number(lng) : null,
        sender,
        sender_name
      });

      // Phát realtime qua Socket.IO và tạo thông báo nếu là direct chat
      if (targetConvId.startsWith('conv-direct-')) {
        const parts = targetConvId.replace('conv-direct-', '').split('--');
        const recipientId = parts.find(p => p !== message.sender);
        if (recipientId) {
          emitToUser(recipientId, 'chat:message', message);
          try {
            notificationService.createMessageNotification({
              conversationId: targetConvId,
              message,
              fromUserId: message.sender,
              toUserId: recipientId,
              senderName: message.sender_name || 'Người dùng VIVU',
              senderAvatar: req.body.senderAvatar || req.body.sender_avatar || ''
            });
          } catch (notifErr) {
            console.warn('[ChatController] Notification create error:', notifErr?.message);
          }
        }
      }

      res.status(201).json({ success: true, data: message });
    } catch (err) {
      if (err.statusCode === 403) {
        return res.status(403).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const { conversationId, readerId } = req.body;
      const count = await dbService.markMessagesAsRead(conversationId, readerId);
      notificationService.markConversationNotificationsRead(conversationId, readerId);
      if (conversationId && conversationId.startsWith('conv-direct-')) {
        const parts = conversationId.replace('conv-direct-', '').split('--');
        const partnerId = parts.find(p => p !== readerId);
        if (partnerId) {
          emitToUser(partnerId, 'chat:read', {
            conversationId,
            readerId,
            readAt: new Date().toISOString()
          });
        }
      }
      res.json({ success: true, count });
    } catch (err) {
      next(err);
    }
  }
};
