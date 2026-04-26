import { Router } from 'express';
import { cargarPanel, asignar, descargarReporte } from '../controllers/admin.controller';

const router = Router();
router.get('/panel', cargarPanel);
router.post('/asignar', asignar);
router.get('/reporte-nomina', descargarReporte);

export default router;