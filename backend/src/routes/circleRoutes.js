import { Router } from 'express';
import { circleController } from '../controllers/circleController.js';

const router = Router();

router.get('/', circleController.getAllCircles);
router.get('/:id', circleController.getCircleById);
router.post('/', circleController.createCircle);
router.put('/:id', circleController.updateCircle);
router.post('/:id/invite', circleController.inviteMembers);
router.post('/:id/add-members', circleController.addMembers);
router.post('/:id/respond', circleController.respondInvite);
router.post('/:id/leave', circleController.leaveCircle);
router.post('/:id/kick', circleController.kickMember);
router.delete('/:id', circleController.deleteCircle);

export default router;
