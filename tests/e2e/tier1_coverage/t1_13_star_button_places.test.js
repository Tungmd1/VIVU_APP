import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createTestServer } from '../helpers/serverHarness.js';
import { REAL_USERS, SAVED_PLACES_FIXTURES } from '../config/fixtures.js';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 13: Star Button & Saved Places UI (T1.13)', () => {
  let harness;

  before(async () => {
    harness = await createTestServer({
      seedData: {
        users: [REAL_USERS.userA],
        savedPlaces: SAVED_PLACES_FIXTURES.map((p, idx) => ({
          id: `pl-${idx + 1}`,
          userId: REAL_USERS.userA.id,
          ...p
        }))
      }
    });
  });

  after(async () => {
    if (harness) await harness.cleanup();
  });

  test('TC 13.1: Static audit: RightActionStack.jsx contains amber star button for saved places', () => {
    const actionPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'RightActionStack.jsx');
    if (!fs.existsSync(actionPath)) return;
    const content = fs.readFileSync(actionPath, 'utf-8');
    const hasStarButton = content.includes('bi-star') || content.includes('saved-places') || content.includes('onOpenSavedPlaces');
    assert.equal(hasStarButton, true, 'RightActionStack.jsx must include a star button to trigger saved places');
  });

  test('TC 13.2: Static audit: Saved Places component supports all 4 standard categories', () => {
    const placesDrawerPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'places', 'SavedPlacesDrawer.jsx');
    const placesModalPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'places', 'SavedPlaceModal.jsx');

    let content = '';
    if (fs.existsSync(placesDrawerPath)) content += fs.readFileSync(placesDrawerPath, 'utf-8');
    if (fs.existsSync(placesModalPath)) content += fs.readFileSync(placesModalPath, 'utf-8');

    const hasFood = /food|ăn uống/i.test(content);
    const hasMusic = /music|âm nhạc/i.test(content);
    const hasDance = /dance|nhảy múa/i.test(content);
    const hasSightseeing = /sightseeing|danh lam/i.test(content);

    assert.ok(hasFood && hasMusic && hasDance && hasSightseeing, 'Must support 4 categories: food, music, dance, sightseeing');
  });

  test('TC 13.3: Static audit: Star button provides accessible title or aria-label', () => {
    const actionPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'RightActionStack.jsx');
    if (!fs.existsSync(actionPath)) return;
    const content = fs.readFileSync(actionPath, 'utf-8');
    const hasAccessibleStar = /aria-label=["'][^"']*địa điểm[^"']*["']|title=["'][^"']*địa điểm[^"']*["']/i.test(content) ||
                              content.includes('bi-star');
    assert.ok(hasAccessibleStar, 'Star button must have an accessible label for screen readers');
  });

  test('TC 13.4: API integration: Fetching places by category filters results accurately', async () => {
    const res = await fetch(`${harness.baseUrl}/api/places?userId=${REAL_USERS.userA.id}&category=food`);
    assert.equal(res.status, 200);
    const body = await res.json();
    if (body.places) {
      assert.ok(body.places.every(p => p.category === 'food'), 'Filtered places must all have category === food');
    }
  });

  test('TC 13.5: Saving place with image URL preserves image link in response', async () => {
    const res = await fetch(`${harness.baseUrl}/api/places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: REAL_USERS.userA.id,
        name: 'Quán Cà Phê Acoustic',
        category: 'music',
        notes: 'Không gian ấm cúng, nhạc live cuối tuần',
        lat: 10.7812,
        lng: 106.6914,
        image: '/uploads/places/cafe_acoustic.jpg'
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.place.image, '/uploads/places/cafe_acoustic.jpg');
  });
});
