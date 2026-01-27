import pool from '../config/database';
import { BaseRepository } from './BaseRepository';
import { NovoProdutoRequest } from '../models/Produto';

export class ProdutoRepository extends BaseRepository {

  async criarProdutoCompleto(produtoData: NovoProdutoRequest, usuarioId: number): Promise<number> {
    const client = await pool.connect(); // Pega um cliente dedicado para transação
    
    try {
      await client.query('BEGIN'); // Inicia Transação

      // 1. Inserir Produto Principal
      const queryProduto = `
        INSERT INTO produtos (
          usuario_id, nome, descricao, codigo_interno, codigo_barras, tipo_item,
          categoria_id, marca_id, fornecedor_padrao_id,
          preco_custo, margem_lucro, preco_venda, preco_promocional,
          movimenta_estoque, estoque_atual, estoque_minimo, estoque_maximo, unidade_id,
          ncm, cest, cfop_padrao, origem_mercadoria, situacao_tributaria, aliquota_icms, aliquota_ipi,
          ativo, imagem_capa
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 
          $19, $20, $21, $22, $23, $24, $25, $26, $27
        ) RETURNING id
      `;

      const valuesProduto = [
        usuarioId, // Garantia de Isolamento
        produtoData.nome, produtoData.descricao, produtoData.codigo_interno, produtoData.codigo_barras, produtoData.tipo_item,
        produtoData.categoria_id, produtoData.marca_id, produtoData.fornecedor_padrao_id,
        produtoData.preco_custo || 0, produtoData.margem_lucro || 0, produtoData.preco_venda, produtoData.preco_promocional,
        produtoData.movimenta_estoque, produtoData.estoque_atual || 0, produtoData.estoque_minimo || 0, produtoData.estoque_maximo, produtoData.unidade_id,
        produtoData.ncm, produtoData.cest, produtoData.cfop_padrao, produtoData.origem_mercadoria || 0, produtoData.situacao_tributaria, produtoData.aliquota_icms || 0, produtoData.aliquota_ipi || 0,
        produtoData.ativo !== false, produtoData.imagem_capa
      ];

      const resProduto = await client.query(queryProduto, valuesProduto);
      const produtoId = resProduto.rows[0].id;

      // 2. Inserir Imagens (Galeria)
      if (produtoData.imagens && produtoData.imagens.length > 0) {
        for (const img of produtoData.imagens) {
          await client.query(
            `INSERT INTO produtos_imagens (produto_id, url_imagem, ordem, principal) VALUES ($1, $2, $3, $4)`,
            [produtoId, img.url_imagem, img.ordem || 0, img.principal || false]
          );
        }
      }

      // 3. Inserir Conversões (Se houver)
      if (produtoData.conversoes && produtoData.conversoes.length > 0) {
        for (const conv of produtoData.conversoes) {
          await client.query(
            `INSERT INTO produtos_conversao (produto_id, unidade_entrada_id, fator_conversao, codigo_barras_entrada) VALUES ($1, $2, $3, $4)`,
            [produtoId, conv.unidade_entrada_id, conv.fator_conversao, conv.codigo_barras_entrada]
          );
        }
      }

      // 4. Inserir Composição (Se for Kit)
      if (produtoData.tipo_item === 'kit' && produtoData.composicao && produtoData.composicao.length > 0) {
        for (const comp of produtoData.composicao) {
          await client.query(
            `INSERT INTO produtos_composicao (produto_pai_id, produto_filho_id, quantidade) VALUES ($1, $2, $3)`,
            [produtoId, comp.produto_filho_id, comp.quantidade]
          );
        }
      }

      await client.query('COMMIT'); // Confirma tudo se não deu erro
      return produtoId;

    } catch (error) {
      await client.query('ROLLBACK'); // Desfaz tudo se der erro
      console.error('Erro na transação de criação de produto:', error);
      throw error;
    } finally {
      client.release(); // Libera a conexão de volta para o pool
    }
  }

  // Método de listagem simples para teste
  async listarProdutos(usuarioId: number) {
    return this.queryWithIsolation(
      `SELECT id, nome, codigo_barras, preco_venda, estoque_atual, ncm FROM produtos`, 
      [], 
      usuarioId
    );
  }
}