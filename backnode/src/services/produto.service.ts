import { ProdutoRepository, ProdutoFiltros } from '../repositories/ProdutoRepository';
import { Produto } from '../models/Produto';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

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
  // 3. EXPORTAÇÃO (CSV, EXCEL, PDF)
  // =========================================================================

  async exportarProdutos(usuarioId: number, opcoes: { formato: 'csv' | 'xlsx' | 'pdf', filtros?: ProdutoFiltros }): Promise<Buffer | string> {
    const listagem = await this.listarProdutos(usuarioId, opcoes.filtros || {}, { page: 1, limit: 10000 });
    const produtos = listagem.produtos;

    switch (opcoes.formato) {
      case 'csv':
        return this.gerarArquivoCSV(produtos);
      case 'xlsx':
        return await this.gerarArquivoExcel(produtos);
      case 'pdf':
        return await this.gerarArquivoPDF(produtos);
      default:
        throw new Error('Formato inválido');
    }
  }

  private gerarArquivoCSV(produtos: any[]): string {
    const header = ['ID', 'NOME', 'SKU/CODIGO', 'PRECO_VENDA', 'ESTOQUE', 'SITUACAO'].join(';');
    const rows = produtos.map(p => 
      `${p.id};"${p.nome}";${p.codigo_interno || p.codigo_barras || '-'};${Number(p.preco_venda || 0).toFixed(2)};${Number(p.estoque_atual || 0).toFixed(2)};${p.situacao}`
    );
    return [header, ...rows].join('\n');
  }

  private async gerarArquivoExcel(produtos: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Produtos');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nome do Produto', key: 'nome', width: 40 },
      { header: 'SKU / Código', key: 'codigo', width: 20 },
      { header: 'Preço Venda', key: 'preco', width: 15 },
      { header: 'Estoque Atual', key: 'estoque', width: 15 },
      { header: 'Situação', key: 'situacao', width: 15 }
    ];

    produtos.forEach(p => {
      worksheet.addRow({
        id: p.id,
        nome: p.nome,
        codigo: p.codigo_interno || p.codigo_barras || '-',
        preco: Number(p.preco_venda || 0),
        estoque: Number(p.estoque_atual || 0),
        situacao: p.situacao
      });
    });

    worksheet.getRow(1).font = { bold: true };
    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  private async gerarArquivoPDF(produtos: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(18).text('Relatório de Produtos', { align: 'center' }).moveDown();

      const drawHeader = (posY: number) => {
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('ID', 30, posY);
        doc.text('NOME', 80, posY);
        doc.text('CÓDIGO', 350, posY);
        doc.text('PREÇO', 480, posY);
        doc.text('ESTOQUE', 600, posY);
        doc.text('SITUAÇÃO', 700, posY);
        doc.moveTo(30, posY + 15).lineTo(770, posY + 15).stroke();
      };

      let y = 100;
      drawHeader(y);
      y += 25;
      doc.font('Helvetica').fontSize(9);

      produtos.forEach(p => {
        if (y > 550) {
          doc.addPage();
          y = 50;
          drawHeader(y);
          y += 25;
          doc.font('Helvetica').fontSize(9);
        }
        doc.text(String(p.id), 30, y);
        doc.text((p.nome || '').substring(0, 45), 80, y);
        doc.text(p.codigo_interno || p.codigo_barras || '-', 350, y);
        doc.text(Number(p.preco_venda || 0).toFixed(2), 480, y);
        doc.text(Number(p.estoque_atual || 0).toFixed(2), 600, y);
        const cor = p.situacao === 'inativo' ? 'red' : 'green';
        doc.fillColor(cor).text(p.situacao.toUpperCase(), 700, y).fillColor('black');
        
        y += 20;
        doc.save().strokeColor('#eeeeee').lineWidth(0.5).moveTo(30, y - 5).lineTo(770, y - 5).stroke().restore();
      });

      doc.end();
    });
  }

  // =========================================================================
  // 4. REGRAS DE NEGÓCIO E VALIDAÇÕES (Privados)
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

      peso: dados.peso ? Number(dados.peso) : null,
      largura: dados.largura ? Number(dados.largura) : null,
      altura: dados.altura ? Number(dados.altura) : null,
      comprimento: dados.comprimento ? Number(dados.comprimento) : null,
      vendido_separadamente: dados.vendido_separadamente !== undefined ? Boolean(dados.vendido_separadamente) : true,
      comercializavel_pdv: dados.comercializavel_pdv !== undefined ? Boolean(dados.comercializavel_pdv) : true,
      comissao: dados.comissao ? Number(dados.comissao) : null,
      despesas_acessorias: dados.despesas_acessorias ? Number(dados.despesas_acessorias) : null,
      outras_despesas: dados.outras_despesas ? Number(dados.outras_despesas) : null,
      ncm: dados.ncm ? String(dados.ncm).replace(/\D/g, '').substring(0, 8) : null,
      cest: dados.cest ? String(dados.cest).replace(/\D/g, '').substring(0, 7) : null,
      origem_mercadoria: dados.origem_mercadoria !== undefined && dados.origem_mercadoria !== null ? Number(dados.origem_mercadoria) : null,
      cfop_padrao: dados.cfop_padrao ? String(dados.cfop_padrao).replace(/\D/g, '').substring(0, 4) : null,

      // Arrays garantidos
      imagens: dados.imagens || [],
      conversoes: dados.conversoes || [],
      composicao: dados.composicao || []
    };
  }
}