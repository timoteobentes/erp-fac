import pool from "../config/database";
import { BaseRepository } from "./BaseRepository";
import { ContaBancaria } from "../models/ContaBancaria";

export interface FiltrosContaBancaria {
  termo?: string;
}

export class ContaBancariaRepository extends BaseRepository {
  async criar(dados: ContaBancaria, usuarioId: number): Promise<number> {
    const query = `
      INSERT INTO contas_bancarias (usuario_id, nome, saldo_inicial, data_saldo)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const res = await pool.query(query, [usuarioId, dados.nome, dados.saldo_inicial, dados.data_saldo]);
    return res.rows[0].id;
  }

  async listar(usuarioId: number, filtros: FiltrosContaBancaria, paginacao?: { limit: number; offset: number }) {
    let query = `
      SELECT *
      FROM contas_bancarias
      WHERE usuario_id = $1
    `;
    const values: Array<string | number> = [usuarioId];
    let count = 2;

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
      dados: res.rows.map((row) => ({
        ...row,
        saldo_inicial: Number(row.saldo_inicial),
      })),
      total: parseInt(countRes.rows[0].total, 10),
    };
  }

  async buscarPorId(id: number, usuarioId: number): Promise<ContaBancaria | null> {
    const res = await pool.query("SELECT * FROM contas_bancarias WHERE id = $1 AND usuario_id = $2", [id, usuarioId]);
    if (!res.rows[0]) return null;
    return { ...res.rows[0], saldo_inicial: Number(res.rows[0].saldo_inicial) };
  }

  async atualizar(id: number, usuarioId: number, dados: Partial<ContaBancaria>): Promise<ContaBancaria | null> {
    const camposAtualizados: string[] = [];
    const valores: Array<string | number> = [];
    let queryIndex = 1;

    if (dados.nome !== undefined) {
      camposAtualizados.push(`nome = $${queryIndex++}`);
      valores.push(dados.nome);
    }

    if (dados.saldo_inicial !== undefined) {
      camposAtualizados.push(`saldo_inicial = $${queryIndex++}`);
      valores.push(dados.saldo_inicial);
    }

    if (dados.data_saldo !== undefined) {
      camposAtualizados.push(`data_saldo = $${queryIndex++}`);
      valores.push(dados.data_saldo as string);
    }

    if (camposAtualizados.length === 0) return null;

    camposAtualizados.push("atualizado_em = NOW()");
    valores.push(id, usuarioId);

    const query = `
      UPDATE contas_bancarias
      SET ${camposAtualizados.join(", ")}
      WHERE id = $${queryIndex++} AND usuario_id = $${queryIndex++}
      RETURNING *
    `;

    const res = await pool.query(query, valores);
    if (!res.rows[0]) return null;
    return { ...res.rows[0], saldo_inicial: Number(res.rows[0].saldo_inicial) };
  }

  async excluir(id: number, usuarioId: number): Promise<void> {
    await pool.query("DELETE FROM contas_bancarias WHERE id = $1 AND usuario_id = $2", [id, usuarioId]);
  }
}
