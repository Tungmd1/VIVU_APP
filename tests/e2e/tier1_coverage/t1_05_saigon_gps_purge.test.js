import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createTestServer } from '../helpers/serverHarness.js';
import { REAL_USERS, REAL_GPS_LOCATIONS, FORBIDDEN_SAIGON_FALLBACK } from '../config/fixtures.js';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 5: Purge Hardcoded Saigon GPS (T1.05)', () => {
  let harness;

  before(async () => {
    harness = await createTestServer({
      seedData: {
        users: [REAL_USERS.userA],
        profiles: [
          { id: REAL_USERS.userA.id, full_name: REAL_USERS.userA.full_name, is_online: true }
        ]
      }
    });
  });

  after(async () => {
    if (harness) await harness.cleanup();
  });

  test('TC 5.1: POST /api/gps/update with null lat/lng returns HTTP 400 and does NOT fallback to Saigon', async () => {
    const res = await fetch(`${harness.baseUrl}/api/gps/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: REAL_USERS.userA.id,
        lat: null,
        lng: null
      })
    });

    assert.equal(res.status, 400, 'Must reject null coordinates with HTTP 400');
    const body = await res.json();
    assert.equal(body.success, false);

    // Verify profile in DB was NOT assigned Saigon fallback
    const profile = harness.dbStore.data.profiles.find(p => p.id === REAL_USERS.userA.id);
    if (profile && profile.lat != null) {
      assert.notEqual(profile.lat, FORBIDDEN_SAIGON_FALLBACK.lat, 'Profile must not be assigned Saigon fallback lat');
      assert.notEqual(profile.lng, FORBIDDEN_SAIGON_FALLBACK.lng, 'Profile must not be assigned Saigon fallback lng');
    }
  });

  test('TC 5.2: POST /api/gps/update without coordinates payload returns HTTP 400', async () => {
    const res = await fetch(`${harness.baseUrl}/api/gps/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: REAL_USERS.userA.id
      })
    });

    assert.equal(res.status, 400, 'Empty coordinates payload must return 400');
  });

  test('TC 5.3: Updating GPS with Hanoi coordinates preserves exact Hanoi GPS', async () => {
    const hanoi = REAL_GPS_LOCATIONS.hanoiHoanKiem;
    const res = await fetch(`${harness.baseUrl}/api/gps/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: REAL_USERS.userA.id,
        lat: hanoi.lat,
        lng: hanoi.lng,
        accuracy: hanoi.accuracy
      })
    });

    assert.equal(res.status, 200);
    const profile = harness.dbStore.data.profiles.find(p => p.id === REAL_USERS.userA.id);
    assert.equal(profile.lat, hanoi.lat, 'Exact Hanoi latitude must be preserved');
    assert.equal(profile.lng, hanoi.lng, 'Exact Hanoi longitude must be preserved');
  });

  test('TC 5.4: Static audit: backend/src/services/dbService.js has no hardcoded 10.7769 fallback', () => {
    const dbServicePath = path.join(E2E_CONFIG.BACKEND_DIR, 'src', 'services', 'dbService.js');
    const content = fs.readFileSync(dbServicePath, 'utf-8');
    const hasSaigonLat = content.includes('10.7769');
    const hasSaigonLng = content.includes('106.7009');
    assert.equal(hasSaigonLat, false, 'dbService.js must not contain fallback 10.7769');
    assert.equal(hasSaigonLng, false, 'dbService.js must not contain fallback 106.7009');
  });

  test('TC 5.5: Static audit: backend/src/services/socketService.js has no hardcoded 10.7769 fallback', () => {
    const socketServicePath = path.join(E2E_CONFIG.BACKEND_DIR, 'src', 'services', 'socketService.js');
    const content = fs.readFileSync(socketServicePath, 'utf-8');
    const hasSaigonLat = content.includes('10.7769');
    const hasSaigonLng = content.includes('106.7009');
    assert.equal(hasSaigonLat, false, 'socketService.js must not contain fallback 10.7769');
    assert.equal(hasSaigonLng, false, 'socketService.js must not contain fallback 106.7009');
  });
});
