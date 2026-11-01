import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { initSocketIO } from './services/socketService.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Khởi tạo Socket.IO trên httpServer
const io = initSocketIO(httpServer);
app.set('io', io);

// CORS setup
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
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
