import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { initSocketIO } from './services/socketService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(path.join(uploadsDir, 'chat'))) fs.mkdirSync(path.join(uploadsDir, 'chat'), { recursive: true });
if (!fs.existsSync(path.join(uploadsDir, 'highlights'))) fs.mkdirSync(path.join(uploadsDir, 'highlights'), { recursive: true });
if (!fs.existsSync(path.join(uploadsDir, 'stories'))) fs.mkdirSync(path.join(uploadsDir, 'stories'), { recursive: true });

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Khởi tạo Socket.IO trên httpServer
const io = initSocketIO(httpServer);
app.set('io', io);

// Phục vụ tệp tĩnh uploads (Ảnh / Video Chat & Highlights tối ưu cho VPS)
app.use('/uploads', express.static(uploadsDir));

// CORS setup
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: ['text/plain', 'application/json'], limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Root ping
app.get('/', (req, res) => {
  res.json({
    message: 'Chào mừng đến với VIVU Backend API Server',
    docs: '/api/health'
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use(errorHandler);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[VIVU Backend] Server dang chay tai http://0.0.0.0:${PORT} (LAN & Localhost)`);
  console.log(`[VIVU Backend] Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`[VIVU Backend] Socket.IO: WebSocket realtime da kich hoat`);
});

export default app;
