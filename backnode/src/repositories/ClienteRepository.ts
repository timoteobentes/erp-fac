import { PoolClient } from 'pg';
import pool from '../config/database';
import { BaseRepository } from './BaseRepository';
import { type NovoClienteDTO } from '../models/Cliente';

export interface FiltrosCliente {
  nome?: string;
  email?: string;
  cpf_cnpj?: string; // Busca genérica em qualquer documento
  tipo_cliente?: string;
  situacao?: string;
  vendedor?: string;
  cidade?: string;
  estado?: string;
  data_inicio?: string;
  data_fim?: string;
}

export class ClienteRepository extends BaseRepository {

  // ============================================================================
  // 1. CRIAÇÃO (TRANSAÇÃO COMPLETA)
  // ============================================================================
  async criarClienteCompleto(dados: NovoClienteDTO, usuarioId: number): Promise<number> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO clientes (
          usuario_id, tipo_cliente, situacao, nome, nome_fantasia,
          cpf, rg, cnpj, documento_estrangeiro,
          inscricao_estadual, inscricao_municipal, inscricao_suframa, isento_ie,
          data_nascimento, sexo, pais_origem,
          email, telefone_comercial, telefone_celular, site, responsavel,
          vendedor_responsavel, limite_credito, permitir_ultrapassar_limite,
          observacoes, foto_perfil_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
        RETURNING id
      `;

      const values = [
        usuarioId, dados.tipo_cliente, dados.situacao || 'ativo', dados.nome, dados.nome_fantasia || null,
        dados.cpf || null, dados.rg || null, dados.cnpj || null, dados.documento || null,
        dados.inscricao_estadual || null, dados.inscricao_municipal || null, dados.inscricao_suframa || null, dados.isento_ie || false,
        dados.data_nascimento || null, dados.sexo || null, dados.pais_origem || 'Brasil',
        dados.email, dados.telefone_comercial || null, dados.telefone_celular || null, dados.site || null, dados.responsavel || null,
        dados.vendedor_responsavel || null, dados.limite_credito || 0, dados.permitir_ultrapassar_limite || false,
        dados.observacoes || null, dados.foto?.url || null
      ];

      const res = await client.query(insertQuery, values);
      const novoId = res.rows[0].id;

      await this._salvarFilhos(client, novoId, dados);

      await client.query('COMMIT');
      return novoId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================================
  // 2. ATUALIZAÇÃO (TRANSAÇÃO COMPLETA)
  // ============================================================================
  async atualizarCliente(id: number, dados: NovoClienteDTO, usuarioId: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Atualiza Tabela Pai
      const updateQuery = `
        UPDATE clientes SET
          tipo_cliente = $1, situacao = $2, nome = $3, nome_fantasia = $4,
          cpf = $5, rg = $6, cnpj = $7, documento_estrangeiro = $8,
          inscricao_estadual = $9, inscricao_municipal = $10, inscricao_suframa = $11, isento_ie = $12,
          data_nascimento = $13, sexo = $14, pais_origem = $15,
          email = $16, telefone_comercial = $17, telefone_celular = $18, site = $19, responsavel = $20,
          vendedor_responsavel = $21, limite_credito = $22, permitir_ultrapassar_limite = $23,
          observacoes = $24, atualizado_em = NOW()
        WHERE id = $25 AND usuario_id = $26
      `;

      const values = [
        dados.tipo_cliente, dados.situacao, dados.nome, dados.nome_fantasia || null,
        dados.cpf || null, dados.rg || null, dados.cnpj || null, dados.documento || null,
        dados.inscricao_estadual || null, dados.inscricao_municipal || null, dados.inscricao_suframa || null, dados.isento_ie || false,
        dados.data_nascimento || null, dados.sexo || null, dados.pais_origem || 'Brasil',
        dados.email, dados.telefone_comercial || null, dados.telefone_celular || null, dados.site || null, dados.responsavel || null,
        dados.vendedor_responsavel || null, dados.limite_credito || 0, dados.permitir_ultrapassar_limite || false,
        dados.observacoes || null,
        id, usuarioId
      ];

      await client.query(updateQuery, values);

      // 2. Estratégia de Atualização de Filhos: Limpar e Recriar
      // (Mais seguro para consistência quando vem o formulário completo do front)
      await client.query('DELETE FROM enderecos WHERE cliente_id = $1', [id]);
      await client.query('DELETE FROM contatos WHERE cliente_id = $1', [id]);
      // Não deletamos anexos automaticamente para não perder arquivos, a gestão de anexos costuma ser individual

      // 3. Re-inserir Endereços e Contatos
      await this._salvarFilhos(client, id, dados, false); // false para pular anexos se não quiser duplicar

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================================
  // 3. LEITURA (BUSCAS E LISTAGEM)
  // ============================================================================

  async buscarClientePorId(id: number, usuarioId: number) {
    const clientRes = await pool.query(
      `SELECT * FROM clientes WHERE id = $1 AND usuario_id = $2`, 
      [id, usuarioId]
    );

    if (clientRes.rows.length === 0) return null;

    const [endRes, conRes, anxRes] = await Promise.all([
      pool.query('SELECT * FROM enderecos WHERE cliente_id = $1', [id]),
      pool.query('SELECT * FROM contatos WHERE cliente_id = $1', [id]),
      pool.query('SELECT * FROM anexos WHERE cliente_id = $1', [id])
    ]);

    return {
      ...clientRes.rows[0],
      enderecos: endRes.rows,
      contatos: conRes.rows,
      anexos: anxRes.rows
    };
  }

  async buscarClientePorDocumento(documento: string, usuarioId: number) {
    // Busca em qualquer coluna de documento
    const query = `
      SELECT * FROM clientes 
      WHERE usuario_id = $1 
      AND (cpf = $2 OR cnpj = $2 OR documento_estrangeiro = $2)
    `;
    const result = await pool.query(query, [usuarioId, documento]);
    return result.rows[0] || null;
  }

  async verificarDocumentoExistente(documento: string, usuarioId: number, ignorarId?: number): Promise<boolean> {
    let query = `
      SELECT id FROM clientes 
      WHERE usuario_id = $1 
      AND (cpf = $2 OR cnpj = $2 OR documento_estrangeiro = $2)
    `;
    const params = [usuarioId, documento];

    if (ignorarId) {
      query += ` AND id != $3`;
      params.push(ignorarId);
    }

    const res = await pool.query(query, params);
    return res.rows.length > 0;
  }

  async listarClientesComFiltros(usuarioId: number, filtros: FiltrosCliente, paginacao?: { limit: number, offset: number }) {
    const { query, values } = this._construirQueryFiltros(usuarioId, filtros);

    // Adicionar ordenação
    const queryCompleta = `${query} ORDER BY criado_em DESC`;
    
    // Paginação
    let finalQuery = queryCompleta;
    if (paginacao) {
      finalQuery += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
      values.push(paginacao.limit, paginacao.offset);
    }

    // Executar Query de Dados
    const result = await pool.query(finalQuery, values);

    // Executar Query de Contagem (para paginação no front)
    // Remove o ORDER BY e LIMIT/OFFSET para contar
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
    // Reutiliza os values dos filtros (sem limit/offset)
    const countValues = values.slice(0, values.length - (paginacao ? 2 : 0));
    
    const countRes = await pool.query(countQuery, countValues);

    return {
      clientes: result.rows,
      total: parseInt(countRes.rows[0].total)
    };
  }

  async listarClientesParaExportacao(usuarioId: number, filtros: FiltrosCliente) {
    const { query, values } = this._construirQueryFiltros(usuarioId, filtros);
    const finalQuery = `${query} ORDER BY nome ASC`;
    const result = await pool.query(finalQuery, values);
    return result.rows;
  }

  // ============================================================================
  // 4. AÇÕES DE STATUS E EXCLUSÃO
  // ============================================================================

  async mudarStatusCliente(id: number, usuarioId: number, situacao: string): Promise<void> {
    await pool.query(
      `UPDATE clientes SET situacao = $1, atualizado_em = NOW() WHERE id = $2 AND usuario_id = $3`,
      [situacao, id, usuarioId]
    );
  }

  async excluirClientePermanentemente(id: number, usuarioId: number): Promise<void> {
    // CASCADE no banco já remove endereços, contatos e anexos
    await pool.query(
      `DELETE FROM clientes WHERE id = $1 AND usuario_id = $2`,
      [id, usuarioId]
    );
  }

  // ============================================================================
  // 5. UTILITÁRIOS E EXPORTAÇÃO
  // ============================================================================

  // Gera o CSV bruto (separado por vírgula ou ponto-e-vírgula)
  async exportarClientesCSV(clientes: any[]): Promise<string> {
    const header = [
      'ID', 'Nome/Razão Social', 'Nome Fantasia', 'Tipo', 'Documento', 
      'Email', 'Telefone', 'Situação', 'Data Cadastro'
    ].join(';');

    const rows = clientes.map(c => {
      const doc = c.cpf || c.cnpj || c.documento_estrangeiro || '';
      const tel = c.telefone_celular || c.telefone_comercial || '';
      
      // Tratamento para evitar quebra de CSV se houver ponto e vírgula no texto
      const clean = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;

      return [
        c.id,
        clean(c.nome),
        clean(c.nome_fantasia),
        c.tipo_cliente,
        clean(doc),
        clean(c.email),
        clean(tel),
        c.situacao,
        c.criado_em ? new Date(c.criado_em).toLocaleDateString('pt-BR') : ''
      ].join(';');
    });

    return [header, ...rows].join('\n');
  }

  validarCampoOrdenacao(campo: string): string {
    const camposPermitidos = ['nome', 'criado_em', 'situacao', 'email', 'limite_credito'];
    return camposPermitidos.includes(campo) ? campo : 'criado_em';
  }

  // ============================================================================
  // MÉTODOS PRIVADOS (HELPERS)
  // ============================================================================

  /**
   * Constrói a query WHERE dinamicamente baseada nos filtros
   */
  private _construirQueryFiltros(usuarioId: number, filtros: FiltrosCliente) {
    let query = `
      SELECT 
        c.*, 
        -- Pega a cidade do endereço principal ou o primeiro que achar
        (SELECT cidade || '/' || uf FROM enderecos e WHERE e.cliente_id = c.id LIMIT 1) as localizacao,
        (SELECT valor FROM contatos ct WHERE ct.cliente_id = c.id AND ct.principal = true LIMIT 1) as telefone_principal
      FROM clientes c
      WHERE c.usuario_id = $1
    `;
    const values: any[] = [usuarioId];
    let count = 2;

    if (filtros.nome) {
      query += ` AND (c.nome ILIKE $${count} OR c.nome_fantasia ILIKE $${count})`;
      values.push(`%${filtros.nome}%`);
      count++;
    }

    if (filtros.email) {
      query += ` AND c.email ILIKE $${count}`;
      values.push(`%${filtros.email}%`);
      count++;
    }

    if (filtros.cpf_cnpj) {
      query += ` AND (c.cpf LIKE $${count} OR c.cnpj LIKE $${count} OR c.documento_estrangeiro LIKE $${count})`;
      values.push(`%${filtros.cpf_cnpj}%`); // Assumindo que o service já limpou caracteres especiais
      count++;
    }

    if (filtros.tipo_cliente) {
      query += ` AND c.tipo_cliente = $${count}`;
      values.push(filtros.tipo_cliente);
      count++;
    }

    if (filtros.situacao) {
      query += ` AND c.situacao = $${count}`;
      values.push(filtros.situacao);
      count++;
    }

    // Filtro por período de cadastro
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND c.criado_em BETWEEN $${count} AND $${count + 1}`;
      values.push(filtros.data_inicio, filtros.data_fim);
      count += 2;
    }

