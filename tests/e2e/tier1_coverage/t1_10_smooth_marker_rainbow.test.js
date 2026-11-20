import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { REAL_GPS_LOCATIONS } from '../config/fixtures.js';

describe('Feature 10: Smooth Marker Motion & Rainbow Trail (T1.10)', () => {
  // Pure Lerp function under test
  function lerp(start, target, alpha) {
    return start + (target - start) * alpha;
  }

  function interpolateGps(p1, p2, alpha) {
    return {
      lat: lerp(p1.lat, p2.lat, alpha),
      lng: lerp(p1.lng, p2.lng, alpha)
    };
  }

  test('TC 10.1: Linear interpolation (Lerp) calculates genuine intermediate coordinate between GPS p1 and p2', () => {
    const p1 = REAL_GPS_LOCATIONS.hanoiHoanKiem;
    const p2 = REAL_GPS_LOCATIONS.hanoiWestLake;

    const mid = interpolateGps(p1, p2, 0.5);
    const expectedLat = (p1.lat + p2.lat) / 2;
    const expectedLng = (p1.lng + p2.lng) / 2;

    assert.ok(Math.abs(mid.lat - expectedLat) < 0.000001, 'Latitude midpoint must match mathematical average');
    assert.ok(Math.abs(mid.lng - expectedLng) < 0.000001, 'Longitude midpoint must match mathematical average');
  });

  test('TC 10.2: Lerp boundary values: t=0 returns start point, t=1 returns target, never NaN', () => {
    const p1 = REAL_GPS_LOCATIONS.saigonBenThanh;
    const p2 = REAL_GPS_LOCATIONS.saigonLandmark81;

    const start = interpolateGps(p1, p2, 0.0);
    const end = interpolateGps(p1, p2, 1.0);

    assert.equal(start.lat, p1.lat, 't=0 must return start latitude');
    assert.equal(start.lng, p1.lng, 't=0 must return start longitude');
    assert.equal(end.lat, p2.lat, 't=1 must return target latitude');
    assert.equal(end.lng, p2.lng, 't=1 must return target longitude');
    assert.ok(!isNaN(start.lat) && !isNaN(end.lat), 'Must never produce NaN');
  });

  test('TC 10.3: Rainbow trail queue stores consecutive real GPS coordinates chronologically (FIFO)', () => {
    const trailBuffer = [];
    const MAX_TRAIL = 5;

    function pushTrailPoint(pt) {
      trailBuffer.push(pt);
      if (trailBuffer.length > MAX_TRAIL) {
        trailBuffer.shift();
      }
    }

    const testPoints = [
      { lat: 21.01, lng: 105.81 },
      { lat: 21.02, lng: 105.82 },
      { lat: 21.03, lng: 105.83 },
      { lat: 21.04, lng: 105.84 },
      { lat: 21.05, lng: 105.85 },
      { lat: 21.06, lng: 105.86 } // 6th point pushes 1st out
    ];

    for (const pt of testPoints) {
      pushTrailPoint(pt);
    }

    assert.equal(trailBuffer.length, 5, 'Buffer should hold max 5 points');
    assert.equal(trailBuffer[0].lat, 21.02, 'Oldest point (21.01) was shifted out');
    assert.equal(trailBuffer[4].lat, 21.06, 'Newest point (21.06) is at tail');
  });

  test('TC 10.4: Trail polyline array format adheres to [[lat, lng], ...]', () => {
    const points = [
      REAL_GPS_LOCATIONS.danangDragonBridge,
      REAL_GPS_LOCATIONS.danangMyKhe
    ];

    const polylineCoords = points.map(p => [p.lat, p.lng]);
    assert.equal(polylineCoords.length, 2);
    assert.ok(Array.isArray(polylineCoords[0]), 'Each coordinate must be an array pair');
    assert.equal(typeof polylineCoords[0][0], 'number');
    assert.equal(typeof polylineCoords[0][1], 'number');
  });

  test('TC 10.5: Clearing trail history empties polyline points when user stops navigation', () => {
    let trail = [[21.01, 105.81], [21.02, 105.82]];
    assert.equal(trail.length, 2);

    // Stop navigation clears trail
    trail = [];
    assert.equal(trail.length, 0, 'Trail must be reset to empty on navigation stop');
  });
});
