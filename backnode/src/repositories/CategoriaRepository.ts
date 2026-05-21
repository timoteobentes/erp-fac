import pool from '../config/database';
import { Categoria } from '../models/Categoria';

export interface FiltrosCategoria {
  nome?: string;
  page?: number | string;
  limit?: number | string;
}

export class CategoriaRepository {
  async criar(dados: Categoria, usuarioId: number): Promise<number> {
    const result = await pool.query(
      `INSERT INTO categorias (usuario_id, nome, ativa)
       VALUES ($1, $2, true)
       RETURNING id`,
      [usuarioId, dados.nome]
    );
    return result.rows[0].id;
  }

  async atualizar(id: number, dados: Categoria, usuarioId: number): Promise<void> {
    await pool.query(
      `UPDATE categorias
       SET nome = $1, atualizado_em = NOW()
       WHERE id = $2 AND usuario_id = $3 AND ativa = true`,
      [dados.nome, id, usuarioId]
    );
  }

  async buscarPorId(id: number, usuarioId: number) {
    const result = await pool.query(
      `SELECT id, nome, ativa, criado_em, atualizado_em
       FROM categorias
       WHERE id = $1 AND usuario_id = $2`,
      [id, usuarioId]
    );
    return result.rows[0] || null;
  }

  async listar(usuarioId: number, filtros: FiltrosCategoria = {}, paginacao?: { limit: number; offset: number }) {
    let query = `
      SELECT id, nome, ativa, criado_em, atualizado_em
      FROM categorias
      WHERE usuario_id = $1 AND ativa = true
    `;
    const values: any[] = [usuarioId];
    let count = 2;

    if (filtros.nome) {
      query += ` AND nome ILIKE $${count}`;
      values.push(`%${filtros.nome}%`);
      count++;
    }

    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
    let finalQuery = `${query} ORDER BY nome ASC`;

    if (paginacao) {
      finalQuery += ` LIMIT $${count} OFFSET $${count + 1}`;
      values.push(Math.min(Number(paginacao.limit) || 500, 500), Math.max(Number(paginacao.offset) || 0, 0));
    }

    const countValues = paginacao ? values.slice(0, -2) : values;
    const [dados, total] = await Promise.all([
      pool.query(finalQuery, values),
      pool.query(countQuery, countValues)
    ]);

    return {
      categorias: dados.rows,
      total: Number(total.rows[0].total)
    };
  }

  async excluir(id: number, usuarioId: number): Promise<void> {
    await pool.query(
      `UPDATE categorias SET ativa = false, atualizado_em = NOW() WHERE id = $1 AND usuario_id = $2`,
      [id, usuarioId]
    );
  }

  async existeNome(nome: string, usuarioId: number, ignorarId?: number): Promise<boolean> {
    const params: any[] = [usuarioId, nome];
    let query = `
      SELECT id
      FROM categorias
      WHERE usuario_id = $1 AND LOWER(nome) = LOWER($2) AND ativa = true
    `;

    if (ignorarId) {
      query += ` AND id != $3`;
      params.push(ignorarId);
    }

    const result = await pool.query(query, params);
    return (result.rowCount || 0) > 0;
  }
}
