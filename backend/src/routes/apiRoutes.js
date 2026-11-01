import { Router } from 'express';
import storyRoutes from './storyRoutes.js';
import chatRoutes from './chatRoutes.js';
import circleRoutes from './circleRoutes.js';
import gpsRoutes from './gpsRoutes.js';
import friendRoutes from './friendRoutes.js';
import authRoutes from './authRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import { dbService } from '../services/dbService.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'vivu-backend',
    cloudDbConnected: dbService.isCloud,
    timestamp: new Date().toISOString()
  });
});

// Tunnel URL synchronization endpoint
import fs from 'fs';
import path from 'path';

let currentTunnelUrl = process.env.VIVU_TUNNEL_URL || '';
const getActiveTunnelUrl = () => {
  if (currentTunnelUrl) return currentTunnelUrl;
  try {
    const candidates = [
      path.resolve(process.cwd(), 'infra', 'tunnel_url.txt'),
      path.resolve(process.cwd(), '..', 'infra', 'tunnel_url.txt')
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        currentTunnelUrl = fs.readFileSync(p, 'utf-8').trim();
        break;
      }
    }
  } catch {}
  return currentTunnelUrl;
};

router.get('/tunnel', (req, res) => {
  res.json({ success: true, url: getActiveTunnelUrl() });
});
router.post('/tunnel', (req, res) => {
  if (req.body?.url) {
    currentTunnelUrl = req.body.url;
  }
  res.json({ success: true, url: currentTunnelUrl });
});

// Feature routes
router.use('/auth', authRoutes);
router.use('/stories', storyRoutes);
router.use('/chat', chatRoutes);
router.use('/circles', circleRoutes);
router.use('/gps', gpsRoutes);
router.use('/friends', friendRoutes);
router.use('/notifications', notificationRoutes);

export default router;
