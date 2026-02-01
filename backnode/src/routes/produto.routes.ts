import { Router } from 'express';
import { ProdutoController } from '../controllers/produto.controller';
import { authMiddleware } from '../middleware/auth';
import { isolamentoMiddleware } from '../middleware/isolamento';
import { loggerMiddleware } from '../middleware/logger';

const produtoRoutes = Router();
const produtoController = new ProdutoController();

produtoRoutes.use(authMiddleware);
produtoRoutes.use(isolamentoMiddleware);
produtoRoutes.use(loggerMiddleware);

produtoRoutes.get('/produtos/auxiliares', produtoController.obterDadosAuxiliares);
produtoRoutes.get('/produtos', produtoController.listar);
produtoRoutes.post('/produtos', produtoController.criar);
produtoRoutes.get('/produtos/:id', produtoController.buscarPorId);
produtoRoutes.put('/produtos/:id', produtoController.atualizar);
produtoRoutes.delete('/produtos/:id', produtoController.excluir);

export default produtoRoutes;