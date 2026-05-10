import { Router, Request, Response } from 'express';
import * as userController from '../controllers/userController';
import * as queueController from '../controllers/queueController';
import { saveSubscription } from '../services/notificationService';

const router = Router();

router.post('/identify', userController.identify);
router.get('/:userId/queues', queueController.getUserQueues);
router.get('/:userId/pending-turn', queueController.getPendingTurn);

// Returns the VAPID public key so the frontend can subscribe
router.get('/vapid-public-key', (_req: Request, res: Response) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Saves or updates the user's push subscription
router.post('/:userId/subscription', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const userIdStr = Array.isArray(userId) ? userId[0] : userId;
  const { subscription } = req.body;
  if (!subscription) {
    res.status(400).json({ error: 'subscription is required' });
    return;
  }
  try {
    await saveSubscription(userIdStr, subscription);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
