import { dbService } from '../services/dbService.js';
import { notificationService } from '../services/notificationService.js';
import { emitToUser } from '../services/socketService.js';

export const friendController = {
  // Tìm kiếm người dùng
  async search(req, res, next) {
    try {
      const { q, currentUserId } = req.query;
      const results = await dbService.searchUsers(q, currentUserId);
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  },

  // Lấy trạng thái quan hệ
  async getStatus(req, res, next) {
    try {
      const { userIdA, userIdB } = req.query;
      const rel = dbService.getFriendshipStatus(userIdA, userIdB);
      res.json({ success: true, data: rel });
    } catch (err) {
      next(err);
    }
  },

  // Gửi lời mời kết bạn
  async sendRequest(req, res, next) {
    try {
      const { senderId, receiverId } = req.body;
      const result = await dbService.sendFriendRequest(senderId, receiverId);

      // Tạo thông báo cho người nhận (sẽ tự động emitToUser qua notificationService)
      notificationService.createNotification({
        type: 'friend_request',
        fromUserId: senderId,
        toUserId: receiverId,
        title: 'Lời mời kết bạn',
        body: `${result.sender_name} muốn kết bạn với bạn`,
        avatar: result.sender_avatar,
        actionData: { requestId: result.id }
      });
      emitToUser(receiverId, 'friend-request:incoming', result);

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // Chấp nhận lời mời kết bạn
  async acceptRequest(req, res, next) {
    try {
      const { requestId, currentUserId } = req.body;
      const result = await dbService.acceptFriendRequest(requestId, currentUserId);
      const friendReq = result.request;

      // Thông báo cho người gửi lời mời
      notificationService.createNotification({
        type: 'friend_accepted',
        fromUserId: currentUserId,
        toUserId: friendReq.sender_id,
        title: 'Kết bạn thành công!',
        body: `${friendReq.receiver_name} đã chấp nhận lời mời kết bạn của bạn`,
        avatar: friendReq.receiver_avatar,
        actionData: { friendshipId: result.friendshipId }
      });
      emitToUser(friendReq.sender_id, 'friend:accepted', { request: friendReq, friendshipId: result.friendshipId });

      // Thông báo cho người chấp nhận
      notificationService.createNotification({
        type: 'friend_accepted',
        fromUserId: friendReq.sender_id,
        toUserId: currentUserId,
        title: 'Kết bạn thành công!',
        body: `Bạn và ${friendReq.sender_name} đã trở thành bạn bè`,
        avatar: friendReq.sender_avatar,
        actionData: { friendshipId: result.friendshipId }
      });
      emitToUser(currentUserId, 'friend:accepted', { request: friendReq, friendshipId: result.friendshipId });

      res.json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // Từ chối lời mời
  async rejectRequest(req, res, next) {
    try {
      const { requestId, currentUserId } = req.body;
      const result = await dbService.rejectFriendRequest(requestId, currentUserId);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // Thu hồi lời mời đã gửi
  async cancelRequest(req, res, next) {
    try {
      const { requestId, currentUserId } = req.body;
      const result = await dbService.cancelFriendRequest(requestId, currentUserId);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // Lấy danh sách lời mời đã nhận & đã gửi
  async getRequests(req, res, next) {
    try {
      const { userId } = req.params;
      const data = await dbService.getFriendRequests(userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Lấy danh sách bạn bè chính thức
  async getFriends(req, res, next) {
    try {
      const { userId } = req.params;
      const friends = await dbService.getFriendsList(userId);
      res.json({ success: true, data: friends });
    } catch (err) {
      next(err);
    }
  },

  // Hủy kết bạn
  async unfriend(req, res, next) {
    try {
      const { userIdA, userIdB } = req.body;
      const result = await dbService.unfriend(userIdA, userIdB);
      emitToUser(userIdB, 'friend:unfriended', { userId: userIdA });
      emitToUser(userIdA, 'friend:unfriended', { userId: userIdB });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
};
