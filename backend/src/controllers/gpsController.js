import { dbService } from '../services/dbService.js';

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
      const { userId, lat, lng, customStatus, name, avatar, userCode, phone } = req.body;
      if (!userId || lat == null || lng == null) {
        return res.status(400).json({ success: false, message: 'userId, lat, lng là bắt buộc' });
      }
      const updated = await dbService.updateGps(userId, lat, lng, customStatus, name, avatar, userCode, phone);
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
        } catch (_) {}
      }
      if (!userId && req.query?.userId) {
        userId = req.query.userId;
      }
      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId là bắt buộc' });
      }

      const updated = await dbService.setUserOffline(userId);

      // Broadcast sự kiện user:offline qua Socket.IO tới toàn bộ các client khác
      const io = req.app?.get('io');
      if (io) {
        io.emit('user:offline', { userId, timestamp: Date.now() });
      }

      console.log(`[GPS Controller] 🔴 User offline: ${userId}`);
      res.json({ success: true, message: 'Đã cập nhật trạng thái offline', data: updated });
    } catch (err) {
      next(err);
    }
  }
};
