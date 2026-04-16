import pool from "../config/database";
import { getPaymentInstance } from "../types/payment.factory";
import { Payment } from 'mercadopago';
import { mpClient } from '../config/mercadoPago';

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

    if (!data.usuarioId) throw new Error("ID do usuário é obrigatório.");

    // Salva o pagamento (aprovado ou recusado)
    await pool.query(
        `INSERT INTO pagamentos (usuario_id, mp_payment_id, mp_status, metodo_pagamento, valor, parcelas, plano_selecionado) 
        VALUES ($1, $2, $3, 'credit_card', $4, $5, $6)`,
        [data.usuarioId, mpData.id.toString(), mpData.status, mpData.transaction_amount, data.installments, data.planName]
    );

    if (mpData.status === 'approved') {
        // Ativar usuário na hora, pois o cartão foi aprovado instantaneamente
        await pool.query(
            `UPDATE usuarios SET status = 'ativo', plano_selecionado = $2, atualizado_em = NOW() WHERE id = $1`, 
            [data.usuarioId, data.planName]
        );
    } else {
      throw new Error(`Pagamento recusado: ${mpData.status_detail || mpData.status}`);
    }

    return mpData;
  }

  async createPix(data: any) {
    if (!data.usuarioId) throw new Error("ID do usuário é obrigatório.");

    const paymentResponse: any = await getPaymentInstance().create({
      body: {
        transaction_amount: data.amount,
        description: data.description,
        payment_method_id: 'pix',
        payer: {
          email: data.payer.email,
          first_name: data.payer.first_name || 'Cliente ', // Obrigatório em Prod
          last_name: data.payer.last_name || 'FaçoAConta',    // Obrigatório em Prod
          identification: {
            type: data.payer.identification?.type || 'CPF',
            number: data.payer.identification?.number
          }
        },
      },
    });

    // Extrair os dados do QR Code da resposta do MP
    const qrCodeBase64 = paymentResponse.point_of_interaction?.transaction_data?.qr_code_base64;
    const qrCodeCopiaCola = paymentResponse.point_of_interaction?.transaction_data?.qr_code;

    // Registar pagamento no banco como 'pending'
    await pool.query(
      `INSERT INTO pagamentos (usuario_id, mp_payment_id, mp_status, metodo_pagamento, valor, parcelas, plano_selecionado, qr_code_base64, qr_code_copia_cola) 
      VALUES ($1, $2, $3, 'pix', $4, 1, $5, $6, $7)`,
      [
          data.usuarioId,
          paymentResponse.id.toString(),
          paymentResponse.status, 
          paymentResponse.transaction_amount,
          data.planName,
          qrCodeBase64,
          qrCodeCopiaCola
      ]
    );

    return paymentResponse;
  }

  // MÉTODOS DE BOLETO E DÉBITO OMITIDOS PARA BREVIDADE (Pode mantê-los como estavam)
  async createDebitCard(data: any) { /* ... */ }
  async createBoleto(data: any) { /* ... */ }

  // ============================================================================
  // WEBHOOK: OUVIR O MERCADO PAGO
  // ============================================================================
  async processWebhookNotification(paymentId: string) {
    try {
      const payment = new Payment(mpClient);
      
      // 1. Busca os dados atualizados e seguros diretamente do Mercado Pago
      console.log(`⏳ Consultando status real do pagamento ${paymentId} na API do MP...`);
      const mpData = await payment.get({ id: paymentId });
      const status = mpData.status;

      console.log(`📊 Status retornado pelo Mercado Pago: [${status?.toUpperCase()}]`);

      // 2. Atualiza a tabela de pagamentos no seu banco
      const result = await pool.query(
        `UPDATE pagamentos SET mp_status = $1, atualizado_em = NOW() WHERE mp_payment_id = $2 RETURNING usuario_id, plano_selecionado`,
        [status, paymentId]
      );

      if (result.rows.length > 0) {
        const { usuario_id, plano_selecionado } = result.rows[0];

        // 3. Se foi aprovado, ativa o usuário!
        if (status === 'approved') {
          await pool.query(
            `UPDATE usuarios SET status = 'ativo', plano_selecionado = $2, atualizado_em = NOW() WHERE id = $1`,
            [usuario_id, plano_selecionado]
          );
          console.log(`✅ SUCESSO ABSOLUTO! Usuário ID [${usuario_id}] ativado no plano [${plano_selecionado}].`);
        } 
        // 4. Se for rejeitado/cancelado e ainda estava pendente, bloqueia.
        else if (status === 'rejected' || status === 'cancelled') {
          await pool.query(
            `UPDATE usuarios SET status = 'bloqueado', atualizado_em = NOW() WHERE id = $1 AND status = 'pendente'`,
            [usuario_id]
          );
          console.log(`🚫 Pagamento rejeitado ou cancelado. Usuário ID [${usuario_id}] continua bloqueado.`);
        }
      } else {
        console.log(`⚠️ ATENÇÃO: Pagamento ${paymentId} não foi encontrado na tabela 'pagamentos' do nosso banco.`);
      }

    } catch (error) {
      console.error(`❌ Falha crítica ao processar a notificação do MP para o ID ${paymentId}:`, error);
    }
  }
}