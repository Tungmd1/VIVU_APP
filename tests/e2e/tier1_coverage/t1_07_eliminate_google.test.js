import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { E2E_CONFIG } from '../config/env.js';
import { auditGoogleReferences } from '../helpers/staticAuditHelper.js';

describe('Feature 7: Eliminate Google References (T1.07)', () => {
  test('TC 7.1: Zero instances of maps.google.com or google.com/maps across frontend', () => {
    const audit = auditGoogleReferences();
    const mapViolations = audit.violations.filter(v => /maps\.google\.com|google\.com\/maps/i.test(v.snippet));
    assert.equal(mapViolations.length, 0, `Found Google Maps URL violations: ${JSON.stringify(mapViolations)}`);
  });

  test('TC 7.2: GoogleMapView.jsx is refactored to VivuMapView.jsx', () => {
    const legacyPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'GoogleMapView.jsx');
    const newPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'VivuMapView.jsx');
    assert.equal(fs.existsSync(legacyPath), false, 'GoogleMapView.jsx must be renamed / removed');
    assert.equal(fs.existsSync(newPath), true, 'VivuMapView.jsx must exist');
  });

  test('TC 7.3: NavigationBanner.jsx does not link to Google Maps or display "Mở trong Google Maps"', () => {
    const bannerPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'NavigationBanner.jsx');
    if (!fs.existsSync(bannerPath)) return;
    const content = fs.readFileSync(bannerPath, 'utf-8');
    const hasGoogleLink = content.includes('google.com/maps');
    const hasGoogleText = content.includes('Google Maps');
    assert.equal(hasGoogleLink, false, 'NavigationBanner.jsx must not contain google.com/maps link');
    assert.equal(hasGoogleText, false, 'NavigationBanner.jsx must not display "Google Maps"');
  });

  test('TC 7.4: RightActionStack.jsx does not display "Google Vệ Tinh" or "Google Đường Phố"', () => {
    const actionPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'RightActionStack.jsx');
    if (!fs.existsSync(actionPath)) return;
    const content = fs.readFileSync(actionPath, 'utf-8');
    const hasGoogleLabels = /Google Vệ Tinh|Google Đường Phố/i.test(content);
    assert.equal(hasGoogleLabels, false, 'RightActionStack.jsx must use generic / OSM map style labels');
  });

  test('TC 7.5: frontend/index.html does not load Google Maps JavaScript API SDK', () => {
    const indexPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf-8');
    const hasGoogleMapsSdk = /maps\.googleapis\.com\/maps\/api\/js/i.test(content);
    assert.equal(hasGoogleMapsSdk, false, 'index.html must not load Google Maps JavaScript SDK');
  });
});
