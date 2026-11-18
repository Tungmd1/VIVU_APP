import { Router } from 'express';
import { profileController } from '../controllers/profileController.js';

const router = Router();

// Routes quản lý Tin Nổi Bật (Highlights)
router.get('/:userId/highlights', profileController.getHighlights);
router.post('/:userId/highlights', profileController.createHighlight);
router.put('/:userId/highlights/:highlightId', profileController.updateHighlight);
router.delete('/:userId/highlights/:highlightId', profileController.deleteHighlight);
router.post('/:userId/highlights/pin-story', profileController.pinStory);

export default router;
