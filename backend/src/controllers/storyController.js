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

      const hasLat = storyData.lat !== undefined && storyData.lat !== null;
      const hasLng = storyData.lng !== undefined && storyData.lng !== null;

      // Nếu gửi tọa độ thì bắt buộc phải có cả lat và lng
      if ((hasLat && !hasLng) || (!hasLat && hasLng)) {
        return res.status(400).json({ success: false, message: 'Cần cung cấp đầy đủ cả lat và lng hoặc không gửi cả hai' });
      }

      // Nếu có gửi cả hai thì kiểm tra tính hợp lệ về mặt số học và phạm vi địa lý
      if (hasLat && hasLng) {
        const numLat = Number(storyData.lat);
        const numLng = Number(storyData.lng);
        if (isNaN(numLat) || isNaN(numLng) || numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
          return res.status(400).json({ success: false, message: 'Tọa độ GPS không hợp lệ (lat: -90..90, lng: -180..180)' });
        }
      }

      const created = await dbService.createStory(storyData);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  },

  async deleteStory(req, res, next) {
    try {
      const { storyId } = req.params;
      const userId = req.query.userId || req.body?.userId || req.headers['x-user-id'];
      const userCode = req.query.userCode || req.body?.userCode;
      const result = await dbService.deleteStory(storyId, userId, userCode);
      res.json({ success: true, data: result });
    } catch (err) {
      if (err.statusCode === 403) {
        return res.status(403).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  async votePoll(req, res, next) {
    try {
      const { storyId } = req.params;
      const { pollId, optionIndex, userId } = req.body;
      const updated = await dbService.voteStoryPoll(storyId, pollId, optionIndex, userId);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async replyQA(req, res, next) {
    try {
      const { storyId } = req.params;
      const { qaId, prompt, text, user } = req.body;
      const updated = await dbService.replyStoryQA(storyId, qaId, prompt, text, user);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async reactStory(req, res, next) {
    try {
      const { storyId } = req.params;
      const { reactionType, userId } = req.body;
      const updated = await dbService.reactStory(storyId, reactionType, userId);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
};
