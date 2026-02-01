import { PoolClient } from 'pg';
import pool from '../config/database';
import { BaseRepository } from './BaseRepository';
import { 
  Produto, 
  ProdutoImagem, 
  ProdutoConversao, 
  ProdutoComposicao 
} from '../models/Produto';

// DTO para Filtros de Listagem
export interface ProdutoFiltros {
  termo?: string; // Busca geral (nome, codigo, EAN)
  categoria_id?: number;
  marca_id?: number;
  situacao?: string;
  tipo_item?: string;
}

export class ProdutoRepository extends BaseRepository {

  // ============================================================================
  // 1. CREATE (CRIAÇÃO COM TRANSAÇÃO)
  // ============================================================================
  async criar(dados: Produto, usuarioId: number): Promise<number> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN'); // Inicia a transação

      // 1.1 Inserir Produto Pai
      const queryProduto = `
        INSERT INTO produtos (
          usuario_id, nome, descricao, codigo_interno, codigo_barras, tipo_item,
          situacao, categoria_id, marca_id, unidade_id, fornecedor_padrao_id,
          preco_custo, margem_lucro, preco_venda, preco_promocional,
          movimenta_estoque, estoque_atual, estoque_minimo, estoque_maximo
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15,
          $16, $17, $18, $19
        ) RETURNING id
      `;

      const valuesProduto = [
        usuarioId,
        dados.nome,
        dados.descricao || null,
        dados.codigo_interno || null,
        dados.codigo_barras || null,
        dados.tipo_item,
        dados.situacao || 'ativo',
        dados.categoria_id || null,
        dados.marca_id || null,
        dados.unidade_id,
        dados.fornecedor_padrao_id || null,
        dados.preco_custo || 0,
        dados.margem_lucro || 0,
        dados.preco_venda || 0,
        dados.preco_promocional || null,
        dados.movimenta_estoque || false,
        dados.estoque_atual || 0,
        dados.estoque_minimo || 0,
        dados.estoque_maximo || null
      ];

      const res = await client.query(queryProduto, valuesProduto);
      const novoProdutoId = res.rows[0].id;

      // 1.2 Salvar Tabelas Filhas (Imagens, Conversão, Composição)
      await this._salvarFilhos(client, novoProdutoId, dados);

