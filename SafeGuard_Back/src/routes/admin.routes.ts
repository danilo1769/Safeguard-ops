import { Router } from 'express';
import { cargarPanel, asignar } from '../controllers/admin.controller';

const router = Router();
router.get('/panel', cargarPanel);
router.post('/asignar', asignar);

export default router;