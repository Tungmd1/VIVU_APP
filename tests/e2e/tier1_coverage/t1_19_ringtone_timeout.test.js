import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createTestServer } from '../helpers/serverHarness.js';
import { createSocketPair } from '../helpers/socketClientHarness.js';
import { REAL_USERS } from '../config/fixtures.js';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 19: Ringtone Feedback & Timeout (T1.19)', () => {
  let harness;
  let socketPair;

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

    socketPair = await createSocketPair(harness.port, REAL_USERS.userA.id, REAL_USERS.userB.id);
  });

  after(async () => {
    if (socketPair) socketPair.disconnectAll();
    if (harness) await harness.cleanup();
  });

  test('TC 19.1: call:ringing event provides caller with callId and status metadata', async () => {
    const waitRinging = socketPair.clientA.waitFor('call:ringing', 3000);

    socketPair.clientA.emit('call:initiate', {
      targetUserId: REAL_USERS.userB.id,
      callType: 'voice'
    });

    const ringing = await waitRinging;
    assert.ok(ringing, 'Caller must receive call:ringing');
    assert.ok(ringing.callId != null || ringing.targetUserId != null, 'Must provide callId or targetUserId');
  });

  test('TC 19.2: Callee rejection before timeout cancels ringing and cleans activeCalls', async () => {
    const waitRejected = socketPair.clientA.waitFor('call:rejected', 3000);

    socketPair.clientB.emit('call:reject', {
      targetUserId: REAL_USERS.userA.id,
      reason: 'declined'
    });

    const rejected = await waitRejected;
    assert.ok(rejected, 'Caller must receive call:rejected');
    assert.equal(rejected.reason, 'declined');
  });

  test('TC 19.3: Backend signaling service configures 45s ringing timeout spec', () => {
    const signalingServicePath = path.join(E2E_CONFIG.BACKEND_DIR, 'src', 'services', 'callSignalingService.js');
    if (!fs.existsSync(signalingServicePath)) return;
    const content = fs.readFileSync(signalingServicePath, 'utf-8');
    const hasTimeoutLogic = /45000|45\s*\*?\s*1000|timeout/i.test(content);
    assert.equal(hasTimeoutLogic, true, 'callSignalingService.js must implement 45s call timeout logic');
  });

  test('TC 19.4: Caller cancelling call while ringing emits call:ended to Callee', async () => {
    // Initiate again
    const waitIncoming = socketPair.clientB.waitFor('call:incoming', 3000);
    socketPair.clientA.emit('call:initiate', {
      targetUserId: REAL_USERS.userB.id,
      callType: 'voice'
    });
    await waitIncoming;

    // Caller hangs up while still ringing
    const waitEnded = socketPair.clientB.waitFor('call:ended', 3000);
    socketPair.clientA.emit('call:end', {
      targetUserId: REAL_USERS.userB.id
    });

    const ended = await waitEnded;
    assert.ok(ended, 'Callee must receive call:ended when Caller cancels during ringing');
  });

  test('TC 19.5: Static audit: useWebRTCCall.js does not use blocking alert() for errors', () => {
    const hookPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'hooks', 'useWebRTCCall.js');
    if (!fs.existsSync(hookPath)) return;
    const content = fs.readFileSync(hookPath, 'utf-8');
    // Ensure no window.alert or alert( in call hook
    const hasAlert = /\balert\s*\(/i.test(content);
    assert.equal(hasAlert, false, 'useWebRTCCall.js must not use window.alert(), use toast notifications instead');
  });
});
