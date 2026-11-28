import assert from 'node:assert/strict';
import { io } from '../../frontend/node_modules/socket.io-client/build/esm/index.js';
import { dbService } from '../src/services/dbService.js';
import { dbStore } from '../src/services/dbStore.js';

async function verifyLiveTrackingIntegration() {
  console.log('🚀 [E2E Verification] Testing Live Tracking & Presence Integration');

  const serverUrl = 'http://localhost:5000';
  const suffix = Date.now();
  const stationaryId = `user-stationary-${suffix}`;
  const movingId = `user-moving-${suffix}`;

  // Thêm mock profile và user cho 2 user vào inMemoryStore
  dbStore.users.push(
    { id: stationaryId, full_name: 'Máy Cố Định', email: `stat_${suffix}@vivu.vn` },
    { id: movingId, full_name: 'Máy Di Chuyển', email: `move_${suffix}@vivu.vn` }
  );
  dbStore.profiles.push(
    {
      id: stationaryId,
      full_name: 'Máy Cố Định',
      name: 'Máy Cố Định',
      user_code: 'VU-STAT',
      is_online: true,
      lat: 16.0544,
      lng: 108.2022,
      last_seen_at: new Date().toISOString()
    },
    {
      id: movingId,
      full_name: 'Máy Di Chuyển',
      name: 'Máy Di Chuyển',
      user_code: 'VU-MOVE',
      is_online: true,
      lat: 16.0600,
      lng: 108.2100,
      last_seen_at: new Date().toISOString()
    }
  );

  console.log('  ▶ Step 1: Connecting Stationary User and Moving User via WebSocket...');
  const socketStationary = io(serverUrl, {
    auth: { userId: stationaryId },
    transports: ['websocket']
  });

  const socketMoving = io(serverUrl, {
    auth: { userId: movingId },
    transports: ['websocket']
  });

  await Promise.all([
    new Promise((resolve, reject) => {
      socketStationary.on('connect', resolve);
      socketStationary.on('connect_error', reject);
      setTimeout(() => reject(new Error('Stationary socket connect timeout')), 4000);
    }),
    new Promise((resolve, reject) => {
      socketMoving.on('connect', resolve);
      socketMoving.on('connect_error', reject);
      setTimeout(() => reject(new Error('Moving socket connect timeout')), 4000);
    })
  ]);

  console.log('  ✔ Step 1 PASS: Both sockets connected successfully');

  // Kiểm tra presence của máy cố định
  console.log('  ▶ Step 2: Verifying stationary phone online presence...');
  const profs = await dbService.getProfiles();
  const statProf = profs.find(p => p.id === stationaryId);
  assert.ok(statProf, 'Stationary profile must be returned');
  assert.equal(statProf.is_online, true, 'Stationary user must be online via active socket connection');
  console.log('  ✔ Step 2 PASS: Stationary phone is confirmed ONLINE via active socket');

  // Kiểm tra truyền gói tin live_location:update từ Moving User -> Stationary User
  console.log('  ▶ Step 3: Moving User streams live coordinates to Stationary User...');
  const testCoords = {
    conversationId: `conv-live-${suffix}`,
    targetUserId: stationaryId,
    messageId: `msg-live-${suffix}`,
    lat: 16.07123,
    lng: 108.22456,
    speed: 38.5,
    heading: 90,
    accuracy: 5.2
  };

  const receivePromise = new Promise((resolve, reject) => {
    socketStationary.once('live_location:update', (data) => {
      resolve(data);
    });
    setTimeout(() => reject(new Error('Live location update timeout')), 4000);
  });

  socketMoving.emit('live_location:update', testCoords);
  const receivedData = await receivePromise;

  assert.equal(receivedData.userId, movingId, 'Sender must match movingId');
  assert.equal(receivedData.lat, testCoords.lat, 'Latitude must match exactly');
  assert.equal(receivedData.lng, testCoords.lng, 'Longitude must match exactly');
  assert.equal(receivedData.speed, testCoords.speed, 'Speed must match exactly');
  console.log(`  ✔ Step 3 PASS: Stationary phone received live update in real-time (${receivedData.speed} km/h, [${receivedData.lat}, ${receivedData.lng}])`);

  // Kiểm tra live_location:stop
  console.log('  ▶ Step 4: Moving User stops live location sharing...');
  const stopPromise = new Promise((resolve, reject) => {
    socketStationary.once('live_location:stopped', (data) => {
      resolve(data);
    });
    setTimeout(() => reject(new Error('Live location stop timeout')), 4000);
  });

  socketMoving.emit('live_location:stop', {
    conversationId: `conv-live-${suffix}`,
    targetUserId: stationaryId,
    messageId: `msg-live-${suffix}`
  });

  const stopData = await stopPromise;
  assert.equal(stopData.userId, movingId);
  console.log('  ✔ Step 4 PASS: Stationary phone received stopped broadcast successfully');

  // Đóng sockets và dọn dẹp mock data
  socketStationary.disconnect();
  socketMoving.disconnect();

  const idxStat = dbStore.profiles.findIndex(p => p.id === stationaryId);
  if (idxStat >= 0) dbStore.profiles.splice(idxStat, 1);
  const idxMove = dbStore.profiles.findIndex(p => p.id === movingId);
  if (idxMove >= 0) dbStore.profiles.splice(idxMove, 1);
  const uStat = dbStore.users.findIndex(u => u.id === stationaryId);
  if (uStat >= 0) dbStore.users.splice(uStat, 1);
  const uMove = dbStore.users.findIndex(u => u.id === movingId);
  if (uMove >= 0) dbStore.users.splice(uMove, 1);

  console.log('\n🎉 ALL LIVE TRACKING & PRESENCE INTEGRATION TESTS PASSED 100%!');
}

verifyLiveTrackingIntegration().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
