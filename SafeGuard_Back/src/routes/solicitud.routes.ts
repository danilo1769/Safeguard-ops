import { Router } from 'express';
import { crear, listar } from '../controllers/solicitud.controller';

const router = Router();
router.post('/crear', crear);
router.get('/cliente/:clienteId', listar);

export default router;