import { dbService } from '../services/dbService.js';

const VALID_CATEGORIES = ['dining', 'music', 'dancing', 'sightseeing', 'cafe_dating', 'other'];

export const placeController = {
  async getSavedPlaces(req, res, next) {
    try {
      const userId = req.query?.userId || req.user?.id || null;
      const places = await dbService.getSavedPlaces(userId);
      return res.json({ success: true, places });
    } catch (err) {
      next(err);
    }
  },

  async createSavedPlace(req, res, next) {
    try {
      const { userId, name, category = 'other', notes, lat, lng, image } = req.body;
      const effectiveUserId = userId || req.user?.id;

      if (!effectiveUserId) {
        return res.status(400).json({ success: false, message: 'userId là bắt buộc.' });
      }

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Tên địa điểm là bắt buộc.' });
      }

      if (lat === undefined || lat === null || lng === undefined || lng === null) {
        return res.status(400).json({ success: false, message: 'Tọa độ lat và lng là bắt buộc.' });
      }

      const numLat = Number(lat);
      const numLng = Number(lng);
      if (isNaN(numLat) || numLat < -90 || numLat > 90 || isNaN(numLng) || numLng < -180 || numLng > 180) {
        return res.status(400).json({ success: false, message: 'Tọa độ GPS không hợp lệ (lat: -90..90, lng: -180..180).' });
      }

      if (category && !VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Danh mục không hợp lệ. Cho phép: ${VALID_CATEGORIES.join(', ')}`
        });
      }

      const place = await dbService.createSavedPlace({
        userId: effectiveUserId,
        name: name.trim(),
        category: category || 'other',
        notes: notes || '',
        lat: numLat,
        lng: numLng,
        image: image || ''
      });

      return res.status(201).json({ success: true, place });
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  async updateSavedPlace(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.body.userId || req.query?.userId || req.user?.id || null;

      if (req.body.name !== undefined && (typeof req.body.name !== 'string' || !req.body.name.trim())) {
        return res.status(400).json({ success: false, message: 'Tên địa điểm không được để trống.' });
      }

      if (req.body.category !== undefined && !VALID_CATEGORIES.includes(req.body.category)) {
        return res.status(400).json({
          success: false,
          message: `Danh mục không hợp lệ. Cho phép: ${VALID_CATEGORIES.join(', ')}`
        });
      }

      if (req.body.lat !== undefined) {
        const numLat = Number(req.body.lat);
        if (isNaN(numLat) || numLat < -90 || numLat > 90) {
          return res.status(400).json({ success: false, message: 'Vĩ độ (lat) không hợp lệ.' });
        }
      }

      if (req.body.lng !== undefined) {
        const numLng = Number(req.body.lng);
        if (isNaN(numLng) || numLng < -180 || numLng > 180) {
          return res.status(400).json({ success: false, message: 'Kinh độ (lng) không hợp lệ.' });
        }
      }

      const place = await dbService.updateSavedPlace(id, req.body, userId);
      return res.json({ success: true, place });
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async deleteSavedPlace(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.query?.userId || req.body?.userId || req.user?.id || null;

      const result = await dbService.deleteSavedPlace(id, userId);
      return res.json({ success: true, message: result.message || 'Đã xóa địa điểm thành công.' });
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};

export default placeController;
