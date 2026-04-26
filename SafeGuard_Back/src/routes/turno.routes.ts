import { Router } from 'express';
import { clockIn, clockOut, misTurnos } from '../controllers/turno.controller';


const router = Router();
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/mis-turnos/:vigilanteId', misTurnos);
export default router;