import pool from '../config/database';

export class DashboardRepository {
  async getResumo(usuarioId: number) {
    const client = await pool.connect();
    try {
      // 1. Total Vendas Hoje
      const vendasHojeResult = await client.query(`
        SELECT COALESCE(SUM(valor_total), 0) as total 
        FROM vendas 
        WHERE usuario_id = $1 AND DATE(criado_em) = CURRENT_DATE AND status = 'concluida'
      `, [usuarioId]);
      const vendasHoje = Number(vendasHojeResult.rows[0].total) || 0;

      // 2. Contas a Receber (Pendente no Mês)
      const aReceberResult = await client.query(`
        SELECT COALESCE(SUM(valor_total), 0) as total 
        FROM contas_receber 
        WHERE usuario_id = $1 
          AND status = 'pendente' 
          AND EXTRACT(MONTH FROM data_vencimento) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)
      `, [usuarioId]);
      const contasReceberPendente = Number(aReceberResult.rows[0].total) || 0;

      // 3. Contas a Pagar (Pendente no Mês)
      const aPagarResult = await client.query(`
        SELECT COALESCE(SUM(valor_total), 0) as total 
        FROM contas_pagar 
        WHERE usuario_id = $1 
          AND status = 'pendente' 
          AND EXTRACT(MONTH FROM data_vencimento) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)
      `, [usuarioId]);
      const contasPagarPendente = Number(aPagarResult.rows[0].total) || 0;

      // 4. Gráfico Vendas 7 Dias
      const vendas7DiasResult = await client.query(`
        WITH dates AS (
          SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day')::date AS data
        )
        SELECT 
          to_char(d.data, 'DD/MM') as data_formatada,
          d.data,
          COALESCE(SUM(v.valor_total), 0) as total_vendas
        FROM dates d
        LEFT JOIN vendas v ON DATE(v.criado_em) = d.data AND v.usuario_id = $1 AND v.status = 'concluida'
        GROUP BY d.data
        ORDER BY d.data ASC
      `, [usuarioId]);
      
      const graficosVendas = vendas7DiasResult.rows.map(row => ({
         data: row.data_formatada,
         valor: Number(row.total_vendas)
      }));

      // 5. Últimas Vendas
      const ultimasVendasResult = await client.query(`
        SELECT id, valor_total, forma_pagamento, to_char(criado_em, 'HH24:MI') as hora
        FROM vendas 
        WHERE usuario_id = $1 AND status = 'concluida' AND DATE(criado_em) = CURRENT_DATE
        ORDER BY criado_em DESC
        LIMIT 5
      `, [usuarioId]);

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
