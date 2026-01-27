import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const paymentRoutes = Router();
const controller = new PaymentController();

// ⚠️ DURANTE TESTES → sem authMiddleware
paymentRoutes.post('/:method', controller.create);

export default paymentRoutes;
