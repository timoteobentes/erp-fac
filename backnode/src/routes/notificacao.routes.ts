import { Router } from 'express';
import { NotificacaoController } from '../controllers/notificacao.controller';

const router = Router();
const controller = new NotificacaoController();

router.get('/notificacoes', controller.listar);
router.get('/notificacoes/resumo', controller.resumo);
router.post('/notificacoes', controller.criar);
router.patch('/notificacoes/marcar', controller.marcar);
router.post('/notificacoes/email', controller.enviarEmail);
router.delete('/notificacoes', controller.excluir);

export default router;
