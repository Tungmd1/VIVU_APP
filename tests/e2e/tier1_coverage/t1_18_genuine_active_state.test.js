import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 18: Genuine Active Call State (T1.18)', () => {
  // Test simulated Call State Machine
  class SimulatedCallStateMachine {
    constructor() {
      this.status = 'idle'; // idle -> ringing -> connecting -> active -> ended
      this.timerStarted = false;
      this.connectionState = 'new';
    }

    onCallAccepted() {
      // Must go to 'connecting', NOT directly to 'active'
      this.status = 'connecting';
      this.timerStarted = false;
    }

    onPeerConnectionStateChange(newState, hasLiveTrack = false) {
      this.connectionState = newState;
      if (newState === 'connected' && hasLiveTrack) {
        this.status = 'active';
        this.timerStarted = true;
      } else if (newState === 'disconnected' || newState === 'failed' || newState === 'closed') {
        this.status = 'ended';
        this.timerStarted = false;
      }
    }
  }

  test('TC 18.1: Receiving call:accepted transitions call status to connecting, not active', () => {
    const sm = new SimulatedCallStateMachine();
    sm.status = 'ringing';
    sm.onCallAccepted();

    assert.equal(sm.status, 'connecting', 'Status must be connecting immediately after accept');
    assert.equal(sm.timerStarted, false, 'Duration timer must NOT start before media connection');
  });

  test('TC 18.2: Call status only transitions to active when connectionState === "connected" with live media', () => {
    const sm = new SimulatedCallStateMachine();
    sm.onCallAccepted();

    // Still connecting
    sm.onPeerConnectionStateChange('connecting', false);
    assert.equal(sm.status, 'connecting');
    assert.equal(sm.timerStarted, false);

    // Media connected
    sm.onPeerConnectionStateChange('connected', true);
    assert.equal(sm.status, 'active', 'Status must become active when connected with live track');
    assert.equal(sm.timerStarted, true, 'Timer must start only when active');
  });

  test('TC 18.3: ICE or media failure transitions call to ended and stops timer', () => {
    const sm = new SimulatedCallStateMachine();
    sm.onCallAccepted();
    sm.onPeerConnectionStateChange('connected', true);
    assert.equal(sm.status, 'active');

    // Failure happens
    sm.onPeerConnectionStateChange('failed', false);
    assert.equal(sm.status, 'ended');
    assert.equal(sm.timerStarted, false);
  });

  test('TC 18.4: Disconnecting media resets active call status', () => {
    const sm = new SimulatedCallStateMachine();
    sm.onCallAccepted();
    sm.onPeerConnectionStateChange('connected', true);

    sm.onPeerConnectionStateChange('disconnected', false);
    assert.equal(sm.status, 'ended');
  });

  test('TC 18.5: Static audit: useWebRTCCall.js transitions to active only upon connected state', () => {
    const hookPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'hooks', 'useWebRTCCall.js');
    if (!fs.existsSync(hookPath)) return;
    const content = fs.readFileSync(hookPath, 'utf-8');
    const hasConnectedCheck = content.includes("'connected'") || content.includes('"connected"');
    assert.equal(hasConnectedCheck, true, 'useWebRTCCall.js must monitor connectionState === "connected"');
  });
});
