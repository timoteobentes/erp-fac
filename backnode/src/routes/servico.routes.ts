import { Router } from 'express';
import {
  listarServicos,
  buscarServicoPorId,
  criarServico,
  atualizarServico,
  deletarServico
} from '../controllers/servico.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', listarServicos);
router.get('/:id', buscarServicoPorId);
router.post('/', criarServico);
router.put('/:id', atualizarServico);
router.delete('/:id', deletarServico);

export default router;
