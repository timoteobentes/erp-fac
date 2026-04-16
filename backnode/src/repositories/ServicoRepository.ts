import pool from '../config/database';
import { Servico } from '../models/Servico';

export class ServicoRepository {
  async listar(usuario_id: number, paginacao?: { limit: number, offset: number }) {
    let query = 'SELECT * FROM servicos WHERE usuario_id = $1';
    const values: any[] = [usuario_id];
    let count = 1;

    let finalQuery = query + ' ORDER BY id DESC';

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
      dados: res.rows,
      total: parseInt(countRes.rows[0].total)
    };
  }

  async buscarPorId(id: number, usuario_id: number): Promise<Servico | null> {
    const { rows } = await pool.query(
      'SELECT * FROM servicos WHERE id = $1 AND usuario_id = $2',
      [id, usuario_id]
    );
    return rows[0] || null;
  }

  async criar(servico: Omit<Servico, 'id' | 'created_at' | 'updated_at'>): Promise<Servico> {
    const { usuario_id, nome, codigo_lc116, codigo_tributacao_nacional, cnae, aliquota_iss, valor_padrao, ativo } = servico;
    const { rows } = await pool.query(
      `INSERT INTO servicos 
        (usuario_id, nome, codigo_lc116, codigo_tributacao_nacional, cnae, aliquota_iss, valor_padrao, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [usuario_id, nome, codigo_lc116, codigo_tributacao_nacional, cnae, aliquota_iss, valor_padrao || 0, ativo ?? true]
    );
    return rows[0];
  }

  async atualizar(id: number, usuario_id: number, servico: Partial<Servico>): Promise<Servico | null> {
    const camposAtualizados = [];
    const valores = [];
    let queryIndex = 1;

    if (servico.nome !== undefined) {
      camposAtualizados.push(`nome = $${queryIndex++}`);
      valores.push(servico.nome);
    }
    if (servico.codigo_lc116 !== undefined) {
      camposAtualizados.push(`codigo_lc116 = $${queryIndex++}`);
      valores.push(servico.codigo_lc116);
    }
    if (servico.codigo_tributacao_nacional !== undefined) {
      camposAtualizados.push(`codigo_tributacao_nacional = $${queryIndex++}`);
      valores.push(servico.codigo_tributacao_nacional);
    }
    if (servico.cnae !== undefined) {
      camposAtualizados.push(`cnae = $${queryIndex++}`);
      valores.push(servico.cnae);
    }
    if (servico.aliquota_iss !== undefined) {
      camposAtualizados.push(`aliquota_iss = $${queryIndex++}`);
      valores.push(servico.aliquota_iss);
    }
    if (servico.valor_padrao !== undefined) {
      camposAtualizados.push(`valor_padrao = $${queryIndex++}`);
      valores.push(servico.valor_padrao);
    }
    if (servico.ativo !== undefined) {
      camposAtualizados.push(`ativo = $${queryIndex++}`);
      valores.push(servico.ativo);
    }

    if (camposAtualizados.length === 0) return null;

    camposAtualizados.push(`updated_at = CURRENT_TIMESTAMP`);

    valores.push(id);
    valores.push(usuario_id);

    const query = `
      UPDATE servicos SET ${camposAtualizados.join(', ')}
      WHERE id = $${queryIndex++} AND usuario_id = $${queryIndex++}
      RETURNING *
    `;

    const { rows } = await pool.query(query, valores);
    return rows[0] || null;
  }

  async deletar(id: number, usuario_id: number): Promise<boolean> {
    const { rowCount } = await pool.query(
      'DELETE FROM servicos WHERE id = $1 AND usuario_id = $2',
      [id, usuario_id]
    );
    return (rowCount ?? 0) > 0;
  }
}
