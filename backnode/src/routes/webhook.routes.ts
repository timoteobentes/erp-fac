import { Router } from 'express';
import { NotificacaoController } from '../controllers/notificacao.controller';

const router = Router();
const controller = new NotificacaoController();

router.post('/notificacoes', controller.receberWebhook);

export default router;
