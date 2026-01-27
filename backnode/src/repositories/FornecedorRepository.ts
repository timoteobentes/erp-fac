import pool from '../config/database';
import { BaseRepository } from './BaseRepository';
import {
  Fornecedor,
  FornecedorPF,
  FornecedorPJ,
  FornecedorEstrangeiro,
  EnderecoFornecedor,
  ContatoFornecedor,
  ProdutoServico,
  AnexoFornecedor,
  NovoFornecedorRequest,
  FornecedorCompleto,
  TipoFornecedor,
  SituacaoFornecedor
} from '../models/Fornecedor';

export class FornecedorRepository extends BaseRepository {
  
  // Criar fornecedor base
  async criarFornecedorBase(fornecedorData: any): Promise<number> {
    const query = `
      INSERT INTO fornecedores (
        usuario_id, tipo_fornecedor, situacao, nome, email, telefone_comercial, 
        telefone_celular, site, responsavel_compras, prazo_entrega, 
        condicao_pagamento, observacoes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `;
    
    const values = [
      fornecedorData.usuario_id,
      fornecedorData.tipo_fornecedor,
      fornecedorData.situacao || 'ativo',
      fornecedorData.nome,
      fornecedorData.email,
      fornecedorData.telefone_comercial,
      fornecedorData.telefone_celular,
      fornecedorData.site,
      fornecedorData.responsavel_compras,
      fornecedorData.prazo_entrega,
      fornecedorData.condicao_pagamento,
      fornecedorData.observacoes
    ];

    const result = await this.queryWithIsolation(query, values);
    return result.rows[0].id;
  }

  // Criar fornecedor PF
  async criarFornecedorPF(fornecedorId: number, pfData: any): Promise<void> {
    const query = `
      INSERT INTO fornecedores_pf (
        fornecedor_id, cpf, rg, nascimento, tipo_contribuinte
      ) VALUES ($1, $2, $3, $4, $5)
    `;
    
    const values = [
      fornecedorId,
      pfData.cpf,
      pfData.rg,
      pfData.nascimento,
      pfData.tipo_contribuinte
    ];

    await pool.query(query, values);
  }

  // Criar fornecedor PJ
  async criarFornecedorPJ(fornecedorId: number, pjData: any): Promise<void> {
    const query = `
      INSERT INTO fornecedores_pj (
        fornecedor_id, cnpj, razao_social, inscricao_estadual, isento,
        tipo_contribuinte, inscricao_municipal, inscricao_suframa, 
        responsavel, ramo_atividade
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    
    const values = [
      fornecedorId,
      pjData.cnpj,
      pjData.razao_social,
      pjData.inscricao_estadual,
      pjData.isento,
      pjData.tipo_contribuinte,
      pjData.inscricao_municipal,
      pjData.inscricao_suframa,
      pjData.responsavel,
      pjData.ramo_atividade
    ];

    await pool.query(query, values);
  }

  // Criar fornecedor estrangeiro
  async criarFornecedorEstrangeiro(fornecedorId: number, estrangeiroData: any): Promise<void> {
    const query = `
      INSERT INTO fornecedores_estrangeiro (
        fornecedor_id, documento, pais_origem
      ) VALUES ($1, $2, $3)
    `;
    
    const values = [
      fornecedorId,
      estrangeiroData.documento,
      estrangeiroData.pais_origem
    ];

    await pool.query(query, values);
  }

  // Criar endereços
  async criarEnderecos(fornecedorId: number, enderecos: EnderecoFornecedor[]): Promise<void> {
    for (const endereco of enderecos) {
      const query = `
        INSERT INTO enderecos_fornecedor (
          fornecedor_id, tipo, cep, logradouro, numero, complemento,
          bairro, cidade, uf, principal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      
      const values = [
        fornecedorId,
        endereco.tipo,
        endereco.cep,
        endereco.logradouro,
        endereco.numero,
        endereco.complemento,
        endereco.bairro,
        endereco.cidade,
        endereco.uf,
        endereco.principal
      ];

      await pool.query(query, values);
    }
  }

