import { Router } from 'express';
import { clockIn, clockOut } from '../controllers/turno.controller';

const router = Router();
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
export default router;