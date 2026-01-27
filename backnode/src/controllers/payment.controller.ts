import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';

const service = new PaymentService();

export class PaymentController {
  async create(req: Request, res: Response) {
    const { method } = req.params;

    try {
      let result;

      switch (method) {
        case 'credit':
          result = await service.createCreditCard(req.body);
          break;

        case 'debit':
          result = await service.createDebitCard(req.body);
          break;

        case 'pix':
          result = await service.createPix(req.body);
          break;

        case 'boleto':
          result = await service.createBoleto(req.body);
          break;

        default:
          return res.status(400).json({ error: 'Método de pagamento inválido' });
      }

      return res.status(201).json(result);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        error: 'Erro ao criar pagamento',
        details: error?.message || error,
      });
    }
  }
}
