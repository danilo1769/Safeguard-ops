import { Router } from 'express';
import { clockIn } from '../controllers/turno.controller';

const router = Router();
router.post('/clock-in', clockIn);
export default router;