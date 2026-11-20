import { Router } from 'express';
import { placeController } from '../controllers/placeController.js';

const router = Router();

router.get('/', placeController.getSavedPlaces);
router.post('/', placeController.createSavedPlace);
router.put('/:id', placeController.updateSavedPlace);
router.delete('/:id', placeController.deleteSavedPlace);

export default router;
