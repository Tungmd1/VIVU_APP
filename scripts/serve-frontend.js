import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'frontend', 'dist');
const PORT = 5173;
const BACKEND_PORT = 5000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

process.on('uncaughtException', (err) => {
  console.warn('[Server Warning] Caught exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.warn('[Server Warning] Caught rejection:', reason);
});

const server = http.createServer((req, res) => {
  req.on('error', (err) => {
    console.warn('[Req Warning]', err.message);
  });
  res.on('error', (err) => {
    console.warn('[Res Warning]', err.message);
  });

  // CORS & Allowed Hosts
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Client error logger
  if (req.url === '/api/client-error' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.error('[CLIENT RUNTIME ERROR]', body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok":true}');
    });
    return;
  }

  // 1. Proxy /api and /socket.io to backend
  if (req.url.startsWith('/api') || req.url.startsWith('/socket.io')) {
    const proxyReq = http.request({
      hostname: '127.0.0.1',
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${BACKEND_PORT}`
      }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
      proxyRes.on('error', (err) => {
        console.warn('[ProxyRes Warning]', err.message);
      });
    });

    proxyReq.on('error', (err) => {
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Proxy Error: ${err.message}`);
      }
    });

    req.pipe(proxyReq);
    return;
  }

  // 2. Serve static files from frontend/dist
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;
  if (pathname === '/') pathname = '/index.html';

  let filePath = path.join(distDir, pathname);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => {
      console.warn('[Stream Warning]', err.message);
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
    stream.pipe(res);
  } else {
    // SPA fallback: index.html
    const indexPath = path.join(distDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      const stream = fs.createReadStream(indexPath);
      stream.on('error', (err) => {
        console.warn('[Stream Warning]', err.message);
        if (!res.headersSent) res.writeHead(500);
        res.end();
      });
      stream.pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    }
  }
});

// Proxy WebSocket upgrades to backend for socket.io
server.on('upgrade', (req, socket, head) => {
  socket.on('error', (err) => {
    console.warn('[Client Socket Warning]', err.message);
  });

  if (req.url.startsWith('/socket.io')) {
    const proxySocket = http.request({
      hostname: '127.0.0.1',
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${BACKEND_PORT}`
      }
    });
    proxySocket.on('upgrade', (proxyRes, backendSocket, backendHead) => {
      backendSocket.on('error', (err) => {
        console.warn('[Backend Socket Warning]', err.message);
        socket.destroy();
      });
      socket.on('error', () => {
        backendSocket.destroy();
      });
      socket.write(`HTTP/1.1 101 Switching Protocols\r\n` +
        Object.entries(proxyRes.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n') +
        `\r\n\r\n`);
      backendSocket.pipe(socket);
      socket.pipe(backendSocket);
    });
    proxySocket.on('error', (err) => {
      console.warn('[ProxySocket Error]', err.message);
      socket.destroy();
    });
    proxySocket.end();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[VIVU Frontend Server] Đang chạy tại http://0.0.0.0:${PORT}`);
  console.log(`[VIVU Frontend Server] Local: http://localhost:${PORT}`);
  console.log(`[VIVU Frontend Server] Proxy /api -> http://localhost:${BACKEND_PORT}`);
});

