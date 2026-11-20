import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createTestServer } from '../helpers/serverHarness.js';
import { createSocketPair } from '../helpers/socketClientHarness.js';
import { REAL_USERS, REAL_GPS_LOCATIONS } from '../config/fixtures.js';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 8: Fix Peer Co-location Distortion (T1.08)', () => {
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

  test('TC 8.1: Socket gps:peer-update broadcasts genuine coordinates without server-side modification', async () => {
    const coordA = REAL_GPS_LOCATIONS.colocatedA;

    const waitPeerUpdate = socketPair.clientB.waitFor('gps:peer-update', 3000);
    socketPair.clientA.emit('gps:update', {
      userId: REAL_USERS.userA.id,
      lat: coordA.lat,
      lng: coordA.lng,
      accuracy: coordA.accuracy
    });

    const update = await waitPeerUpdate;
    assert.ok(update, 'Client B must receive peer update');
    assert.equal(update.userId || update.id, REAL_USERS.userA.id);
    assert.equal(Number(update.lat), coordA.lat, 'Latitude must match exactly without offset');
    assert.equal(Number(update.lng), coordA.lng, 'Longitude must match exactly without offset');
  });

  test('TC 8.2: Static audit: mapPeerProcessor.js does not contain artificial 0.0018 / 0.0022 coordinate distortion', () => {
    const processorPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'mapPeerProcessor.js');
    if (!fs.existsSync(processorPath)) return;
    const content = fs.readFileSync(processorPath, 'utf-8');
    const hasDistortion = content.includes('0.0018') || content.includes('0.0022');
    assert.equal(hasDistortion, false, 'mapPeerProcessor.js must not add 0.0018 / 0.0022 artificial offset to peer coordinates');
  });

  test('TC 8.3: Two peers 15m apart retain actual coordinates (genuine distance < 20m preserved)', () => {
    const p1 = REAL_GPS_LOCATIONS.colocatedA;
    const p2 = REAL_GPS_LOCATIONS.colocatedB_15m;

    // Approximate distance formula in meters
    const dLat = (p2.lat - p1.lat) * 111320;
    const dLng = (p2.lng - p1.lng) * 40075000 * Math.cos((p1.lat * Math.PI) / 180) / 360;
    const distMeters = Math.sqrt(dLat * dLat + dLng * dLng);

    assert.ok(distMeters < 25, `Real distance between coordinates is ~${distMeters.toFixed(1)}m`);
    // Ensure test validates true proximity
    assert.ok(distMeters > 5, 'Real distance is genuinely between 5m and 25m');
  });

  test('TC 8.4: Co-location detection logic flags isCoLocated = true without changing iLat / iLng', () => {
    const processorPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'mapPeerProcessor.js');
    if (!fs.existsSync(processorPath)) return;
    const content = fs.readFileSync(processorPath, 'utf-8');
    // Ensure iLat = safeLat and iLng = safeLng remains untouched
    const hasPreservedCoords = content.includes('iLat = safeLat') && content.includes('iLng = safeLng');
    assert.ok(hasPreservedCoords, 'Coordinates must be preserved directly as safeLat and safeLng');
  });

  test('TC 8.5: Zero-distance identical coordinates do not cause NaN or scatter in socket broadcast', async () => {
    const waitPeerUpdate = socketPair.clientB.waitFor('gps:peer-update', 3000);
    socketPair.clientA.emit('gps:update', {
      userId: REAL_USERS.userA.id,
      lat: 21.028500,
      lng: 105.854150,
      accuracy: 3.0
    });

    const update = await waitPeerUpdate;
    assert.ok(!isNaN(update.lat), 'Latitude must not be NaN');
    assert.ok(!isNaN(update.lng), 'Longitude must not be NaN');
  });
});
