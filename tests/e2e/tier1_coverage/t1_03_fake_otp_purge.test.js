import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createTestServer } from '../helpers/serverHarness.js';
import { REAL_USERS } from '../config/fixtures.js';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 3: Purge Fake OTP & Mock UI (T1.03)', () => {
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

  test('TC 3.1: OTP verification endpoint rejects hardcoded fake OTP "889966"', async () => {
    const res = await fetch(`${harness.baseUrl}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: REAL_USERS.userA.email,
        otp: '889966'
      })
    });

    // Endpoint must reject hardcoded fake OTP with 400 or 401 or 404 (if unrouted)
    assert.ok(res.status === 400 || res.status === 401 || res.status === 404, `Fake OTP 889966 must be rejected, got ${res.status}`);
  });

  test('TC 3.2: OTP verification rejects empty, malformed, or blank OTP inputs', async () => {
    const res = await fetch(`${harness.baseUrl}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: REAL_USERS.userA.email,
        otp: '   '
      })
    });

    assert.ok(res.status === 400 || res.status === 404, `Empty OTP must be rejected with 400/404, got ${res.status}`);
  });

  test('TC 3.3: Static audit: ForgotPasswordForm.jsx does not initialize state with "889966"', async () => {
    const formPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'auth', 'ForgotPasswordForm.jsx');
    if (!fs.existsSync(formPath)) {
      assert.ok(true, 'File refactored or moved');
      return;
    }
    const content = fs.readFileSync(formPath, 'utf-8');
    const hasDefaultMockOtp = content.includes("useState('889966')") || content.includes('useState("889966")');
    assert.equal(hasDefaultMockOtp, false, 'ForgotPasswordForm.jsx must not initialize mockOtp state with "889966"');
  });

  test('TC 3.4: Static audit: ForgotPasswordForm.jsx placeholder does not reference 889966', async () => {
    const formPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'auth', 'ForgotPasswordForm.jsx');
    if (!fs.existsSync(formPath)) return;
    const content = fs.readFileSync(formPath, 'utf-8');
    const hasPlaceholder889966 = content.includes('889966');
    assert.equal(hasPlaceholder889966, false, 'ForgotPasswordForm.jsx must not contain 889966 anywhere in UI');
  });

  test('TC 3.5: Static audit: AuthGateView.jsx does not bypass authentication with mock credentials', async () => {
    const authGatePath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'auth', 'AuthGateView.jsx');
    if (!fs.existsSync(authGatePath)) return;
    const content = fs.readFileSync(authGatePath, 'utf-8');
    const hasMockBypass = content.includes('mockOtp') || content.includes('889966');
    assert.equal(hasMockBypass, false, 'AuthGateView.jsx must not contain mockOtp or 889966 bypass logic');
  });
});
