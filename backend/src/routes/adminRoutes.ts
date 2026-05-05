import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

// Public: Admin login
router.post('/login', adminController.login);

// Protected: Machine management (isAdmin middleware ile korunuyor)
router.post('/machines', isAdmin, adminController.createMachine);
router.delete('/machines/:id', isAdmin, adminController.deleteMachine);
router.post('/machines/:id/force-reset', isAdmin, adminController.forceReset);
router.patch('/machines/:id/status', isAdmin, adminController.setStatus);
router.get('/logs', isAdmin, adminController.getLogs);

export default router;
