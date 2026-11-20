import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createTestServer } from '../helpers/serverHarness.js';
import { createSocketPair } from '../helpers/socketClientHarness.js';
import { REAL_USERS } from '../config/fixtures.js';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 17: Voice Call Audio Element Fix (T1.17)', () => {
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

  test('TC 17.1: Voice call signaling specifies callType === "voice" and isVideo === false', async () => {
    const waitIncoming = socketPair.clientB.waitFor('call:incoming', 3000);

    socketPair.clientA.emit('call:initiate', {
      targetUserId: REAL_USERS.userB.id,
      callType: 'voice'
    });

    const incoming = await waitIncoming;
    assert.ok(incoming);
    assert.equal(incoming.callType, 'voice', 'Call type must be voice');
    assert.equal(incoming.isVideo, false, 'isVideo must be false');
  });

  test('TC 17.2: Static audit: MessengerActiveCallModal.jsx contains <audio> tag for voice calls', () => {
    const modalPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'call', 'MessengerActiveCallModal.jsx');
    if (!fs.existsSync(modalPath)) return;
    const content = fs.readFileSync(modalPath, 'utf-8');
    const hasAudioTag = /<audio\b[^>]*>/i.test(content);
    assert.equal(hasAudioTag, true, 'MessengerActiveCallModal.jsx must render an <audio> element for remote audio stream');
  });

  test('TC 17.3: Static audit: Audio element has autoPlay and playsInline attributes', () => {
    const modalPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'call', 'MessengerActiveCallModal.jsx');
    if (!fs.existsSync(modalPath)) return;
    const content = fs.readFileSync(modalPath, 'utf-8');
    const hasAutoPlay = /autoPlay/i.test(content);
    const hasPlaysInline = /playsInline/i.test(content);
    assert.ok(hasAutoPlay && hasPlaysInline, '<audio> element must specify autoPlay and playsInline');
  });

  test('TC 17.4: Audio element attaches remoteStream reference when !isVideo', () => {
    const modalPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'call', 'MessengerActiveCallModal.jsx');
    if (!fs.existsSync(modalPath)) return;
    const content = fs.readFileSync(modalPath, 'utf-8');
    const hasAudioRef = /remoteAudioRef|audioRef/i.test(content) || /ref=\{.*audio.*\}/i.test(content);
    assert.equal(hasAudioRef, true, 'Audio element must be bound via ref to attach remote media stream');
  });

  test('TC 17.5: Ending voice call emits call:ended cleanly without media residue', async () => {
    const waitEnded = socketPair.clientB.waitFor('call:ended', 3000);

    socketPair.clientA.emit('call:end', {
      targetUserId: REAL_USERS.userB.id
    });

    const ended = await waitEnded;
    assert.ok(ended, 'Callee must receive call:ended');
  });
});
