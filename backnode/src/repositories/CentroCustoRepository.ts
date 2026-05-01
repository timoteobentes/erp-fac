import pool from "../config/database";
import { BaseRepository } from "./BaseRepository";
import { CentroCusto } from "../models/CentroCusto";

export interface FiltrosCentroCusto {
  status?: string;
  termo?: string;
}

export class CentroCustoRepository extends BaseRepository {
  async criar(dados: CentroCusto, usuarioId: number): Promise<number> {
    const query = `
      INSERT INTO centro_custos (usuario_id, nome, status)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const res = await pool.query(query, [usuarioId, dados.nome, dados.status]);
    return res.rows[0].id;
  }

  async listar(usuarioId: number, filtros: FiltrosCentroCusto, paginacao?: { limit: number; offset: number }) {
    let query = `
      SELECT *
      FROM centro_custos
      WHERE usuario_id = $1
    `;
    const values: Array<string | number> = [usuarioId];
    let count = 2;

    if (filtros.status) {
      query += ` AND status = $${count}`;
      values.push(filtros.status);
      count++;
    }

    if (filtros.termo) {
      query += ` AND nome ILIKE $${count}`;
      values.push(`%${filtros.termo}%`);
      count++;
    }

    let finalQuery = query + " ORDER BY nome ASC";

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
      dados: res.rows,
      total: parseInt(countRes.rows[0].total, 10),
    };
  }

  async buscarPorId(id: number, usuarioId: number): Promise<CentroCusto | null> {
    const res = await pool.query("SELECT * FROM centro_custos WHERE id = $1 AND usuario_id = $2", [id, usuarioId]);
    return res.rows[0] || null;
  }

  async atualizar(id: number, usuarioId: number, dados: Partial<CentroCusto>): Promise<CentroCusto | null> {
    const camposAtualizados: string[] = [];
    const valores: Array<string | number> = [];
    let queryIndex = 1;

    if (dados.nome !== undefined) {
      camposAtualizados.push(`nome = $${queryIndex++}`);
      valores.push(dados.nome);
    }

    if (dados.status !== undefined) {
      camposAtualizados.push(`status = $${queryIndex++}`);
      valores.push(dados.status);
    }

    if (camposAtualizados.length === 0) return null;

    camposAtualizados.push("atualizado_em = NOW()");
    valores.push(id, usuarioId);

    const query = `
      UPDATE centro_custos
      SET ${camposAtualizados.join(", ")}
      WHERE id = $${queryIndex++} AND usuario_id = $${queryIndex++}
      RETURNING *
    `;

    const res = await pool.query(query, valores);
    return res.rows[0] || null;
  }

  async excluir(id: number, usuarioId: number): Promise<void> {
    await pool.query("DELETE FROM centro_custos WHERE id = $1 AND usuario_id = $2", [id, usuarioId]);
  }
}
