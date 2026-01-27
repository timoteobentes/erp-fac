import { ProdutoRepository } from '../repositories/ProdutoRepository';
import { NovoProdutoRequest } from '../models/Produto';

export class ProdutoService {
  private produtoRepository: ProdutoRepository;

  constructor() {
    this.produtoRepository = new ProdutoRepository();
  }

  async criarProduto(dados: NovoProdutoRequest, usuarioId: number) {
    // 1. Validações Básicas
    if (!dados.nome) throw new Error("O nome do produto é obrigatório");
    if (!dados.preco_venda || dados.preco_venda < 0) throw new Error("O preço de venda deve ser válido");
    if (!dados.unidade_id) throw new Error("A unidade de medida é obrigatória");

    // 2. Validações Fiscais (Crítico para seu módulo)
    if (dados.movimenta_estoque && !dados.ncm) {
      // Se movimenta estoque, geralmente vai vender, então precisa de NCM
      throw new Error("O NCM é obrigatório para produtos que movimentam estoque/venda");
    }

    // 3. Tratamento de Dados (Sanitization)
    // Remove caracteres especiais do NCM se vierem
    if (dados.ncm) dados.ncm = dados.ncm.replace(/\D/g, ''); 
    if (dados.cest) dados.cest = dados.cest.replace(/\D/g, '');

    // 4. Chama o Repository
    return await this.produtoRepository.criarProdutoCompleto(dados, usuarioId);
  }

  async listarProdutos(usuarioId: number) {
    const result = await this.produtoRepository.listarProdutos(usuarioId);
    return result.rows;
  }
}