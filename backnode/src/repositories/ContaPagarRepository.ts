import pool from '../config/database';
import { BaseRepository } from './BaseRepository';
import { ContaPagar, ContaPagarParcela } from '../models/ContaPagar';

export interface FiltrosContaPagar {
  status?: string;
  data_vencimento_inicio?: string;
  data_vencimento_fim?: string;
  fornecedor_id?: number;
  termo?: string;
}

export class ContaPagarRepository extends BaseRepository {
  async criar(dados: ContaPagar, usuarioId: number): Promise<number> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO contas_pagar (
          usuario_id, fornecedor_id, descricao, valor_total,
          data_vencimento, data_pagamento, status, categoria_despesa, observacao,
          plano_conta_id, centro_custo_id, forma_pagamento_id, conta_bancaria_id,
          pagamento_quitado, data_compensacao, parcelamento_recorrencia_ativo,
          tipo_parcela, repeticao, quantidade_parcelas, data_primeira_parcela
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20
        ) RETURNING id
      `;

      const res = await client.query(query, [
        usuarioId,
        dados.fornecedor_id || null,
        dados.descricao,
        dados.valor_total,
        dados.data_vencimento,
        dados.data_pagamento || null,
        dados.status || 'pendente',
        dados.categoria_despesa || null,
        dados.observacao || null,
        dados.plano_conta_id || null,
        dados.centro_custo_id || null,
        dados.forma_pagamento_id || null,
        dados.conta_bancaria_id || null,
        dados.pagamento_quitado ?? false,
        dados.data_compensacao || null,
        dados.parcelamento_recorrencia_ativo ?? false,
        dados.parcelamento_recorrencia_ativo ? dados.tipo_parcela || null : null,
        dados.parcelamento_recorrencia_ativo ? dados.repeticao || null : null,
        dados.parcelamento_recorrencia_ativo ? dados.quantidade_parcelas || null : null,
        dados.parcelamento_recorrencia_ativo ? dados.data_primeira_parcela || null : null,
      ]);

      const contaId = res.rows[0].id;

      if (dados.parcelamento_recorrencia_ativo && dados.parcelas?.length) {
        await this.salvarParcelas(client, contaId, usuarioId, dados.parcelas);
      }

      await client.query('COMMIT');
      return contaId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async listar(usuarioId: number, filtros: FiltrosContaPagar, paginacao?: { limit: number, offset: number }) {
    let query = `
      SELECT
        cp.*,
        f.nome as fornecedor_nome,
        pc.nome as plano_conta_nome,
        pc.conta_mae as plano_conta_mae,
        cc.nome as centro_custo_nome,
        fp.nome as forma_pagamento_nome,
        cb.nome as conta_bancaria_nome,
        EXISTS (
          SELECT 1 FROM contas_pagar_parcelas cpp
          WHERE cpp.conta_pagar_id = cp.id
        ) as possui_parcelas
      FROM contas_pagar cp
      LEFT JOIN fornecedores f ON cp.fornecedor_id = f.id
      LEFT JOIN plano_contas pc ON cp.plano_conta_id = pc.id
      LEFT JOIN centro_custos cc ON cp.centro_custo_id = cc.id
      LEFT JOIN formas_pagamento fp ON cp.forma_pagamento_id = fp.id
      LEFT JOIN contas_bancarias cb ON cp.conta_bancaria_id = cb.id
      WHERE cp.usuario_id = $1
    `;
    const values: Array<string | number> = [usuarioId];
    let count = 2;

    if (filtros.status) {
      query += ` AND cp.status = $${count++}`;
      values.push(filtros.status);
    }
    if (filtros.fornecedor_id) {
      query += ` AND cp.fornecedor_id = $${count++}`;
      values.push(filtros.fornecedor_id);
    }
    if (filtros.termo) {
      query += ` AND cp.descricao ILIKE $${count++}`;
      values.push(`%${filtros.termo}%`);
    }
    if (filtros.data_vencimento_inicio) {
      query += ` AND cp.data_vencimento >= $${count++}`;
      values.push(filtros.data_vencimento_inicio);
    }
    if (filtros.data_vencimento_fim) {
      query += ` AND cp.data_vencimento <= $${count++}`;
      values.push(filtros.data_vencimento_fim);
    }

    let finalQuery = query + ` ORDER BY cp.data_vencimento ASC`;

    if (paginacao) {
      const safeLimit = Math.min(Number(paginacao.limit) || 500, 500);
      const safeOffset = Math.max(Number(paginacao.offset) || 0, 0);
      finalQuery += ` LIMIT $${count} OFFSET $${count + 1}`;
      values.push(safeLimit, safeOffset);
    }

    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
    const countValues = values.slice(0, values.length - (paginacao ? 2 : 0));

    const [res, countRes] = await Promise.all([
      pool.query(finalQuery, values),
      pool.query(countQuery, countValues)
    ]);

    return {
      dados: res.rows.map(row => this.mapConta(row)),
      total: parseInt(countRes.rows[0].total, 10)
    };
  }

  async buscarPorId(id: number, usuarioId: number): Promise<ContaPagar | null> {
    const query = `
      SELECT
        cp.*,
        f.nome as fornecedor_nome,
        pc.nome as plano_conta_nome,
        pc.conta_mae as plano_conta_mae,
        cc.nome as centro_custo_nome,
        fp.nome as forma_pagamento_nome,
        cb.nome as conta_bancaria_nome
      FROM contas_pagar cp
      LEFT JOIN fornecedores f ON cp.fornecedor_id = f.id
      LEFT JOIN plano_contas pc ON cp.plano_conta_id = pc.id
      LEFT JOIN centro_custos cc ON cp.centro_custo_id = cc.id
      LEFT JOIN formas_pagamento fp ON cp.forma_pagamento_id = fp.id
      LEFT JOIN contas_bancarias cb ON cp.conta_bancaria_id = cb.id
      WHERE cp.id = $1 AND cp.usuario_id = $2
    `;

    const res = await pool.query(query, [id, usuarioId]);
    if (res.rows.length === 0) return null;

    const parcelas = await this.listarParcelas(id, usuarioId);
    return {
      ...this.mapConta(res.rows[0]),
      parcelas,
    };
  }

  async atualizar(id: number, usuarioId: number, dados: ContaPagar): Promise<ContaPagar | null> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const query = `
        UPDATE contas_pagar
        SET
          fornecedor_id = $1,
          descricao = $2,
          valor_total = $3,
          data_vencimento = $4,
          data_pagamento = $5,
          status = $6,
          categoria_despesa = $7,
          observacao = $8,
          plano_conta_id = $9,
          centro_custo_id = $10,
          forma_pagamento_id = $11,
          conta_bancaria_id = $12,
          pagamento_quitado = $13,
          data_compensacao = $14,
          parcelamento_recorrencia_ativo = $15,
          tipo_parcela = $16,
          repeticao = $17,
          quantidade_parcelas = $18,
          data_primeira_parcela = $19,
          atualizado_em = NOW()
        WHERE id = $20 AND usuario_id = $21
        RETURNING id
      `;

      const res = await client.query(query, [
        dados.fornecedor_id || null,
        dados.descricao,
        dados.valor_total,
        dados.data_vencimento,
        dados.data_pagamento || null,
        dados.status || 'pendente',
        dados.categoria_despesa || null,
        dados.observacao || null,
        dados.plano_conta_id || null,
        dados.centro_custo_id || null,
        dados.forma_pagamento_id || null,
        dados.conta_bancaria_id || null,
        dados.pagamento_quitado ?? false,
        dados.data_compensacao || null,
        dados.parcelamento_recorrencia_ativo ?? false,
        dados.parcelamento_recorrencia_ativo ? dados.tipo_parcela || null : null,
        dados.parcelamento_recorrencia_ativo ? dados.repeticao || null : null,
        dados.parcelamento_recorrencia_ativo ? dados.quantidade_parcelas || null : null,
        dados.parcelamento_recorrencia_ativo ? dados.data_primeira_parcela || null : null,
        id,
        usuarioId,
      ]);

      if (!res.rows[0]) {
        await client.query('ROLLBACK');
        return null;
      }

      if (!dados.parcelamento_recorrencia_ativo) {
        const pagas = await client.query(
          `SELECT COUNT(*)::int as total FROM contas_pagar_parcelas WHERE conta_pagar_id = $1 AND usuario_id = $2 AND pago = true`,
          [id, usuarioId]
        );
        if (pagas.rows[0].total > 0) {
          throw new Error('Nao e possivel remover parcelamento com parcelas ja pagas.');
        }
        await client.query(`DELETE FROM contas_pagar_parcelas WHERE conta_pagar_id = $1 AND usuario_id = $2`, [id, usuarioId]);
      } else {
        const pagas = await client.query(
          `SELECT id FROM contas_pagar_parcelas WHERE conta_pagar_id = $1 AND usuario_id = $2 AND pago = true`,
          [id, usuarioId]
        );
        const idsPayload = new Set((dados.parcelas || []).filter((p) => p.id).map((p) => Number(p.id)));
        const parcelaPagaRemovida = pagas.rows.some((row) => !idsPayload.has(Number(row.id)));
        if (parcelaPagaRemovida) {
          throw new Error('Nao e possivel remover parcelas ja pagas.');
        }

        await client.query(`DELETE FROM contas_pagar_parcelas WHERE conta_pagar_id = $1 AND usuario_id = $2 AND pago = false`, [id, usuarioId]);
        if (dados.parcelas?.length) {
          const parcelasNovasOuAbertas = dados.parcelas.filter((parcela) => !parcela.id || !parcela.pago);
          await this.salvarParcelas(client, id, usuarioId, parcelasNovasOuAbertas);
        }
      }

      await client.query('COMMIT');
      return this.buscarPorId(id, usuarioId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async atualizarStatus(id: number, usuarioId: number, status: string, dataPagamento?: string | null): Promise<void> {
    const query = `
      UPDATE contas_pagar
      SET status = $1, data_pagamento = $2, pagamento_quitado = $3, data_compensacao = $4, atualizado_em = NOW()
      WHERE id = $5 AND usuario_id = $6
    `;
    await pool.query(query, [status, dataPagamento || null, status === 'pago', dataPagamento || null, id, usuarioId]);
  }

  async excluir(id: number, usuarioId: number): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM contas_pagar_parcelas WHERE conta_pagar_id = $1 AND usuario_id = $2`, [id, usuarioId]);
      await client.query(`DELETE FROM contas_pagar WHERE id = $1 AND usuario_id = $2`, [id, usuarioId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async listarParcelas(contaPagarId: number, usuarioId: number): Promise<ContaPagarParcela[]> {
    const res = await pool.query(
      `SELECT
        cpp.*,
        fp.nome as forma_pagamento_nome,
        cb.nome as conta_bancaria_nome
      FROM contas_pagar_parcelas cpp
      INNER JOIN formas_pagamento fp ON cpp.forma_pagamento_id = fp.id
      LEFT JOIN contas_bancarias cb ON cpp.conta_bancaria_id = cb.id
      WHERE cpp.conta_pagar_id = $1 AND cpp.usuario_id = $2
      ORDER BY cpp.numero_parcela ASC`,
      [contaPagarId, usuarioId]
    );

    return res.rows.map((row) => ({
      ...row,
      valor: Number(row.valor),
      pago: Boolean(row.pago),
    }));
  }

  private async salvarParcelas(client: any, contaPagarId: number, usuarioId: number, parcelas: ContaPagarParcela[]) {
    for (const parcela of parcelas) {
      await client.query(
        `INSERT INTO contas_pagar_parcelas (
          usuario_id, conta_pagar_id, numero_parcela, data_vencimento,
          valor, forma_pagamento_id, conta_bancaria_id, pago, observacao
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (conta_pagar_id, numero_parcela)
        DO UPDATE SET
          data_vencimento = EXCLUDED.data_vencimento,
          valor = EXCLUDED.valor,
          forma_pagamento_id = EXCLUDED.forma_pagamento_id,
          conta_bancaria_id = EXCLUDED.conta_bancaria_id,
          pago = EXCLUDED.pago,
          observacao = EXCLUDED.observacao,
          atualizado_em = NOW()`,
        [
          usuarioId,
          contaPagarId,
          parcela.numero_parcela,
          parcela.data_vencimento,
          parcela.valor,
          parcela.forma_pagamento_id,
          parcela.conta_bancaria_id || null,
          parcela.pago ?? false,
          parcela.observacao || null,
        ]
      );
    }
  }

  private mapConta(row: any): ContaPagar {
    return {
      ...row,
      valor_total: Number(row.valor_total),
      pagamento_quitado: Boolean(row.pagamento_quitado),
      parcelamento_recorrencia_ativo: Boolean(row.parcelamento_recorrencia_ativo),
      possui_parcelas: Boolean(row.possui_parcelas),
    };
  }
}
