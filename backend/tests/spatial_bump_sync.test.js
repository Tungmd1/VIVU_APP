import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { io as Client } from '../../frontend/node_modules/socket.io-client/build/esm/index.js';
import { initSocketIO } from '../src/services/socketService.js';
import { dbStore } from '../src/services/dbStore.js';
import { notificationService } from '../src/services/notificationService.js';

describe('VIVU Spatial Bump 2-Way Handshake Synchronization Suite', () => {
  let server;
  let clientA, clientB;
  let port;
  const userAId = `user-bump-a-${Date.now()}`;
  const userBId = `user-bump-b-${Date.now()}`;

  before(async () => {
    // 1. Tạo HTTP server độc lập cho test
    server = http.createServer();
    initSocketIO(server);
    await new Promise(resolve => server.listen(0, resolve));
    port = server.address().port;

    // 2. Đăng ký test users vào DB
    dbStore.users.push(
      { id: userAId, full_name: 'Người dùng A', user_code: 'VU-A1' },
      { id: userBId, full_name: 'Người dùng B', user_code: 'VU-B1' }
    );
    dbStore.profiles.push(
      { id: userAId, full_name: 'Người dùng A', is_online: true, lat: 10.7769, lng: 106.7009 },
      { id: userBId, full_name: 'Người dùng B', is_online: true, lat: 10.7770, lng: 106.7010 }
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
      new Promise(res => clientA.on('connect', res)),
      new Promise(res => clientB.on('connect', res))
    ]);
  });

  after(() => {
    if (clientA) clientA.disconnect();
    if (clientB) clientB.disconnect();
    if (server) server.close();
  });

  test('1. Khi A gửi spatial:bump-initiate -> CẢ A VÀ B đều nhận spatial:bump-trigger đồng bộ', async () => {
    const triggerReceivedA = new Promise(resolve => clientA.once('spatial:bump-trigger', resolve));
    const triggerReceivedB = new Promise(resolve => clientB.once('spatial:bump-trigger', resolve));

    clientA.emit('spatial:bump-initiate', {
      targetUserId: userBId,
      targetName: 'Người dùng B',
      targetAvatar: 'https://avatar-b.png',
      senderName: 'Người dùng A',
      senderAvatar: 'https://avatar-a.png',
      lat: 10.7769,
      lng: 106.7009
    });

    const [payloadA, payloadB] = await Promise.all([triggerReceivedA, triggerReceivedB]);

    assert.ok(payloadA, 'Client A phải nhận được spatial:bump-trigger');
    assert.ok(payloadB, 'Client B phải nhận được spatial:bump-trigger');
    assert.equal(payloadA.initiatorId, userAId);
    assert.equal(payloadB.initiatorId, userAId);
    assert.equal(payloadA.targetUserId, userBId);
    assert.equal(payloadB.targetUserId, userBId);

    // Kiểm tra Notification đã được gửi cho B
    const bNotifs = notificationService.getNotifications(userBId);
    assert.ok(bNotifs.length > 0, 'User B phải nhận được thông báo Toast Cụng Ly');
    assert.equal(bNotifs[0].type, 'spatial_bump');
  });

  test('2. Mutual Handshake: Chỉ A bấm ready -> B nhận spatial:bump-peer-ready, CHƯA ai nhận spatial:bump-clink', async () => {
    let clinkFired = false;
    const clinkListener = () => { clinkFired = true; };
    clientA.on('spatial:bump-clink', clinkListener);
    clientB.on('spatial:bump-clink', clinkListener);

    const peerReadyPromise = new Promise(resolve => clientB.once('spatial:bump-peer-ready', resolve));

    clientA.emit('spatial:bump-ready', { targetUserId: userBId });

    const peerReadyPayload = await peerReadyPromise;
    assert.ok(peerReadyPayload);
    assert.equal(peerReadyPayload.fromUserId, userAId);

    // Chờ 100ms đảm bảo chưa có clink
    await new Promise(r => setTimeout(r, 100));
    assert.equal(clinkFired, false, 'Chưa được clink khi B chưa bấm sẵn sàng');

    clientA.off('spatial:bump-clink', clinkListener);
    clientB.off('spatial:bump-clink', clinkListener);
  });

  test('3. B cũng bấm ready -> CẢ 2 BÊN cùng nhận spatial:bump-clink kèm Joint Story', async () => {
    const clinkA = new Promise(resolve => clientA.once('spatial:bump-clink', resolve));
    const clinkB = new Promise(resolve => clientB.once('spatial:bump-clink', resolve));

    clientB.emit('spatial:bump-ready', { targetUserId: userAId });

    const [resA, resB] = await Promise.all([clinkA, clinkB]);
    assert.ok(resA, 'Client A phải nhận spatial:bump-clink');
    assert.ok(resB, 'Client B phải nhận spatial:bump-clink');
    assert.ok(resA.story || resB.story, 'Phải có Joint Story đính kèm');

    // Kiểm tra Story đôi đã được tạo trong Database
    const jointStory = dbStore.stories.find(s => s.partner_id === userBId || s.host_id === userAId);
    assert.ok(jointStory, 'Joint Story phải tồn tại trong CSDL');
    assert.equal(jointStory.is_joint, true);
  });
});
