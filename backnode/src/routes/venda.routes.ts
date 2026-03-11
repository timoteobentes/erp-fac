import { Router } from 'express';
import { VendaController } from '../controllers/venda.controller';
import { authMiddleware } from '../middleware/auth';
import { isolamentoMiddleware } from '../middleware/isolamento';
import { loggerMiddleware } from '../middleware/logger';

const router = Router();
const vendaController = new VendaController();

// Todas as rotas de PDV/Vendas são protegidas
router.use(authMiddleware);
router.use(isolamentoMiddleware);
router.use(loggerMiddleware);

router.post('/pdv/checkout', vendaController.checkout);
router.get('/vendas', vendaController.listar);

export default router;
