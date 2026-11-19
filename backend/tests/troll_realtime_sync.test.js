import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { io as Client } from '../../frontend/node_modules/socket.io-client/build/esm/index.js';
import { initSocketIO } from '../src/services/socketService.js';
import { dbStore } from '../src/services/dbStore.js';
import { notificationService } from '../src/services/notificationService.js';

describe('VIVU Realtime Troll & Screen Takeover Synchronization Suite', () => {
  let server;
  let clientA, clientB;
  let port;
  const userAId = `user-troll-a-${Date.now()}`;
  const userBId = `user-troll-b-${Date.now()}`;

  before(async () => {
    // 1. Tạo HTTP server độc lập cho test
    server = http.createServer();
    initSocketIO(server);
    await new Promise((resolve) => server.listen(0, resolve));
    port = server.address().port;

    // 2. Đăng ký test users vào DB
    dbStore.users.push(
      { id: userAId, full_name: 'Người dùng A', user_code: 'VU-TR1' },
      { id: userBId, full_name: 'Người dùng B', user_code: 'VU-TR2' }
    );
    dbStore.profiles.push(
      { id: userAId, full_name: 'Người dùng A', is_online: true },
      { id: userBId, full_name: 'Người dùng B', is_online: true }
    );
    dbStore.persist();

    // 3. Kết nối 2 client Socket
    clientA = Client(`http://localhost:${port}`, {
      auth: { userId: userAId },
      transports: ['websocket']
    });
    clientB = Client(`http://localhost:${port}`, {
      auth: { userId: userBId },
      transports: ['websocket']
    });

    await Promise.all([
      new Promise((res) => clientA.on('connect', res)),
      new Promise((res) => clientB.on('connect', res))
    ]);
  });

  after(() => {
    if (clientA) clientA.disconnect();
    if (clientB) clientB.disconnect();
    if (server) server.close();
  });

  test('1. Khi A gửi troll:send (Dép tổ ong) -> B nhận troll:receive tức thì kèm dữ liệu đầy đủ', async () => {
    const receivePromise = new Promise((resolve) => {
      clientB.once('troll:receive', resolve);
    });

    clientA.emit('troll:send', {
      targetUserId: userBId,
      senderName: 'Người dùng A',
      senderAvatar: 'https://avatar-a.png',
      meme: {
        id: 'honeycomb_slipper',
        name: 'Dép Tổ Ong',
        category: 'tools',
        soundType: 'slap',
        emotion: 'Vả mặt',
        badge: 'Huyền thoại'
      },
      quote: 'Một dép vào mặt cho tỉnh ngủ nè!'
    });

    const receivedPayload = await receivePromise;
    assert.equal(receivedPayload.senderId, userAId);
    assert.equal(receivedPayload.senderName, 'Người dùng A');
    assert.equal(receivedPayload.meme.id, 'honeycomb_slipper');
    assert.equal(receivedPayload.meme.soundType, 'slap');
    assert.equal(receivedPayload.quote, 'Một dép vào mặt cho tỉnh ngủ nè!');
    assert.ok(receivedPayload.timestamp > 0);
  });

  test('2. Khi A trêu B -> Tạo thông báo in-app Notification cho B trong notificationService', async () => {
    const notifs = notificationService.getNotifications(userBId);
    const trollNotif = notifs.find((n) => n.type === 'troll');
    assert.ok(trollNotif, 'Phải có thông báo loại troll');
    assert.equal(trollNotif.from_user_id, userAId);
    assert.ok(trollNotif.body.includes('Dép Tổ Ong'));
  });

  test('3. B phản đòn lại A (Counter-Attack): B gửi troll:send (Bom BÙM) -> A nhận troll:receive', async () => {
    const receivePromiseA = new Promise((resolve) => {
      clientA.once('troll:receive', resolve);
    });

    clientB.emit('troll:send', {
      targetUserId: userAId,
      senderName: 'Người dùng B',
      senderAvatar: 'https://avatar-b.png',
      meme: {
        id: 'dynamite_boom',
        name: 'Bom Nổ BÙM',
        category: 'tools',
        soundType: 'boom',
        emotion: 'Phát nổ',
        badge: 'BÙM!'
      },
      quote: 'Phản đòn bom nổ banh xác nè!'
    });

    const receivedPayloadA = await receivePromiseA;
    assert.equal(receivedPayloadA.senderId, userBId);
    assert.equal(receivedPayloadA.meme.id, 'dynamite_boom');
    assert.equal(receivedPayloadA.meme.soundType, 'boom');
    assert.equal(receivedPayloadA.quote, 'Phản đòn bom nổ banh xác nè!');
  });

  test('4. Tương thích ngược: Khi emit meme_troll cũ -> B vẫn nhận troll:receive bình thường', async () => {
    const receivePromiseLegacy = new Promise((resolve) => {
      clientB.once('troll:receive', resolve);
    });

    clientA.emit('meme_troll', {
      targetId: userBId,
      senderName: 'Người dùng A',
      meme: {
        id: 'tomato_splat',
        name: 'Cà Chua Ném',
        category: 'tools',
        soundType: 'splat'
      },
      quote: 'Cà chua ném bẹp dí!'
    });

    const legacyPayload = await receivePromiseLegacy;
    assert.equal(legacyPayload.senderId, userAId);
    assert.equal(legacyPayload.meme.id, 'tomato_splat');
    assert.equal(legacyPayload.quote, 'Cà chua ném bẹp dí!');
  });
});
