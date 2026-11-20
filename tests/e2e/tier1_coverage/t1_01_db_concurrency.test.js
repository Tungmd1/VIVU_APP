import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createTestServer } from '../helpers/serverHarness.js';
import { REAL_USERS, REAL_GPS_LOCATIONS } from '../config/fixtures.js';

describe('Feature 1: DB Concurrency & Write Lock (T1.01)', () => {
  let harness;

  before(async () => {
    harness = await createTestServer({
      seedData: {
        users: [REAL_USERS.userA, REAL_USERS.userB],
        profiles: [
          { id: REAL_USERS.userA.id, full_name: REAL_USERS.userA.full_name, lat: 21.0285, lng: 105.8542, is_online: true },
          { id: REAL_USERS.userB.id, full_name: REAL_USERS.userB.full_name, lat: 16.0610, lng: 108.2272, is_online: true }
        ]
      }
    });
  });

  after(async () => {
    if (harness) await harness.cleanup();
  });

  test('TC 1.1: 20 concurrent profile/status writes do not corrupt database JSON', async () => {
    const promises = [];
    for (let i = 0; i < 20; i++) {
      const p = fetch(`${harness.baseUrl}/api/profile/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: REAL_USERS.userA.id,
          statusText: `Concurrent status update #${i + 1}`,
          emoji: 'star'
        })
      });
      promises.push(p);
    }

    const responses = await Promise.all(promises);
    assert.equal(responses.length, 20, 'All 20 requests must complete');
    
    // Check that database JSON file on disk is still valid parseable JSON
    assert.doesNotThrow(() => {
      const raw = fs.readFileSync(harness.dbFile, 'utf-8');
      const parsed = JSON.parse(raw);
      assert.ok(Array.isArray(parsed.users), 'Parsed users must be an array');
    }, 'Database file on disk must remain valid JSON');
  });

  test('TC 1.2: 30 concurrent GPS updates execute without unhandled EBUSY crash', async () => {
    const promises = [];
    for (let i = 0; i < 30; i++) {
      const lat = 21.0285 + (i * 0.0001);
      const lng = 105.8542 + (i * 0.0001);
      const p = fetch(`${harness.baseUrl}/api/gps/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: REAL_USERS.userA.id,
          lat,
          lng,
          accuracy: 5.0
        })
      });
      promises.push(p);
    }

    const responses = await Promise.all(promises);
    assert.equal(responses.length, 30, 'All 30 GPS updates must complete');
    for (const res of responses) {
      assert.ok([200, 201].includes(res.status), `Expected 200/201 but got ${res.status}`);
    }
  });

  test('TC 1.3: Database reload from disk recovers complete records after high-concurrency writes', async () => {
    // Read directly from disk
    const raw = fs.readFileSync(harness.dbFile, 'utf-8');
    const parsed = JSON.parse(raw);
    assert.ok(parsed.users.length >= 2, 'Users must be preserved');
    const profile = parsed.profiles.find(p => p.id === REAL_USERS.userA.id);
    assert.ok(profile, 'User A profile must exist');
    assert.ok(profile.lat != null && profile.lng != null, 'GPS coordinates must be present');
  });

  test('TC 1.4: Concurrent reads and writes execute without deadlock or undefined payload returns', async () => {
    const ops = [];
    // 15 writes and 15 reads simultaneously
    for (let i = 0; i < 15; i++) {
      ops.push(fetch(`${harness.baseUrl}/api/gps/profiles`));
      ops.push(fetch(`${harness.baseUrl}/api/gps/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: REAL_USERS.userB.id,
          lat: 16.0610 + (i * 0.0001),
          lng: 108.2272,
          accuracy: 4.0
        })
      }));
    }

    const results = await Promise.all(ops);
    assert.equal(results.length, 30, 'All 30 read/write operations must complete');
    const statusCodes = results.map(r => r.status);
    assert.ok(statusCodes.every(code => code === 200 || code === 201), 'Zero 500 or deadlock errors');
  });

  test('TC 1.5: No leftover .tmp files exist in data directory after write batch settles', async () => {
    await new Promise(r => setTimeout(r, 200));
    const dir = path.dirname(harness.dbFile);
    const prefix = path.basename(harness.dbFile);
    const leftoverTmps = fs.readdirSync(dir).filter(f => f.startsWith(prefix) && f.endsWith('.tmp'));
    assert.equal(leftoverTmps.length, 0, `Expected 0 temporary files, found: ${leftoverTmps.join(', ')}`);
  });
});
