import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 6: Leaflet OSM Tile Migration (T1.06)', () => {
  const tileFilePath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'mapTileConstants.js');

  test('TC 6.1: mapTileConstants.js does not rely on paid/key-gated CARTO endpoints or legacy GOOGLE_TILES alias', () => {
    assert.ok(fs.existsSync(tileFilePath), 'mapTileConstants.js must exist');
    const content = fs.readFileSync(tileFilePath, 'utf-8');
    const hasBrokenCarto = /basemaps\.cartocdn\.com|GOOGLE_TILES/i.test(content);
    assert.equal(hasBrokenCarto, false, 'mapTileConstants.js must NOT use key-gated cartocdn.com or legacy GOOGLE_TILES');
  });

  test('TC 6.2: mapTileConstants.js configures valid Google / OpenStreetMap / ESRI tile URLs', () => {
    const content = fs.readFileSync(tileFilePath, 'utf-8');
    const hasTiles = (content.includes('mt{s}.google.com/vt') || content.includes('tile.openstreetmap.org')) &&
      (content.includes('tile.openstreetmap.org') || content.includes('arcgisonline.com'));
    assert.equal(hasTiles, true, 'mapTileConstants.js must configure valid street/satellite tiles and OSM/ESRI fallbacks');
  });

  test('TC 6.3: Tile configuration defines standard zoom levels (maxZoom >= 19)', () => {
    const content = fs.readFileSync(tileFilePath, 'utf-8');
    const hasMaxZoom = /maxZoom:\s*(1[8-9]|2[0-2])/.test(content);
    assert.equal(hasMaxZoom, true, 'Tile layer must define appropriate maxZoom (18-22)');
  });

  test('TC 6.4: Tile configuration specifies mandatory OpenStreetMap attribution text', () => {
    const content = fs.readFileSync(tileFilePath, 'utf-8');
    const hasAttribution = /OpenStreetMap/i.test(content) && /contributors/i.test(content);
    assert.equal(hasAttribution, true, 'Tile configuration must include OpenStreetMap contributors attribution');
  });

  test('TC 6.5: Subdomains configuration is valid for OSM / Carto tile mirrors', () => {
    const content = fs.readFileSync(tileFilePath, 'utf-8');
    const hasValidSubdomains = /subdomains:\s*['"]?[a-d0-3]+['"]?/.test(content) || /subdomains:\s*\[['"][a-d0-3]['"]/.test(content);
    assert.equal(hasValidSubdomains, true, 'Subdomains configuration must be present for tile balancing');
  });
});
