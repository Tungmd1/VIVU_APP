import { Router } from 'express';
import { friendController } from '../controllers/friendController.js';

const router = Router();

router.get('/search', friendController.search);
router.get('/status', friendController.getStatus);
router.post('/request', friendController.sendRequest);
router.post('/accept', friendController.acceptRequest);
router.post('/reject', friendController.rejectRequest);
router.post('/cancel', friendController.cancelRequest);
router.get('/requests/:userId', friendController.getRequests);
router.get('/list/:userId', friendController.getFriends);
router.post('/unfriend', friendController.unfriend);

export default router;
