import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

/**
 * E2E Testing Environment Configuration
 * Provides dynamic ports, isolated database paths, and standard timeout constants.
 */

export const E2E_CONFIG = {
  // Network & Ports
  DEFAULT_PORT: 0, // Port 0 triggers kernel ephemeral port assignment (zero conflict)
  DEFAULT_HOST: '127.0.0.1',

  // Timeouts (milliseconds)
  TIMEOUTS: {
    FAST_STEP: 500,
    DEFAULT_STEP: 3000,
    SOCKET_WAIT: 4000,
    LONG_OP: 10000,
    CALL_RINGING_SPEC: 45000, // 45s ringing timeout spec from R4 / Feature 19
    CALL_TEST_TIMEOUT: 2000 // Compressed fast-timeout for rapid test suites
  },

  // Directory paths
  ROOT_DIR: path.resolve(import.meta.dirname, '..', '..', '..'),
  BACKEND_DIR: path.resolve(import.meta.dirname, '..', '..', '..', 'backend'),
  FRONTEND_DIR: path.resolve(import.meta.dirname, '..', '..', '..', 'frontend'),
  UPLOAD_DIR: path.resolve(import.meta.dirname, '..', '..', '..', 'backend', 'uploads'),

  // Saved Places standard categories (from R3 & PROJECT.md)
  SAVED_PLACE_CATEGORIES: ['food', 'music', 'dance', 'sightseeing'],

  // Tile sources
  MAP_TILE_PROVIDERS: {
    OSM: 'openstreetmap.org',
    CARTO: 'cartocdn.com',
    ESRI: 'arcgisonline.com'
  }
};

/**
 * Generate a unique, isolated temporary DB file path for a test suite or case.
 * Guaranteed never to collide or taint the main database.
 */
export function getIsolatedTempDbPath(prefix = 'vivu_e2e_') {
  const uniqueId = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const dbFile = path.join(os.tmpdir(), `${prefix}${uniqueId}.json`);
  const bakFile = `${dbFile}.bak`;
  return { dbFile, bakFile };
}
