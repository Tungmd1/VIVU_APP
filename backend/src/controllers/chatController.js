import { dbService } from '../services/dbService.js';
import { dbStore } from '../services/dbStore.js';
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
      const { conversationId, conversation_id, text, image, video, type, isSticker, is_sticker, sticker, soundType, sound_type, isLocation, is_location, isLiveLocation, is_live_location, liveDurationMinutes, live_duration_minutes, liveExpiresAt, live_expires_at, speed, isHeart, is_heart, lat, lng, sender, sender_name, client_msg_id, clientMsgId, poll, isPoll, is_poll } = req.body;
      const targetConvId = conversationId || conversation_id;
      if (!targetConvId) {
        return res.status(400).json({ success: false, message: 'conversationId là bắt buộc' });
      }
      const message = await dbService.sendMessage({
        conversation_id: targetConvId,
        client_msg_id: client_msg_id || clientMsgId || null,
        type: (type === 'sticker' || isSticker || is_sticker || sticker) ? 'sticker' : type || null,
        is_sticker: Boolean(isSticker || is_sticker || type === 'sticker' || sticker),
        sticker: sticker || null,
        sound_type: soundType || sound_type || sticker?.soundType || null,
        text,
        image,
        video,
        is_location: Boolean(isLocation || is_location),
        is_live_location: Boolean(isLiveLocation || is_live_location),
        live_duration_minutes: liveDurationMinutes || live_duration_minutes || null,
        live_expires_at: liveExpiresAt || live_expires_at || null,
        speed: (speed != null && !isNaN(Number(speed))) ? Number(speed) : null,
        is_heart: Boolean(isHeart || is_heart || text === '❤️'),
        is_poll: Boolean(isPoll || is_poll || poll),
        poll: poll || null,
        lat: (lat != null && !isNaN(Number(lat))) ? Number(lat) : null,
        lng: (lng != null && !isNaN(Number(lng))) ? Number(lng) : null,
        sender,
        sender_name
      });

      // Phát realtime qua Socket.IO và tạo thông báo
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
      } else if (targetConvId.startsWith('circle-')) {
        const circle = dbStore.circles?.find(c => c.id === targetConvId);
        const recipients = (circle?.member_ids || []).filter(mid => mid && mid !== message.sender);
        recipients.forEach(recipientId => {
          emitToUser(recipientId, 'chat:message', message);
        });
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
  },

  async stopLiveLocation(req, res, next) {
    try {
      const { messageId, userId } = req.body;
      const updatedMsg = await dbService.stopLiveLocation(messageId, userId);
      const stopPayload = {
        messageId: updatedMsg.id,
        clientMsgId: updatedMsg.client_msg_id || null,
        conversationId: updatedMsg.conversation_id,
        live_status: 'stopped',
        stopped_at: updatedMsg.stopped_at
      };
      if (updatedMsg.conversation_id?.startsWith('conv-direct-')) {
        const parts = updatedMsg.conversation_id.replace('conv-direct-', '').split('--');
        parts.filter(pid => pid && pid !== updatedMsg.sender).forEach(pid => {
          emitToUser(pid, 'chat:live_location_stopped', stopPayload);
        });
      } else if (updatedMsg.conversation_id?.startsWith('circle-')) {
        const circle = dbStore.circles?.find(c => c.id === updatedMsg.conversation_id);
        (circle?.member_ids || []).filter(mid => mid && mid !== updatedMsg.sender).forEach(mid => {
          emitToUser(mid, 'chat:live_location_stopped', stopPayload);
        });
      }
      res.json({ success: true, data: updatedMsg, message: updatedMsg });
    } catch (err) {
      next(err);
    }
  },

  async votePoll(req, res, next) {
    try {
      const { messageId } = req.params;
      const { optionId, userId } = req.body;
      const currentUserId = userId || req.headers['x-user-id'];
      const updatedMsg = await dbService.voteMessagePoll(messageId, optionId, currentUserId);

      // Phát realtime qua Socket.IO nếu có
      if (updatedMsg.conversation_id?.startsWith('conv-direct-')) {
        const parts = updatedMsg.conversation_id.replace('conv-direct-', '').split('--');
        const recipientId = parts.find(p => p !== currentUserId);
        if (recipientId) {
          emitToUser(recipientId, 'chat:poll_updated', updatedMsg);
        }
      }

      res.json({ success: true, data: updatedMsg });
    } catch (err) {
      if (err.statusCode === 403) {
        return res.status(403).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  async deleteMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const { deleteForEveryone } = req.body || {};
      const queryDeleteForEveryone = req.query.deleteForEveryone === 'true' || req.query.deleteForEveryone === true;
      const shouldDeleteForEveryone = Boolean(deleteForEveryone || queryDeleteForEveryone);
      const userId = req.body?.userId || req.query.userId || req.headers['x-user-id'];

      const result = await dbService.deleteMessage(messageId, userId, shouldDeleteForEveryone);

      // Phát realtime qua Socket.IO
      if (result.conversationId) {
        if (result.conversationId.startsWith('conv-direct-')) {
          const parts = result.conversationId.replace('conv-direct-', '').split('--');
          const recipientId = parts.find(p => p !== userId);
          if (recipientId && shouldDeleteForEveryone) {
            emitToUser(recipientId, 'chat:message_deleted', {
              messageId,
              conversationId: result.conversationId,
              deleteForEveryone: true
            });
          }
        } else if (result.conversationId.startsWith('circle-') && shouldDeleteForEveryone) {
          const circle = dbStore.circles?.find(c => c.id === result.conversationId);
          if (circle && Array.isArray(circle.member_ids)) {
            circle.member_ids.forEach(mId => {
              if (mId !== userId) {
                emitToUser(mId, 'chat:message_deleted', {
                  messageId,
                  conversationId: result.conversationId,
                  deleteForEveryone: true
                });
              }
            });
          }
        }
      }

      res.json({ success: true, data: result });
    } catch (err) {
      if (err.statusCode === 403) {
        return res.status(403).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  async clearConversationMessages(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { clearForEveryone } = req.body || {};
      const queryClearForEveryone = req.query.clearForEveryone === 'true' || req.query.clearForEveryone === true;
      const shouldClearForEveryone = clearForEveryone !== undefined ? Boolean(clearForEveryone) : (req.query.clearForEveryone !== undefined ? queryClearForEveryone : true);
      const userId = req.body?.userId || req.query.userId || req.headers['x-user-id'];

      const result = await dbService.clearConversationMessages(conversationId, userId, shouldClearForEveryone);

      // Phát realtime qua Socket.IO nếu xóa ở cả hai bên
      if (shouldClearForEveryone && conversationId) {
        if (conversationId.startsWith('conv-direct-')) {
          const parts = conversationId.replace('conv-direct-', '').split('--');
          const recipientId = parts.find(p => p !== userId);
          if (recipientId) {
            emitToUser(recipientId, 'chat:conversation_cleared', {
              conversationId,
              clearedBy: userId
            });
          }
        } else if (conversationId.startsWith('circle-')) {
          const circle = dbStore.circles?.find(c => c.id === conversationId);
          if (circle && Array.isArray(circle.member_ids)) {
            circle.member_ids.forEach(mId => {
              if (mId !== userId) {
                emitToUser(mId, 'chat:conversation_cleared', {
                  conversationId,
                  clearedBy: userId
                });
              }
            });
          }
        }
      }

      res.json({ success: true, data: result });
    } catch (err) {
      if (err.statusCode === 403) {
        return res.status(403).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  async toggleArchiveConversation(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { isArchived } = req.body || {};
      const userId = req.body?.userId || req.query.userId || req.headers['x-user-id'];

      const result = await dbService.toggleArchiveConversation(conversationId, userId, isArchived !== false);

      res.json({ success: true, data: result });
    } catch (err) {
      if (err.statusCode === 403) {
        return res.status(403).json({ success: false, message: err.message });
      }
      next(err);
    }
  }
};
