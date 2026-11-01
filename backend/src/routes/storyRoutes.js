import { Router } from 'express';
import { storyController } from '../controllers/storyController.js';

const router = Router();

router.get('/', storyController.getAllStories);
router.post('/', storyController.createStory);

export default router;
