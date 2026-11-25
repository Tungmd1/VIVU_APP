import { dbService } from '../services/dbService.js';

export const profileController = {
  // GET /api/profile/:userId?viewerId=...
  async getUserProfile(req, res, next) {
    try {
      const { userId } = req.params;
      const viewerId = req.query.viewerId || req.headers['x-user-id'] || null;
      const result = await dbService.getViewerFilteredProfile(userId, viewerId);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ người dùng' });
      }
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/profile/:userId/highlights
  async getHighlights(req, res, next) {
    try {
      const { userId } = req.params;
      const highlights = await dbService.getUserHighlights(userId);
      res.json({ success: true, data: highlights });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/profile/:userId/highlights
  async createHighlight(req, res, next) {
    try {
      const { userId } = req.params;
      const highlight = await dbService.createHighlight(userId, req.body);
      res.status(201).json({ success: true, data: highlight });
    } catch (err) {
      if (err.statusCode === 403) {
        return res.status(403).json({ success: false, message: err.message });
      }
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // PUT /api/profile/:userId/highlights/:highlightId
  async updateHighlight(req, res, next) {
    try {
      const { userId, highlightId } = req.params;
      const updated = await dbService.updateHighlight(userId, highlightId, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      if (err.statusCode === 403) {
        return res.status(403).json({ success: false, message: err.message });
      }
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // DELETE /api/profile/:userId/highlights/:highlightId
  async deleteHighlight(req, res, next) {
    try {
      const { userId, highlightId } = req.params;
      const result = await dbService.deleteHighlight(userId, highlightId);
      res.json({ success: true, data: result });
    } catch (err) {
      if (err.statusCode === 403) {
        return res.status(403).json({ success: false, message: err.message });
      }
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // POST /api/profile/:userId/highlights/pin-story
  async pinStory(req, res, next) {
    try {
      const { userId } = req.params;
      const { highlightId, storyData } = req.body;
      const result = await dbService.pinStoryToHighlight(userId, highlightId, storyData);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      if (err.statusCode === 403) {
        return res.status(403).json({ success: false, message: err.message });
      }
      res.status(400).json({ success: false, message: err.message });
    }
  }
};
