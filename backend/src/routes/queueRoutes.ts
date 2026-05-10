import { Router } from 'express';
import * as queueController from '../controllers/queueController';

const router = Router({ mergeParams: true });

router.get('/', queueController.getInfo);
router.post('/join', queueController.join);
router.delete('/leave', queueController.leave);
router.delete('/skip', queueController.skip);

export default router;
