import { Router } from 'express';
import {
  listarNfse,
  buscarNfsePorId,
  criarNfse,
  dispararTransmissaoSefaz
} from '../controllers/nfse.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', listarNfse);
router.get('/:id', buscarNfsePorId);
router.post('/', criarNfse);
router.post('/:id/emitir', dispararTransmissaoSefaz);

export default router;
