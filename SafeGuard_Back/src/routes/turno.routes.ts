import { Router } from 'express';
import { clockIn, clockOut, misTurnos, reportarFalta } from '../controllers/turno.controller';

const router = Router();

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/vigilante/:vigilanteId', misTurnos); 
router.post('/reportar-ausencia', reportarFalta);

export default router;