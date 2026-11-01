import { Router } from 'express';
import { chatController } from '../controllers/chatController.js';

const router = Router();

router.get('/inbox/:userId', chatController.getInbox);
router.get('/conversations/:userId', chatController.getUserConversations);
router.get('/:conversationId/messages', chatController.getMessagesByConversation);
router.post('/messages', chatController.sendMessage);
router.post('/messages/read', chatController.markAsRead);

export default router;
