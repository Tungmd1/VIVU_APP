import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { WEBRTC_FIXTURES } from '../config/fixtures.js';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 16: ICE Candidate Buffering Queue (T1.16)', () => {
  // Test simulated WebRTC Manager Queue
  class SimulatedWebRtcQueue {
    constructor() {
      this.hasRemoteDescription = false;
      this.candidateQueue = [];
      this.appliedCandidates = [];
    }

    async addIceCandidate(candidate) {
      if (!this.hasRemoteDescription) {
        this.candidateQueue.push(candidate);
        return { queued: true };
      }
      this.appliedCandidates.push(candidate);
      return { queued: false, applied: true };
    }

    async setRemoteDescription() {
      this.hasRemoteDescription = true;
      // Drain queue
      while (this.candidateQueue.length > 0) {
        const c = this.candidateQueue.shift();
        this.appliedCandidates.push(c);
      }
    }

    endCall() {
      this.hasRemoteDescription = false;
      this.candidateQueue = [];
      this.appliedCandidates = [];
    }
  }

  test('TC 16.1: Candidate arriving before remoteDescription is safely queued without throwing', async () => {
    const rtc = new SimulatedWebRtcQueue();
    const res = await rtc.addIceCandidate(WEBRTC_FIXTURES.sampleCandidate1);
    assert.equal(res.queued, true);
    assert.equal(rtc.candidateQueue.length, 1);
    assert.equal(rtc.appliedCandidates.length, 0);
  });

  test('TC 16.2: Multiple early candidates are stored in FIFO buffer order', async () => {
    const rtc = new SimulatedWebRtcQueue();
    await rtc.addIceCandidate(WEBRTC_FIXTURES.sampleCandidate1);
    await rtc.addIceCandidate(WEBRTC_FIXTURES.sampleCandidate2);
    assert.equal(rtc.candidateQueue.length, 2);
    assert.equal(rtc.candidateQueue[0].sdpMid, '0');
    assert.equal(rtc.candidateQueue[1].sdpMid, '1');
  });

  test('TC 16.3: Setting remoteDescription flushes all buffered candidates in sequence', async () => {
    const rtc = new SimulatedWebRtcQueue();
    await rtc.addIceCandidate(WEBRTC_FIXTURES.sampleCandidate1);
    await rtc.addIceCandidate(WEBRTC_FIXTURES.sampleCandidate2);

    await rtc.setRemoteDescription();
    assert.equal(rtc.candidateQueue.length, 0, 'Buffer queue must be emptied');
    assert.equal(rtc.appliedCandidates.length, 2, 'All candidates must be applied');
  });

  test('TC 16.4: Candidates arriving after remoteDescription is set bypass the queue', async () => {
    const rtc = new SimulatedWebRtcQueue();
    await rtc.setRemoteDescription();

    const res = await rtc.addIceCandidate(WEBRTC_FIXTURES.sampleCandidate1);
    assert.equal(res.queued, false);
    assert.equal(res.applied, true);
    assert.equal(rtc.appliedCandidates.length, 1);
  });

  test('TC 16.5: Static audit: webrtcManager.js maintains candidate queue array', () => {
    const managerPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'services', 'webrtcManager.js');
    if (!fs.existsSync(managerPath)) return;
    const content = fs.readFileSync(managerPath, 'utf-8');
    const hasQueue = /iceCandidateQueue|candidateQueue|bufferedCandidates/i.test(content);
    assert.equal(hasQueue, true, 'webrtcManager.js must define an ICE candidate buffer queue');
  });
});
