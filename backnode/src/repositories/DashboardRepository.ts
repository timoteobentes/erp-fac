import pool from '../config/database';

export class DashboardRepository {
  async getResumo(usuarioId: number) {
    const client = await pool.connect();

    try {
      const [
        vendasHojeResult,
        aReceberResult,
        aPagarResult,
        vendas7DiasResult,
        ultimasVendasResult
      ] = await Promise.all([
        client.query(`
          SELECT COALESCE(SUM(valor_total), 0) as total
          FROM vendas
          WHERE usuario_id = $1
            AND DATE(criado_em) = CURRENT_DATE
            AND status = 'concluida'
        `, [usuarioId]),
        client.query(`
          SELECT COALESCE(SUM(valor_total), 0) as total
          FROM contas_receber
          WHERE usuario_id = $1
            AND status IN ('pendente', 'atrasado')
            AND data_vencimento >= date_trunc('month', CURRENT_DATE)
            AND data_vencimento < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')
        `, [usuarioId]),
        client.query(`
          SELECT COALESCE(SUM(valor_total), 0) as total
          FROM contas_pagar
          WHERE usuario_id = $1
            AND status IN ('pendente', 'atrasado')
            AND data_vencimento >= date_trunc('month', CURRENT_DATE)
            AND data_vencimento < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')
        `, [usuarioId]),
        client.query(`
          WITH dates AS (
            SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day')::date AS data
          )
          SELECT
            to_char(d.data, 'DD/MM') as data_formatada,
            d.data,
            COALESCE(SUM(v.valor_total), 0) as total_vendas
          FROM dates d
          LEFT JOIN vendas v
            ON DATE(v.criado_em) = d.data
           AND v.usuario_id = $1
           AND v.status = 'concluida'
          GROUP BY d.data
          ORDER BY d.data ASC
        `, [usuarioId]),
        client.query(`
          SELECT id, valor_total, forma_pagamento, to_char(criado_em, 'HH24:MI') as hora
          FROM vendas
          WHERE usuario_id = $1
            AND status = 'concluida'
            AND DATE(criado_em) = CURRENT_DATE
          ORDER BY criado_em DESC
          LIMIT 5
        `, [usuarioId])
      ]);

      const vendasHoje = Number(vendasHojeResult.rows[0].total) || 0;
      const contasReceberPendente = Number(aReceberResult.rows[0].total) || 0;
      const contasPagarPendente = Number(aPagarResult.rows[0].total) || 0;

      const graficosVendas = vendas7DiasResult.rows.map((row) => ({
        data: row.data_formatada,
        valor: Number(row.total_vendas)
      }));

      return {
        vendas_hoje: vendasHoje,
        contas_receber_pendente_mes: contasReceberPendente,
        contas_pagar_pendente_mes: contasPagarPendente,
        graficos_vendas: graficosVendas,
        ultimas_vendas: ultimasVendasResult.rows
      };
    } finally {
      client.release();
    }
  }
}
