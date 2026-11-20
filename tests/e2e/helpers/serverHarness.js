import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import express from '../../../backend/node_modules/express/index.js';
import cors from '../../../backend/node_modules/cors/lib/index.js';
import { E2E_CONFIG, getIsolatedTempDbPath } from '../config/env.js';

/**
 * Server Harness for E2E Testing
 * Spins up Express and Socket.IO server on dynamic port (0)
 * with an isolated temporary database, eliminating port collisions and DB pollution.
 */

export async function createTestServer(options = {}) {
  const {
    seedData = {},
    customRoutes = null,
    enableUploads = true
  } = options;

  // 1. Prepare isolated database path
  const { dbFile, bakFile } = getIsolatedTempDbPath();
  process.env.NODE_ENV = 'test';
  process.env.VIVU_DB_FILE = dbFile;
  process.env.VIVU_DB_BAK_FILE = bakFile;

  // Initialize isolated temp DB file with clean structure
  const initialData = {
    users: [],
    profiles: [],
    stories: [],
    messages: [],
    circles: [],
    friendRequests: [],
    friendships: [],
    notifications: [],
    highlights: [],
    archivedConversations: [],
    savedPlaces: [],
    ...seedData
  };
  fs.writeFileSync(dbFile, JSON.stringify(initialData, null, 2), 'utf-8');

  // Dynamic import backend components after setting env
  const { initSocketIO, forceUserOffline } = await import('../../../backend/src/services/socketService.js');
  const { dbStore } = await import('../../../backend/src/services/dbStore.js');
  const { errorHandler } = await import('../../../backend/src/middlewares/errorHandler.js');
  const apiRoutesModule = await import('../../../backend/src/routes/apiRoutes.js');
  const apiRoutes = apiRoutesModule.default;

  // Point dbStore to our initial test data
  dbStore.data = {
    ...initialData,
    users: [...(initialData.users || [])],
    profiles: [...(initialData.profiles || [])],
    stories: [...(initialData.stories || [])],
    messages: [...(initialData.messages || [])],
    circles: [...(initialData.circles || [])],
    friendRequests: [...(initialData.friendRequests || [])],
    friendships: [...(initialData.friendships || [])],
    notifications: [...(initialData.notifications || [])],
    highlights: [...(initialData.highlights || [])],
    archivedConversations: [...(initialData.archivedConversations || [])],
    savedPlaces: [...(initialData.savedPlaces || [])]
  };

  // 2. Setup Express application
  const app = express();

  // Middleware
  app.use(cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.text({ type: ['text/plain', 'application/json'], limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads
  if (enableUploads) {
    const uploadsDir = E2E_CONFIG.UPLOAD_DIR;
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    app.use('/uploads', express.static(uploadsDir));
  }

  // Custom routes if provided
  if (typeof customRoutes === 'function') {
    customRoutes(app);
  }

  // Mount API routes
  app.use('/api', apiRoutes);

  // Error handler
  app.use(errorHandler);

  // 3. Create HTTP server & Socket.IO
  const server = http.createServer(app);
  const io = initSocketIO(server);
  app.set('io', io);

  // 4. Listen on ephemeral port (0)
  await new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  // 5. Cleanup method
  const cleanup = async () => {
    try {
      // Close all socket connections
      if (io && io.sockets) {
        io.sockets.disconnectSockets(true);
        io.close();
      }

      // Close HTTP server
      await new Promise(resolve => server.close(resolve));

      // Remove temp DB and backup files
      try { if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile); } catch {}
      try { if (fs.existsSync(bakFile)) fs.unlinkSync(bakFile); } catch {}

      // Clean any temporary write queue files
      const dir = path.dirname(dbFile);
      const prefix = path.basename(dbFile);
      if (fs.existsSync(dir)) {
        const leftovers = fs.readdirSync(dir).filter(f => f.startsWith(prefix) && f.endsWith('.tmp'));
        for (const f of leftovers) {
          try { fs.unlinkSync(path.join(dir, f)); } catch {}
        }
      }
    } catch (err) {
      console.warn('[ServerHarness] Error during cleanup:', err.message);
    }
  };

  const resetDb = (newData = {}) => {
    dbStore.data = {
      users: [],
      profiles: [],
      stories: [],
      messages: [],
      circles: [],
      friendRequests: [],
      friendships: [],
      notifications: [],
      highlights: [],
      archivedConversations: [],
      savedPlaces: [],
      ...newData
    };
    try {
      fs.writeFileSync(dbFile, JSON.stringify(dbStore.data, null, 2), 'utf-8');
    } catch {}
  };

  return {
    server,
    app,
    io,
    port,
    baseUrl,
    dbFile,
    dbStore,
    cleanup,
    resetDb,
    forceUserOffline
  };
}
