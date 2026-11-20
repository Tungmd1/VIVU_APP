import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createTestServer } from '../helpers/serverHarness.js';
import { REAL_USERS } from '../config/fixtures.js';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 4: Remove Fake Account Store (T1.04)', () => {
  let harness;

  before(async () => {
    harness = await createTestServer({
      seedData: {
        users: [REAL_USERS.userA, REAL_USERS.userB],
        profiles: [
          { id: REAL_USERS.userA.id, full_name: REAL_USERS.userA.full_name, is_online: true },
          { id: REAL_USERS.userB.id, full_name: REAL_USERS.userB.full_name, is_online: true }
        ]
      }
    });
  });

  after(async () => {
    if (harness) await harness.cleanup();
  });

  test('TC 4.1: GET /api/gps/profiles returns only registered accounts, zero mock accounts', async () => {
    const res = await fetch(`${harness.baseUrl}/api/gps/profiles`);
    assert.equal(res.status, 200);
    const data = await res.json();
    const profiles = Array.isArray(data) ? data : (data.profiles || data.users || []);

    // Check no mock account identifiers
    const mockIds = ['mock-', 'demo-', 'client-', 'fake-'];
    for (const p of profiles) {
      assert.ok(!mockIds.some(prefix => String(p.id).startsWith(prefix)), `Profile ${p.id} appears to be a mock account`);
    }
  });

  test('TC 4.2: GET /api/friends/suggested returns only real registered users', async () => {
    const res = await fetch(`${harness.baseUrl}/api/friends/suggested?userId=${REAL_USERS.userA.id}`);
    if (res.status === 200) {
      const data = await res.json();
      const suggested = Array.isArray(data) ? data : (data.suggested || data.users || []);
      for (const u of suggested) {
        assert.ok(!String(u.id).startsWith('client-'), 'Suggested friend must not be a client-xxx mock');
      }
    } else {
      assert.ok([200, 404].includes(res.status));
    }
  });

  test('TC 4.3: Switching accounts requires authentic credentials, no switchable mock account API', async () => {
    // Attempting to switch without valid token or credentials must fail
    const res = await fetch(`${harness.baseUrl}/api/auth/switch-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: 'mock-user-123' })
    });

    // Endpoint must be 404 or reject unauthenticated mock switch with 401/403
    assert.ok([401, 403, 404].includes(res.status), `Mock account switch must not succeed, got ${res.status}`);
  });

  test('TC 4.4: Static audit: sharedStoreService.js does not contain hardcoded mock users list', () => {
    const storePath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'services', 'sharedStoreService.js');
    if (!fs.existsSync(storePath)) {
      assert.ok(true, 'sharedStoreService.js successfully removed');
      return;
    }
    const content = fs.readFileSync(storePath, 'utf-8');
    const hasMockArray = /mockUsers|demoAccounts|fakeProfiles/i.test(content);
    assert.equal(hasMockArray, false, 'sharedStoreService.js must not contain mockUsers or demoAccounts');
  });

  test('TC 4.5: Newly registered user appears in verified user list and is isolated from mocks', async () => {
    const newUserId = `e2e_real_user_${Date.now()}`;
    harness.dbStore.data.users.push({
      id: newUserId,
      full_name: 'Người Dùng Thật Mới',
      email: `real.${Date.now()}@example.com`
    });
    harness.dbStore.data.profiles.push({
      id: newUserId,
      full_name: 'Người Dùng Thật Mới',
      is_online: true
    });

    const res = await fetch(`${harness.baseUrl}/api/gps/profiles`);
    const data = await res.json();
    const profiles = Array.isArray(data) ? data : (data.profiles || data.users || []);
    const found = profiles.find(p => p.id === newUserId);
    assert.ok(found, 'Newly registered real user must appear in profiles');
  });
});
