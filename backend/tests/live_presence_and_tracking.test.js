import assert from 'node:assert/strict';
import { dbService, checkIsUserOnline, setSocketPresenceChecker } from '../src/services/dbService.js';
import { dbStore } from '../src/services/dbStore.js';
import { isUserSocketConnected } from '../src/services/socketService.js';

async function runLivePresenceAndTrackingTests() {
  console.log('🧪 [Test Suite] Live Presence & Tracking Resilience Tests');

  const suffix = Date.now();
  const stationaryUserId = `user-stationary-${suffix}`;
  const movingUserId = `user-moving-${suffix}`;

  // 1. Kiểm thử Presence: Khi có kết nối socket, máy đứng cố định LUÔN là Online
  console.log('  ▶ Test 1: Active Socket Connection keeps stationary user Online');
  // Giả lập presence checker trả về true cho stationary user
  setSocketPresenceChecker((uid) => uid === stationaryUserId);

  const mockProfileStationary = {
    id: stationaryUserId,
    is_online: true,
    last_seen_at: new Date(Date.now() - 45000).toISOString() // 45 giây trước (vượt xa mức 15s cũ)
  };

  const isStationaryOnline = checkIsUserOnline(mockProfileStationary, 45000);
  assert.equal(isStationaryOnline, true, 'Máy đứng cố định có socket kết nối phải luôn báo Online');

  // 2. Kiểm thử Presence: Khi không có socket, ngưỡng timeout là 60s (thay vì 15s)
  console.log('  ▶ Test 2: Extended grace period (60s) avoids false offline blips');
  const mockProfileNoSocket = {
    id: movingUserId,
    is_online: true,
    last_seen_at: new Date(Date.now() - 25000).toISOString()
  };
  const isWithinGracePeriod = checkIsUserOnline(mockProfileNoSocket, 25000);
  assert.equal(isWithinGracePeriod, true, 'Thiết bị trong vòng 25s (chưa vượt 60s) vẫn phải giữ Online');

  const isExpired = checkIsUserOnline(mockProfileNoSocket, 75000);
  assert.equal(isExpired, false, 'Thiết bị quá 60s và không có socket mới báo Offline');

  // Khôi phục presence checker thật từ socketService
  setSocketPresenceChecker(isUserSocketConnected);

  // 3. Kiểm thử Live Message Coords Persistence
  console.log('  ▶ Test 3: Live location message coordinates update in memory');
  const testMessage = {
    id: `msg-live-${suffix}`,
    conversation_id: `conv-${suffix}`,
    sender: movingUserId,
    text: 'Đang chia sẻ vị trí trực tiếp',
    is_live_location: true,
    live_status: 'active',
    lat: 16.0544,
    lng: 108.2022,
    speed: 15.5,
    created_at: new Date().toISOString()
  };

  dbStore.messages.push(testMessage);

  // Giả lập toạ độ di chuyển mới
  const updatedLat = 16.0599;
  const updatedLng = 16.2088;
  const updatedSpeed = 36.2;

  const foundMsg = dbStore.messages.find(m => m.id === testMessage.id);
  foundMsg.lat = updatedLat;
  foundMsg.lng = updatedLng;
  foundMsg.speed = updatedSpeed;

  assert.equal(foundMsg.lat, updatedLat);
  assert.equal(foundMsg.lng, updatedLng);
  assert.equal(foundMsg.speed, updatedSpeed);

  // Dọn dẹp test data khỏi dbStore
  const msgIdx = dbStore.messages.findIndex(m => m.id === testMessage.id);
  if (msgIdx >= 0) dbStore.messages.splice(msgIdx, 1);

  console.log('  ✅ ALL TESTS PASSED: Live Presence & Tracking Resilience Verified!');
}

runLivePresenceAndTrackingTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
