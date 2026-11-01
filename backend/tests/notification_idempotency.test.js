import test, { describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { notificationService } from '../src/services/notificationService.js';
import { dbService } from '../src/services/dbService.js';
import { dbStore } from '../src/services/dbStore.js';

describe('VIVU Anti-Duplicate & Notification Sync Verification Suite', () => {
  const userA = { id: 'notif-user-alpha', full_name: 'Alpha Tester', email: 'alpha@vivu.vn' };
  const userB = { id: 'notif-user-beta', full_name: 'Beta Tester', email: 'beta@vivu.vn' };
  const userC = { id: 'notif-user-gamma', full_name: 'Gamma Outsider', email: 'gamma@vivu.vn' };
  const conversationId = `conv-direct-${[userA.id, userB.id].sort().join('--')}`;

  before(() => {
    // Đăng ký tài khoản thử nghiệm
    [userA, userB, userC].forEach(u => {
      if (!dbStore.users.some(x => x.id === u.id)) {
        dbStore.users.push(u);
      }
      if (!dbStore.profiles.some(x => x.id === u.id)) {
        dbStore.profiles.push({
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
        });
      }
    });
  });

  beforeEach(() => {
    // Dọn sạch notifications và friend requests liên quan đến test users
    dbStore.data.notifications = dbStore.data.notifications.filter(
      n => ![userA.id, userB.id, userC.id].includes(n.to_user_id) && ![userA.id, userB.id, userC.id].includes(n.from_user_id)
    );
    dbStore.friendRequests = dbStore.friendRequests.filter(
      r => ![userA.id, userB.id, userC.id].includes(r.sender_id) && ![userA.id, userB.id, userC.id].includes(r.receiver_id)
    );
    dbStore.friendships = dbStore.friendships.filter(
      f => ![userA.id, userB.id, userC.id].includes(f.user_a_id) && ![userA.id, userB.id, userC.id].includes(f.user_b_id)
    );
    dbStore.messages = dbStore.messages.filter(
      m => ![userA.id, userB.id, userC.id].includes(m.sender)
    );
  });

  // ========================================================
  // 1. CHỐNG THÔNG BÁO TIN NHẮN TRÙNG & GỘP HỘI THOẠI
  // ========================================================
  describe('Message Notification Idempotency & Aggregation', () => {
    test('1. Gửi 1 message một lần: người nhận có đúng một notification với unread_count = 1', async () => {
      const msg = { id: 'msg-test-1', text: 'Chào bạn!' };
      const notif = notificationService.createMessageNotification({
        toUserId: userB.id,
        fromUserId: userA.id,
        conversationId,
        message: msg,
        senderName: userA.full_name
      });

      assert.ok(notif);
      assert.equal(notif.to_user_id, userB.id);
      assert.equal(notif.unread_count, 1);
      assert.equal(notif.body, 'Chào bạn!');
      assert.equal(notif.read, false);

      const notifs = notificationService.getNotifications(userB.id);
      assert.equal(notifs.length, 1);
      assert.equal(notifs[0].id, `notif-conv-${userB.id}-${conversationId}`);
    });

    test('2. Gửi lại cùng request (cùng message.id): không phát sinh notification trùng, không tăng lặp unread', async () => {
      const msg = { id: 'msg-test-retry', text: 'Tin nhắn thử nghiệm retry' };

      // Lần 1
      notificationService.createMessageNotification({
        toUserId: userB.id,
        fromUserId: userA.id,
        conversationId,
        message: msg,
        senderName: userA.full_name
      });

      // Lần 2 (Retry cùng message.id)
      notificationService.createMessageNotification({
        toUserId: userB.id,
        fromUserId: userA.id,
        conversationId,
        message: msg,
        senderName: userA.full_name
      });

      const notifs = notificationService.getNotifications(userB.id);
      assert.equal(notifs.length, 1, 'Chỉ duy nhất 1 bản ghi thông báo');
      assert.equal(notifs[0].unread_count, 1, 'unread_count không được bị đếm đúp');
    });

    test('3. Gửi nhiều tin nhắn liên tiếp: Gộp vào 1 thông báo duy nhất, tăng unread_count và cập nhật preview', async () => {
      const msg1 = { id: 'msg-multi-1', text: 'Tin 1' };
      const msg2 = { id: 'msg-multi-2', text: 'Tin 2' };
      const msg3 = { id: 'msg-multi-3', text: 'Tin 3 mới nhất' };

      notificationService.createMessageNotification({
        toUserId: userB.id,
        fromUserId: userA.id,
        conversationId,
        message: msg1,
        senderName: userA.full_name
      });

      notificationService.createMessageNotification({
        toUserId: userB.id,
        fromUserId: userA.id,
        conversationId,
        message: msg2,
        senderName: userA.full_name
      });

      notificationService.createMessageNotification({
        toUserId: userB.id,
        fromUserId: userA.id,
        conversationId,
        message: msg3,
        senderName: userA.full_name
      });

      const notifs = notificationService.getNotifications(userB.id);
      assert.equal(notifs.length, 1, 'Hội thoại chỉ duy trì 1 thông báo gộp');
      assert.equal(notifs[0].unread_count, 3, 'Số lượng tin chưa đọc phải là 3');
      assert.equal(notifs[0].body, 'Tin 3 mới nhất', 'Nội dung phải cập nhật tin mới nhất');
    });

    test('4. Mở cuộc trò chuyện: Đánh dấu đã đọc thông báo gộp và đặt unread_count = 0', async () => {
      const msg = { id: 'msg-read-sync', text: 'Kiểm tra đọc' };
      notificationService.createMessageNotification({
        toUserId: userB.id,
        fromUserId: userA.id,
        conversationId,
        message: msg,
        senderName: userA.full_name
      });

      // User B mở conversation
      notificationService.markConversationNotificationsRead(conversationId, userB.id);

      const notifs = notificationService.getNotifications(userB.id);
      assert.equal(notifs.length, 1);
      assert.equal(notifs[0].read, true);
      assert.equal(notifs[0].unread_count, 0);
    });
  });

  // ========================================================
  // 2. CHỐNG THÔNG BÁO KẾT BẠN TRÙNG & XỬ LÝ VÒNG ĐỜI
  // ========================================================
  describe('Friend Request Notification Idempotency & Lifecycle', () => {
    test('5. Gửi lời mời kết bạn: Người nhận có đúng một notification friend_request', async () => {
      const req = await dbService.sendFriendRequest(userA.id, userB.id);
      const notif = notificationService.createFriendRequestNotification({
        toUserId: userB.id,
        fromUserId: userA.id,
        requestId: req.id,
        senderName: userA.full_name
      });

      assert.ok(notif);
      assert.equal(notif.id, `notif-freq-${userB.id}-${req.id}`);
      assert.equal(notif.status, 'pending');

      const notifs = notificationService.getNotifications(userB.id);
      assert.equal(notifs.length, 1);
      assert.equal(notifs[0].type, 'friend_request');
    });

    test('6. Retry gửi lời mời hoặc event lặp: Không tạo notification thứ hai', async () => {
      const req = await dbService.sendFriendRequest(userA.id, userB.id);

      // Phát lần 1
      notificationService.createFriendRequestNotification({
        toUserId: userB.id,
        fromUserId: userA.id,
        requestId: req.id,
        senderName: userA.full_name
      });

      // Phát lại (Retry / Reconnect)
      notificationService.createFriendRequestNotification({
        toUserId: userB.id,
        fromUserId: userA.id,
        requestId: req.id,
        senderName: userA.full_name
      });

      const notifs = notificationService.getNotifications(userB.id);
      assert.equal(notifs.length, 1, 'Chỉ duy nhất 1 thông báo lời mời kết bạn');
    });

    test('7. Chấp nhận kết bạn: Cập nhật notification của người nhận thành accepted và read', async () => {
      const req = await dbService.sendFriendRequest(userA.id, userB.id);
      notificationService.createFriendRequestNotification({
        toUserId: userB.id,
        fromUserId: userA.id,
        requestId: req.id,
        senderName: userA.full_name
      });

      // Người nhận chấp nhận
      await dbService.acceptFriendRequest(req.id, userB.id);

      const notifs = notificationService.getNotifications(userB.id);
      assert.equal(notifs.length, 1);
      assert.equal(notifs[0].status, 'accepted');
      assert.equal(notifs[0].read, true);
    });

    test('8. Từ chối lời mời kết bạn: Xóa hẳn thông báo khỏi database theo quyết định thiết kế', async () => {
      const req = await dbService.sendFriendRequest(userA.id, userB.id);
      notificationService.createFriendRequestNotification({
        toUserId: userB.id,
        fromUserId: userA.id,
        requestId: req.id,
        senderName: userA.full_name
      });

      assert.equal(notificationService.getNotifications(userB.id).length, 1);

      // Người nhận từ chối
      await dbService.rejectFriendRequest(req.id, userB.id);

      // Thông báo phải biến mất hoàn toàn
      const notifsAfter = notificationService.getNotifications(userB.id);
      assert.equal(notifsAfter.length, 0, 'Thông báo phải được xóa sạch sau khi từ chối');
    });

    test('9. Người gửi thu hồi lời mời (Cancel): Xóa hẳn thông báo khỏi database của người nhận', async () => {
      const req = await dbService.sendFriendRequest(userA.id, userB.id);
      notificationService.createFriendRequestNotification({
        toUserId: userB.id,
        fromUserId: userA.id,
        requestId: req.id,
        senderName: userA.full_name
      });

      assert.equal(notificationService.getNotifications(userB.id).length, 1);

      // Người gửi thu hồi
      await dbService.cancelFriendRequest(req.id, userA.id);

      // Thông báo phải biến mất hoàn toàn
      const notifsAfter = notificationService.getNotifications(userB.id);
      assert.equal(notifsAfter.length, 0, 'Thông báo phải được xóa sạch sau khi người gửi thu hồi');
    });
  });

  // ========================================================
  // 3. BẢO MẬT QUYỀN RIÊNG TƯ & ĐỒNG BỘ ĐA THIẾT BỊ
  // ========================================================
  describe('Privacy & Multi-Device Isolation', () => {
    test('10. Tài khoản không liên quan (User C) không đọc được thông báo của User B', async () => {
      const msg = { id: 'msg-secret-1', text: 'Bí mật riêng tư' };
      notificationService.createMessageNotification({
        toUserId: userB.id,
        fromUserId: userA.id,
        conversationId,
        message: msg,
        senderName: userA.full_name
      });

      const notifsForC = notificationService.getNotifications(userC.id);
      assert.equal(notifsForC.length, 0, 'Người thứ 3 tuyệt đối không thấy thông báo của người khác');

      const notifsForB = notificationService.getNotifications(userB.id);
      assert.equal(notifsForB.length, 1, 'Chỉ đúng người nhận mới đọc được');
    });
  });
});
