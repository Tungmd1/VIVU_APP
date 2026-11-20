import { io as Client } from '../../../frontend/node_modules/socket.io-client/build/esm/index.js';
import { E2E_CONFIG } from '../config/env.js';

/**
 * Socket.IO Client Harness for E2E Testing
 * Connects 1 or more clients with authentication and provides
 * robust event-waiting, event-collecting, and negative assertion helpers.
 */

export function createSocketClient(port, userId, options = {}) {
  const {
    host = E2E_CONFIG.DEFAULT_HOST,
    transports = ['websocket'],
    extraAuth = {}
  } = options;

  const url = `http://${host}:${port}`;
  const socket = Client(url, {
    auth: {
      userId,
      ...extraAuth
    },
    transports,
    reconnection: false,
    forceNew: true
  });

  const client = {
    socket,
    userId,

    /**
     * Wait for a single event to be received by this socket.
     */
    waitFor(eventName, timeoutMs = E2E_CONFIG.TIMEOUTS.SOCKET_WAIT) {
      return new Promise((resolve, reject) => {
        let timer = null;
        const handler = (data) => {
          if (timer) clearTimeout(timer);
          resolve(data);
        };
        timer = setTimeout(() => {
          socket.off(eventName, handler);
          reject(new Error(`[SocketHarness] Timeout (${timeoutMs}ms) waiting for event: '${eventName}' on user '${userId}'`));
        }, timeoutMs);

        socket.once(eventName, handler);
      });
    },

    /**
     * Collect N instances of an event.
     */
    collect(eventName, count, timeoutMs = E2E_CONFIG.TIMEOUTS.SOCKET_WAIT) {
      return new Promise((resolve, reject) => {
        const collected = [];
        let timer = null;

        const handler = (data) => {
          collected.push(data);
          if (collected.length >= count) {
            if (timer) clearTimeout(timer);
            socket.off(eventName, handler);
            resolve(collected);
          }
        };

        timer = setTimeout(() => {
          socket.off(eventName, handler);
          reject(new Error(`[SocketHarness] Timeout (${timeoutMs}ms) waiting to collect ${count} of '${eventName}', received ${collected.length}`));
        }, timeoutMs);

        socket.on(eventName, handler);
      });
    },

    /**
     * Assert that an event is NOT emitted during a specified duration.
     */
    expectNone(eventName, durationMs = E2E_CONFIG.TIMEOUTS.FAST_STEP) {
      return new Promise((resolve, reject) => {
        const handler = (data) => {
          socket.off(eventName, handler);
          reject(new Error(`[SocketHarness] Unexpected event '${eventName}' received on user '${userId}' with data: ${JSON.stringify(data)}`));
        };

        socket.once(eventName, handler);

        setTimeout(() => {
          socket.off(eventName, handler);
          resolve();
        }, durationMs);
      });
    },

    /**
     * Emit event with data.
     */
    emit(eventName, data) {
      socket.emit(eventName, data);
    },

    /**
     * Disconnect socket cleanly.
     */
    disconnect() {
      if (socket.connected) {
        socket.disconnect();
      }
    }
  };

  return client;
}

/**
 * Convenience helper to create two clients connected simultaneously (e.g. Caller and Callee).
 */
export async function createSocketPair(port, userAId, userBId, options = {}) {
  const clientA = createSocketClient(port, userAId, options);
  const clientB = createSocketClient(port, userBId, options);

  // Wait for both sockets to connect
  await Promise.all([
    new Promise((resolve, reject) => {
      if (clientA.socket.connected) return resolve();
      clientA.socket.once('connect', resolve);
      clientA.socket.once('connect_error', reject);
    }),
    new Promise((resolve, reject) => {
      if (clientB.socket.connected) return resolve();
      clientB.socket.once('connect', resolve);
      clientB.socket.once('connect_error', reject);
    })
  ]);

  const disconnectAll = () => {
    clientA.disconnect();
    clientB.disconnect();
  };

  return {
    clientA,
    clientB,
    disconnectAll
  };
}
