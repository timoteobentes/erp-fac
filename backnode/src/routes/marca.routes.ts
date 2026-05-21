import { Router } from 'express';
import { MarcaController } from '../controllers/marca.controller';
import { loggerMiddleware } from '../middleware/logger';

const marcaRoutes = Router();
const controller = new MarcaController();

marcaRoutes.use(loggerMiddleware);

marcaRoutes.get('/marcas', controller.listar);
marcaRoutes.post('/marcas', controller.criar);
marcaRoutes.get('/marcas/:id', controller.buscarPorId);
marcaRoutes.put('/marcas/:id', controller.atualizar);
marcaRoutes.delete('/marcas/:id', controller.excluir);

export default marcaRoutes;