  // Criar contatos
  async criarContatos(fornecedorId: number, contatos: ContatoFornecedor[]): Promise<void> {
    for (const contato of contatos) {
      const query = `
        INSERT INTO contatos_fornecedor (
          fornecedor_id, tipo, nome, contato, cargo, observacao, principal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      
      const values = [
        fornecedorId,
        contato.tipo,
        contato.nome,
        contato.valor,
        contato.cargo,
        contato.observacao,
        contato.principal
      ];

      await pool.query(query, values);
    }
  }

  // Criar produtos/serviços
  async criarProdutosServicos(fornecedorId: number, produtosServicos: ProdutoServico[]): Promise<void> {
    for (const item of produtosServicos) {
      const query = `
        INSERT INTO produtos_servicos (
          fornecedor_id, tipo, nome, descricao, unidade_medida, 
          preco_unitario, moeda, estoque_minimo, estoque_atual, ativo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      
      const values = [
        fornecedorId,
        item.tipo,
        item.nome,
        item.descricao,
        item.unidade_medida,
        item.preco_unitario,
        item.moeda,
        item.estoque_minimo,
        item.estoque_atual,
        item.ativo
      ];

      await pool.query(query, values);
    }
  }

  // Criar anexos
  async criarAnexos(fornecedorId: number, anexos: AnexoFornecedor[]): Promise<void> {
    for (const anexo of anexos) {
      const query = `
        INSERT INTO anexos_fornecedor (
          fornecedor_id, nome_arquivo, caminho_arquivo, tipo, tamanho
        ) VALUES ($1, $2, $3, $4, $5)
      `;
      
      const values = [
        fornecedorId,
        anexo.nome,
        anexo.arquivo,
        anexo.tipo,
        anexo.tamanho
      ];

      await pool.query(query, values);
    }
  }

  // Buscar fornecedor completo por ID
  async buscarFornecedorPorId(id: number, usuarioId: number): Promise<FornecedorCompleto | null> {
    // Buscar dados base do fornecedor COM ISOLAMENTO
    const fornecedorQuery = `
      SELECT f.*
      FROM fornecedores f 
      WHERE f.id = $1 AND f.usuario_id = $2
    `;
    const fornecedorResult = await pool.query(fornecedorQuery, [id, usuarioId]);
    
    if (fornecedorResult.rows.length === 0) {
      return null;
    }

    const fornecedor = fornecedorResult.rows[0];
    
    let fornecedorEspecifico: any = {};

    if (fornecedor.tipo_fornecedor === 'PF') {
      const pfQuery = 'SELECT * FROM fornecedores_pf WHERE fornecedor_id = $1';
      const pfResult = await pool.query(pfQuery, [id]);
      fornecedorEspecifico = pfResult.rows[0] || {};
    } else if (fornecedor.tipo_fornecedor === 'PJ') {
      const pjQuery = 'SELECT * FROM fornecedores_pj WHERE fornecedor_id = $1';
      const pjResult = await pool.query(pjQuery, [id]);
      fornecedorEspecifico = pjResult.rows[0] || {};
    } else if (fornecedor.tipo_fornecedor === 'estrangeiro') {
      const estrangeiroQuery = 'SELECT * FROM fornecedores_estrangeiro WHERE fornecedor_id = $1';
      const estrangeiroResult = await pool.query(estrangeiroQuery, [id]);
      fornecedorEspecifico = estrangeiroResult.rows[0] || {};
    }

    // Buscar relacionamentos
    const [enderecosResult, contatosResult, produtosResult, anexosResult] = await Promise.all([
      pool.query('SELECT * FROM enderecos_fornecedor WHERE fornecedor_id = $1', [id]),
      pool.query('SELECT * FROM contatos_fornecedor WHERE fornecedor_id = $1', [id]),
      pool.query('SELECT * FROM produtos_servicos WHERE fornecedor_id = $1', [id]),
      pool.query('SELECT * FROM anexos_fornecedor WHERE fornecedor_id = $1', [id])
    ]);

    return {
      fornecedor: { ...fornecedor, ...fornecedorEspecifico },
      enderecos: enderecosResult.rows,
      contatos: contatosResult.rows,
      produtos_servicos: produtosResult.rows,
      anexos: anexosResult.rows
    };
  }

  // Listar fornecedores por usuário
  async listarFornecedoresPorUsuario(usuarioId: number): Promise<any[]> {
    const query = `
      SELECT 
        f.*,
        CASE 
          WHEN f.tipo_fornecedor = 'PF' THEN fp.cpf
          WHEN f.tipo_fornecedor = 'PJ' THEN fj.cnpj
          ELSE fe.documento
        END as documento_principal
      FROM fornecedores f
      LEFT JOIN fornecedores_pf fp ON f.id = fp.fornecedor_id
      LEFT JOIN fornecedores_pj fj ON f.id = fj.fornecedor_id
      LEFT JOIN fornecedores_estrangeiro fe ON f.id = fe.fornecedor_id
      WHERE f.usuario_id = $1
      ORDER BY f.criado_em DESC
    `;
    
    const result = await pool.query(query, [usuarioId]);
    return result.rows;
  }

  // Verificar se CPF/CNPJ já existe
  async verificarDocumentoExistente(tipo: string, documento: string, usuarioId: number): Promise<boolean> {
    let query = '';
    
    if (tipo === 'PF') {
      query = `
        SELECT 1 FROM fornecedores f
        JOIN fornecedores_pf fp ON f.id = fp.fornecedor_id
        WHERE fp.cpf = $1 AND f.usuario_id = $2
      `;
    } else if (tipo === 'PJ') {
      query = `
        SELECT 1 FROM fornecedores f
        JOIN fornecedores_pj fp ON f.id = fp.fornecedor_id
        WHERE fp.cnpj = $1 AND f.usuario_id = $2
      `;
    }
    
    if (query) {
      const result = await pool.query(query, [documento, usuarioId]);
      return result.rows.length > 0;
    }
    
    return false;
  }

  // Listar com filtros e paginação
  async listarFornecedoresComFiltros(
    usuarioId: number, 
    filtros: any,
    paginacao: any,
    ordenacao: any
  ): Promise<any> {
    let query = `
      SELECT 
        f.*,
        CASE 
          WHEN f.tipo_fornecedor = 'PF' THEN fp.cpf
          WHEN f.tipo_fornecedor = 'PJ' THEN fj.cnpj
          ELSE fe.documento
        END as documento_principal,
        COUNT(ps.id) as total_produtos
      FROM fornecedores f
      LEFT JOIN fornecedores_pf fp ON f.id = fp.fornecedor_id
      LEFT JOIN fornecedores_pj fj ON f.id = fj.fornecedor_id
      LEFT JOIN fornecedores_estrangeiro fe ON f.id = fe.fornecedor_id
      LEFT JOIN produtos_servicos ps ON f.id = ps.fornecedor_id AND ps.ativo = true
      WHERE f.usuario_id = $1
    `;

    let countQuery = `
      SELECT COUNT(DISTINCT f.id) as total
      FROM fornecedores f
      LEFT JOIN fornecedores_pf fp ON f.id = fp.fornecedor_id
      LEFT JOIN fornecedores_pj fj ON f.id = fj.fornecedor_id
      LEFT JOIN fornecedores_estrangeiro fe ON f.id = fe.fornecedor_id
      WHERE f.usuario_id = $1
    `;

    const values: any[] = [usuarioId];
    let paramCount = 1;

    // Aplicar filtros
    if (filtros.nome) {
      paramCount++;
      query += ` AND f.nome ILIKE $${paramCount}`;
      countQuery += ` AND f.nome ILIKE $${paramCount}`;
      values.push(`%${filtros.nome}%`);
    }

    if (filtros.tipo_fornecedor) {
      paramCount++;
      query += ` AND f.tipo_fornecedor = $${paramCount}`;
      countQuery += ` AND f.tipo_fornecedor = $${paramCount}`;
      values.push(filtros.tipo_fornecedor);
    }

    if (filtros.situacao) {
      paramCount++;
      query += ` AND f.situacao = $${paramCount}`;
      countQuery += ` AND f.situacao = $${paramCount}`;
      values.push(filtros.situacao);
    }

    if (filtros.cpf_cnpj) {
      paramCount++;
      query += ` AND (fp.cpf = $${paramCount} OR fj.cnpj = $${paramCount} OR fe.documento = $${paramCount})`;
      countQuery += ` AND (fp.cpf = $${paramCount} OR fj.cnpj = $${paramCount} OR fe.documento = $${paramCount})`;
      values.push(filtros.cpf_cnpj);
    }

    if (filtros.ramo_atividade) {
      paramCount++;
      query += ` AND fj.ramo_atividade ILIKE $${paramCount}`;
      countQuery += ` AND fj.ramo_atividade ILIKE $${paramCount}`;
      values.push(`%${filtros.ramo_atividade}%`);
    }

    if (filtros.responsavel_compras) {
      paramCount++;
      query += ` AND f.responsavel_compras ILIKE $${paramCount}`;
      countQuery += ` AND f.responsavel_compras ILIKE $${paramCount}`;
      values.push(`%${filtros.responsavel_compras}%`);
    }

    if (filtros.data_inicio && filtros.data_fim) {
      paramCount++;
      query += ` AND f.criado_em BETWEEN $${paramCount} AND $${paramCount + 1}`;
      countQuery += ` AND f.criado_em BETWEEN $${paramCount} AND $${paramCount + 1}`;
      values.push(filtros.data_inicio, filtros.data_fim);
      paramCount++;
    }

    // Group by para produtos
    query += ` GROUP BY f.id, fp.cpf, fj.cnpj, fe.documento`;

    // Ordenação
    const ordemValida = ordenacao.ordem === 'ASC' ? 'ASC' : 'DESC';
    const ordenarPorValido = this.validarCampoOrdenacao(ordenacao.ordenarPor);
    query += ` ORDER BY ${ordenarPorValido} ${ordemValida}`;

    // Paginação
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(paginacao.limite, paginacao.offset);

    // Executar queries
    const [fornecedoresResult, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, values.slice(0, -2))
    ]);

