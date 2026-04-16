import pool from '../config/database';
import { BaseRepository } from './BaseRepository';
import { ContaReceber } from '../models/ContaReceber';

export interface FiltrosContaReceber {
  status?: string;
  data_vencimento_inicio?: string;
  data_vencimento_fim?: string;
  cliente_id?: number;
}

export class ContaReceberRepository extends BaseRepository {
  
  // ==========================================
  // 1. CRIAR
  // ==========================================
  async criar(dados: ContaReceber, usuarioId: number): Promise<number> {
    const query = `
      INSERT INTO contas_receber (
        usuario_id, cliente_id, venda_id, descricao, valor_total,
        data_vencimento, status, forma_pagamento, observacao
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING id
    `;
    const values = [
      usuarioId,
      dados.cliente_id || null,
      dados.venda_id || null,
      dados.descricao,
      dados.valor_total,
      dados.data_vencimento,
      dados.status || 'pendente',
      dados.forma_pagamento || null,
      dados.observacao || null
    ];

    const res = await pool.query(query, values);
    return res.rows[0].id;
  }

  // ==========================================
  // 2. LISTAR COM FILTROS (MVP)
  // ==========================================
  async listar(usuarioId: number, filtros: FiltrosContaReceber, paginacao?: { limit: number, offset: number }) {
    let query = `
      SELECT 
        cr.*,
        c.nome as cliente_nome
      FROM contas_receber cr
      LEFT JOIN clientes c ON cr.cliente_id = c.id
      WHERE cr.usuario_id = $1
    `;
    const values: any[] = [usuarioId];
    let count = 2;

    if (filtros.status) {
      query += ` AND cr.status = $${count}`;
      values.push(filtros.status);
      count++;
    }
    if (filtros.cliente_id) {
      query += ` AND cr.cliente_id = $${count}`;
      values.push(filtros.cliente_id);
      count++;
    }
    if (filtros.data_vencimento_inicio) {
      query += ` AND cr.data_vencimento >= $${count}`;
      values.push(filtros.data_vencimento_inicio);
      count++;
    }
    if (filtros.data_vencimento_fim) {
      query += ` AND cr.data_vencimento <= $${count}`;
      values.push(filtros.data_vencimento_fim);
      count++;
    }

    let finalQuery = query + ` ORDER BY cr.data_vencimento ASC`;

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
      dados: res.rows.map(row => ({
        ...row,
        valor_total: Number(row.valor_total)
      })),
      total: parseInt(countRes.rows[0].total)
    };
  }

  // ==========================================
  // 3. BUSCAR POR ID
  // ==========================================
  async buscarPorId(id: number, usuarioId: number): Promise<ContaReceber | null> {
    const res = await pool.query(
      `SELECT * FROM contas_receber WHERE id = $1 AND usuario_id = $2`,
      [id, usuarioId]
    );

    if (res.rows.length === 0) return null;
    
    const conta = res.rows[0];
    return {
      ...conta,
      valor_total: Number(conta.valor_total)
    };
  }

  // ==========================================
  // 4. ATUALIZAR STATUS (DAR BAIXA OU CANCELAR)
  // ==========================================
  async atualizarStatus(id: number, usuarioId: number, status: string, dataRecebimento?: string | null): Promise<void> {
    const query = `
      UPDATE contas_receber 
      SET status = $1, data_recebimento = $2, atualizado_em = NOW()
      WHERE id = $3 AND usuario_id = $4
    `;
    await pool.query(query, [status, dataRecebimento || null, id, usuarioId]);
  }

  // ==========================================
  // 5. EXCLUIR
  // ==========================================
  async excluir(id: number, usuarioId: number): Promise<void> {
    await pool.query(
      `DELETE FROM contas_receber WHERE id = $1 AND usuario_id = $2`,
      [id, usuarioId]
    );
  }
}
