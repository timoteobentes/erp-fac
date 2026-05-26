import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import type { InfinityPayWebhookPayload } from '../types/payment.types';

const service = new PaymentService();

export class PaymentController {

  async createLink(req: Request, res: Response) {
    try {
      const { usuarioId, planId, planName, amount, email, nome, telefone } = req.body;

      if (!usuarioId || !planId || !planName || !amount) {
        return res.status(400).json({ error: 'usuarioId, planId, planName e amount são obrigatórios' });
      }

      const result = await service.createCheckoutLink({
        usuarioId,
        planId,
        planName,
        amount: Number(amount),
        email,
        nome,
        telefone,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      const msg: string = error?.message ?? '';
      console.error('❌ Erro ao criar link de checkout:', msg);
      // Erros de validação da InfinityPay retornam 422 para o frontend distinguir
      const status = msg.startsWith('InfinityPay:') ? 422 : 500;
      return res.status(status).json({ error: msg || 'Erro ao criar link de pagamento' });
    }
  }

  async checkStatus(req: Request, res: Response) {
    try {
      const { orderNsu, transactionNsu, slug } = req.body;

      if (!orderNsu) {
        return res.status(400).json({ error: 'orderNsu é obrigatório' });
      }

      const result = await service.checkPaymentStatus({ orderNsu, transactionNsu, slug });
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ Erro ao verificar status do pagamento:', error?.message);
      return res.status(500).json({ error: 'Erro ao verificar pagamento', details: error?.message });
    }
  }

  // REGRA DE OURO: Responder 200 imediatamente — InfinityPay retenta se receber 400
  async webhook(req: Request, res: Response) {
    res.status(200).send('OK');

    try {
      const payload = req.body as InfinityPayWebhookPayload;

      if (!payload?.order_nsu) {
        console.log('⚠️ Webhook InfinityPay recebido sem order_nsu, ignorando.');
        return;
      }

      console.log(`🔔 Webhook InfinityPay: order_nsu=${payload.order_nsu} método=${payload.capture_method}`);

      service.processWebhookNotification(payload).catch(err => {
        console.error('❌ Erro no processamento do webhook InfinityPay:', err);
      });
    } catch (error) {
      console.error('❌ Erro ao ler payload do webhook InfinityPay:', error);
    }
  }
}
