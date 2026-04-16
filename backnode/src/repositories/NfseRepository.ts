import pool from '../config/database';
import { Nfse } from '../models/Nfse';

class NfseRepository {
  async listar(usuarioId: number, paginacao?: { limit: number, offset: number }) {
    let query = `
      SELECT 
        n.*, 
        c.nome as cliente_nome, 
        s.nome as servico_nome 
      FROM nfse n
      LEFT JOIN clientes c ON n.cliente_id = c.id
      LEFT JOIN servicos s ON n.servico_id = s.id
      WHERE n.usuario_id = $1
    `;
    const values: any[] = [usuarioId];
    let count = 1;

    let finalQuery = query + ` ORDER BY n.id DESC`;

    if (paginacao) {
      const safeLimit = Math.min(Number(paginacao.limit) || 500, 500);
      const safeOffset = Math.max(Number(paginacao.offset) || 0, 0);
      finalQuery += ` LIMIT $${count + 1} OFFSET $${count + 2}`;
      values.push(safeLimit, safeOffset);
    }

    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
    const countValues = values.slice(0, values.length - (paginacao ? 2 : 0));

    const [res, countRes] = await Promise.all([
      pool.query(finalQuery, values),
      pool.query(countQuery, countValues)
    ]);

    return {
      dados: res.rows,
      total: parseInt(countRes.rows[0].total)
    };
  }

  async buscarPorId(id: number, usuarioId: number): Promise<Nfse | null> {
    const query = `
      SELECT n.*, c.nome as cliente_nome, s.nome as servico_nome 
      FROM nfse n
      LEFT JOIN clientes c ON n.cliente_id = c.id
      LEFT JOIN servicos s ON n.servico_id = s.id
      WHERE n.id = $1 AND n.usuario_id = $2
    `;
    const { rows } = await pool.query(query, [id, usuarioId]);
    return rows[0] || null;
  }

  async getNfseCompleta(id: number): Promise<any> {
    const query = `
      SELECT 
        n.*, 
        c.nome as cliente_nome, 
        COALESCE(c.cnpj, c.cpf) as cliente_cpf_cnpj, 
        e.logradouro as cliente_lgr, 
        e.numero as cliente_nro, 
        e.bairro as cliente_bairro, 
        e.cidade as cliente_mun, 
        e.uf as cliente_uf, 
        e.cep as cliente_cep,
        s.nome as servico_nome, s.codigo_lc116, s.codigo_tributacao_nacional, s.cnae,
        u.cnpj as emissor_cnpj,
        cf.certificado_base64, cf.certificado_senha,
        cfn.inscricao_municipal as emissor_im,
        cfn.codigo_tributacao_nacional as emissor_c_trib_nac,
        cfn.codigo_tributacao_municipal as emissor_c_trib_mun,
        cfn.serie_dps as emissor_serie_dps
      FROM nfse n
      LEFT JOIN clientes c ON n.cliente_id = c.id
      LEFT JOIN enderecos e ON e.cliente_id = c.id
      LEFT JOIN servicos s ON n.servico_id = s.id
      LEFT JOIN usuarios u ON n.usuario_id = u.id
      LEFT JOIN configuracoes_fiscais cf ON cf.usuario_id = u.id
      LEFT JOIN configuracoes_fiscais_nfse cfn ON cfn.usuario_id = u.id
      WHERE n.id = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async atualizarStatus(id: number, status: string, xml_autorizado?: string): Promise<void> {
    await pool.query(
      `UPDATE nfse SET status = $1, xml_autorizado = $2, atualizado_em = CURRENT_TIMESTAMP WHERE id = $3`,
      [status, xml_autorizado || null, id]
    );
  }

  async atualizarTransmissao(id: number, status: string, chave_acesso: string | null = null, xml_autorizado: string | null = null, mensagem_retorno: string | null = null): Promise<void> {
    // Tenta atualizar colunas novas. Se elas não existirem no BD nativamente, o PG vai jogar log de erro mas garantimos a alteração principal.
    try {
      await pool.query(
        `UPDATE nfse SET status = $1, chave_acesso = $2, xml_autorizado = $3, mensagem_retorno = $4, atualizado_em = CURRENT_TIMESTAMP WHERE id = $5`,
        [status, chave_acesso, xml_autorizado, mensagem_retorno, id]
      );
    } catch (e: any) {
      if (e.code === '42703') { // undefined_column
         console.warn("⚠️ MIGRATION WARN: Adicione as colunas chave_acesso e mensagem_retorno na tabela nfse. Atualizando apenas status por fallback.");
         await pool.query(
          `UPDATE nfse SET status = $1, xml_autorizado = $2, atualizado_em = CURRENT_TIMESTAMP WHERE id = $3`,
          [status, xml_autorizado, id]
        );
      } else throw e;
    }
  }

  async criar(nfse: Nfse): Promise<Nfse> {
    const { 
      usuario_id, cliente_id, servico_id, competencia, 
      valor_servico, desconto, valor_total, 
      aliquota_iss, valor_iss, status 
    } = nfse;

    const query = `
      INSERT INTO nfse (
        usuario_id, cliente_id, servico_id, competencia, 
        valor_servico, desconto, valor_total, 
        aliquota_iss, valor_iss, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      usuario_id, cliente_id, servico_id, competencia,
      valor_servico, desconto || 0, valor_total,
      aliquota_iss, valor_iss, status
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  }
}

export default new NfseRepository();
