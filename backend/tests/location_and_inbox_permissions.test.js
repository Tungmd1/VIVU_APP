import test, { describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { dbService } from '../src/services/dbService.js';
import { dbStore } from '../src/services/dbStore.js';

describe('VIVU Location Consent, Messaging Permissions & Inbox Suite', () => {
  const userA = { id: 'test-user-alpha', full_name: 'Alpha Tester', email: 'alpha@vivu.vn' };
  const userB = { id: 'test-user-beta', full_name: 'Beta Tester', email: 'beta@vivu.vn' };
  const userC = { id: 'test-user-gamma', full_name: 'Gamma Tester', email: 'gamma@vivu.vn' };

  before(() => {
    // Đăng ký 3 tài khoản thử nghiệm vào dbStore
    [userA, userB, userC].forEach(u => {
      if (!dbStore.users.some(x => x.id === u.id)) {
        dbStore.users.push({ ...u, created_at: new Date().toISOString() });
      }
      if (!dbStore.profiles.some(x => x.id === u.id)) {
        dbStore.profiles.push({
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          is_online: true,
          last_seen_at: new Date().toISOString()
        });
      }
    });
  });

  beforeEach(() => {
    // Dọn dẹp trạng thái kết bạn, nhóm và tin nhắn trước mỗi ca test
    dbStore.friendRequests = dbStore.friendRequests.filter(
      r => ![userA.id, userB.id, userC.id].includes(r.sender_id) && ![userA.id, userB.id, userC.id].includes(r.receiver_id)
    );
    dbStore.friendships = dbStore.friendships.filter(
      f => ![userA.id, userB.id, userC.id].includes(f.user_a_id) && ![userA.id, userB.id, userC.id].includes(f.user_b_id)
    );
    dbStore.messages = dbStore.messages.filter(
      m => ![userA.id, userB.id, userC.id].includes(m.sender)
    );
    dbStore.circles = dbStore.circles.filter(
      c => !c.id.startsWith('test-circle-')
    );

    // Reset quyền riêng tư tin nhắn mặc định là 'everyone'
    const uB = dbStore.users.find(u => u.id === userB.id);
    if (uB) uB.message_privacy = 'everyone';
  });

  // ====================================================================
  // 1. KIỂM THỬ TỌA ĐỘ GPS THỰC TẾ (KHÔNG CÒN ĐÀ NẴNG MẶC ĐỊNH)
  // ====================================================================
  describe('GPS Hardware Coordinates Invariant', () => {
    test('1. Tọa độ thực tế tại Hà Nội được lưu chính xác, không bị biến thành Đà Nẵng', async () => {
      const hanoiCoords = { lat: 21.028511, lng: 105.854167 };
      const updated = await dbService.updateGps(
        userA.id,
        hanoiCoords.lat,
        hanoiCoords.lng,
        'Đang ở Hồ Gươm',
        userA.full_name,
        null,
        'VU-1111',
        ''
      );

      assert.equal(updated.lat, hanoiCoords.lat, 'Vĩ độ phải giữ nguyên Hà Nội');
      assert.equal(updated.lng, hanoiCoords.lng, 'Kinh độ phải giữ nguyên Hà Nội');
      assert.notEqual(updated.lat, 16.0544, 'Tuyệt đối không bị gán mặc định Đà Nẵng');

      const profiles = await dbService.getProfiles();
      const profA = profiles.find(p => p.id === userA.id);
      assert.ok(profA, 'Phải tìm thấy profile userA');
      assert.equal(profA.lat, hanoiCoords.lat);
      assert.equal(profA.lng, hanoiCoords.lng);
    });

    test('2. Tọa độ thực tế tại TP. Hồ Chí Minh được bảo toàn nguyên vẹn', async () => {
      const hcmCoords = { lat: 10.776889, lng: 106.700806 };
      const updated = await dbService.updateGps(
        userB.id,
        hcmCoords.lat,
        hcmCoords.lng,
        'Đang ở Phố đi bộ',
        userB.full_name,
        null,
        'VU-2222',
        ''
      );

      assert.equal(updated.lat, hcmCoords.lat);
      assert.equal(updated.lng, hcmCoords.lng);
    });
  });

  // ====================================================================
  // 2. KIỂM THỬ PHÂN LOẠI HỘP THƯ (INBOX CLASSIFICATION & PERSISTENCE)
  // ====================================================================
  describe('Inbox Classification & Friendship Promotion', () => {
    const directConvId = `conv-direct-${[userA.id, userB.id].sort().join('--')}`;

    test('1. Người lạ gửi tin nhắn: Hội thoại nằm trong tab Người lạ (isStranger = true)', async () => {
      await dbService.sendMessage({
        conversation_id: directConvId,
        sender: userA.id,
        sender_name: userA.full_name,
        text: 'Xin chào, mình làm quen nhé!'
      });

      const convsB = await dbService.getUserConversations(userB.id);
      const conv = convsB.find(c => c.id === directConvId);

      assert.ok(conv, 'Hội thoại phải tồn tại trong danh sách của User B');
      assert.equal(conv.isStranger, true, 'Hội thoại với người lạ chưa trả lời phải là isStranger = true');
      assert.equal(conv.isFriend, false, 'Chưa kết bạn thì isFriend phải là false');
      assert.equal(conv.unreadCount, 1, 'Số tin chưa đọc phải bằng 1');
    });

    test('2. Người nhận trả lời tin nhắn: Hội thoại tự động chuyển sang tab Tất cả (isStranger = false)', async () => {
      await dbService.sendMessage({
        conversation_id: directConvId,
        sender: userA.id,
        sender_name: userA.full_name,
        text: 'Xin chào bạn!'
      });

      // User B trả lời lại
      await dbService.sendMessage({
        conversation_id: directConvId,
        sender: userB.id,
        sender_name: userB.full_name,
        text: 'Chào bạn nhé, rất vui được biết bạn!'
      });

      const convsB = await dbService.getUserConversations(userB.id);
      const conv = convsB.find(c => c.id === directConvId);

      assert.ok(conv);
      assert.equal(conv.hasReplied, true, 'User B đã trả lời');
      assert.equal(conv.isStranger, false, 'Khi đã trả lời thì isStranger phải là false (thuộc Tất cả)');
    });

    test('3. Kết bạn thành công: Hội thoại chuyển ngay sang Bạn bè (isStranger = false, isFriend = true)', async () => {
      // 1. A gửi tin nhắn làm quen
      await dbService.sendMessage({
        conversation_id: directConvId,
        sender: userA.id,
        sender_name: userA.full_name,
        text: 'Mình kết bạn nhé!'
      });

      // 2. A gửi lời mời kết bạn và B chấp nhận
      const req = await dbService.sendFriendRequest(userA.id, userB.id);
      await dbService.acceptFriendRequest(req.id, userB.id);

      // 3. Kiểm tra danh sách hội thoại của cả hai phía
      const convsA = await dbService.getUserConversations(userA.id);
      const convsB = await dbService.getUserConversations(userB.id);

      const convForA = convsA.find(c => c.id === directConvId);
      const convForB = convsB.find(c => c.id === directConvId);

      assert.ok(convForA, 'A phải thấy hội thoại');
      assert.ok(convForB, 'B phải thấy hội thoại');

      assert.equal(convForA.isFriend, true, 'A thấy B là bạn bè');
      assert.equal(convForA.isStranger, false, 'A không thấy B là người lạ (thuộc Tất cả)');

      assert.equal(convForB.isFriend, true, 'B thấy A là bạn bè');
      assert.equal(convForB.isStranger, false, 'B không thấy A là người lạ (thuộc Tất cả)');
    });
  });

  // ====================================================================
  // 3. KIỂM THỬ PHÂN QUYỀN NHÓM (CIRCLE ACCESS CONTROL)
  // ====================================================================
  describe('Circle Membership & Access Control', () => {
    let circleId = 'circle-test-weekend';

    beforeEach(async () => {
      // Tạo nhóm gồm A và B
      const circle = await dbService.createCircle({
        id: circleId,
        name: 'Kèo Cafe Cuối Tuần',
        member_ids: [userA.id, userB.id]
      });
      circleId = circle.id;
    });

    test('1. Thành viên nhóm (User A) đọc và gửi tin nhắn thành công', async () => {
      const msg = await dbService.sendMessage({
        conversation_id: circleId,
        sender: userA.id,
        sender_name: userA.full_name,
        text: 'Cuối tuần này gặp ở đâu cả nhóm?'
      });

      assert.ok(msg.id);
      assert.equal(msg.text, 'Cuối tuần này gặp ở đâu cả nhóm?');

      const messages = await dbService.getMessages(circleId, userA.id);
      assert.equal(messages.length, 1);
    });

    test('2. Người ngoài (User C) bị chặn 403 khi cố gửi tin nhắn vào nhóm', async () => {
      await assert.rejects(
        async () => {
          await dbService.sendMessage({
            conversation_id: circleId,
            sender: userC.id,
            sender_name: userC.full_name,
            text: 'Cho mình vào nhóm với!'
          });
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /không phải thành viên/);
          return true;
        }
      );
    });

    test('3. Người ngoài (User C) bị chặn 403 khi cố đọc tin nhắn của nhóm', async () => {
      await assert.rejects(
        async () => {
          await dbService.getMessages(circleId, userC.id);
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /không phải thành viên/);
          return true;
        }
      );
    });

    test('4. Người ngoài (User C) gọi getUserConversations không thấy nhóm của A và B', async () => {
      const convsC = await dbService.getUserConversations(userC.id);
      assert.equal(convsC.some(c => c.id === circleId), false, 'User C không được nhìn thấy nhóm của A và B');
    });
  });

  // ====================================================================
  // 4. KIỂM THỬ PHÂN QUYỀN TIN NHẮN ("CHỈ BẠN BÈ" VS "MỌI NGƯỜI")
  // ====================================================================
  describe('Message Privacy Enforcement', () => {
    const convWithB = `conv-direct-${[userB.id, userC.id].sort().join('--')}`;

    test('1. Khi User B cài đặt message_privacy = friends_only, người lạ User C bị chặn 403', async () => {
      await dbService.updateUserProfile(userB.id, { messagePrivacy: 'friends_only' });

      await assert.rejects(
        async () => {
          await dbService.sendMessage({
            conversation_id: convWithB,
            sender: userC.id,
            sender_name: userC.full_name,
            text: 'Chào B, mình làm quen nhé'
          });
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /chỉ nhận tin nhắn từ bạn bè/);
          return true;
        }
      );
    });

    test('2. Khi User B cài đặt message_privacy = friends_only, bạn bè (User A) vẫn gửi tin nhắn bình thường', async () => {
      // 1. Kết bạn giữa A và B
      const req = await dbService.sendFriendRequest(userA.id, userB.id);
      await dbService.acceptFriendRequest(req.id, userB.id);

      // 2. B khóa nhận tin nhắn từ người lạ
      await dbService.updateUserProfile(userB.id, { messagePrivacy: 'friends_only' });

      // 3. Bạn bè A gửi tin nhắn cho B -> Thành công
      const directConvAB = `conv-direct-${[userA.id, userB.id].sort().join('--')}`;
      const msg = await dbService.sendMessage({
        conversation_id: directConvAB,
        sender: userA.id,
        sender_name: userA.full_name,
        text: 'Mai đi cafe không B?'
      });

      assert.ok(msg.id);
      assert.equal(msg.text, 'Mai đi cafe không B?');
    });
  });
});
