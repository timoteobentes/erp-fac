import pool from "../config/database";
import { BaseRepository } from "./BaseRepository";
import { PlanoConta } from "../models/PlanoConta";

export interface FiltrosPlanoConta {
  conta_mae?: string;
  termo?: string;
}

export class PlanoContaRepository extends BaseRepository {
  async criar(dados: PlanoConta, usuarioId: number): Promise<number> {
    const query = `
      INSERT INTO plano_contas (usuario_id, conta_mae, nome)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const res = await pool.query(query, [usuarioId, dados.conta_mae, dados.nome]);
    return res.rows[0].id;
  }

  async listar(usuarioId: number, filtros: FiltrosPlanoConta, paginacao?: { limit: number; offset: number }) {
    let query = `
      SELECT *
      FROM plano_contas
      WHERE usuario_id = $1
    `;
    const values: Array<string | number> = [usuarioId];
    let count = 2;

    if (filtros.conta_mae) {
      query += ` AND conta_mae = $${count}`;
      values.push(filtros.conta_mae);
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

  async buscarPorId(id: number, usuarioId: number): Promise<PlanoConta | null> {
    const res = await pool.query("SELECT * FROM plano_contas WHERE id = $1 AND usuario_id = $2", [id, usuarioId]);
    return res.rows[0] || null;
  }

  async atualizar(id: number, usuarioId: number, dados: Partial<PlanoConta>): Promise<PlanoConta | null> {
    const camposAtualizados: string[] = [];
    const valores: Array<string | number> = [];
    let queryIndex = 1;

    if (dados.conta_mae !== undefined) {
      camposAtualizados.push(`conta_mae = $${queryIndex++}`);
      valores.push(dados.conta_mae);
    }

    if (dados.nome !== undefined) {
      camposAtualizados.push(`nome = $${queryIndex++}`);
      valores.push(dados.nome);
    }

    if (camposAtualizados.length === 0) return null;

    camposAtualizados.push("atualizado_em = NOW()");
    valores.push(id, usuarioId);

    const query = `
      UPDATE plano_contas
      SET ${camposAtualizados.join(", ")}
      WHERE id = $${queryIndex++} AND usuario_id = $${queryIndex++}
      RETURNING *
    `;

    const res = await pool.query(query, valores);
    return res.rows[0] || null;
  }

  async excluir(id: number, usuarioId: number): Promise<void> {
    await pool.query("DELETE FROM plano_contas WHERE id = $1 AND usuario_id = $2", [id, usuarioId]);
  }
}