    return { query, values };
  }

  /**
   * Salva as tabelas filhas (Endereços, Contatos, Anexos) dentro da transação
   */
  private async _salvarFilhos(client: PoolClient, clienteId: number, dados: NovoClienteDTO, salvarAnexos = true) {
    // Endereços
    if (dados.enderecos?.length) {
      for (const end of dados.enderecos) {
        await client.query(`
          INSERT INTO enderecos (cliente_id, tipo, cep, logradouro, numero, complemento, bairro, cidade, uf, pais, principal)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [clienteId, end.tipo, end.cep, end.logradouro, end.numero, end.complemento, end.bairro, end.cidade, end.uf, end.pais || 'Brasil', end.principal || false]);
      }
    }

    // Contatos
    if (dados.contatos?.length) {
      for (const ctt of dados.contatos) {
        await client.query(`
          INSERT INTO contatos (cliente_id, tipo, nome, valor, cargo, observacao, principal)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [clienteId, ctt.tipo, ctt.nome, ctt.valor, ctt.cargo, ctt.observacao, ctt.principal || false]);
      }
    }

    // Anexos (Geralmente só na criação ou upload específico, na edição costuma ser separado)
    if (salvarAnexos && dados.anexos?.length) {
      for (const anx of dados.anexos) {
        if (anx.url) {
          await client.query(`
            INSERT INTO anexos (cliente_id, nome_arquivo, url_arquivo, tipo_arquivo)
            VALUES ($1, $2, $3, $4)
          `, [clienteId, anx.nome, anx.url, anx.tipo || 'arquivo']);
        }
      }
    }
  }
}