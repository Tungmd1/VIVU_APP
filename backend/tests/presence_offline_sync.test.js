import test, { describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import { io as Client } from '../../frontend/node_modules/socket.io-client/build/esm/index.js';
import { initSocketIO, forceUserOffline } from '../src/services/socketService.js';
import { dbStore } from '../src/services/dbStore.js';
import { dbService } from '../src/services/dbService.js';
import { gpsController } from '../src/controllers/gpsController.js';

describe('VIVU Zero-Delay Offline Synchronization & 10s Presence Suite', () => {
  let server;
  let port;
  let clientA, clientB;
  const userAId = `user-sync-a-${Date.now()}`;
  const userBId = `user-sync-b-${Date.now()}`;

  before(async () => {
    // 1. Tạo Express App & HTTP Server cho testing
    const app = express();
    app.use(express.json());
    app.use(express.text({ type: ['text/plain', 'application/json'], limit: '5mb' }));
    app.post('/api/gps/offline', gpsController.setOffline);

    server = http.createServer(app);
    const io = initSocketIO(server);
    app.set('io', io);

    await new Promise(resolve => server.listen(0, resolve));
    port = server.address().port;

    // 2. Chuẩn bị database mock
    dbStore.users.push(
      { id: userAId, full_name: 'Người dùng Sync A', user_code: 'VU-SA', is_online: true, last_seen_at: new Date().toISOString() },
      { id: userBId, full_name: 'Người dùng Sync B', user_code: 'VU-SB', is_online: true, last_seen_at: new Date().toISOString() }
    );
    dbStore.profiles.push(
      { id: userAId, full_name: 'Người dùng Sync A', is_online: true, last_seen_at: new Date().toISOString(), lat: 10.7769, lng: 106.7009 },
      { id: userBId, full_name: 'Người dùng Sync B', is_online: true, last_seen_at: new Date().toISOString(), lat: 10.7770, lng: 106.7010 }
    );

    // Tạo mối quan hệ bạn bè giữa userA và userB
    if (!Array.isArray(dbStore.data.friendships)) {
      dbStore.data.friendships = [];
    }
    dbStore.data.friendships.push({
      id: `fs-${Date.now()}`,
      user_a_id: userAId,
      user_b_id: userBId,
      status: 'active',
      created_at: new Date().toISOString()
    });

    dbStore.persist();
  });

  after(() => {
    if (clientA?.connected) clientA.disconnect();
    if (clientB?.connected) clientB.disconnect();
    if (server) server.close();
  });

  test('1. dbService.setUserOffline() cập nhật cả profiles và users với is_online: false và last_seen_at lùi 10 phút', async () => {
    const updated = await dbService.setUserOffline(userAId);
    assert.ok(updated, 'Cần trả về profile cập nhật');
    assert.strictEqual(updated.is_online, false, 'Profile is_online phải là false');

    const profile = dbStore.profiles.find(p => p.id === userAId);
    const user = dbStore.users.find(u => u.id === userAId);

    assert.strictEqual(profile.is_online, false, 'dbStore profile is_online phải là false');
    assert.strictEqual(user.is_online, false, 'dbStore user is_online phải là false');

    const profileAgeMs = Date.now() - new Date(profile.last_seen_at).getTime();
    assert.ok(profileAgeMs >= 500000, 'last_seen_at phải lùi ít nhất 500s để chắc chắn offline');
  });

  test('2. dbService.getFriendsList() trả về isOnline: false và is_online: false ngay khi bạn bè offline', async () => {
    // Đảm bảo userA offline
    await dbService.setUserOffline(userAId);

    // userB xem danh sách bạn bè (trong đó có userA)
    const friendsOfB = await dbService.getFriendsList(userBId);
    const friendA = friendsOfB.find(f => f.id === userAId);

    assert.ok(friendA, 'userA phải có trong danh sách bạn bè của userB');
    assert.strictEqual(friendA.isOnline, false, 'friendA.isOnline phải là false');
    assert.strictEqual(friendA.is_online, false, 'friendA.is_online phải là false');
  });

  test('3. gpsController.setOffline xử lý chuẩn xác body JSON, chuỗi JSON và chuỗi text/plain', async () => {
    // Test case 3a: JSON Object
    let resJson = {};
    let statusCode = 200;
    const mockRes1 = {
      status(code) { statusCode = code; return this; },
      json(data) { resJson = data; }
    };
    await gpsController.setOffline({ body: { userId: userAId } }, mockRes1, () => {});
    assert.strictEqual(resJson.success, true);

    // Test case 3b: Text plain chứa JSON string (sendBeacon Blob fallback)
    await gpsController.setOffline({ body: JSON.stringify({ userId: userAId }) }, mockRes1, () => {});
    assert.strictEqual(resJson.success, true);

    // Test case 3c: Text plain chứa raw userId string
    await gpsController.setOffline({ body: userAId }, mockRes1, () => {});
    assert.strictEqual(resJson.success, true);
  });

  test('4. Socket.io Realtime: Khi userA ngắt kết nối hoặc forceUserOffline, userB nhận event user:offline lập tức', async () => {
    clientA = Client(`http://localhost:${port}`, {
      auth: { userId: userAId },
      transports: ['websocket']
    });
    clientB = Client(`http://localhost:${port}`, {
      auth: { userId: userBId },
      transports: ['websocket']
    });

    await Promise.all([
      new Promise(res => clientA.on('connect', res)),
      new Promise(res => clientB.on('connect', res))
    ]);

    // Lắng nghe sự kiện user:offline trên client B
    const offlinePromise = new Promise(resolve => {
      clientB.once('user:offline', (data) => {
        resolve(data);
      });
    });

    // Cưỡng chế ngắt A hoặc A disconnect
    forceUserOffline(userAId);

    const offlineData = await offlinePromise;
    assert.ok(offlineData, 'Client B phải nhận được user:offline');
    assert.strictEqual(offlineData.userId, userAId, 'Payload userId phải là userAId');
  });
});
