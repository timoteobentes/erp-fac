import { PoolClient } from 'pg';
import pool from '../config/database';
import { BaseRepository } from './BaseRepository';
import { MovimentacaoEstoque } from '../models/MovimentacaoEstoque';

export class EstoqueRepository extends BaseRepository {

  // ============================================================================
  // 1. LISTAR HISTÓRICO
  // ============================================================================
  async listarHistoricoProduto(produtoId: number, usuarioId: number): Promise<MovimentacaoEstoque[]> {
    const query = `
      SELECT 
        m.id, m.usuario_id, m.produto_id, m.tipo, m.quantidade, m.saldo_apos,
        m.origem, m.observacao, m.criado_em,
        u.nome_empresa as usuario_nome
      FROM movimentacoes_estoque m
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.produto_id = $1 AND m.usuario_id = $2
      ORDER BY m.criado_em DESC
    `;
    
    const res = await pool.query(query, [produtoId, usuarioId]);
    
    return res.rows.map(row => ({
      ...row,
      quantidade: Number(row.quantidade),
      saldo_apos: Number(row.saldo_apos)
    }));
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
