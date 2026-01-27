import { Router } from 'express';
import { ProdutoController } from '../controllers/produto.controller';
import { authMiddleware } from '../middleware/auth';
import { isolamentoMiddleware } from '../middleware/isolamento';
import { loggerMiddleware } from '../middleware/logger';

const produtoRoutes = Router();
const produtoController = new ProdutoController();

// Aplica middlewares globais para produtos (Segurança e Log)
produtoRoutes.use(authMiddleware);
produtoRoutes.use(isolamentoMiddleware);
produtoRoutes.use(loggerMiddleware);

// Definição das Rotas
produtoRoutes.post('/produtos', produtoController.criarProduto.bind(produtoController));
produtoRoutes.get('/produtos', produtoController.listarProdutos.bind(produtoController));

export default produtoRoutes;