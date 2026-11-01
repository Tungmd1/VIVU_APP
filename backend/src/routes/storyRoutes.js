import { Router } from 'express';
import { storyController } from '../controllers/storyController.js';

const router = Router();

router.get('/', storyController.getAllStories);
router.post('/', storyController.createStory);
router.post('/:storyId/poll-vote', storyController.votePoll);
router.post('/:storyId/qa-reply', storyController.replyQA);
router.post('/:storyId/react', storyController.reactStory);

export default router;
