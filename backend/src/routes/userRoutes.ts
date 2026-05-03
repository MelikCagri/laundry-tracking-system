import { Router } from 'express';
import * as userController from '../controllers/userController';
import * as queueController from '../controllers/queueController';

const router = Router();

router.post('/identify', userController.identify);
router.get('/:userId/queues', queueController.getUserQueues);

export default router;
