import { PoolClient } from 'pg';
import pool from '../config/database';
import { BaseRepository } from './BaseRepository';
import { MovimentacaoEstoque } from '../models/MovimentacaoEstoque';

export class EstoqueRepository extends BaseRepository {

  // ============================================================================
  // 1. LISTAR HISTÓRICO
  // ============================================================================
  async listarHistoricoProduto(produtoId: number, usuarioId: number, paginacao?: { limit: number, offset: number }) {
    let query = `
      SELECT 
        m.id, m.usuario_id, m.produto_id, m.tipo, m.quantidade, m.saldo_apos,
        m.origem, m.observacao, m.criado_em,
        u.nome_empresa as usuario_nome
      FROM movimentacoes_estoque m
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.produto_id = $1 AND m.usuario_id = $2
    `;
    const values: any[] = [produtoId, usuarioId];
    let count = 2;
    
    let finalQuery = query + ` ORDER BY m.criado_em DESC`;

    if (paginacao) {
      const safeLimit = Math.min(Number(paginacao.limit) || 500, 500);
      const safeOffset = Math.max(Number(paginacao.offset) || 0, 0);
      finalQuery += ` LIMIT $${count + 1} OFFSET $${count + 2}`;
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
        quantidade: Number(row.quantidade),
        saldo_apos: Number(row.saldo_apos)
      })),
      total: parseInt(countRes.rows[0].total)
    };
  }

  // ============================================================================
  // 1.5 LISTAR HISTÓRICO GLOBAL DA EMPRESA
  // ============================================================================
  async listarHistoricoGlobal(usuarioId: number, paginacao?: { limit: number, offset: number }) {
    let query = `
      SELECT 
        m.id, m.usuario_id, m.produto_id, m.tipo, m.quantidade, m.saldo_apos,
        m.origem, m.observacao, m.criado_em,
        p.nome as produto_nome, p.codigo_interno
      FROM movimentacoes_estoque m
      INNER JOIN produtos p ON m.produto_id = p.id
      WHERE m.usuario_id = $1
    `;
    const values: any[] = [usuarioId];
    let count = 1;

    let finalQuery = query + ` ORDER BY m.criado_em DESC`;

    if (paginacao) {
      const safeLimit = Math.min(Number(paginacao.limit) || 500, 500);
      const safeOffset = Math.max(Number(paginacao.offset) || 0, 0);
      finalQuery += ` LIMIT $${count + 1} OFFSET $${count + 2}`;
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
        quantidade: Number(row.quantidade),
        saldo_apos: Number(row.saldo_apos)
      })),
      total: parseInt(countRes.rows[0].total)
    };
  }

  // ============================================================================
  // 2. REGISTRAR DENTRO DE TRANSAÇÃO (Usado pelo PDV ou Ajuste Manual)
  // ============================================================================
  async registrarMovimentacaoTransaction(client: PoolClient, dados: MovimentacaoEstoque): Promise<void> {
    const query = `
      INSERT INTO movimentacoes_estoque (
        usuario_id, produto_id, tipo, quantidade, saldo_apos, origem, observacao
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
    `;

    const values = [
      dados.usuario_id,
      dados.produto_id,
      dados.tipo,
      dados.quantidade,
      dados.saldo_apos,
      dados.origem,
      dados.observacao || null
    ];

    await client.query(query, values);
  }
}
