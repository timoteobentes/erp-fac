import { Router } from 'express';
import { PerfilController } from '../controllers/perfil.controller';
import { authMiddleware } from '../middleware/auth';
import { isolamentoMiddleware } from '../middleware/isolamento';

const router = Router();
const perfilController = new PerfilController();

router.use(authMiddleware);
router.use(isolamentoMiddleware);

router.get('/perfil', perfilController.getPerfil);
router.put('/perfil', perfilController.updatePerfil);

export default router;
