import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createTestServer } from '../helpers/serverHarness.js';
import { REAL_USERS } from '../config/fixtures.js';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 2: Purge Mock Password Reset (T1.02)', () => {
  let harness;

  before(async () => {
    harness = await createTestServer({
      seedData: {
        users: [REAL_USERS.userA]
      }
    });
  });

  after(async () => {
    if (harness) await harness.cleanup();
  });

  test('TC 2.1: POST /api/auth/reset-password-mock returns HTTP 404 (route completely purged)', async () => {
    const res = await fetch(`${harness.baseUrl}/api/auth/reset-password-mock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: REAL_USERS.userA.email,
        newPassword: 'NewPassword@2026'
      })
    });

    assert.equal(res.status, 404, `Expected HTTP 404 Not Found for purged mock endpoint, got ${res.status}`);
  });

  test('TC 2.2: Mock reset payload with non-existent email also returns HTTP 404', async () => {
    const res = await fetch(`${harness.baseUrl}/api/auth/reset-password-mock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'unknown.ghost@example.com',
        newPassword: 'SomePassword@999'
      })
    });

    assert.equal(res.status, 404, 'Mock endpoint must return 404 regardless of payload');
  });

  test('TC 2.3: GET /api/auth/reset-password-mock returns HTTP 404', async () => {
    const res = await fetch(`${harness.baseUrl}/api/auth/reset-password-mock`);
    assert.equal(res.status, 404, 'GET request on purged endpoint must return 404');
  });

  test('TC 2.4: Genuine reset-password route requires token verification and rejects arbitrary resets', async () => {
    // If genuine reset-password exists at /api/auth/reset-password
    const res = await fetch(`${harness.baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: REAL_USERS.userA.email,
        newPassword: 'Password123'
      })
    });

    // Should reject without valid reset token or code (e.g. 400 or 401 or 404 if not yet implemented)
    assert.ok(res.status === 400 || res.status === 401 || res.status === 404, `Expected rejection 400/401/404, got ${res.status}`);
  });

  test('TC 2.5: Static code check: authRoutes.js has no reset-password-mock route', async () => {
    const authRoutesPath = path.join(E2E_CONFIG.BACKEND_DIR, 'src', 'routes', 'authRoutes.js');
    const content = fs.readFileSync(authRoutesPath, 'utf-8');
    const hasMockRoute = content.includes('reset-password-mock');
    assert.equal(hasMockRoute, false, 'authRoutes.js must NOT contain reset-password-mock route');
  });
});
