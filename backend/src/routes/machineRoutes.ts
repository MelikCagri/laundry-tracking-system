import { Router } from 'express';
import * as machineController from '../controllers/machineController';

const router = Router();

router.get('/', machineController.getAll);
router.post('/:id/start', machineController.start);
router.post('/:id/finish', machineController.finish);
router.post('/:id/clear', machineController.clear);
router.post('/:id/extend', machineController.extend);
router.post('/:id/report', machineController.report);
router.get('/:id/owner-whatsapp', machineController.ownerWhatsApp);

export default router;
