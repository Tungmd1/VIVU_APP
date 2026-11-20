import test, { describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { dbService } from '../src/services/dbService.js';
import { dbStore } from '../src/services/dbStore.js';

describe('VIVU Chat Single Delete, Clear History & Archive Verification Suite', () => {
  const userA = { id: 'test-del-user-alpha', full_name: 'Alpha Del', email: 'alphadel@vivu.vn' };
  const userB = { id: 'test-del-user-beta', full_name: 'Beta Del', email: 'betadel@vivu.vn' };
  const convId = `conv-direct-${userA.id}--${userB.id}`;

  before(() => {
    [userA, userB].forEach(u => {
      if (!dbStore.users.some(x => x.id === u.id)) {
        dbStore.users.push(u);
      }
      if (!dbStore.profiles.some(x => x.id === u.id)) {
        dbStore.profiles.push({
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          lat: 10.7769,
          lng: 106.7009
        });
      }
    });
  });

  beforeEach(() => {
    // Dọn dẹp tin nhắn test trước mỗi ca kiểm thử
    dbStore.messages = dbStore.messages.filter(m => m.conversation_id !== convId);
    if (dbStore.archivedConversations) {
      dbStore.archivedConversations = dbStore.archivedConversations.filter(
        a => !(a.conversationId === convId && (a.userId === userA.id || a.userId === userB.id))
      );
    }
  });

  test('1. Gửi tin nhắn và xóa từng tin nhắn đơn lẻ ở phía tôi (delete for me only)', async () => {
    const msg = await dbService.sendMessage({
      conversation_id: convId,
      sender: userA.id,
      sender_name: userA.full_name,
      text: 'Tin nhắn sẽ bị xóa ở phía tôi'
    });
    assert.ok(msg && msg.id, 'Tin nhắn phải được tạo thành công');

    // User A xóa ở phía A
    const delRes = await dbService.deleteMessage(msg.id, userA.id, false);
    assert.strictEqual(delRes.success, true, 'Xóa tin nhắn phải thành công');

    // Lấy tin nhắn với tư cách User A -> không còn thấy
    const msgsForA = await dbService.getMessages(convId, userA.id);
    const foundInA = msgsForA.some(m => m.id === msg.id);
    assert.strictEqual(foundInA, false, 'User A không còn thấy tin nhắn đã xóa');

    // Lấy tin nhắn với tư cách User B -> vẫn còn thấy
    const msgsForB = await dbService.getMessages(convId, userB.id);
    const foundInB = msgsForB.some(m => m.id === msg.id);
    assert.strictEqual(foundInB, true, 'User B vẫn thấy tin nhắn vì chỉ xóa ở phía A');
  });

  test('2. Thu hồi tin nhắn với mọi người (delete for everyone / unsend)', async () => {
    const msg = await dbService.sendMessage({
      conversation_id: convId,
      sender: userA.id,
      sender_name: userA.full_name,
      text: 'Tin nhắn thu hồi cho tất cả'
    });

    // User A thu hồi tin nhắn cho tất cả
    const delRes = await dbService.deleteMessage(msg.id, userA.id, true);
    assert.strictEqual(delRes.success, true);

    // Cả User A và User B đều không còn thấy tin nhắn
    const msgsForA = await dbService.getMessages(convId, userA.id);
    assert.strictEqual(msgsForA.some(m => m.id === msg.id), false, 'User A không thấy tin nhắn');

    const msgsForB = await dbService.getMessages(convId, userB.id);
    assert.strictEqual(msgsForB.some(m => m.id === msg.id), false, 'User B không thấy tin nhắn đã thu hồi');
  });

  test('3. Người nhận không được phép thu hồi tin nhắn của người gửi cho tất cả', async () => {
    const msg = await dbService.sendMessage({
      conversation_id: convId,
      sender: userA.id,
      sender_name: userA.full_name,
      text: 'Tin nhắn do User A gửi'
    });

    // User B cố gắng thu hồi tin nhắn của User A cho mọi người -> phải bị chặn (403)
    await assert.rejects(
      async () => {
        await dbService.deleteMessage(msg.id, userB.id, true);
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403);
        return true;
      }
    );
  });

  test('4. Xóa toàn bộ lịch sử tin nhắn trong cuộc trò chuyện (Clear conversation history)', async () => {
    await dbService.sendMessage({ conversation_id: convId, sender: userA.id, text: 'Msg 1' });
    await dbService.sendMessage({ conversation_id: convId, sender: userB.id, text: 'Msg 2' });
    await dbService.sendMessage({ conversation_id: convId, sender: userA.id, text: 'Msg 3' });

    let msgs = await dbService.getMessages(convId, userA.id);
    assert.strictEqual(msgs.length, 3, 'Phải có 3 tin nhắn');

    // Xóa toàn bộ tin nhắn
    const clearRes = await dbService.clearConversationMessages(convId, userA.id);
    assert.strictEqual(clearRes.success, true);

    msgs = await dbService.getMessages(convId, userA.id);
    assert.strictEqual(msgs.length, 0, 'Toàn bộ tin nhắn phải được dọn sạch');
  });

  test('5. Lưu trữ và bỏ lưu trữ cuộc trò chuyện (Archive / Unarchive conversation)', async () => {
    await dbService.sendMessage({ conversation_id: convId, sender: userA.id, text: 'Hello' });

    // Lưu trữ cuộc trò chuyện đối với User A
    const archRes = await dbService.toggleArchiveConversation(convId, userA.id, true);
    assert.strictEqual(archRes.success, true);
    assert.strictEqual(archRes.isArchived, true);

    // Kiểm tra trong danh sách cuộc trò chuyện của User A
    const convsA = await dbService.getUserConversations(userA.id);
    const targetConvA = convsA.find(c => c.id === convId);
    assert.ok(targetConvA, 'Cuộc trò chuyện phải tồn tại');
    assert.strictEqual(targetConvA.isArchived, true, 'isArchived của User A phải là true');

    // Kiểm tra User B không bị ảnh hưởng (mỗi user độc lập)
    const convsB = await dbService.getUserConversations(userB.id);
    const targetConvB = convsB.find(c => c.id === convId);
    if (targetConvB) {
      assert.strictEqual(Boolean(targetConvB.isArchived), false, 'isArchived của User B phải là false');
    }

    // Bỏ lưu trữ
    const unarchRes = await dbService.toggleArchiveConversation(convId, userA.id, false);
    assert.strictEqual(unarchRes.success, true);
    assert.strictEqual(unarchRes.isArchived, false);
  });
});
