import { Router } from 'express';
import { clockIn, clockOut, misTurnos } from '../controllers/turno.controller';

const router = Router();

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
// AQUÍ ESTÁ LA CLAVE: Debe ser un GET y llamarse '/vigilante/:vigilanteId'
router.get('/vigilante/:vigilanteId', misTurnos); 

export default router;