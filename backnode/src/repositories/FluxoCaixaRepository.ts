import pool from "../config/database";

export interface FluxoCaixaContaBancariaResumo {
  id: number;
  nome: string;
  saldo_inicial: number;
  data_saldo: string;
  formas_pagamento_vinculadas: number;
}

export interface FluxoCaixaTotaisStatus {
  antes_inicio: number;
  realizado_periodo: number;
  pendente_periodo: number;
  atrasado_periodo: number;
  cancelado_periodo: number;
  quantidade_realizado: number;
  quantidade_pendente: number;
  quantidade_atrasado: number;
  quantidade_cancelado: number;
}

export interface FluxoCaixaMovimentoRaw {
  id: number;
  tipo: "RECEBIMENTO" | "PAGAMENTO";
  origem: "REALIZADO" | "PREVISTO";
  descricao: string;
  pessoa_nome: string | null;
  forma_pagamento: string | null;
  status: string;
  valor: number;
  data_movimento: string;
  data_vencimento: string;
  data_baixa: string | null;
}

export interface FluxoCaixaFormaRecebimento {
  forma_pagamento: string;
  quantidade: number;
  valor_total: number;
}

interface PanoramaFluxoCaixaRaw {
  contasBancarias: FluxoCaixaContaBancariaResumo[];
  totaisContasBancarias: {
    total_ate_inicio: number;
    total_ate_fim: number;
  };
  recebimentos: FluxoCaixaTotaisStatus;
  pagamentos: FluxoCaixaTotaisStatus;
  movimentos: FluxoCaixaMovimentoRaw[];
  formasRecebimento: FluxoCaixaFormaRecebimento[];
  aReceberHoje: number;
  aPagarHoje: number;
}

const toNumber = (value: unknown) => Number(value || 0);
const toInteger = (value: unknown) => parseInt(String(value || 0), 10);

