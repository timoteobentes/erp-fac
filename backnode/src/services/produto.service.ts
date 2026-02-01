import { ProdutoRepository, ProdutoFiltros } from '../repositories/ProdutoRepository';
import { Produto } from '../models/Produto';

export class ProdutoService {
  private produtoRepository: ProdutoRepository;

  constructor() {
    this.produtoRepository = new ProdutoRepository();
  }

  // =========================================================================
  // 1. CRUD PRINCIPAL (Com Validações)
  // =========================================================================

  async criarProduto(dados: Produto, usuarioId: number): Promise<number> {
    // 1. Sanitização
    const dadosLimpos = this.higienizarDados(dados);

    // 2. Validações de Negócio
    this.validarProduto(dadosLimpos);

    // 3. Persistência
    return await this.produtoRepository.criar(dadosLimpos, usuarioId);
  }

  async atualizarProduto(id: number, dados: Produto, usuarioId: number): Promise<void> {
    // 1. Verifica existência
    const produtoExistente = await this.produtoRepository.buscarPorId(id, usuarioId);
    if (!produtoExistente) {
      throw new Error('Produto não encontrado.');
    }

    // 2. Sanitização e Validação
    const dadosLimpos = this.higienizarDados(dados);
    this.validarProduto(dadosLimpos);

    // 3. Atualização Atômica
    await this.produtoRepository.atualizar(id, dadosLimpos, usuarioId);
  }

  async excluirProduto(id: number, usuarioId: number): Promise<void> {
    const produto = await this.produtoRepository.buscarPorId(id, usuarioId);
    if (!produto) {
      throw new Error('Produto não encontrado.');
    }

    // TODO: Aqui você pode adicionar validação extra, ex: 
    // "Não excluir se tiver vendas vinculadas" (checando em tabela de itens_venda)

    await this.produtoRepository.excluir(id, usuarioId);
  }

  async buscarProdutoPorId(id: number, usuarioId: number) {
    const produto = await this.produtoRepository.buscarPorId(id, usuarioId);
    if (!produto) throw new Error('Produto não encontrado.');
    return produto;
  }

  async listarProdutos(usuarioId: number, filtros: ProdutoFiltros, paginacao: { page: number, limit: number }) {
    const offset = (paginacao.page - 1) * paginacao.limit;
    
    // Tratamento de filtros vazios
    const filtrosLimpos: ProdutoFiltros = {
      ...filtros,
      termo: filtros.termo?.trim() || undefined,
      situacao: filtros.situacao || undefined,
      tipo_item: filtros.tipo_item || undefined
    };

    return await this.produtoRepository.listar(usuarioId, filtrosLimpos, {
      limit: paginacao.limit,
      offset
    });
  }

  // =========================================================================
  // 2. AUXILIARES (Para popular selects no Front)
  // =========================================================================

  async obterDadosAuxiliares(usuarioId: number) {
    const [categorias, marcas, unidades] = await Promise.all([
      this.produtoRepository.listarCategorias(usuarioId),
      this.produtoRepository.listarMarcas(usuarioId),
      this.produtoRepository.listarUnidades(usuarioId)
    ]);

    return { categorias, marcas, unidades };
  }

  // =========================================================================
  // 3. REGRAS DE NEGÓCIO E VALIDAÇÕES (Privados)
  // =========================================================================

  private validarProduto(dados: Produto) {
    const erros: string[] = [];

    // Validações Básicas
    if (!dados.nome) erros.push('O nome do produto é obrigatório.');
    if (!dados.unidade_id) erros.push('A unidade de medida é obrigatória.');
    
    // Validação de Preços
    if (dados.preco_venda < 0) erros.push('O preço de venda não pode ser negativo.');
    if (dados.preco_custo < 0) erros.push('O preço de custo não pode ser negativo.');

    // Regra de Negócio: KIT
    if (dados.tipo_item === 'kit') {
      if (!dados.composicao || dados.composicao.length === 0) {
        erros.push('Um Kit deve conter pelo menos um item na composição.');
      }
      
      // Opcional: Impedir kit dentro de kit para evitar loop infinito
      // Isso exigiria uma verificação no banco, pode ficar para v2
    }

    // Regra de Negócio: Código de Barras
    if (dados.codigo_barras && dados.codigo_barras.length > 50) {
      erros.push('O Código de Barras (EAN) é muito longo.');
    }

    if (erros.length > 0) {
      throw new Error(erros.join(' | '));
    }
  }

  private higienizarDados(dados: Produto): Produto {
    return {
      ...dados,
      nome: dados.nome?.trim(),
      descricao: dados.descricao?.trim(),
      codigo_interno: dados.codigo_interno?.trim() || undefined,
      codigo_barras: dados.codigo_barras?.trim() || undefined,
      
      // Garante números (caso venha string do front)
      preco_custo: Number(dados.preco_custo) || 0,
      margem_lucro: Number(dados.margem_lucro) || 0,
      preco_venda: Number(dados.preco_venda) || 0,
      preco_promocional: dados.preco_promocional ? Number(dados.preco_promocional) : null,
      
      estoque_atual: Number(dados.estoque_atual) || 0,
      estoque_minimo: Number(dados.estoque_minimo) || 0,
      estoque_maximo: dados.estoque_maximo ? Number(dados.estoque_maximo) : null,

      // Arrays garantidos
      imagens: dados.imagens || [],
      conversoes: dados.conversoes || [],
      composicao: dados.composicao || []
    };
  }
}