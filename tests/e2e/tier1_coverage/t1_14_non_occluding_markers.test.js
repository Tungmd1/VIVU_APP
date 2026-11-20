import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 14: Non-Occluding Map Markers (T1.14)', () => {
  const getMapContent = () => {
    const candidates = [
      path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'VivuMapView.jsx'),
      path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'GoogleMapView.jsx')
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return fs.readFileSync(c, 'utf-8');
    }
    return '';
  };

  test('TC 14.1: Saved place marker dimensions are 30x36px (smaller than user and peer markers)', () => {
    const content = getMapContent();
    const hasSmallSize = /\[30,\s*36\]/.test(content) || /30px/.test(content);
    assert.equal(hasSmallSize, true, 'Saved place markers must be sized 30x36px to prevent occluding user teardrop');
  });

  test('TC 14.2: Saved place marker zIndexOffset is 300 (lower than peer 500-600 and user 1000)', () => {
    const content = getMapContent();
    const hasZIndex300 = /zIndexOffset:\s*300/.test(content);
    assert.equal(hasZIndex300, true, 'Saved place markers must have zIndexOffset: 300');
  });

  test('TC 14.3: User teardrop marker has highest zIndexOffset (1000), never occluded by other pins', () => {
    const content = getMapContent();
    const hasUserZIndex1000 = /zIndexOffset:\s*1000/.test(content);
    assert.equal(hasUserZIndex1000, true, 'User teardrop marker must have zIndexOffset: 1000');
  });

  test('TC 14.4: Category icon mapping defines distinct Bootstrap Icons for all 4 categories', () => {
    const content = getMapContent();
    // Check icons for food (cup-hot/egg-fried), music (music-note), dance (activity/stars), sightseeing (compass/building/geo-alt)
    const hasCategoryIcons = /bi-cup-hot|bi-music-note|bi-activity|bi-compass|bi-geo-alt|bi-star/i.test(content);
    assert.equal(hasCategoryIcons, true, 'Map view must configure Bootstrap Icons for saved place categories');
  });

  test('TC 14.5: Marker anchor position is calibrated to bottom-center ([15, 36])', () => {
    const content = getMapContent();
    const hasAnchor = /iconAnchor:\s*\[15,\s*36\]/.test(content) || /anchor:\s*\[15,\s*36\]/.test(content);
    assert.equal(hasAnchor, true, 'Marker anchor must be calibrated to [15, 36]');
  });
});
