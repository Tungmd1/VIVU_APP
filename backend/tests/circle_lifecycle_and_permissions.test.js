import { describe, test, before, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { dbService } from '../src/services/dbService.js';
import { dbStore } from '../src/services/dbStore.js';
import { notificationService } from '../src/services/notificationService.js';

describe('VIVU Circle Lifecycle & Permission Enforcement Suite', () => {
  const userA = { id: 'user-circ-a', email: 'circ_a@vivu.vn', full_name: 'Trưởng nhóm A' };
  const userB = { id: 'user-circ-b', email: 'circ_b@vivu.vn', full_name: 'Bạn B' };
  const userC = { id: 'user-circ-c', email: 'circ_c@vivu.vn', full_name: 'Người ngoài C' };
  let testCircleId;

  before(() => {
    // 1. Đăng ký 3 tài khoản thử nghiệm vào dbStore
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

  beforeEach(async () => {
    // Tạo nhóm với User A là Trưởng nhóm, mời User B
    const circle = await dbService.createCircle({
      name: 'Hội Du Lịch Cuối Tuần',
      description: 'Nhóm đi phượt và cắm trại',
      privacy: 'private',
      ownerId: userA.id,
      invitedMemberIds: [userB.id]
    });
    testCircleId = circle.id;
  });

  afterEach(async () => {
    if (testCircleId) {
      await dbService.deleteCircle(testCircleId, userA.id).catch(() => {});
    }
  });

  test('1. Tạo nhóm thành công: Trưởng nhóm là owner (accepted), thành viên được mời là pending', async () => {
    const circle = await dbService.getCircleById(testCircleId);
    assert.ok(circle);
    assert.equal(circle.name, 'Hội Du Lịch Cuối Tuần');
    assert.equal(circle.owner_id, userA.id);
    assert.equal(circle.privacy, 'private');

    // User A là owner và đã accepted
    const memberA = circle.members.find(m => m.user_id === userA.id);
    assert.ok(memberA);
    assert.equal(memberA.role, 'owner');
    assert.equal(memberA.status, 'accepted');
    assert.ok(circle.member_ids.includes(userA.id));

    // User B đang ở trạng thái pending (chờ duyệt theo quyết định thiết kế)
    const memberB = circle.members.find(m => m.user_id === userB.id);
    assert.ok(memberB);
    assert.equal(memberB.role, 'member');
    assert.equal(memberB.status, 'pending');
    assert.ok(!circle.member_ids.includes(userB.id));
  });

  test('2. Kiểm tra quyền sửa thông tin nhóm: Chỉ Trưởng nhóm được sửa, người ngoài bị chặn 403', async () => {
    // User C (người ngoài) cố sửa tên nhóm -> Phải nhận lỗi 403
    await assert.rejects(
      async () => {
        await dbService.updateCircle(testCircleId, {
          name: 'Tên nhóm bị hack',
          requesterId: userC.id
        });
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /quyền chỉnh sửa/);
        return true;
      }
    );

    // Trưởng nhóm User A sửa tên nhóm -> Thành công
    const updated = await dbService.updateCircle(testCircleId, {
      name: 'Hội Đi Phượt Hà Giang',
      description: 'Mô tả mới đã cập nhật',
      requesterId: userA.id
    });
    assert.equal(updated.name, 'Hội Đi Phượt Hà Giang');
    assert.equal(updated.description, 'Mô tả mới đã cập nhật');
  });

  test('3. Chấp nhận lời mời (accept): Chuyển status sang accepted và vào member_ids', async () => {
    // User B phản hồi Chấp nhận (accept)
    const res = await dbService.respondToCircleInvite(testCircleId, {
      userId: userB.id,
      action: 'accept'
    });
    assert.equal(res.status, 'accepted');

    const circle = await dbService.getCircleById(testCircleId);
    assert.ok(circle.member_ids.includes(userB.id));
    const memberB = circle.members.find(m => m.user_id === userB.id);
    assert.equal(memberB.status, 'accepted');

    // Sau khi accept, User B gửi tin nhắn vào nhóm thành công
    const msg = await dbService.sendMessage({
      conversation_id: testCircleId,
      sender: userB.id,
      sender_name: userB.full_name,
      text: 'Chào cả nhóm, mình đã tham gia!'
    });
    assert.ok(msg.id);
  });

  test('4. Từ chối lời mời (decline): Chuyển status sang declined và không vào member_ids', async () => {
    const res = await dbService.respondToCircleInvite(testCircleId, {
      userId: userB.id,
      action: 'decline'
    });
    assert.equal(res.status, 'declined');

    const circle = await dbService.getCircleById(testCircleId);
    assert.ok(!circle.member_ids.includes(userB.id));
    const memberB = circle.members.find(m => m.user_id === userB.id);
    assert.equal(memberB.status, 'declined');

    // User B cố gửi tin nhắn vào nhóm -> Bị chặn 403
    await assert.rejects(
      async () => {
        await dbService.sendMessage({
          conversation_id: testCircleId,
          sender: userB.id,
          sender_name: userB.full_name,
          text: 'Tin nhắn spam'
        });
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        return true;
      }
    );
  });

  test('5. Mời thêm thành viên (invite): Thành viên mới được thêm vào danh sách pending', async () => {
    const inviteRes = await dbService.inviteToCircle(testCircleId, {
      memberIds: [userC.id],
      requesterId: userA.id
    });
    assert.equal(inviteRes.newInvited.length, 1);
    assert.equal(inviteRes.newInvited[0], userC.id);

    const circle = await dbService.getCircleById(testCircleId);
    const memberC = circle.members.find(m => m.user_id === userC.id);
    assert.ok(memberC);
    assert.equal(memberC.status, 'pending');
  });

  test('6. Xóa thành viên (kick): Chỉ Trưởng nhóm có quyền xóa, người khác bị chặn 403', async () => {
    // Cho User B chấp nhận vào nhóm trước
    await dbService.respondToCircleInvite(testCircleId, { userId: userB.id, action: 'accept' });

    // User C (người ngoài) cố xóa User B -> Bị chặn 403
    await assert.rejects(
      async () => {
        await dbService.kickFromCircle(testCircleId, {
          targetUserId: userB.id,
          requesterId: userC.id
        });
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        return true;
      }
    );

    // Trưởng nhóm User A xóa User B -> Thành công
    const kickRes = await dbService.kickFromCircle(testCircleId, {
      targetUserId: userB.id,
      requesterId: userA.id
    });
    assert.equal(kickRes.kicked, userB.id);

    const circle = await dbService.getCircleById(testCircleId);
    assert.ok(!circle.member_ids.includes(userB.id));
    const memberB = circle.members.find(m => m.user_id === userB.id);
    assert.equal(memberB.status, 'removed');
  });

  test('7. Rời nhóm (leave): Thành viên thường rời nhóm an toàn', async () => {
    // Cho User B chấp nhận vào nhóm
    await dbService.respondToCircleInvite(testCircleId, { userId: userB.id, action: 'accept' });

    // User B tự rời nhóm
    const leaveRes = await dbService.leaveCircle(testCircleId, { userId: userB.id });
    assert.equal(leaveRes.left, true);

    const circle = await dbService.getCircleById(testCircleId);
    assert.ok(!circle.member_ids.includes(userB.id));
    const memberB = circle.members.find(m => m.user_id === userB.id);
    assert.equal(memberB.status, 'left');
  });

  test('8. Giải tán nhóm (disband): Người ngoài bị chặn 403, Trưởng nhóm giải tán thành công', async () => {
    // User C cố xóa nhóm -> Bị chặn 403
    await assert.rejects(
      async () => {
        await dbService.deleteCircle(testCircleId, userC.id);
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /Chỉ Trưởng nhóm/);
        return true;
      }
    );

    // Trưởng nhóm User A giải tán nhóm -> Thành công
    const delRes = await dbService.deleteCircle(testCircleId, userA.id);
    assert.equal(delRes.deleted, true);

    const checkCircle = await dbService.getCircleById(testCircleId);
    assert.equal(checkCircle, null);
    testCircleId = null; // Tránh xóa lại trong afterEach
  });

  test('9. Thêm thành viên trực tiếp vào nhóm (addMembersToCircle): Thành viên được thêm trực tiếp vào member_ids với status accepted', async () => {
    // User A thêm trực tiếp User C vào nhóm
    const { circle, newlyAdded } = await dbService.addMembersToCircle(testCircleId, {
      memberIds: [userC.id],
      requesterId: userA.id
    });

    assert.ok(newlyAdded.includes(userC.id));
    assert.ok(circle.member_ids.includes(userC.id));
    const memberC = circle.members.find(m => m.user_id === userC.id);
    assert.ok(memberC);
    assert.equal(memberC.status, 'accepted');
  });

  test('10. Tạo nhóm có sẵn memberIds: Thành viên được thêm trực tiếp vào nhóm ngay khi tạo', async () => {
    const directCircle = await dbService.createCircle({
      name: 'Nhóm Thêm Trực Tiếp',
      description: 'Test thêm trực tiếp',
      ownerId: userA.id,
      memberIds: [userB.id, userC.id]
    });

    assert.ok(directCircle.member_ids.includes(userA.id));
    assert.ok(directCircle.member_ids.includes(userB.id));
    assert.ok(directCircle.member_ids.includes(userC.id));
    assert.equal(directCircle.member_ids.length, 3);

    const memberB = directCircle.members.find(m => m.user_id === userB.id);
    assert.equal(memberB.status, 'accepted');
    const memberC = directCircle.members.find(m => m.user_id === userC.id);
    assert.equal(memberC.status, 'accepted');

    // Dọn dẹp
    await dbService.deleteCircle(directCircle.id, userA.id);
  });
});
