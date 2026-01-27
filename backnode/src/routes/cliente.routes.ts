import { Router } from 'express';
import { ClienteController } from '../controllers/cliente.controller';
import { authMiddleware } from '../middleware/auth';
import { isolamentoMiddleware } from '../middleware/isolamento';
import { loggerMiddleware } from '../middleware/logger';

const clienteRoutes = Router();
const clienteController = new ClienteController();

clienteRoutes.use(authMiddleware);     // 1º: Autenticação
clienteRoutes.use(isolamentoMiddleware); // 2º: Isolamento
clienteRoutes.use(loggerMiddleware);    // 3º: Logging

// Rotas protegidas com isolamento
clienteRoutes.post('/clientes', clienteController.criar.bind(clienteController));
clienteRoutes.get('/clientes', clienteController.listar.bind(clienteController));
// clienteRoutes.get('/clientes/estatisticas', clienteController.estatistica.bind(clienteController));
clienteRoutes.get('/clientes/exportar', clienteController.exportar.bind(clienteController));
clienteRoutes.get('/clientes/documento/:documento', clienteController.buscarPorDocumento.bind(clienteController));
clienteRoutes.get('/clientes/:id', clienteController.buscarPorId.bind(clienteController));
clienteRoutes.put('/clientes/:id', clienteController.atualizar.bind(clienteController));
clienteRoutes.patch('/clientes/:id/status', clienteController.mudarStatus.bind(clienteController));
clienteRoutes.delete('/clientes/:id', clienteController.excluir.bind(clienteController));

export default clienteRoutes;