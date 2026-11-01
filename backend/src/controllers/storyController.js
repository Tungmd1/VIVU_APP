import { dbService } from '../services/dbService.js';

export const storyController = {
  async getAllStories(req, res, next) {
    try {
      const { privacy } = req.query;
      const stories = await dbService.getStories(privacy);
      res.json({ success: true, data: stories });
    } catch (err) {
      next(err);
    }
  },

  async createStory(req, res, next) {
    try {
      const storyData = req.body;
      if (!storyData.title) {
        return res.status(400).json({ success: false, message: 'Tiêu đề Story là bắt buộc' });
      }
      const created = await dbService.createStory(storyData);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }
};
