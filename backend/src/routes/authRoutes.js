import { Router } from 'express';
import { authController } from '../controllers/authController.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password-mock', authController.resetPasswordMock);
router.post('/google', authController.googleLogin);
router.post('/facebook', authController.facebookLogin);
router.post('/oauth/sync', authController.syncOAuthAccount);
router.get('/me', authController.getMe);
router.post('/profile', authController.updateProfile);

export default router;
