import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServer } from '../helpers/serverHarness.js';
import { REAL_USERS, SAVED_PLACES_FIXTURES } from '../config/fixtures.js';

describe('Feature 11: Saved Places Backend & Schema (T1.11)', () => {
  let harness;
  let createdPlaceId = null;

  before(async () => {
    harness = await createTestServer({
      seedData: {
        users: [REAL_USERS.userA],
        savedPlaces: []
      }
    });
  });

  after(async () => {
    if (harness) await harness.cleanup();
  });

  test('TC 11.1: POST /api/places creates a new place with valid payload returning 201', async () => {
    const fixture = SAVED_PLACES_FIXTURES[0];
    const res = await fetch(`${harness.baseUrl}/api/places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: REAL_USERS.userA.id,
        name: fixture.name,
        category: fixture.category,
        notes: fixture.notes,
        lat: fixture.lat,
        lng: fixture.lng,
        image: fixture.image
      })
    });

    assert.equal(res.status, 201, `Expected 201 Created for place creation, got ${res.status}`);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.place, 'Must return created place object');
    assert.ok(body.place.id, 'Place must have unique ID');
    assert.equal(body.place.name, fixture.name);
    assert.equal(body.place.category, fixture.category);

    createdPlaceId = body.place.id;
  });

  test('TC 11.2: GET /api/places returns list containing the newly created place', async () => {
    const res = await fetch(`${harness.baseUrl}/api/places?userId=${REAL_USERS.userA.id}`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.places), 'Places must be an array');

    const found = body.places.find(p => p.id === createdPlaceId);
    assert.ok(found, 'Created place must appear in fetched list');
    assert.equal(found.name, SAVED_PLACES_FIXTURES[0].name);
  });

  test('TC 11.3: PUT /api/places/:id updates place notes and category successfully', async () => {
    if (!createdPlaceId) {
      assert.fail('Cannot update place: createdPlaceId is missing');
    }

    const updatedNotes = 'Đã cập nhật: Rất đông vào buổi sáng, nên đi sớm';
    const res = await fetch(`${harness.baseUrl}/api/places/${createdPlaceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: REAL_USERS.userA.id,
        notes: updatedNotes
      })
    });

    assert.equal(res.status, 200, `Expected 200 OK for update, got ${res.status}`);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.place.notes, updatedNotes);
  });

  test('TC 11.4: DELETE /api/places/:id removes place and subsequent GET confirms deletion', async () => {
    if (!createdPlaceId) {
      assert.fail('Cannot delete place: createdPlaceId is missing');
    }

    const delRes = await fetch(`${harness.baseUrl}/api/places/${createdPlaceId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: REAL_USERS.userA.id })
    });

    assert.equal(delRes.status, 200);
    const delBody = await delRes.json();
    assert.equal(delBody.success, true);

    // Verify deletion via GET
    const getRes = await fetch(`${harness.baseUrl}/api/places?userId=${REAL_USERS.userA.id}`);
    const getBody = await getRes.json();
    const found = getBody.places.find(p => p.id === createdPlaceId);
    assert.equal(found, undefined, 'Place must be removed from list');
  });

  test('TC 11.5: Schema validation: POST /api/places without required fields returns HTTP 400', async () => {
    // Missing name
    const resNoName = await fetch(`${harness.baseUrl}/api/places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: REAL_USERS.userA.id,
        category: 'food',
        lat: 21.0315,
        lng: 105.8528
      })
    });
    assert.equal(resNoName.status, 400, 'Missing place name must return 400');

    // Invalid category
    const resInvalidCat = await fetch(`${harness.baseUrl}/api/places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: REAL_USERS.userA.id,
        name: 'Invalid Place',
        category: 'unknown_alien_category',
        lat: 21.0315,
        lng: 105.8528
      })
    });
    assert.equal(resInvalidCat.status, 400, 'Invalid category must return 400');
  });
});
