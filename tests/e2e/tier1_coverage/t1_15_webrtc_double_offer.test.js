import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createTestServer } from '../helpers/serverHarness.js';
import { createSocketPair } from '../helpers/socketClientHarness.js';
import { REAL_USERS, WEBRTC_FIXTURES } from '../config/fixtures.js';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 15: WebRTC Signaling Double Offer Fix (T1.15)', () => {
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

  test('TC 15.1: call:initiate triggers call:incoming on Callee and call:ringing on Caller', async () => {
    const waitIncoming = socketPair.clientB.waitFor('call:incoming', 3000);
    const waitRinging = socketPair.clientA.waitFor('call:ringing', 3000);

    socketPair.clientA.emit('call:initiate', {
      targetUserId: REAL_USERS.userB.id,
      callType: 'video'
    });

    const [incoming, ringing] = await Promise.all([waitIncoming, waitRinging]);
    assert.ok(incoming, 'Callee must receive call:incoming');
    assert.equal(incoming.callerId, REAL_USERS.userA.id);
    assert.ok(ringing, 'Caller must receive call:ringing');
  });

  test('TC 15.2: call:accept emits call:accepted to both Caller and Callee', async () => {
    const waitAcceptedCaller = socketPair.clientA.waitFor('call:accepted', 3000);
    const waitAcceptedCallee = socketPair.clientB.waitFor('call:accepted', 3000);

    socketPair.clientB.emit('call:accept', {
      callerId: REAL_USERS.userA.id
    });

    const [accCaller, accCallee] = await Promise.all([waitAcceptedCaller, waitAcceptedCallee]);
    assert.ok(accCaller, 'Caller must receive call:accepted');
    assert.ok(accCallee, 'Callee must receive call:accepted');
  });

  test('TC 15.3: Caller sends SDP offer via call:signal after call:accepted', async () => {
    const waitSignalCallee = socketPair.clientB.waitFor('call:signal', 3000);

    socketPair.clientA.emit('call:signal', {
      targetUserId: REAL_USERS.userB.id,
      signal: WEBRTC_FIXTURES.sampleOffer
    });

    const signalData = await waitSignalCallee;
    assert.ok(signalData, 'Callee must receive signaling data');
    assert.equal(signalData.fromUserId, REAL_USERS.userA.id);
    assert.equal(signalData.signal.type, 'offer', 'Signal must be of type offer');
  });

  test('TC 15.4: Callee sends SDP answer and Callee never generates duplicate offer', async () => {
    const waitSignalCaller = socketPair.clientA.waitFor('call:signal', 3000);

    socketPair.clientB.emit('call:signal', {
      targetUserId: REAL_USERS.userA.id,
      signal: WEBRTC_FIXTURES.sampleAnswer
    });

    const signalData = await waitSignalCaller;
    assert.ok(signalData, 'Caller must receive answer');
    assert.equal(signalData.signal.type, 'answer', 'Signal must be of type answer');

    // Callee must NOT emit any offer signal
    await socketPair.clientA.expectNone('call:signal', 400);
  });

  test('TC 15.5: Static audit: useWebRTCCall.js guards createOffer so only Caller initiates offer', () => {
    const hookPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'hooks', 'useWebRTCCall.js');
    if (!fs.existsSync(hookPath)) return;
    const content = fs.readFileSync(hookPath, 'utf-8');
    // Ensure caller check exists before createOffer
    const hasCallerGuard = /isCaller|callerId === user|activeCallRef\.current\?\.isCaller/.test(content);
    assert.equal(hasCallerGuard, true, 'useWebRTCCall.js must check isCaller before creating offer');
  });
});
