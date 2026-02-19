import pool from "../config/database";
import { getPaymentInstance } from "../types/payment.factory";

export class PaymentService {
  async createCreditCard(data: any) {
    const paymentResponse = await getPaymentInstance().create({
      body: {
        transaction_amount: data.amount,
        description: data.description,
        token: data.token,
        installments: data.installments,
        payment_method_id: data.payment_method_id,
        payer: {
          email: data.payer.email,
          identification: {
            type: data.payer.identification.type,
            number: data.payer.identification.number
          }
        },
      },
    });

    const mpData: any = paymentResponse;

    if (mpData.status === 'approved') {

      if (!data.usuarioId) {
        throw new Error("ID do usuário é obrigatório para registrar o pagamento.");
      }

        await pool.query(
            `INSERT INTO pagamentos (usuario_id, mp_payment_id, mp_status, metodo_pagamento, valor, parcelas, plano_selecionado) 
            VALUES ($1, $2, $3, 'credit_card', $4, $5, $6)`,
            [
                data.usuarioId,              // $1: ID dinâmico vindo do Controller
                mpData.id.toString(),        // $2
                mpData.status,               // $3
                mpData.transaction_amount,   // $4
                data.installments,           // $5
                data.planName                // $6: Nome do plano (Ex: 'Profissional')
            ]
        );
        
        // Ativar usuário
        await pool.query(
            `UPDATE usuarios 
            SET status = 'ativo', 
                plano_selecionado = $2,
                atualizado_em = NOW()
            WHERE id = $1`, 
            [
                data.usuarioId, // $1
                data.planName   // $2
            ]
        );
    } else {
      throw new Error(mpData.status);
    }

    return mpData;
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
