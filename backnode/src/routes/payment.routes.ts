import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const paymentRoutes = Router();
const controller = new PaymentController();

// Webhook InfinityPay — sem autenticação, chamado diretamente pela InfinityPay
paymentRoutes.post('/webhook', (req, res) => controller.webhook(req, res));

// Criar link de checkout — chamado pelo frontend do usuário autenticado
paymentRoutes.post('/link', (req, res) => controller.createLink(req, res));

// Verificar status do pagamento após retorno do InfinityPay
paymentRoutes.post('/check', (req, res) => controller.checkStatus(req, res));

export default paymentRoutes;
