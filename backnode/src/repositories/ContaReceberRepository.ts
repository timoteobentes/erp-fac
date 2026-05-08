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
        data_vencimento, status, forma_pagamento, observacao,
        plano_conta_id, centro_custo_id, forma_pagamento_id, conta_bancaria_id,
        recebimento_quitado, data_compensacao, entidade_tipo, entidade_id,
        data_competencia, informacoes_complementares, anexos
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20
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
      dados.observacao || null,
      dados.plano_conta_id || null,
      dados.centro_custo_id || null,
      dados.forma_pagamento_id || null,
      dados.conta_bancaria_id || null,
      dados.recebimento_quitado ?? false,
      dados.data_compensacao || null,
      dados.entidade_tipo || null,
      dados.entidade_id || null,
      dados.data_competencia || null,
      dados.informacoes_complementares || null,
      dados.anexos ? JSON.stringify(dados.anexos) : null,
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
        c.nome as cliente_nome,
        pc.nome as plano_conta_nome,
        cc.nome as centro_custo_nome,
        fp.nome as forma_pagamento_nome_relacionada,
        cb.nome as conta_bancaria_nome,
        CASE
          WHEN cr.entidade_tipo = 'cliente' THEN c.nome
          WHEN cr.entidade_tipo = 'fornecedor' THEN f.nome
          ELSE NULL
        END as entidade_nome
      FROM contas_receber cr
      LEFT JOIN clientes c ON cr.cliente_id = c.id
      LEFT JOIN fornecedores f ON cr.entidade_tipo = 'fornecedor' AND cr.entidade_id = f.id
      LEFT JOIN plano_contas pc ON cr.plano_conta_id = pc.id
      LEFT JOIN centro_custos cc ON cr.centro_custo_id = cc.id
      LEFT JOIN formas_pagamento fp ON cr.forma_pagamento_id = fp.id
      LEFT JOIN contas_bancarias cb ON cr.conta_bancaria_id = cb.id
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
        valor_total: Number(row.valor_total),
        recebimento_quitado: Boolean(row.recebimento_quitado),
        anexos: Array.isArray(row.anexos) ? row.anexos : [],
      })),
      total: parseInt(countRes.rows[0].total)
    };
  }

  // ==========================================
  // 3. BUSCAR POR ID
  // ==========================================
  async buscarPorId(id: number, usuarioId: number): Promise<ContaReceber | null> {
    const res = await pool.query(
      `SELECT
        cr.*,
        c.nome as cliente_nome,
        pc.nome as plano_conta_nome,
        cc.nome as centro_custo_nome,
        fp.nome as forma_pagamento_nome_relacionada,
        cb.nome as conta_bancaria_nome,
        CASE
          WHEN cr.entidade_tipo = 'cliente' THEN c.nome
          WHEN cr.entidade_tipo = 'fornecedor' THEN f.nome
          ELSE NULL
        END as entidade_nome
      FROM contas_receber cr
      LEFT JOIN clientes c ON cr.cliente_id = c.id
      LEFT JOIN fornecedores f ON cr.entidade_tipo = 'fornecedor' AND cr.entidade_id = f.id
      LEFT JOIN plano_contas pc ON cr.plano_conta_id = pc.id
      LEFT JOIN centro_custos cc ON cr.centro_custo_id = cc.id
      LEFT JOIN formas_pagamento fp ON cr.forma_pagamento_id = fp.id
      LEFT JOIN contas_bancarias cb ON cr.conta_bancaria_id = cb.id
      WHERE cr.id = $1 AND cr.usuario_id = $2`,
      [id, usuarioId]
    );

    if (res.rows.length === 0) return null;
    
    const conta = res.rows[0];
    return {
      ...conta,
      valor_total: Number(conta.valor_total),
      recebimento_quitado: Boolean(conta.recebimento_quitado),
      anexos: Array.isArray(conta.anexos) ? conta.anexos : [],
    };
  }

  async atualizar(id: number, usuarioId: number, dados: Partial<ContaReceber>): Promise<ContaReceber | null> {
    const camposAtualizados: string[] = [];
    const valores: unknown[] = [];
    let queryIndex = 1;

    const adicionarCampo = (campo: string, valor: unknown) => {
      camposAtualizados.push(`${campo} = $${queryIndex++}`);
      valores.push(valor);
    };

    if (dados.cliente_id !== undefined) adicionarCampo('cliente_id', dados.cliente_id);
    if (dados.venda_id !== undefined) adicionarCampo('venda_id', dados.venda_id);
    if (dados.descricao !== undefined) adicionarCampo('descricao', dados.descricao);
    if (dados.valor_total !== undefined) adicionarCampo('valor_total', dados.valor_total);
    if (dados.data_vencimento !== undefined) adicionarCampo('data_vencimento', dados.data_vencimento);
    if (dados.data_recebimento !== undefined) adicionarCampo('data_recebimento', dados.data_recebimento);
    if (dados.status !== undefined) adicionarCampo('status', dados.status);
    if (dados.forma_pagamento !== undefined) adicionarCampo('forma_pagamento', dados.forma_pagamento);
    if (dados.observacao !== undefined) adicionarCampo('observacao', dados.observacao);
    if (dados.plano_conta_id !== undefined) adicionarCampo('plano_conta_id', dados.plano_conta_id);
    if (dados.centro_custo_id !== undefined) adicionarCampo('centro_custo_id', dados.centro_custo_id);
    if (dados.forma_pagamento_id !== undefined) adicionarCampo('forma_pagamento_id', dados.forma_pagamento_id);
    if (dados.conta_bancaria_id !== undefined) adicionarCampo('conta_bancaria_id', dados.conta_bancaria_id);
    if (dados.recebimento_quitado !== undefined) adicionarCampo('recebimento_quitado', dados.recebimento_quitado);
    if (dados.data_compensacao !== undefined) adicionarCampo('data_compensacao', dados.data_compensacao);
    if (dados.entidade_tipo !== undefined) adicionarCampo('entidade_tipo', dados.entidade_tipo);
    if (dados.entidade_id !== undefined) adicionarCampo('entidade_id', dados.entidade_id);
    if (dados.data_competencia !== undefined) adicionarCampo('data_competencia', dados.data_competencia);
    if (dados.informacoes_complementares !== undefined) adicionarCampo('informacoes_complementares', dados.informacoes_complementares);
    if (dados.anexos !== undefined) adicionarCampo('anexos', dados.anexos ? JSON.stringify(dados.anexos) : null);

    if (camposAtualizados.length === 0) {
      return this.buscarPorId(id, usuarioId);
    }

    camposAtualizados.push('atualizado_em = NOW()');
    valores.push(id, usuarioId);

    const query = `
      UPDATE contas_receber
      SET ${camposAtualizados.join(', ')}
      WHERE id = $${queryIndex++} AND usuario_id = $${queryIndex++}
      RETURNING id
    `;

    const res = await pool.query(query, valores);
    if (!res.rows[0]) return null;

    return this.buscarPorId(id, usuarioId);
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
