import { getPaymentInstance } from "../types/payment.factory";

export class PaymentService {
  async createCreditCard(data: any) {
    return getPaymentInstance().create({
      body: {
        transaction_amount: data.amount,
        token: data.token,
        description: data.description,
        installments: data.installments,
        payment_method_id: data.payment_method_id,
        payer: data.payer,
      },
    });
  }

  async createDebitCard(data: any) {
    return getPaymentInstance().create({
      body: {
        transaction_amount: data.amount,
        token: data.token,
        description: data.description,
        payment_method_id: data.payment_method_id,
        installments: 1,
        payer: data.payer,
      },
    });
  }

  async createPix(data: any) {
    return getPaymentInstance().create({
      body: {
        transaction_amount: data.amount,
        description: data.description,
        payment_method_id: 'pix',
        payer: data.payer,
      },
    });
  }

  async createBoleto(data: any) {
    return getPaymentInstance().create({
      body: {
        transaction_amount: data.amount,
        description: data.description,
        payment_method_id: 'bolbradesco',
        payer: data.payer,
      },
    });
  }
}
