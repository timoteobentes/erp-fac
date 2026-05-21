import { Router } from 'express';
import { CategoriaController } from '../controllers/categoria.controller';
import { loggerMiddleware } from '../middleware/logger';

const categoriaRoutes = Router();
const controller = new CategoriaController();

categoriaRoutes.use(loggerMiddleware);

categoriaRoutes.get('/categorias', controller.listar);
categoriaRoutes.post('/categorias', controller.criar);
categoriaRoutes.get('/categorias/:id', controller.buscarPorId);
categoriaRoutes.put('/categorias/:id', controller.atualizar);
categoriaRoutes.delete('/categorias/:id', controller.excluir);

export default categoriaRoutes;
