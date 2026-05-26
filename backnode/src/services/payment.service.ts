import { randomUUID } from 'crypto';
import pool from '../config/database';
import axios from 'axios';
import { INFINITYPAY_CONFIG } from '../config/infinitypay';
import type { InfinityPayCreateLinkPayload, InfinityPayWebhookPayload } from '../types/payment.types';
import { setValidadeAssinatura } from './assinatura.service';

const PLANO_DADOS: Record<string, { nome: string; preco: number }> = {
  mei:      { nome: 'MEI',      preco: 107 },
  controle: { nome: 'Controle', preco: 237 },
  essencial:{ nome: 'Essencial',preco: 337 },
  anual:    { nome: 'Anual',    preco: 3639.60 },
};

export interface CreateLinkData {
  usuarioId: string;
  planId: string;
  planName: string;
  amount: number; // em reais
  email?: string;
  nome?: string;
  telefone?: string;
}

export class PaymentService {

  async createCheckoutLink(data: CreateLinkData) {
    const orderNsu = randomUUID();

    // Registra pagamento pendente antes de chamar InfinityPay
    const result = await pool.query(
      `INSERT INTO pagamentos
         (usuario_id, ip_order_nsu, ip_status, metodo_pagamento, valor, parcelas, plano_selecionado)
       VALUES ($1, $2, 'pending', 'infinitypay', $3, 1, $4)
       RETURNING id`,
      [data.usuarioId, orderNsu, data.amount, data.planId]
    );
    const pagamentoId = result.rows[0].id;

    const payload: InfinityPayCreateLinkPayload = {
      handle: INFINITYPAY_CONFIG.handle,
      items: [
        {
          quantity: 1,
          price: Math.round(data.amount * 100), // centavos
          description: `Assinatura ${data.planName} - FacoAConta ERP`,
        },
      ],
      order_nsu: orderNsu,
    };

    if (INFINITYPAY_CONFIG.redirectUrl) {
      payload.redirect_url = `${INFINITYPAY_CONFIG.redirectUrl}?order_nsu=${orderNsu}`;
    }
    if (INFINITYPAY_CONFIG.webhookUrl) {
      payload.webhook_url = INFINITYPAY_CONFIG.webhookUrl;
    }
    if (data.email || data.nome) {
      payload.customer = {
        ...(data.nome && { name: data.nome }),
        ...(data.email && { email: data.email }),
        ...(data.telefone && { phone_number: data.telefone }),
      };
    }

    let response: any;
    try {
      response = await axios.post(`${INFINITYPAY_CONFIG.apiUrl}/links`, payload);
    } catch (err: any) {
      // Propaga os erros de validação da InfinityPay com detalhes
      const ipData = err?.response?.data;
      const ipErrors = ipData?.errors;
      const detail = ipErrors
        ? JSON.stringify(ipErrors)
        : (ipData?.message ?? err?.message ?? 'Erro desconhecido');
      throw new Error(`InfinityPay: ${detail}`);
    }

    // InfinityPay pode retornar o link em campos diferentes dependendo da versão
    const checkoutUrl: string =
      response.data?.link ??
      response.data?.url ??
      response.data?.checkout_url ??
      response.data?.payment_url;

    if (!checkoutUrl) {
      console.error('Resposta InfinityPay:', response.data);
      throw new Error('InfinityPay não retornou uma URL de checkout válida');
    }

    await pool.query(
      `UPDATE pagamentos SET ip_checkout_url = $1 WHERE id = $2`,
      [checkoutUrl, pagamentoId]
    );

    console.log(`🔗 Link InfinityPay criado: order_nsu=${orderNsu}`);
    return { checkoutUrl, orderNsu, pagamentoId };
  }

  async checkPaymentStatus(data: { orderNsu: string; transactionNsu?: string; slug?: string }) {
    const response = await axios.post(`${INFINITYPAY_CONFIG.apiUrl}/payment_check`, {
      handle: INFINITYPAY_CONFIG.handle,
      order_nsu: data.orderNsu,
      ...(data.transactionNsu && { transaction_nsu: data.transactionNsu }),
      ...(data.slug && { slug: data.slug }),
    });

    // Se InfinityPay confirma o pagamento, sincroniza o banco (idempotente — cobre a race condition
    // entre o webhook e o retorno imediato do usuário ao sistema)
    if (response.data?.paid === true) {
      const { rows } = await pool.query(
        `SELECT ip_status, usuario_id, plano_selecionado FROM pagamentos WHERE ip_order_nsu = $1`,
        [data.orderNsu]
      );
      if (rows.length > 0 && rows[0].ip_status !== 'paid') {
        await pool.query(
          `UPDATE pagamentos SET ip_status = 'paid', atualizado_em = NOW() WHERE ip_order_nsu = $1`,
          [data.orderNsu]
        );
        await pool.query(
          `UPDATE usuarios SET status = 'ativo', plano_selecionado = $2, atualizado_em = NOW() WHERE id = $1`,
          [rows[0].usuario_id, rows[0].plano_selecionado]
        );
        await setValidadeAssinatura(rows[0].usuario_id, rows[0].plano_selecionado);
        console.log(`✅ [check] Usuário [${rows[0].usuario_id}] ativado via payment_check (webhook ainda não chegou).`);
      }
    }

    return response.data;
  }

  async processWebhookNotification(payload: InfinityPayWebhookPayload) {
    const { order_nsu, transaction_nsu, invoice_slug, capture_method, receipt_url } = payload;

    const result = await pool.query(
      `UPDATE pagamentos
       SET ip_status = 'paid',
           ip_transaction_nsu = $2,
           ip_invoice_slug = $3,
           ip_capture_method = $4,
           ip_receipt_url = $5,
           metodo_pagamento = $4,
           atualizado_em = NOW()
       WHERE ip_order_nsu = $1
       RETURNING usuario_id, plano_selecionado`,
      [order_nsu, transaction_nsu, invoice_slug, capture_method, receipt_url]
    );

    if (result.rows.length === 0) {
      console.log(`⚠️ Pagamento com order_nsu [${order_nsu}] não encontrado no banco.`);
      return;
    }

    const { usuario_id, plano_selecionado } = result.rows[0];

    await pool.query(
      `UPDATE usuarios
       SET status = 'ativo', plano_selecionado = $2, atualizado_em = NOW()
       WHERE id = $1`,
      [usuario_id, plano_selecionado]
    );

    await setValidadeAssinatura(usuario_id, plano_selecionado);

    await pool.query(
      `INSERT INTO webhook_eventos (usuario_id, origem, evento, payload, status, processado_em)
       VALUES ($1, 'infinitypay', 'payment.approved', $2, 'processado', NOW())`,
      [usuario_id, JSON.stringify(payload)]
    );

    console.log(`✅ Usuário [${usuario_id}] ativado no plano [${plano_selecionado}].`);
  }

  async renovarAssinatura(usuarioId: string) {
    const { rows } = await pool.query(
      `SELECT email, nome_empresa, nome_completo, plano_selecionado FROM usuarios WHERE id = $1`,
      [usuarioId]
    );
    if (rows.length === 0) throw new Error('Usuário não encontrado');

    const { email, nome_empresa, nome_completo, plano_selecionado } = rows[0];
    const plano = (plano_selecionado ?? 'essencial').toLowerCase();
    const dados = PLANO_DADOS[plano] ?? PLANO_DADOS['essencial'];

    return this.createCheckoutLink({
      usuarioId,
      planId: plano,
      planName: dados.nome,
      amount: dados.preco,
      email,
      nome: nome_empresa || nome_completo,
    });
  }
}
