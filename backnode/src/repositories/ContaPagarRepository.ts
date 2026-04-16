import pool from '../config/database';
import { BaseRepository } from './BaseRepository';
import { ContaPagar } from '../models/ContaPagar';

export interface FiltrosContaPagar {
  status?: string;
  data_vencimento_inicio?: string;
  data_vencimento_fim?: string;
  fornecedor_id?: number;
}

export class ContaPagarRepository extends BaseRepository {
  
  // ==========================================
  // 1. CRIAR
  // ==========================================
  async criar(dados: ContaPagar, usuarioId: number): Promise<number> {
    const query = `
      INSERT INTO contas_pagar (
        usuario_id, fornecedor_id, descricao, valor_total,
        data_vencimento, status, categoria_despesa, observacao
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      ) RETURNING id
    `;
    const values = [
      usuarioId,
      dados.fornecedor_id || null,
      dados.descricao,
      dados.valor_total,
      dados.data_vencimento,
      dados.status || 'pendente',
      dados.categoria_despesa || null,
      dados.observacao || null
    ];

    const res = await pool.query(query, values);
    return res.rows[0].id;
  }

  // ==========================================
  // 2. LISTAR COM FILTROS (MVP)
  // ==========================================
  async listar(usuarioId: number, filtros: FiltrosContaPagar, paginacao?: { limit: number, offset: number }) {
    let query = `
      SELECT 
        cp.*,
        f.nome as fornecedor_nome
      FROM contas_pagar cp
      LEFT JOIN clientes f ON cp.fornecedor_id = f.id
      WHERE cp.usuario_id = $1
    `; // Assumindo que fornecedores também estão na tabela clientes/fornecedores
    const values: any[] = [usuarioId];
    let count = 2;

    if (filtros.status) {
      query += ` AND cp.status = $${count}`;
      values.push(filtros.status);
      count++;
    }
    if (filtros.fornecedor_id) {
      query += ` AND cp.fornecedor_id = $${count}`;
      values.push(filtros.fornecedor_id);
      count++;
    }
    if (filtros.data_vencimento_inicio) {
      query += ` AND cp.data_vencimento >= $${count}`;
      values.push(filtros.data_vencimento_inicio);
      count++;
    }
    if (filtros.data_vencimento_fim) {
      query += ` AND cp.data_vencimento <= $${count}`;
      values.push(filtros.data_vencimento_fim);
      count++;
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
  async buscarPorId(id: number, usuarioId: number): Promise<ContaPagar | null> {
    const res = await pool.query(
      `SELECT * FROM contas_pagar WHERE id = $1 AND usuario_id = $2`,
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
  async atualizarStatus(id: number, usuarioId: number, status: string, dataPagamento?: string | null): Promise<void> {
    const query = `
      UPDATE contas_pagar 
      SET status = $1, data_pagamento = $2, atualizado_em = NOW()
      WHERE id = $3 AND usuario_id = $4
    `;
    await pool.query(query, [status, dataPagamento || null, id, usuarioId]);
  }

  // ==========================================
  // 5. EXCLUIR
  // ==========================================
  async excluir(id: number, usuarioId: number): Promise<void> {
    await pool.query(
      `DELETE FROM contas_pagar WHERE id = $1 AND usuario_id = $2`,
      [id, usuarioId]
    );
  }
}
