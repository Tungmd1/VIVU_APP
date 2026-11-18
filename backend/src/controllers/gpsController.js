import { dbService } from '../services/dbService.js';
import { forceUserOffline } from '../services/socketService.js';

export const gpsController = {
  async getNearbyProfiles(req, res, next) {
    try {
      const profiles = await dbService.getProfiles();
      res.json({ success: true, data: profiles });
    } catch (err) {
      next(err);
    }
  },

  async updateLocation(req, res, next) {
    try {
      const { userId, lat, lng, customStatus, name, avatar, userCode, phone, customSong, customChibi, pinSkin, pinMascot, pinAction, chibiExpiresAt } = req.body;
      if (!userId || lat == null || lng == null) {
        return res.status(400).json({ success: false, message: 'userId, lat, lng là bắt buộc' });
      }
      const updated = await dbService.updateGps(userId, lat, lng, customStatus, name, avatar, userCode, phone, customSong, customChibi, pinSkin, pinMascot, pinAction, chibiExpiresAt);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async setOffline(req, res, next) {
    try {
      let userId = req.body?.userId;
      if (!userId && typeof req.body === 'string') {
        try {
          const parsed = JSON.parse(req.body);
          userId = parsed.userId;
        } catch (_) {
          // Nếu body là raw userId text
          if (req.body.startsWith('user-')) userId = req.body.trim();
        }
      }
      if (!userId && req.query?.userId) {
        userId = req.query.userId;
      }
      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId là bắt buộc' });
      }

      const updated = await dbService.setUserOffline(userId);

      // Cưỡng chế ngắt socket mapping & broadcast user:offline tức thì
      try {
        forceUserOffline(userId);
      } catch (fErr) {
        const io = req.app?.get('io');
        if (io) {
          io.emit('user:offline', { userId, timestamp: Date.now() });
        }
      }

      console.log(`[GPS Controller] 🔴 User offline: ${userId}`);
      res.json({ success: true, message: 'Đã cập nhật trạng thái offline', data: updated });
    } catch (err) {
      next(err);
    }
  }
};
