import { Router } from 'express';
import { FornecedorController } from '../controllers/fornecedor.controller';
import { authMiddleware } from '../middleware/auth';
import { isolamentoMiddleware } from '../middleware/isolamento';
import { loggerMiddleware } from '../middleware/logger';

const fornecedorRoutes = Router();
const fornecedorController = new FornecedorController();

fornecedorRoutes.use(authMiddleware);     // 1º: Autenticação
fornecedorRoutes.use(isolamentoMiddleware); // 2º: Isolamento
fornecedorRoutes.use(loggerMiddleware);    // 3º: Logging

// Rotas CRUD básicas
fornecedorRoutes.post('/fornecedores', fornecedorController.criarFornecedor.bind(fornecedorController));
fornecedorRoutes.get('/fornecedores', fornecedorController.listarFornecedores.bind(fornecedorController));
fornecedorRoutes.get('/fornecedores/estatisticas', fornecedorController.obterEstatisticas.bind(fornecedorController));
fornecedorRoutes.get('/fornecedores/exportar', fornecedorController.exportarFornecedores.bind(fornecedorController));
fornecedorRoutes.get('/fornecedores/documento/:documento', fornecedorController.buscarFornecedorPorDocumento.bind(fornecedorController));
fornecedorRoutes.get('/fornecedores/:id', fornecedorController.buscarFornecedor.bind(fornecedorController));
fornecedorRoutes.put('/fornecedores/:id', fornecedorController.atualizarFornecedor.bind(fornecedorController));
fornecedorRoutes.patch('/fornecedores/:id/status', fornecedorController.mudarStatusFornecedor.bind(fornecedorController));
fornecedorRoutes.delete('/fornecedores/:id', fornecedorController.excluirFornecedor.bind(fornecedorController));

// Rotas para produtos/serviços
fornecedorRoutes.post('/fornecedores/:id/produtos', fornecedorController.adicionarProdutoServico.bind(fornecedorController));

export default fornecedorRoutes;