      await client.query('COMMIT'); // Confirma tudo
      return novoProdutoId;

    } catch (error) {
      await client.query('ROLLBACK'); // Desfaz tudo se der erro
      console.error('Erro ao criar produto:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================================
  // 2. UPDATE (ATUALIZAÇÃO COM TRANSAÇÃO)
  // ============================================================================
  async atualizar(id: number, dados: Produto, usuarioId: number): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 2.1 Atualiza tabela pai
      const queryUpdate = `
        UPDATE produtos SET
          nome = $1, descricao = $2, codigo_interno = $3, codigo_barras = $4, tipo_item = $5,
          situacao = $6, categoria_id = $7, marca_id = $8, unidade_id = $9, fornecedor_padrao_id = $10,
          preco_custo = $11, margem_lucro = $12, preco_venda = $13, preco_promocional = $14,
          movimenta_estoque = $15, estoque_atual = $16, estoque_minimo = $17, estoque_maximo = $18,
          atualizado_em = NOW()
        WHERE id = $19 AND usuario_id = $20
      `;

      const valuesUpdate = [
        dados.nome, dados.descricao || null, dados.codigo_interno || null, dados.codigo_barras || null, dados.tipo_item,
        dados.situacao, dados.categoria_id || null, dados.marca_id || null, dados.unidade_id, dados.fornecedor_padrao_id || null,
        dados.preco_custo, dados.margem_lucro, dados.preco_venda, dados.preco_promocional || null,
        dados.movimenta_estoque, dados.estoque_atual, dados.estoque_minimo, dados.estoque_maximo || null,
        id, usuarioId
      ];

      await client.query(queryUpdate, valuesUpdate);

      // 2.2 Estratégia de Atualização de Filhos: Limpar e Recriar
      // Isso evita lógica complexa de "diff" (quem foi alterado, quem foi deletado...)
      await client.query('DELETE FROM produto_imagens WHERE produto_id = $1', [id]);
      await client.query('DELETE FROM produto_conversao WHERE produto_id = $1', [id]);
      await client.query('DELETE FROM produto_composicao WHERE produto_pai_id = $1', [id]);

      // 2.3 Re-inserir dados atualizados
      await this._salvarFilhos(client, id, dados);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao atualizar produto:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================================
  // 3. READ (LISTAGEM E BUSCA POR ID)
  // ============================================================================
  
  async listar(usuarioId: number, filtros: ProdutoFiltros, paginacao: { limit: number, offset: number }) {
    let query = `
      SELECT 
        p.id, p.nome, p.codigo_interno, p.codigo_barras, p.preco_venda, p.estoque_atual, p.situacao, p.tipo_item,
        c.nome as categoria_nome,
        m.nome as marca_nome,
        u.sigla as unidade_sigla,
        (SELECT url_imagem FROM produto_imagens pi WHERE pi.produto_id = p.id AND pi.principal = true LIMIT 1) as imagem_capa
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      WHERE p.usuario_id = $1
    `;
    
    const values: any[] = [usuarioId];
    let count = 2;

    if (filtros.termo) {
      query += ` AND (p.nome ILIKE $${count} OR p.codigo_interno ILIKE $${count} OR p.codigo_barras ILIKE $${count})`;
      values.push(`%${filtros.termo}%`);
      count++;
    }

    if (filtros.categoria_id) {
      query += ` AND p.categoria_id = $${count}`;
      values.push(filtros.categoria_id);
      count++;
    }

    if (filtros.situacao) {
      query += ` AND p.situacao = $${count}`;
      values.push(filtros.situacao);
      count++;
    }

    // Ordenação e Paginação
    const queryData = `${query} ORDER BY p.nome ASC LIMIT $${count} OFFSET $${count + 1}`;
    const valuesData = [...values, paginacao.limit, paginacao.offset];

    // Query de Contagem
    const queryCount = `SELECT COUNT(*) as total FROM produtos p WHERE p.usuario_id = $1` + query.split('WHERE p.usuario_id = $1')[1];
    
    const [resData, resCount] = await Promise.all([
      pool.query(queryData, valuesData),
      pool.query(queryCount, values)
    ]);

    return {
      produtos: resData.rows,
      total: parseInt(resCount.rows[0].total)
    };
  }

  async buscarPorId(id: number, usuarioId: number): Promise<Produto | null> {
    // 1. Busca Dados Principais
    const resProd = await pool.query(
      `SELECT * FROM produtos WHERE id = $1 AND usuario_id = $2`,
      [id, usuarioId]
    );

    if (resProd.rows.length === 0) return null;
    const produto = resProd.rows[0];

    // 2. Busca Dados Relacionados (Paralelo)
    const [resImg, resConv, resComp] = await Promise.all([
      pool.query(`SELECT * FROM produto_imagens WHERE produto_id = $1 ORDER BY ordem ASC`, [id]),
      pool.query(`SELECT * FROM produto_conversao WHERE produto_id = $1`, [id]),
      pool.query(`
        SELECT pc.*, p.nome as nome_produto_filho 
        FROM produto_composicao pc 
        JOIN produtos p ON pc.produto_filho_id = p.id
        WHERE pc.produto_pai_id = $1
      `, [id])
    ]);

    return {
      ...produto,
      preco_custo: Number(produto.preco_custo),
      preco_venda: Number(produto.preco_venda),
      estoque_atual: Number(produto.estoque_atual),
      imagens: resImg.rows,
      conversoes: resConv.rows,
      composicao: resComp.rows
    };
  }

  // ============================================================================
  // 4. DELETE
  // ============================================================================
  async excluir(id: number, usuarioId: number): Promise<void> {
    // Graças ao ON DELETE CASCADE no banco, isso apaga tudo (imagens, composição, etc)
    await pool.query(
      `DELETE FROM produtos WHERE id = $1 AND usuario_id = $2`,
      [id, usuarioId]
    );
  }

  // ============================================================================
  // 5. HELPER PRIVADO (Salvar Filhos)
  // ============================================================================
  private async _salvarFilhos(client: PoolClient, produtoId: number, dados: Produto) {
    
    // A. Imagens
    if (dados.imagens && dados.imagens.length > 0) {
      for (const img of dados.imagens) {
        await client.query(`
          INSERT INTO produto_imagens (produto_id, url_imagem, principal, ordem)
          VALUES ($1, $2, $3, $4)
        `, [produtoId, img.url_imagem, img.principal || false, img.ordem || 0]);
      }
    }

    // B. Conversão (Unidades)
    if (dados.conversoes && dados.conversoes.length > 0) {
      for (const conv of dados.conversoes) {
        await client.query(`
          INSERT INTO produto_conversao (produto_id, unidade_entrada_id, fator_conversao, codigo_barras_entrada)
          VALUES ($1, $2, $3, $4)
        `, [produtoId, conv.unidade_entrada_id, conv.fator_conversao, conv.codigo_barras_entrada || null]);
      }
    }

    // C. Composição (Se for KIT)
    if (dados.tipo_item === 'kit' && dados.composicao && dados.composicao.length > 0) {
      for (const comp of dados.composicao) {
        await client.query(`
          INSERT INTO produto_composicao (produto_pai_id, produto_filho_id, quantidade)
          VALUES ($1, $2, $3)
        `, [produtoId, comp.produto_filho_id, comp.quantidade]);
      }
    }
  }

  // ============================================================================
  // 6. AUXILIARES (Dropdowns)
  // ============================================================================
  async listarCategorias(usuarioId: number) {
    const res = await pool.query(`SELECT id, nome, categoria_pai_id FROM categorias WHERE usuario_id = $1 AND ativa = true ORDER BY nome`, [usuarioId]);
    return res.rows;
  }

  async listarMarcas(usuarioId: number) {
    const res = await pool.query(`SELECT id, nome FROM marcas WHERE usuario_id = $1 ORDER BY nome`, [usuarioId]);
    return res.rows;
  }

  async listarUnidades(usuarioId: number) {
    const res = await pool.query(`SELECT id, sigla, descricao FROM unidades_medida WHERE usuario_id = $1 ORDER BY sigla`, [usuarioId]);
    return res.rows;
  }
}