import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createTestServer } from '../helpers/serverHarness.js';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 12: Saved Places Photo Upload (T1.12)', () => {
  let harness;
  let uploadedFileUrl = null;

  before(async () => {
    harness = await createTestServer();
  });

  after(async () => {
    if (harness) await harness.cleanup();
  });

  test('TC 12.1: POST /api/upload/media?category=places uploads image and returns 201 with fileUrl', async () => {
    // Generate a minimal valid 1x1 PNG image buffer
    const pngBuffer = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2DB40000000049454E44AE426082', 'hex');
    const blob = new Blob([pngBuffer], { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', blob, 'test_place.png');

    const res = await fetch(`${harness.baseUrl}/api/upload/media?category=places`, {
      method: 'POST',
      body: formData
    });

    assert.ok([200, 201].includes(res.status), `Expected 200/201 on upload, got ${res.status}`);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.fileUrl, 'Response must return fileUrl');
    assert.ok(body.fileUrl.includes('/uploads/places/'), `fileUrl must route to /uploads/places/, got ${body.fileUrl}`);

    uploadedFileUrl = body.fileUrl;
  });

  test('TC 12.2: Uploaded place image is persisted under uploads/places directory on disk', () => {
    if (!uploadedFileUrl) return;
    const fileName = path.basename(uploadedFileUrl);
    const diskPath = path.join(E2E_CONFIG.UPLOAD_DIR, 'places', fileName);
    assert.ok(fs.existsSync(diskPath), `Uploaded image file must exist at ${diskPath}`);
  });

  test('TC 12.3: GET static image URL serves image with HTTP 200 and image Content-Type', async () => {
    if (!uploadedFileUrl) return;
    const res = await fetch(`${harness.baseUrl}${uploadedFileUrl}`);
    assert.equal(res.status, 200, 'Serving uploaded image must return 200');
    const contentType = res.headers.get('content-type');
    assert.ok(contentType && contentType.startsWith('image/'), `Content-Type must be image/*, got ${contentType}`);
  });

  test('TC 12.4: POST /api/upload/media without file payload returns HTTP 400', async () => {
    const formData = new FormData();
    const res = await fetch(`${harness.baseUrl}/api/upload/media?category=places`, {
      method: 'POST',
      body: formData
    });

    assert.equal(res.status, 400, 'Upload without file must return 400');
  });

  test('TC 12.5: Static audit: uploadRoutes.js supports "places" category in destination mapping', () => {
    const uploadRoutesPath = path.join(E2E_CONFIG.BACKEND_DIR, 'src', 'routes', 'uploadRoutes.js');
    const content = fs.readFileSync(uploadRoutesPath, 'utf-8');
    const hasPlacesCategory = content.includes("'places'") || content.includes('"places"');
    assert.equal(hasPlacesCategory, true, 'uploadRoutes.js must include places category');
  });
});
