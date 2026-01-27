import { PreApproval } from 'mercadopago';
import { mpClient } from '../config/mercadoPago';

const preApproval = new PreApproval(mpClient);

export async function createSubscription(data: {
  email: string;
  amount: number;
  reason: string;
}) {
  const payload = {
    reason: data.reason,
    payer_email: data.email,

    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: Number(data.amount),
      currency_id: 'BRL',
    },

    back_url: 'https://amadev.com.br/assinatura/retorno',
    redirect_url: 'https://amadev.com.br/assinatura/sucesso',
  };

  console.log('📦 PAYLOAD ASSINATURA:', payload);

  return await preApproval.create({
    body: payload,
  });
}
