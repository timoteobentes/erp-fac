import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const paymentRoutes = Router();
const controller = new PaymentController();

// A ROTA DO WEBHOOK TEM DE ESTAR PRIMEIRO
paymentRoutes.post('/webhook', controller.webhook);

// ⚠️ DURANTE TESTES → sem authMiddleware
paymentRoutes.post('/:method', controller.create);

export default paymentRoutes;