import test, { describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { dbService } from '../src/services/dbService.js';
import { dbStore } from '../src/services/dbStore.js';

describe('VIVU Friendship & Messaging Verification Suite', () => {
  const userA = { id: 'test-user-alpha', full_name: 'Alpha Tester', email: 'alpha@vivu.vn' };
  const userB = { id: 'test-user-beta', full_name: 'Beta Tester', email: 'beta@vivu.vn' };
  const userC = { id: 'test-user-gamma', full_name: 'Gamma Tester', email: 'gamma@vivu.vn' };

  before(() => {
    // Đăng ký 3 tài khoản thử nghiệm vào dbStore
    [userA, userB, userC].forEach(u => {
      if (!dbStore.users.some(x => x.id === u.id)) {
        dbStore.users.push(u);
      }
      if (!dbStore.profiles.some(x => x.id === u.id)) {
        dbStore.profiles.push({
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          lat: 16.0544,
          lng: 108.2022
        });
      }
    });
  });

  beforeEach(() => {
    // Dọn dẹp trạng thái quan hệ và tin nhắn test trước mỗi ca kiểm thử
    dbStore.friendRequests = dbStore.friendRequests.filter(
      r => ![userA.id, userB.id, userC.id].includes(r.sender_id) && ![userA.id, userB.id, userC.id].includes(r.receiver_id)
    );
    dbStore.friendships = dbStore.friendships.filter(
      f => ![userA.id, userB.id, userC.id].includes(f.user_a_id) && ![userA.id, userB.id, userC.id].includes(f.user_b_id)
    );
    dbStore.messages = dbStore.messages.filter(
      m => ![userA.id, userB.id, userC.id].includes(m.sender)
    );
    [userA, userB, userC].forEach(u => {
      const existing = dbStore.users.find(x => x.id === u.id);
      if (existing) existing.message_privacy = 'everyone';
    });
  });

  // ==========================================
  // 1. KIỂM THỬ QUY CHUẨN KẾT BẠN (FRIENDSHIP)
  // ==========================================
  describe('Friendship Protocol', () => {
    test('1. Không thể tự gửi lời mời kết bạn cho chính mình', async () => {
      await assert.rejects(
        async () => {
          await dbService.sendFriendRequest(userA.id, userA.id);
        },
        { message: 'Không thể tự kết bạn với chính mình' }
      );
    });

    test('2. Gửi lời mời kết bạn hợp lệ chuyển sang trạng thái pending_sent và pending_received', async () => {
      const req = await dbService.sendFriendRequest(userA.id, userB.id);
      assert.ok(req.id, 'Phải có requestId hợp lệ');
      assert.equal(req.status, 'pending');
      assert.equal(req.sender_id, userA.id);
      assert.equal(req.receiver_id, userB.id);

      const statusA = dbService.getFriendshipStatus(userA.id, userB.id);
      assert.equal(statusA.status, 'pending_sent');

      const statusB = dbService.getFriendshipStatus(userB.id, userA.id);
      assert.equal(statusB.status, 'pending_received');
    });

    test('3. Gửi trùng lời mời kết bạn một chiều bị từ chối', async () => {
      await dbService.sendFriendRequest(userA.id, userB.id);
      await assert.rejects(
        async () => {
          await dbService.sendFriendRequest(userA.id, userB.id);
        },
        { message: 'Lời mời kết bạn đã được gửi trước đó' }
      );
    });

    test('4. Người gửi không thể tự chấp nhận lời mời của chính mình', async () => {
      const req = await dbService.sendFriendRequest(userA.id, userB.id);
      await assert.rejects(
        async () => {
          await dbService.acceptFriendRequest(req.id, userA.id);
        },
        { message: 'Chỉ người nhận mới có thể chấp nhận lời mời kết bạn' }
      );
    });

    test('5. Người nhận chấp nhận lời mời -> Trở thành Bạn bè 2 chiều', async () => {
      const req = await dbService.sendFriendRequest(userA.id, userB.id);
      const res = await dbService.acceptFriendRequest(req.id, userB.id);
      assert.equal(res.success, true);

      const statusA = dbService.getFriendshipStatus(userA.id, userB.id);
      assert.equal(statusA.status, 'friends');

      const statusB = dbService.getFriendshipStatus(userB.id, userA.id);
      assert.equal(statusB.status, 'friends');

      const friendsListA = await dbService.getFriendsList(userA.id);
      assert.ok(friendsListA.some(f => f.id === userB.id));

      const friendsListB = await dbService.getFriendsList(userB.id);
      assert.ok(friendsListB.some(f => f.id === userA.id));
    });

    test('6. Lời mời kết bạn đồng thời 2 chiều tự động thiết lập bạn bè', async () => {
      await dbService.sendFriendRequest(userA.id, userB.id);
      // B gửi ngược lại cho A khi A đã gửi cho B
      const mutualRes = await dbService.sendFriendRequest(userB.id, userA.id);
      assert.equal(mutualRes.success, true);

      const statusA = dbService.getFriendshipStatus(userA.id, userB.id);
      assert.equal(statusA.status, 'friends');
    });

    test('7. Người nhận từ chối lời mời kết bạn', async () => {
      const req = await dbService.sendFriendRequest(userA.id, userB.id);
      const res = await dbService.rejectFriendRequest(req.id, userB.id);
      assert.equal(res.success, true);
      assert.equal(res.request.status, 'rejected');

      const statusA = dbService.getFriendshipStatus(userA.id, userB.id);
      assert.equal(statusA.status, 'none');
    });

    test('8. Người gửi thu hồi lời mời kết bạn khi còn chờ', async () => {
      const req = await dbService.sendFriendRequest(userA.id, userB.id);
      const res = await dbService.cancelFriendRequest(req.id, userA.id);
      assert.equal(res.success, true);
      assert.equal(res.request.status, 'cancelled');

      const statusA = dbService.getFriendshipStatus(userA.id, userB.id);
      assert.equal(statusA.status, 'none');
    });

    test('9. Hủy kết bạn (Unfriend) đưa trạng thái về none', async () => {
      const req = await dbService.sendFriendRequest(userA.id, userB.id);
      await dbService.acceptFriendRequest(req.id, userB.id);
      assert.equal(dbService.getFriendshipStatus(userA.id, userB.id).status, 'friends');

      await dbService.unfriend(userA.id, userB.id);
      assert.equal(dbService.getFriendshipStatus(userA.id, userB.id).status, 'none');
      assert.equal(dbService.getFriendshipStatus(userB.id, userA.id).status, 'none');
    });
  });

  // ==========================================
  // 2. KIỂM THỬ QUY CHUẨN NHẮN TIN (MESSAGING)
  // ==========================================
  describe('Messaging Protocol', () => {
    test('1. Từ chối gửi tin nhắn rỗng', async () => {
      await assert.rejects(
        async () => {
          await dbService.sendMessage({
            conversation_id: 'conv-direct-test-user-alpha--test-user-beta',
            sender: userA.id,
            text: '    '
          });
        },
        { message: 'Nội dung tin nhắn không được để trống' }
      );
    });

    test('2. Từ chối gửi tin nhắn vượt quá 2000 ký tự', async () => {
      const longText = 'a'.repeat(2001);
      await assert.rejects(
        async () => {
          await dbService.sendMessage({
            conversation_id: 'conv-direct-test-user-alpha--test-user-beta',
            sender: userA.id,
            text: longText
          });
        },
        { message: 'Nội dung tin nhắn vượt quá giới hạn 2000 ký tự' }
      );
    });

    test('3. Gửi tin nhắn hợp lệ: Nội dung được trim và lưu bền vững', async () => {
      const convId = 'conv-direct-test-user-alpha--test-user-beta';
      const msg = await dbService.sendMessage({
        conversation_id: convId,
        sender: userA.id,
        sender_name: userA.full_name,
        text: '   Xin chào từ VIVU!   '
      });

      assert.ok(msg.id);
      assert.equal(msg.text, 'Xin chào từ VIVU!');
      assert.equal(msg.status, 'sent');

      const messages = await dbService.getMessages(convId);
      assert.equal(messages.length, 1);
      assert.equal(messages[0].id, msg.id);
      assert.equal(messages[0].text, 'Xin chào từ VIVU!');
    });

    test('4. Chống trùng lặp tin nhắn qua client_msg_id', async () => {
      const convId = 'conv-direct-test-user-alpha--test-user-beta';
      const clientMsgId = `cmsg-${Date.now()}`;

      const msg1 = await dbService.sendMessage({
        conversation_id: convId,
        client_msg_id: clientMsgId,
        sender: userA.id,
        text: 'Tin nhắn thử nghiệm'
      });

      const msg2 = await dbService.sendMessage({
        conversation_id: convId,
        client_msg_id: clientMsgId,
        sender: userA.id,
        text: 'Tin nhắn thử nghiệm'
      });

      assert.equal(msg1.id, msg2.id);
      const messages = await dbService.getMessages(convId);
      assert.equal(messages.length, 1);
    });

    test('5. Đánh dấu đã đọc cập nhật trạng thái read', async () => {
      const convId = 'conv-direct-test-user-alpha--test-user-beta';
      await dbService.sendMessage({
        conversation_id: convId,
        sender: userA.id,
        text: 'Bạn có đó không?'
      });

      const readRes = await dbService.markMessagesAsRead(convId, userB.id);
      assert.equal(readRes.updatedCount, 1);

      const messages = await dbService.getMessages(convId);
      assert.equal(messages[0].status, 'read');
      assert.ok(messages[0].read_at);
    });
  });
});
