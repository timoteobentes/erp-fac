import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const controller = new DashboardController();

// Todas as rotas de dashboard são protegidas
router.use(authMiddleware);

router.get('/dashboard/resumo', controller.getResumo);

export default router;
