import pool from "../config/database";
import { BaseRepository } from "./BaseRepository";
import { CategoriaDre } from "../models/CategoriaDre";

export interface FiltrosCategoriaDre {
  grupo?: string;
  tipo?: string;
  ativo?: boolean;
  termo?: string;
}

export class CategoriaDreRepository extends BaseRepository {
  async criar(dados: CategoriaDre, usuarioId: number): Promise<number> {
    const query = `
      INSERT INTO categorias_dre (usuario_id, grupo, nome, tipo, ativo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const res = await pool.query(query, [usuarioId, dados.grupo, dados.nome, dados.tipo, dados.ativo]);
    return res.rows[0].id;
  }

  async listar(usuarioId: number, filtros: FiltrosCategoriaDre, paginacao?: { limit: number; offset: number }) {
    let query = `
      SELECT *
      FROM categorias_dre
      WHERE usuario_id = $1
    `;
    const values: Array<string | number | boolean> = [usuarioId];
    let count = 2;

    if (filtros.grupo) {
      query += ` AND grupo = $${count}`;
      values.push(filtros.grupo);
      count++;
    }

    if (filtros.tipo) {
      query += ` AND tipo = $${count}`;
      values.push(filtros.tipo);
      count++;
    }

    if (typeof filtros.ativo === "boolean") {
      query += ` AND ativo = $${count}`;
      values.push(filtros.ativo);
      count++;
    }

    if (filtros.termo) {
      query += ` AND nome ILIKE $${count}`;
      values.push(`%${filtros.termo}%`);
      count++;
    }

    let finalQuery = query + " ORDER BY grupo ASC, nome ASC, id ASC";

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
      pool.query(countQuery, countValues),
    ]);

    return {
      dados: res.rows.map((row) => ({
        ...row,
        ativo: Boolean(row.ativo),
      })),
      total: parseInt(countRes.rows[0].total, 10),
    };
  }

  async listarAtivas(usuarioId: number): Promise<CategoriaDre[]> {
    const res = await pool.query(
      `
        SELECT *
        FROM categorias_dre
        WHERE usuario_id = $1
          AND ativo = true
        ORDER BY grupo ASC, nome ASC, id ASC
      `,
      [usuarioId]
    );

    return res.rows.map((row) => ({ ...row, ativo: Boolean(row.ativo) }));
  }

  async buscarPorId(id: number, usuarioId: number): Promise<CategoriaDre | null> {
    const res = await pool.query("SELECT * FROM categorias_dre WHERE id = $1 AND usuario_id = $2", [id, usuarioId]);
    if (!res.rows[0]) return null;
    return { ...res.rows[0], ativo: Boolean(res.rows[0].ativo) };
  }

  async atualizar(id: number, usuarioId: number, dados: Partial<CategoriaDre>): Promise<CategoriaDre | null> {
    const camposAtualizados: string[] = [];
    const valores: Array<string | number | boolean> = [];
    let queryIndex = 1;

    if (dados.grupo !== undefined) {
      camposAtualizados.push(`grupo = $${queryIndex++}`);
      valores.push(dados.grupo);
    }

    if (dados.nome !== undefined) {
      camposAtualizados.push(`nome = $${queryIndex++}`);
      valores.push(dados.nome);
    }

    if (dados.tipo !== undefined) {
      camposAtualizados.push(`tipo = $${queryIndex++}`);
      valores.push(dados.tipo);
    }

    if (dados.ativo !== undefined) {
      camposAtualizados.push(`ativo = $${queryIndex++}`);
      valores.push(dados.ativo);
    }

    if (camposAtualizados.length === 0) return null;

    camposAtualizados.push("atualizado_em = NOW()");
    valores.push(id, usuarioId);

    const query = `
      UPDATE categorias_dre
      SET ${camposAtualizados.join(", ")}
      WHERE id = $${queryIndex++} AND usuario_id = $${queryIndex++}
      RETURNING *
    `;

    const res = await pool.query(query, valores);
    if (!res.rows[0]) return null;
    return { ...res.rows[0], ativo: Boolean(res.rows[0].ativo) };
  }

  async excluir(id: number, usuarioId: number): Promise<void> {
    await pool.query("DELETE FROM categorias_dre WHERE id = $1 AND usuario_id = $2", [id, usuarioId]);
  }
}
