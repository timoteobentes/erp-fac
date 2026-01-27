import { Request, Response } from 'express';
import { createSubscription } from '../services/subscription.service';

export async function createSubscriptionController(
  req: Request,
  res: Response
) {
  try {
    const { email, amount, plan } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'email é obrigatório' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'amount inválido' });
    }

    const subscription = await createSubscription({
      email,
      amount,
      reason: `Plano ${plan} - ERP`,
    });

    return res.status(201).json(subscription);
  } catch (error: any) {
    console.error('Erro assinatura:', error);

    return res.status(500).json({
      error: 'Erro ao criar assinatura',
      details: error.message,
    });
  }
}