export class FluxoCaixaRepository {
  async obterPanorama(usuarioId: number, dataInicio: string, dataFim: string): Promise<PanoramaFluxoCaixaRaw> {
    const [
      contasBancariasRes,
      totaisContasBancariasRes,
      recebimentosRes,
      pagamentosRes,
      movimentosRes,
      formasRecebimentoRes,
      aReceberHojeRes,
      aPagarHojeRes,
    ] = await Promise.all([
      pool.query(
        `
          SELECT
            cb.id,
            cb.nome,
            cb.saldo_inicial,
            cb.data_saldo,
            COUNT(fp.id)::int AS formas_pagamento_vinculadas
          FROM contas_bancarias cb
          LEFT JOIN formas_pagamento fp
            ON fp.conta_bancaria_id = cb.id
           AND fp.usuario_id = cb.usuario_id
          WHERE cb.usuario_id = $1
          GROUP BY cb.id, cb.nome, cb.saldo_inicial, cb.data_saldo
          ORDER BY cb.nome ASC, cb.id ASC
        `,
        [usuarioId]
      ),
      pool.query(
        `
          SELECT
            COALESCE(SUM(CASE WHEN data_saldo <= $2::date THEN saldo_inicial ELSE 0 END), 0) AS total_ate_inicio,
            COALESCE(SUM(CASE WHEN data_saldo <= $3::date THEN saldo_inicial ELSE 0 END), 0) AS total_ate_fim
          FROM contas_bancarias
          WHERE usuario_id = $1
        `,
        [usuarioId, dataInicio, dataFim]
      ),
      pool.query(
        `
          SELECT
            COALESCE(SUM(CASE WHEN status = 'recebido' AND data_recebimento < $2::date THEN valor_total ELSE 0 END), 0) AS antes_inicio,
            COALESCE(SUM(CASE WHEN status = 'recebido' AND data_recebimento BETWEEN $2::date AND $3::date THEN valor_total ELSE 0 END), 0) AS realizado_periodo,
            COALESCE(SUM(CASE WHEN status = 'pendente' AND data_vencimento BETWEEN $2::date AND $3::date THEN valor_total ELSE 0 END), 0) AS pendente_periodo,
            COALESCE(SUM(CASE WHEN status = 'atrasado' AND data_vencimento BETWEEN $2::date AND $3::date THEN valor_total ELSE 0 END), 0) AS atrasado_periodo,
            COALESCE(SUM(CASE WHEN status = 'cancelado' AND COALESCE(data_recebimento, data_vencimento) BETWEEN $2::date AND $3::date THEN valor_total ELSE 0 END), 0) AS cancelado_periodo,
            COUNT(*) FILTER (WHERE status = 'recebido' AND data_recebimento BETWEEN $2::date AND $3::date)::int AS quantidade_realizado,
            COUNT(*) FILTER (WHERE status = 'pendente' AND data_vencimento BETWEEN $2::date AND $3::date)::int AS quantidade_pendente,
            COUNT(*) FILTER (WHERE status = 'atrasado' AND data_vencimento BETWEEN $2::date AND $3::date)::int AS quantidade_atrasado,
            COUNT(*) FILTER (WHERE status = 'cancelado' AND COALESCE(data_recebimento, data_vencimento) BETWEEN $2::date AND $3::date)::int AS quantidade_cancelado
          FROM contas_receber
          WHERE usuario_id = $1
        `,
        [usuarioId, dataInicio, dataFim]
      ),
      pool.query(
        `
          SELECT
            COALESCE(SUM(CASE WHEN status = 'pago' AND data_pagamento < $2::date THEN valor_total ELSE 0 END), 0) AS antes_inicio,
            COALESCE(SUM(CASE WHEN status = 'pago' AND data_pagamento BETWEEN $2::date AND $3::date THEN valor_total ELSE 0 END), 0) AS realizado_periodo,
            COALESCE(SUM(CASE WHEN status = 'pendente' AND data_vencimento BETWEEN $2::date AND $3::date THEN valor_total ELSE 0 END), 0) AS pendente_periodo,
            COALESCE(SUM(CASE WHEN status = 'atrasado' AND data_vencimento BETWEEN $2::date AND $3::date THEN valor_total ELSE 0 END), 0) AS atrasado_periodo,
            COALESCE(SUM(CASE WHEN status = 'cancelado' AND COALESCE(data_pagamento, data_vencimento) BETWEEN $2::date AND $3::date THEN valor_total ELSE 0 END), 0) AS cancelado_periodo,
            COUNT(*) FILTER (WHERE status = 'pago' AND data_pagamento BETWEEN $2::date AND $3::date)::int AS quantidade_realizado,
            COUNT(*) FILTER (WHERE status = 'pendente' AND data_vencimento BETWEEN $2::date AND $3::date)::int AS quantidade_pendente,
            COUNT(*) FILTER (WHERE status = 'atrasado' AND data_vencimento BETWEEN $2::date AND $3::date)::int AS quantidade_atrasado,
            COUNT(*) FILTER (WHERE status = 'cancelado' AND COALESCE(data_pagamento, data_vencimento) BETWEEN $2::date AND $3::date)::int AS quantidade_cancelado
          FROM contas_pagar
          WHERE usuario_id = $1
        `,
        [usuarioId, dataInicio, dataFim]
      ),
      pool.query(
        `
          SELECT
            movimento.id,
            movimento.tipo,
            movimento.origem,
            movimento.descricao,
            movimento.pessoa_nome,
            movimento.forma_pagamento,
            movimento.status,
            movimento.valor,
            movimento.data_movimento,
            movimento.data_vencimento,
            movimento.data_baixa
          FROM (
            SELECT
              cr.id,
              'RECEBIMENTO'::text AS tipo,
              CASE WHEN cr.status = 'recebido' THEN 'REALIZADO' ELSE 'PREVISTO' END::text AS origem,
              cr.descricao,
              c.nome AS pessoa_nome,
              cr.forma_pagamento,
              cr.status,
              cr.valor_total AS valor,
              CASE WHEN cr.status = 'recebido' THEN cr.data_recebimento ELSE cr.data_vencimento END AS data_movimento,
              cr.data_vencimento,
              cr.data_recebimento AS data_baixa
            FROM contas_receber cr
            LEFT JOIN clientes c ON c.id = cr.cliente_id
            WHERE cr.usuario_id = $1
              AND (
                (cr.status = 'recebido' AND cr.data_recebimento BETWEEN $2::date AND $3::date)
                OR (cr.status IN ('pendente', 'atrasado') AND cr.data_vencimento BETWEEN $2::date AND $3::date)
              )

            UNION ALL

            SELECT
              cp.id,
              'PAGAMENTO'::text AS tipo,
              CASE WHEN cp.status = 'pago' THEN 'REALIZADO' ELSE 'PREVISTO' END::text AS origem,
              cp.descricao,
              f.nome AS pessoa_nome,
              NULL::text AS forma_pagamento,
              cp.status,
              cp.valor_total AS valor,
              CASE WHEN cp.status = 'pago' THEN cp.data_pagamento ELSE cp.data_vencimento END AS data_movimento,
              cp.data_vencimento,
              cp.data_pagamento AS data_baixa
            FROM contas_pagar cp
            LEFT JOIN clientes f ON f.id = cp.fornecedor_id
            WHERE cp.usuario_id = $1
              AND (
                (cp.status = 'pago' AND cp.data_pagamento BETWEEN $2::date AND $3::date)
                OR (cp.status IN ('pendente', 'atrasado') AND cp.data_vencimento BETWEEN $2::date AND $3::date)
              )
          ) movimento
          ORDER BY movimento.data_movimento ASC, movimento.tipo ASC, movimento.id ASC
        `,
        [usuarioId, dataInicio, dataFim]
      ),
      pool.query(
        `
          SELECT
            COALESCE(NULLIF(TRIM(forma_pagamento), ''), 'Nao informado') AS forma_pagamento,
            COUNT(*)::int AS quantidade,
            COALESCE(SUM(valor_total), 0) AS valor_total
          FROM contas_receber
          WHERE usuario_id = $1
            AND status = 'recebido'
            AND data_recebimento BETWEEN $2::date AND $3::date
          GROUP BY COALESCE(NULLIF(TRIM(forma_pagamento), ''), 'Nao informado')
          ORDER BY valor_total DESC, forma_pagamento ASC
          LIMIT 5
        `,
        [usuarioId, dataInicio, dataFim]
      ),
      pool.query(
        `
          SELECT COALESCE(SUM(valor_total), 0) AS total
          FROM contas_receber
          WHERE usuario_id = $1
            AND status IN ('pendente', 'atrasado')
            AND data_vencimento = CURRENT_DATE
        `,
        [usuarioId]
      ),
      pool.query(
        `
          SELECT COALESCE(SUM(valor_total), 0) AS total
          FROM contas_pagar
          WHERE usuario_id = $1
            AND status IN ('pendente', 'atrasado')
            AND data_vencimento = CURRENT_DATE
        `,
        [usuarioId]
      ),
    ]);

    const contasBancarias = contasBancariasRes.rows.map((row) => ({
      id: toInteger(row.id),
      nome: String(row.nome),
      saldo_inicial: toNumber(row.saldo_inicial),
      data_saldo: String(row.data_saldo),
      formas_pagamento_vinculadas: toInteger(row.formas_pagamento_vinculadas),
    }));

    const totaisContasBancarias = {
      total_ate_inicio: toNumber(totaisContasBancariasRes.rows[0]?.total_ate_inicio),
      total_ate_fim: toNumber(totaisContasBancariasRes.rows[0]?.total_ate_fim),
    };

    const recebimentos = this.normalizarTotaisStatus(recebimentosRes.rows[0]);
    const pagamentos = this.normalizarTotaisStatus(pagamentosRes.rows[0]);

    const movimentos = movimentosRes.rows.map((row) => ({
      id: toInteger(row.id),
      tipo: row.tipo,
      origem: row.origem,
      descricao: String(row.descricao),
      pessoa_nome: row.pessoa_nome ? String(row.pessoa_nome) : null,
      forma_pagamento: row.forma_pagamento ? String(row.forma_pagamento) : null,
      status: String(row.status),
      valor: toNumber(row.valor),
      data_movimento: String(row.data_movimento),
      data_vencimento: String(row.data_vencimento),
      data_baixa: row.data_baixa ? String(row.data_baixa) : null,
    })) as FluxoCaixaMovimentoRaw[];

    const formasRecebimento = formasRecebimentoRes.rows.map((row) => ({
      forma_pagamento: String(row.forma_pagamento),
      quantidade: toInteger(row.quantidade),
      valor_total: toNumber(row.valor_total),
    }));

    return {
      contasBancarias,
      totaisContasBancarias,
      recebimentos,
      pagamentos,
      movimentos,
      formasRecebimento,
      aReceberHoje: toNumber(aReceberHojeRes.rows[0]?.total),
      aPagarHoje: toNumber(aPagarHojeRes.rows[0]?.total),
    };
  }

  private normalizarTotaisStatus(row: Record<string, unknown> | undefined): FluxoCaixaTotaisStatus {
    return {
      antes_inicio: toNumber(row?.antes_inicio),
      realizado_periodo: toNumber(row?.realizado_periodo),
      pendente_periodo: toNumber(row?.pendente_periodo),
      atrasado_periodo: toNumber(row?.atrasado_periodo),
      cancelado_periodo: toNumber(row?.cancelado_periodo),
      quantidade_realizado: toInteger(row?.quantidade_realizado),
      quantidade_pendente: toInteger(row?.quantidade_pendente),
      quantidade_atrasado: toInteger(row?.quantidade_atrasado),
      quantidade_cancelado: toInteger(row?.quantidade_cancelado),
    };
  }
}
