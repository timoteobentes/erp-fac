import { Router } from 'express';
import { FinanceiroController } from '../controllers/financeiro.controller';
import { authMiddleware } from '../middleware/auth';
import { isolamentoMiddleware } from '../middleware/isolamento';
import { loggerMiddleware } from '../middleware/logger';

const router = Router();
const financeiroController = new FinanceiroController();

router.use(authMiddleware);
router.use(isolamentoMiddleware);
router.use(loggerMiddleware);

// --- CONTAS A RECEBER ---
router.post('/financeiro/receber', financeiroController.criarContaReceber);
router.get('/financeiro/receber', financeiroController.listarContasReceber);
router.get('/financeiro/receber/:id', financeiroController.buscarContaReceber);
router.patch('/financeiro/receber/:id/baixa', financeiroController.baixarContaReceber);
router.delete('/financeiro/receber/:id', financeiroController.excluirContaReceber);

// --- CONTAS A PAGAR ---
router.post('/financeiro/pagar', financeiroController.criarContaPagar);
router.get('/financeiro/pagar', financeiroController.listarContasPagar);
router.get('/financeiro/pagar/:id', financeiroController.buscarContaPagar);
router.patch('/financeiro/pagar/:id/baixa', financeiroController.baixarContaPagar);
router.delete('/financeiro/pagar/:id', financeiroController.excluirContaPagar);

export default router;
