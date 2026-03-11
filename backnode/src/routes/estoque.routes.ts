import { Router } from 'express';
import { EstoqueController } from '../controllers/estoque.controller';
import { authMiddleware } from '../middleware/auth';
import { isolamentoMiddleware } from '../middleware/isolamento';
import { loggerMiddleware } from '../middleware/logger';

const router = Router();
const estoqueController = new EstoqueController();

// Todas rotas de estoque requerem autenticação e middlewares base
router.use(authMiddleware);
router.use(isolamentoMiddleware);
router.use(loggerMiddleware);

// Rota de listagem de histórico
router.get('/estoque/:produto_id/historico', estoqueController.listarHistorico);

// Rota de movimentação/ajuste
router.post('/estoque/movimentar', estoqueController.movimentarEstoque);

export default router;
