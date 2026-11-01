import { Router } from 'express';
import { gpsController } from '../controllers/gpsController.js';

const router = Router();

router.get('/profiles', gpsController.getNearbyProfiles);
router.post('/update', gpsController.updateLocation);
router.post('/offline', gpsController.setOffline);

export default router;