    return {
      fornecedores: fornecedoresResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  // Atualizar fornecedor
  async atualizarFornecedor(fornecedorId: number, usuarioId: number, fornecedorData: any): Promise<void> {
    const camposPermitidos = [
      'nome', 'email', 'telefone_comercial', 'telefone_celular', 'site',
      'responsavel_compras', 'prazo_entrega', 'condicao_pagamento',
      'observacoes', 'situacao'
    ];

    const camposParaAtualizar: string[] = [];
    const valores: any[] = [];
    let paramCount = 1;

    for (const [campo, valor] of Object.entries(fornecedorData)) {
      if (camposPermitidos.includes(campo) && valor !== undefined) {
        camposParaAtualizar.push(`${campo} = $${paramCount}`);
        valores.push(valor);
        paramCount++;
      }
    }

    if (camposParaAtualizar.length === 0) {
      return;
    }

    valores.push(fornecedorId, usuarioId);
    
    const query = `
      UPDATE fornecedores 
      SET ${camposParaAtualizar.join(', ')}, atualizado_em = NOW()
      WHERE id = $${paramCount} AND usuario_id = $${paramCount + 1}
    `;

    await pool.query(query, valores);
  }

  // Mudar status do fornecedor
  async mudarStatusFornecedor(fornecedorId: number, usuarioId: number, situacao: string): Promise<void> {
    const query = `
      UPDATE fornecedores 
      SET situacao = $1, atualizado_em = NOW()
      WHERE id = $2 AND usuario_id = $3
    `;
    
    await pool.query(query, [situacao, fornecedorId, usuarioId]);
  }

  // Excluir fornecedor permanentemente
  async excluirFornecedorPermanentemente(fornecedorId: number, usuarioId: number): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Excluir registros relacionados primeiro
      await client.query('DELETE FROM anexos_fornecedor WHERE fornecedor_id = $1', [fornecedorId]);
      await client.query('DELETE FROM produtos_servicos WHERE fornecedor_id = $1', [fornecedorId]);
      await client.query('DELETE FROM contatos_fornecedor WHERE fornecedor_id = $1', [fornecedorId]);
      await client.query('DELETE FROM enderecos_fornecedor WHERE fornecedor_id = $1', [fornecedorId]);
      
      // Excluir dados específicos do tipo
      await client.query('DELETE FROM fornecedores_pf WHERE fornecedor_id = $1', [fornecedorId]);
      await client.query('DELETE FROM fornecedores_pj WHERE fornecedor_id = $1', [fornecedorId]);
      await client.query('DELETE FROM fornecedores_estrangeiro WHERE fornecedor_id = $1', [fornecedorId]);
      
      // Excluir fornecedor base
      await client.query('DELETE FROM fornecedores WHERE id = $1 AND usuario_id = $2', [fornecedorId, usuarioId]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Buscar fornecedor por documento
  async buscarFornecedorPorDocumento(usuarioId: number, documento: string): Promise<FornecedorCompleto | null> {
    const query = `
      SELECT f.* 
      FROM fornecedores f
      LEFT JOIN fornecedores_pf fp ON f.id = fp.fornecedor_id
      LEFT JOIN fornecedores_pj fj ON f.id = fj.fornecedor_id
      LEFT JOIN fornecedores_estrangeiro fe ON f.id = fe.fornecedor_id
      WHERE f.usuario_id = $1 AND (fp.cpf = $2 OR fj.cnpj = $2 OR fe.documento = $2)
    `;

    const result = await pool.query(query, [usuarioId, documento]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.buscarFornecedorPorId(result.rows[0].id, usuarioId);
  }

  // Obter estatísticas
  async obterEstatisticasFornecedores(usuarioId: number): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN situacao = 'ativo' THEN 1 END) as ativos,
        COUNT(CASE WHEN situacao = 'inativo' THEN 1 END) as inativos,
        COUNT(CASE WHEN tipo_fornecedor = 'PF' THEN 1 END) as pf,
        COUNT(CASE WHEN tipo_fornecedor = 'PJ' THEN 1 END) as pj,
        COUNT(CASE WHEN tipo_fornecedor = 'estrangeiro' THEN 1 END) as estrangeiro,
        COUNT(DISTINCT ps.id) as total_produtos,
        COALESCE(SUM(ps.preco_unitario * ps.estoque_atual), 0) as valor_total_estoque
      FROM fornecedores f
      LEFT JOIN produtos_servicos ps ON f.id = ps.fornecedor_id AND ps.ativo = true
      WHERE f.usuario_id = $1
    `;

    const ultimosQuery = `
      SELECT f.id, f.nome, f.tipo_fornecedor, f.criado_em, 
             COUNT(ps.id) as produtos_cadastrados
      FROM fornecedores f
      LEFT JOIN produtos_servicos ps ON f.id = ps.fornecedor_id
      WHERE f.usuario_id = $1 
      GROUP BY f.id
      ORDER BY f.criado_em DESC 
      LIMIT 5
    `;

    const [estatisticasResult, ultimosResult] = await Promise.all([
      pool.query(query, [usuarioId]),
      pool.query(ultimosQuery, [usuarioId])
    ]);

    const stats = estatisticasResult.rows[0];

    return {
      total: parseInt(stats.total),
      ativos: parseInt(stats.ativos),
      inativos: parseInt(stats.inativos),
      porTipo: {
        PF: parseInt(stats.pf),
        PJ: parseInt(stats.pj),
        estrangeiro: parseInt(stats.estrangeiro)
      },
      totalProdutosServicos: parseInt(stats.total_produtos),
      valorTotalEstoque: parseFloat(stats.valor_total_estoque),
      ultimosCadastrados: ultimosResult.rows
    };
  }

  // Listar para exportação
  async listarFornecedoresParaExportacao(usuarioId: number, filtros?: any): Promise<any[]> {
    let query = `
      SELECT 
        f.*,
        CASE 
          WHEN f.tipo_fornecedor = 'PF' THEN fp.cpf
          WHEN f.tipo_fornecedor = 'PJ' THEN fj.cnpj
          ELSE fe.documento
        END as documento,
        fp.cpf,
        fj.cnpj,
        fe.documento as documento_estrangeiro,
        fj.razao_social,
        fj.responsavel,
        fj.ramo_atividade,
        COUNT(ps.id) as total_produtos
      FROM fornecedores f
      LEFT JOIN fornecedores_pf fp ON f.id = fp.fornecedor_id
      LEFT JOIN fornecedores_pj fj ON f.id = fj.fornecedor_id
      LEFT JOIN fornecedores_estrangeiro fe ON f.id = fe.fornecedor_id
      LEFT JOIN produtos_servicos ps ON f.id = ps.fornecedor_id AND ps.ativo = true
      WHERE f.usuario_id = $1
    `;

    const values: any[] = [usuarioId];
    let paramCount = 1;

    // Aplicar filtros se existirem
    if (filtros) {
      if (filtros.situacao) {
        paramCount++;
        query += ` AND f.situacao = $${paramCount}`;
        values.push(filtros.situacao);
      }

      if (filtros.tipo_fornecedor) {
        paramCount++;
        query += ` AND f.tipo_fornecedor = $${paramCount}`;
        values.push(filtros.tipo_fornecedor);
      }

      if (filtros.nome) {
        paramCount++;
        query += ` AND f.nome ILIKE $${paramCount}`;
        values.push(`%${filtros.nome}%`);
      }

      if (filtros.cpf_cnpj) {
        paramCount++;
        query += ` AND (fp.cpf = $${paramCount} OR fj.cnpj = $${paramCount} OR fe.documento = $${paramCount})`;
        values.push(filtros.cpf_cnpj);
      }

      if (filtros.ramo_atividade) {
        paramCount++;
        query += ` AND fj.ramo_atividade ILIKE $${paramCount}`;
        values.push(`%${filtros.ramo_atividade}%`);
      }
    }

    query += ` GROUP BY f.id, fp.cpf, fj.cnpj, fe.documento, fj.razao_social, fj.responsavel, fj.ramo_atividade`;
    query += ` ORDER BY f.criado_em DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Métodos para produtos/serviços
  async adicionarProdutoServico(fornecedorId: number, produtoData: any): Promise<number> {
    const query = `
      INSERT INTO produtos_servicos (
        fornecedor_id, tipo, nome, descricao, unidade_medida, 
        preco_unitario, moeda, estoque_minimo, estoque_atual, ativo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;
    
    const values = [
      fornecedorId,
      produtoData.tipo,
      produtoData.nome,
      produtoData.descricao,
      produtoData.unidade_medida,
      produtoData.preco_unitario,
      produtoData.moeda,
      produtoData.estoque_minimo,
      produtoData.estoque_atual,
      produtoData.ativo !== false
    ];

    const result = await pool.query(query, values);
    return result.rows[0].id;
  }

  async atualizarProdutoServico(produtoId: number, produtoData: any): Promise<void> {
    const query = `
      UPDATE produtos_servicos 
      SET nome = $1, descricao = $2, preco_unitario = $3, 
          estoque_atual = $4, ativo = $5, atualizado_em = NOW()
      WHERE id = $6
    `;
    
    await pool.query(query, [
      produtoData.nome,
      produtoData.descricao,
      produtoData.preco_unitario,
      produtoData.estoque_atual,
      produtoData.ativo,
      produtoId
    ]);
  }

  // Validar campo de ordenação
  private validarCampoOrdenacao(campo: string): string {
    const camposPermitidos = [
      'id', 'nome', 'tipo_fornecedor', 'situacao', 
      'responsavel_compras', 'prazo_entrega', 'criado_em', 'atualizado_em'
    ];
    
    return camposPermitidos.includes(campo) ? campo : 'criado_em';
  }
}