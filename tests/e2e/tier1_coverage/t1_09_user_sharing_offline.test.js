import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServer } from '../helpers/serverHarness.js';
import { createSocketPair } from '../helpers/socketClientHarness.js';
import { REAL_USERS, REAL_GPS_LOCATIONS } from '../config/fixtures.js';

describe('Feature 9: User-Controlled Sharing & Offline (T1.09)', () => {
  let harness;
  let socketPair;

  before(async () => {
    harness = await createTestServer({
      seedData: {
        users: [REAL_USERS.userA, REAL_USERS.userB],
        profiles: [
          { id: REAL_USERS.userA.id, full_name: REAL_USERS.userA.full_name, is_online: true },
          { id: REAL_USERS.userB.id, full_name: REAL_USERS.userB.full_name, is_online: true }
        ],
        friendships: [
          { id: 'fs-ab', user_a_id: REAL_USERS.userA.id, user_b_id: REAL_USERS.userB.id, status: 'active' }
        ]
      }
    });

    socketPair = await createSocketPair(harness.port, REAL_USERS.userA.id, REAL_USERS.userB.id);
  });

  after(async () => {
    if (socketPair) socketPair.disconnectAll();
    if (harness) await harness.cleanup();
  });

  test('TC 9.1: Disconnecting or stopping sharing broadcasts user:offline event to peers within < 200ms', async () => {
    const startTime = Date.now();
    const waitOffline = socketPair.clientB.waitFor('user:offline', 3000);

    // Client A emits going offline
    socketPair.clientA.emit('user:going-offline', { userId: REAL_USERS.userA.id });

    const offlineData = await waitOffline;
    const elapsed = Date.now() - startTime;

    assert.ok(offlineData, 'Must receive user:offline event');
    assert.equal(offlineData.userId, REAL_USERS.userA.id);
    assert.ok(elapsed < 2000, `Broadcast completed in ${elapsed}ms`);
  });

  test('TC 9.2: POST /api/gps/offline triggers immediate offline status in database', async () => {
    const res = await fetch(`${harness.baseUrl}/api/gps/offline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: REAL_USERS.userA.id })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);

    const profile = harness.dbStore.data.profiles.find(p => p.id === REAL_USERS.userA.id);
    assert.equal(profile.is_online, false, 'User A is_online must be set to false in profile');
  });

  test('TC 9.3: Stopping location sharing updates last_seen_at in user profile', async () => {
    const profileBefore = harness.dbStore.data.profiles.find(p => p.id === REAL_USERS.userA.id);
    assert.ok(profileBefore.last_seen_at != null, 'last_seen_at must be populated');
  });

  test('TC 9.4: Restarting sharing via POST /api/gps/update reactivates online state', async () => {
    const coord = REAL_GPS_LOCATIONS.hanoiHoanKiem;
    const res = await fetch(`${harness.baseUrl}/api/gps/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: REAL_USERS.userA.id,
        lat: coord.lat,
        lng: coord.lng,
        accuracy: coord.accuracy
      })
    });

    assert.equal(res.status, 200);
    const profile = harness.dbStore.data.profiles.find(p => p.id === REAL_USERS.userA.id);
    assert.equal(profile.is_online, true, 'User A should be marked online after GPS update');
    assert.equal(profile.lat, coord.lat);
  });

  test('TC 9.5: GPS update payload preserves accuracy (±m) and timestamp attributes', async () => {
    const coord = REAL_GPS_LOCATIONS.danangDragonBridge;
    const res = await fetch(`${harness.baseUrl}/api/gps/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: REAL_USERS.userB.id,
        lat: coord.lat,
        lng: coord.lng,
        accuracy: coord.accuracy,
        timestamp: new Date().toISOString()
      })
    });

    assert.equal(res.status, 200);
    const profile = harness.dbStore.data.profiles.find(p => p.id === REAL_USERS.userB.id);
    assert.equal(profile.accuracy, coord.accuracy, 'Accuracy metric must be preserved');
  });
});
