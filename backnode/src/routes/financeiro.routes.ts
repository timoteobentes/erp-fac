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
router.get('/financeiro/receber/exportar', financeiroController.exportarContasReceber);
router.post('/financeiro/receber', financeiroController.criarContaReceber);
router.get('/financeiro/receber', financeiroController.listarContasReceber);
router.get('/financeiro/receber/:id', financeiroController.buscarContaReceber);
router.put('/financeiro/receber/:id', financeiroController.atualizarContaReceber);
router.patch('/financeiro/receber/:id/baixa', financeiroController.baixarContaReceber);
router.delete('/financeiro/receber/:id', financeiroController.excluirContaReceber);

// --- CONTAS A PAGAR ---
router.get('/financeiro/pagar/exportar', financeiroController.exportarContasPagar);
router.post('/financeiro/pagar', financeiroController.criarContaPagar);
router.get('/financeiro/pagar', financeiroController.listarContasPagar);
router.get('/financeiro/pagar/:id', financeiroController.buscarContaPagar);
router.patch('/financeiro/pagar/:id/baixa', financeiroController.baixarContaPagar);
router.delete('/financeiro/pagar/:id', financeiroController.excluirContaPagar);

// --- CENTRO DE CUSTOS ---
router.post('/financeiro/centro-custos', financeiroController.criarCentroCusto);
router.get('/financeiro/centro-custos', financeiroController.listarCentroCustos);
router.get('/financeiro/centro-custos/:id', financeiroController.buscarCentroCusto);
router.put('/financeiro/centro-custos/:id', financeiroController.atualizarCentroCusto);
router.delete('/financeiro/centro-custos/:id', financeiroController.excluirCentroCusto);

// --- PLANOS DE CONTAS ---
router.post('/financeiro/planos-de-contas', financeiroController.criarPlanoConta);
router.get('/financeiro/planos-de-contas', financeiroController.listarPlanosContas);
router.get('/financeiro/planos-de-contas/:id', financeiroController.buscarPlanoConta);
router.put('/financeiro/planos-de-contas/:id', financeiroController.atualizarPlanoConta);
router.delete('/financeiro/planos-de-contas/:id', financeiroController.excluirPlanoConta);
router.post('/financeiro/planos-contas', financeiroController.criarPlanoConta);
router.get('/financeiro/planos-contas', financeiroController.listarPlanosContas);
router.get('/financeiro/planos-contas/:id', financeiroController.buscarPlanoConta);
router.put('/financeiro/planos-contas/:id', financeiroController.atualizarPlanoConta);
router.delete('/financeiro/planos-contas/:id', financeiroController.excluirPlanoConta);

// --- CONTAS BANCARIAS ---
router.post('/financeiro/contas-bancarias', financeiroController.criarContaBancaria);
router.get('/financeiro/contas-bancarias', financeiroController.listarContasBancarias);
router.get('/financeiro/contas-bancarias/:id', financeiroController.buscarContaBancaria);
router.put('/financeiro/contas-bancarias/:id', financeiroController.atualizarContaBancaria);
router.delete('/financeiro/contas-bancarias/:id', financeiroController.excluirContaBancaria);
router.post('/financeiro/contas-bancaria', financeiroController.criarContaBancaria);
router.get('/financeiro/contas-bancaria', financeiroController.listarContasBancarias);
router.get('/financeiro/contas-bancaria/:id', financeiroController.buscarContaBancaria);
router.put('/financeiro/contas-bancaria/:id', financeiroController.atualizarContaBancaria);
router.delete('/financeiro/contas-bancaria/:id', financeiroController.excluirContaBancaria);

// --- FORMAS DE PAGAMENTO ---
router.post('/financeiro/formas-pagamento', financeiroController.criarFormaPagamento);
router.get('/financeiro/formas-pagamento', financeiroController.listarFormasPagamento);
router.get('/financeiro/formas-pagamento/:id', financeiroController.buscarFormaPagamento);
router.put('/financeiro/formas-pagamento/:id', financeiroController.atualizarFormaPagamento);
router.delete('/financeiro/formas-pagamento/:id', financeiroController.excluirFormaPagamento);
router.post('/financeiro/formas-de-pagamento', financeiroController.criarFormaPagamento);
router.get('/financeiro/formas-de-pagamento', financeiroController.listarFormasPagamento);
router.get('/financeiro/formas-de-pagamento/:id', financeiroController.buscarFormaPagamento);
router.put('/financeiro/formas-de-pagamento/:id', financeiroController.atualizarFormaPagamento);
router.delete('/financeiro/formas-de-pagamento/:id', financeiroController.excluirFormaPagamento);

// --- DRE GERENCIAL ---
router.get('/financeiro/dre-gerencial/exportar', financeiroController.exportarDreGerencial);
router.get('/financeiro/dre-gerencial', financeiroController.obterDreGerencial);

// --- CATEGORIAS DRE ---
router.post('/financeiro/dre-gerencial/categorias', financeiroController.criarCategoriaDre);
router.get('/financeiro/dre-gerencial/categorias', financeiroController.listarCategoriasDre);
router.get('/financeiro/dre-gerencial/categorias/:id', financeiroController.buscarCategoriaDre);
router.put('/financeiro/dre-gerencial/categorias/:id', financeiroController.atualizarCategoriaDre);
router.delete('/financeiro/dre-gerencial/categorias/:id', financeiroController.excluirCategoriaDre);

// --- FLUXO DE CAIXA ---
router.get('/financeiro/fluxo-caixa/exportar', financeiroController.exportarFluxoCaixa);
router.get('/financeiro/fluxo-caixa', financeiroController.obterFluxoCaixa);

export default router;
