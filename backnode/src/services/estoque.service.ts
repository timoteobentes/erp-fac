import pool from '../config/database';
import { EstoqueRepository } from '../repositories/EstoqueRepository';
import { MovimentacaoEstoque } from '../models/MovimentacaoEstoque';

export class EstoqueService {
  private estoqueRepository: EstoqueRepository;

  constructor() {
    this.estoqueRepository = new EstoqueRepository();
  }

  // =========================================================================
  // 1. LISTAR HISTÓRICO DE PRODUTO
  // =========================================================================
  async listarHistoricoProduto(produtoId: number, usuarioId: number) {
    return await this.estoqueRepository.listarHistoricoProduto(produtoId, usuarioId);
  }

  // =========================================================================
  // 2. MOVIMENTAR ESTOQUE (Entrada, Saída, Ajuste)
  // =========================================================================
  async movimentarEstoque(dados: MovimentacaoEstoque, usuarioId: number): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN'); // 1. Inicia Transação

      // Busca produto para garantir que existe, que pertence ao usuário, e pega o saldo atual
      // O "FOR UPDATE" bloqueia o registro de produto especifico para outras transações simultâneas
      // Mas para não complicar, mantemos o check simples:
      const resProduto = await client.query(
        'SELECT id, estoque_atual, movimenta_estoque FROM produtos WHERE id = $1 AND usuario_id = $2 FOR UPDATE',
        [dados.produto_id, usuarioId]
      );

      if (resProduto.rows.length === 0) {
        throw new Error('Produto não encontrado ou não pertence ao usuário.');
      }

      const produto = resProduto.rows[0];

      if (!produto.movimenta_estoque && dados.origem === 'pdv') {
         // Aqui pode simplesmente ignorar se a origem for pdv e o produto não movimentar estoque.
         await client.query('COMMIT');
         return;
      }

      let estoqueAtual = Number(produto.estoque_atual);
      const qtdMovimento = Number(dados.quantidade);
      let novoSaldo = estoqueAtual;

      // 2. Calcula novo saldo
      if (dados.tipo === 'entrada') {
        novoSaldo = estoqueAtual + qtdMovimento;
      } else if (dados.tipo === 'saida') {
        novoSaldo = estoqueAtual - qtdMovimento;
      } else if (dados.tipo === 'ajuste') {
        novoSaldo = qtdMovimento; // O saldo passa a ser exatamente o informado
      } else {
        throw new Error('Tipo de movimentação inválido.');
      }

      // 3. Atualiza produtos
      await client.query(
        'UPDATE produtos SET estoque_atual = $1, atualizado_em = NOW() WHERE id = $2',
        [novoSaldo, produto.id]
      );

      // 4. Salva Movimentação
      dados.usuario_id = usuarioId;
      dados.saldo_apos = novoSaldo;
      
      // Quando for 'ajuste', a quantidade real de movimentação gerada (diferença) para histórico
      if (dados.tipo === 'ajuste') {
         // Opcional, guardar a quantidade como o valor absoluto da diferença, 
         // Ou apenas guardar o número final
         dados.quantidade = qtdMovimento;
      }

      await this.estoqueRepository.registrarMovimentacaoTransaction(client, dados);

      await client.query('COMMIT'); // 5. Confirma Transação
    } catch (error) {
      await client.query('ROLLBACK'); // Desfaz se houver erro
      console.error('Erro ao movimentar estoque:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}
