import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';

const service = new PaymentService();

export class PaymentController {
  
  async create(req: Request, res: Response) {
    const { method } = req.params;

    try {
      let result;
      switch (method) {
        case 'credit': result = await service.createCreditCard(req.body); break;
        case 'debit':  result = await service.createDebitCard(req.body); break;
        case 'pix':    result = await service.createPix(req.body); break;
        case 'boleto': result = await service.createBoleto(req.body); break;
        default: return res.status(400).json({ error: 'Método de pagamento inválido' });
      }
      return res.status(201).json(result);
    } catch (error: any) {
      console.error("❌ Erro no pagamento:", error);
      return res.status(500).json({ error: 'Erro ao criar pagamento', details: error?.message || error });
    }
  }

  // =======================================================
  // WEBHOOK OTIMIZADO (Padrão Mercado Pago)
  // =======================================================
  async webhook(req: Request, res: Response) {
    // 1. REGRA DE OURO: Responder 200 OK imediatamente para evitar Timeout 503!
    res.status(200).send('OK');

    try {
      const { query, body } = req;
      
      // 2. Extrair o ID seja por query params ou pelo body (Webhook / IPN)
      const paymentId = query['data.id'] || query.id || body?.data?.id;

      // 3. Verificar se é realmente uma notificação de pagamento
      const isPaymentEvent = query.topic === 'payment' || body?.action?.includes('payment') || body?.type === 'payment';

      if (paymentId && isPaymentEvent) {
        console.log(`\n🔔 Webhook Recebido! Disparando verificação para o Pagamento ID: ${paymentId}`);
        
        // 4. Executa a atualização do banco em Background (Repare que não há "await" aqui)
        service.processWebhookNotification(paymentId as string).catch(err => {
            console.error('❌ Erro no processamento em background do Webhook:', err);
        });
      }
    } catch (error) {
      console.error('❌ Erro ao ler a notificação do Mercado Pago:', error);
    }
  }
}