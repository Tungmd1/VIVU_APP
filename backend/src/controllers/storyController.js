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
  },

  async deleteStory(req, res, next) {
    try {
      const { storyId } = req.params;
      const userId = req.query.userId || req.body?.userId;
      const result = await dbService.deleteStory(storyId, userId);
      res.json({ success: true, data: result });
    } catch (err) {
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
