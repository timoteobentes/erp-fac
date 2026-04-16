import pool from '../config/database';
import { Venda, ItemVenda } from '../models/Venda';

export class VendaRepository {

  /**
   * Processa toda a venda de forma transacional:
   * 1. Insere a Venda.
   * 2. Insere os Itens da Venda.
   * 3. Atualiza Estoque.
   * 4. Registra Movimentação de Estoque.
   * 5. Insere no Contas a Receber.
   */
  async processarVendaTransaction(venda: Venda, itens: ItemVenda[]): Promise<Venda> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN'); // INICIO DA TRANSAÇÃO

      // Blindagem contra concorrencia e Deadlock
      await client.query("SET LOCAL lock_timeout = '3s'");
      await client.query("SET LOCAL statement_timeout = '15s'");

      // 1. Inserir Venda no Caixa (PDV)
      const vendaQuery = `
        INSERT INTO vendas (
          usuario_id, cliente_id, valor_bruto, desconto, 
          valor_total, forma_pagamento, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      const vendaValues = [
        venda.usuario_id,
        venda.cliente_id || null,
        venda.valor_bruto,
        venda.desconto || 0,
        venda.valor_total,
        venda.forma_pagamento,
        venda.status || 'concluida'
      ];
      const resultVenda = await client.query(vendaQuery, vendaValues);
      const novaVenda = resultVenda.rows[0];

      // 2. Inserir Itens da Venda
      const itemQuery = `
        INSERT INTO itens_venda (
          venda_id, produto_id, quantidade, valor_unitario, valor_total
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      
      // 2. Ordenar os Itens por produto_id para manter ordem estável de lock e evitar Deadlock
      const itensOrdenados = [...itens].sort((a, b) => a.produto_id - b.produto_id);

      for (const item of itensOrdenados) {
        await client.query(itemQuery, [
          novaVenda.id,
          item.produto_id,
          item.quantidade,
          item.valor_unitario,
          item.valor_total
        ]);

        // 3. Atualizar Estoque (Transacional)
        const checkEstoque = await client.query(
          `SELECT estoque_atual, movimenta_estoque FROM produtos WHERE id = $1 FOR UPDATE`,
          [item.produto_id]
        );

        if (checkEstoque.rows.length > 0 && checkEstoque.rows[0].movimenta_estoque) {
          const estoqueAtual = Number(checkEstoque.rows[0].estoque_atual);
          const novoEstoque = estoqueAtual - Number(item.quantidade);

          await client.query(
            `UPDATE produtos SET estoque_atual = $1 WHERE id = $2`,
            [novoEstoque, item.produto_id]
          );

          // 4. Registrar Movimentação de Estoque
          await client.query(
            `INSERT INTO movimentacoes_estoque (usuario_id, produto_id, tipo, quantidade, saldo_apos, origem, observacao) 
             VALUES ($1, $2, 'saida', $3, $4, 'pdv', $5)`,
            [
              venda.usuario_id, 
              item.produto_id, 
              item.quantidade, 
              novoEstoque, 
              `Venda PDV #${novaVenda.id}`
            ]
          );
        }
      }

      // 5. Alimentar o Financeiro (Contas a Receber)
      const contaReceberQuery = `
        INSERT INTO contas_receber (
          usuario_id, cliente_id, venda_id, descricao, valor_total,
          data_vencimento, data_recebimento, status, forma_pagamento
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7, $8)
      `;
      
      const descFinanceiro = `Venda PDV Cód. ${novaVenda.id} - Pgto ${venda.forma_pagamento}`;
      await client.query(contaReceberQuery, [
        venda.usuario_id,
        venda.cliente_id || null,
        novaVenda.id,
        descFinanceiro,
        venda.valor_total,
        (venda as any).data_recebimento || null,
        (venda as any).status_financeiro || 'recebido',
        venda.forma_pagamento
      ]);

      await client.query('COMMIT'); // CONFIRMA A TRANSAÇÃO
      return novaVenda;

    } catch (error: any) {
      await client.query('ROLLBACK'); // DESFAZ EM CASO DE ERRO
      
      console.error("[VendaRepository] Erro transacional no PDV:", error.message);
      if (error.code === '57014' || error.message.includes('timeout')) {
         throw new Error("Ocorreu um bloqueio temporário no estoque ou no banco de dados. Por favor, tente novamente a emissão.");
      }
      if (error.code === '40P01') {
         throw new Error("Deadlock detectado nas transações do banco. Por favor, feche a venda novamente.");
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async getVendaCompleta(vendaId: number): Promise<any> {
    const vendaQuery = `
      SELECT v.*, u.nome_empresa, u.cnpj as emitente_cnpj, u.telefone as emitente_telefone,
             u.cidade as emitente_cidade, u.estado as emitente_estado,
             cf.inscricao_estadual, cf.regime_tributario, cf.csc_id, cf.csc_alfanumerico,
             cf.ambiente_sefaz, cf.certificado_base64, cf.certificado_senha,
             c.nome as cliente_nome, c.cpf as cliente_cpf
      FROM vendas v
      JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN configuracoes_fiscais cf ON u.id = cf.usuario_id
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.id = $1
    `;
    const resultVenda = await pool.query(vendaQuery, [vendaId]);
    if (resultVenda.rows.length === 0) return null;

    const venda = resultVenda.rows[0];

    const itensQuery = `
      SELECT iv.*, p.nome as produto_nome, p.codigo_barras, p.ncm, p.cest, p.cfop_padrao, p.origem_mercadoria, u.sigla as unidade_sigla
      FROM itens_venda iv
      JOIN produtos p ON iv.produto_id = p.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id OR u.usuario_id IS NULL
      WHERE iv.venda_id = $1
    `;
    const resultItens = await pool.query(itensQuery, [vendaId]);
    venda.itens = resultItens.rows;

    return venda;
  }

  async atualizarDadosSefaz(vendaId: number, dadosSefaz: any) {
    const query = `
      UPDATE vendas
      SET status_sefaz = $1,
          chave_acesso = $2,
          numero_nfe = $3,
          protocolo = $4,
          xml_autorizado = $5,
          atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $6
    `;
    const values = [
      dadosSefaz.status_sefaz,
      dadosSefaz.chave_acesso,
      dadosSefaz.numero_nfe,
      dadosSefaz.protocolo,
      dadosSefaz.xml_autorizado,
      vendaId
    ];
    await pool.query(query, values);
  }

  // Lista simples das vendas do dia/período
  async listar(filtros: { data_inicio?: string, data_fim?: string } = {}, paginacao?: { limit: number, offset: number }) {
    let query = 'SELECT * FROM vendas WHERE 1=1';
    const values: any[] = [];
    let count = 1;

    if (filtros.data_inicio) {
        query += ` AND data_venda >= $${count}`;
        values.push(filtros.data_inicio);
        count++;
    }

    if (filtros.data_fim) {
        // Incluir até o final do dia do data_fim
        query += ` AND data_venda <= $${count}::date + integer '1' - interval '1 second'`;
        values.push(filtros.data_fim);
        count++;
    }

    let finalQuery = query + ' ORDER BY data_venda DESC';

    if (paginacao) {
      const safeLimit = Math.min(Number(paginacao.limit) || 500, 500);
      const safeOffset = Math.max(Number(paginacao.offset) || 0, 0);
      finalQuery += ` LIMIT $${count} OFFSET $${count + 1}`;
      values.push(safeLimit, safeOffset);
    }

    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
    const countValues = values.slice(0, values.length - (paginacao ? 2 : 0));

    const [result, countRes] = await Promise.all([
      pool.query(finalQuery, values),
      pool.query(countQuery, countValues)
    ]);

    return {
      dados: result.rows,
      total: parseInt(countRes.rows[0].total)
    };
  }
}
