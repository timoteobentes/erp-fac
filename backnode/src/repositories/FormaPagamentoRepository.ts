import pool from "../config/database";
import { BaseRepository } from "./BaseRepository";
import { FormaPagamento } from "../models/FormaPagamento";

export interface FiltrosFormaPagamento {
  termo?: string;
  modalidade?: string;
  disponivel_em?: string;
  conta_bancaria_id?: number;
}

export class FormaPagamentoRepository extends BaseRepository {
  async criar(dados: FormaPagamento, usuarioId: number): Promise<number> {
    const query = `
      INSERT INTO formas_pagamento (
        usuario_id,
        nome,
        conta_bancaria_id,
        disponivel_em,
        confirmacao_automatica,
        numero_maximo_parcelas,
        intervalo_parcelas_dias,
        primeira_parcela_dias,
        taxa_banco,
        taxa_operadora,
        juros_multa,
        juros_mora,
        modalidade
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `;

    const res = await pool.query(query, [
      usuarioId,
      dados.nome,
      dados.conta_bancaria_id,
      dados.disponivel_em,
      dados.confirmacao_automatica,
      dados.numero_maximo_parcelas,
      dados.intervalo_parcelas_dias,
      dados.primeira_parcela_dias,
      dados.taxa_banco,
      dados.taxa_operadora,
      dados.juros_multa,
      dados.juros_mora,
      dados.modalidade,
    ]);

    return res.rows[0].id;
  }

  async listar(usuarioId: number, filtros: FiltrosFormaPagamento, paginacao?: { limit: number; offset: number }) {
    let query = `
      SELECT
        fp.*,
        cb.nome AS conta_bancaria_nome
      FROM formas_pagamento fp
      INNER JOIN contas_bancarias cb ON cb.id = fp.conta_bancaria_id
      WHERE fp.usuario_id = $1
    `;

    const values: Array<string | number> = [usuarioId];
    let count = 2;

    if (filtros.termo) {
      query += ` AND fp.nome ILIKE $${count}`;
      values.push(`%${filtros.termo}%`);
      count++;
    }

    if (filtros.modalidade) {
      query += ` AND fp.modalidade = $${count}`;
      values.push(filtros.modalidade);
      count++;
    }

    if (filtros.disponivel_em) {
      query += ` AND fp.disponivel_em = $${count}`;
      values.push(filtros.disponivel_em);
      count++;
    }

    if (filtros.conta_bancaria_id) {
      query += ` AND fp.conta_bancaria_id = $${count}`;
      values.push(filtros.conta_bancaria_id);
      count++;
    }

    let finalQuery = query + " ORDER BY fp.nome ASC";

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
        taxa_banco: Number(row.taxa_banco),
        taxa_operadora: Number(row.taxa_operadora),
        juros_multa: Number(row.juros_multa),
        juros_mora: Number(row.juros_mora),
      })),
      total: parseInt(countRes.rows[0].total, 10),
    };
  }

  async buscarPorId(id: number, usuarioId: number): Promise<FormaPagamento | null> {
    const query = `
      SELECT
        fp.*,
        cb.nome AS conta_bancaria_nome
      FROM formas_pagamento fp
      INNER JOIN contas_bancarias cb ON cb.id = fp.conta_bancaria_id
      WHERE fp.id = $1
        AND fp.usuario_id = $2
    `;

    const res = await pool.query(query, [id, usuarioId]);
    if (!res.rows[0]) return null;

    return {
      ...res.rows[0],
      taxa_banco: Number(res.rows[0].taxa_banco),
      taxa_operadora: Number(res.rows[0].taxa_operadora),
      juros_multa: Number(res.rows[0].juros_multa),
      juros_mora: Number(res.rows[0].juros_mora),
    };
  }

  async atualizar(id: number, usuarioId: number, dados: Partial<FormaPagamento>): Promise<FormaPagamento | null> {
    const camposAtualizados: string[] = [];
    const valores: Array<string | number> = [];
    let queryIndex = 1;

    if (dados.nome !== undefined) {
      camposAtualizados.push(`nome = $${queryIndex++}`);
      valores.push(dados.nome);
    }

    if (dados.conta_bancaria_id !== undefined) {
      camposAtualizados.push(`conta_bancaria_id = $${queryIndex++}`);
      valores.push(dados.conta_bancaria_id);
    }

    if (dados.disponivel_em !== undefined) {
      camposAtualizados.push(`disponivel_em = $${queryIndex++}`);
      valores.push(dados.disponivel_em);
    }

    if (dados.confirmacao_automatica !== undefined) {
      camposAtualizados.push(`confirmacao_automatica = $${queryIndex++}`);
      valores.push(dados.confirmacao_automatica);
    }

    if (dados.numero_maximo_parcelas !== undefined) {
      camposAtualizados.push(`numero_maximo_parcelas = $${queryIndex++}`);
      valores.push(dados.numero_maximo_parcelas);
    }

    if (dados.intervalo_parcelas_dias !== undefined) {
      camposAtualizados.push(`intervalo_parcelas_dias = $${queryIndex++}`);
      valores.push(dados.intervalo_parcelas_dias);
    }

    if (dados.primeira_parcela_dias !== undefined) {
      camposAtualizados.push(`primeira_parcela_dias = $${queryIndex++}`);
      valores.push(dados.primeira_parcela_dias);
    }

    if (dados.taxa_banco !== undefined) {
      camposAtualizados.push(`taxa_banco = $${queryIndex++}`);
      valores.push(dados.taxa_banco);
    }

    if (dados.taxa_operadora !== undefined) {
      camposAtualizados.push(`taxa_operadora = $${queryIndex++}`);
      valores.push(dados.taxa_operadora);
    }

    if (dados.juros_multa !== undefined) {
      camposAtualizados.push(`juros_multa = $${queryIndex++}`);
      valores.push(dados.juros_multa);
    }

    if (dados.juros_mora !== undefined) {
      camposAtualizados.push(`juros_mora = $${queryIndex++}`);
      valores.push(dados.juros_mora);
    }

    if (dados.modalidade !== undefined) {
      camposAtualizados.push(`modalidade = $${queryIndex++}`);
      valores.push(dados.modalidade);
    }

    if (camposAtualizados.length === 0) return null;

    camposAtualizados.push("atualizado_em = NOW()");
    valores.push(id, usuarioId);

    const query = `
      UPDATE formas_pagamento
      SET ${camposAtualizados.join(", ")}
      WHERE id = $${queryIndex++} AND usuario_id = $${queryIndex++}
      RETURNING *
    `;

    const res = await pool.query(query, valores);
    if (!res.rows[0]) return null;

    return this.buscarPorId(res.rows[0].id, usuarioId);
  }

  async excluir(id: number, usuarioId: number): Promise<void> {
    await pool.query("DELETE FROM formas_pagamento WHERE id = $1 AND usuario_id = $2", [id, usuarioId]);
  }
}
