import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { FornecedorRepository } from '../repositories/FornecedorRepository';
import { NovoFornecedorRequest, FornecedorCompleto } from '../models/Fornecedor';

export interface FiltrosFornecedor {
  nome?: string;
  email?: string;
  tipo_fornecedor?: string;
  situacao?: string;
  cpf_cnpj?: string;
  responsavel_compras?: string;
  ramo_atividade?: string;
  data_inicio?: string;
  data_fim?: string;
}

export interface OpcoesExportacao {
  formato: 'csv' | 'excel' | 'pdf';
  filtros?: FiltrosFornecedor;
}

export interface OpcoesPaginacao {
  limite: number;
  offset: number;
}

export interface OpcoesOrdenacao {
  ordenarPor: string;
  ordem: string;
}

export interface ResultadoPaginado {
  fornecedores: any[];
  total: number;
}

export interface EstatisticasFornecedores {
  total: number;
  ativos: number;
  inativos: number;
  porTipo: {
    PF: number;
    PJ: number;
    estrangeiro: number;
  };
  totalProdutosServicos: number;
  valorTotalEstoque: number;
  ultimosCadastrados: any[];
}

export class FornecedorService {
  private fornecedorRepository: FornecedorRepository;

  constructor() {
    this.fornecedorRepository = new FornecedorRepository();
  }

  async criarFornecedor(fornecedorData: NovoFornecedorRequest, usuarioId: number): Promise<number> {
    // Verificar se documento já existe
    if (fornecedorData.tipo_fornecedor === 'PF' && fornecedorData.cpf) {
      const cpfExiste = await this.fornecedorRepository.verificarDocumentoExistente('PF', fornecedorData.cpf, usuarioId);
      if (cpfExiste) {
        throw new Error('CPF já cadastrado para este usuário');
      }
    }

    if (fornecedorData.tipo_fornecedor === 'PJ' && fornecedorData.cnpj) {
      const cnpjExiste = await this.fornecedorRepository.verificarDocumentoExistente('PJ', fornecedorData.cnpj, usuarioId);
      if (cnpjExiste) {
        throw new Error('CNPJ já cadastrado para este usuário');
      }
    }

    try {
      // Criar fornecedor base
      const fornecedorId = await this.fornecedorRepository.criarFornecedorBase({
        ...fornecedorData,
        usuario_id: usuarioId
      });

      // Criar dados específicos baseados no tipo
      if (fornecedorData.tipo_fornecedor === 'PF') {
        await this.fornecedorRepository.criarFornecedorPF(fornecedorId, {
          cpf: fornecedorData.cpf,
          rg: fornecedorData.rg,
          nascimento: fornecedorData.nascimento,
          tipo_contribuinte: fornecedorData.tipo_contribuinte
        });
      } else if (fornecedorData.tipo_fornecedor === 'PJ') {
        await this.fornecedorRepository.criarFornecedorPJ(fornecedorId, {
          cnpj: fornecedorData.cnpj,
          razao_social: fornecedorData.razao_social,
          inscricao_estadual: fornecedorData.inscricao_estadual,
          isento: fornecedorData.isento,
          tipo_contribuinte: fornecedorData.tipo_contribuinte,
          inscricao_municipal: fornecedorData.inscricao_municipal,
          inscricao_suframa: fornecedorData.inscricao_suframa,
          responsavel: fornecedorData.responsavel,
          ramo_atividade: fornecedorData.ramo_atividade
        });
      } else if (fornecedorData.tipo_fornecedor === 'estrangeiro') {
        await this.fornecedorRepository.criarFornecedorEstrangeiro(fornecedorId, {
          documento: fornecedorData.documento,
          pais_origem: fornecedorData.pais_origem
        });
      }

      // Criar endereços
      await this.fornecedorRepository.criarEnderecos(fornecedorId, fornecedorData.enderecos);

      // Criar contatos
      await this.fornecedorRepository.criarContatos(fornecedorId, fornecedorData.contatos);

      // Criar produtos/serviços se existirem
      if (fornecedorData.produtos_servicos && fornecedorData.produtos_servicos.length > 0) {
        await this.fornecedorRepository.criarProdutosServicos(fornecedorId, fornecedorData.produtos_servicos);
      }

      // Criar anexos se existirem
      if (fornecedorData.anexos && fornecedorData.anexos.length > 0) {
        await this.fornecedorRepository.criarAnexos(fornecedorId, fornecedorData.anexos);
      }

      return fornecedorId;

    } catch (error: any) {
      throw new Error(`Erro ao criar fornecedor: ${error.message}`);
    }
  }

  async buscarFornecedor(id: number, usuarioId: number): Promise<FornecedorCompleto | null> {
    return await this.fornecedorRepository.buscarFornecedorPorId(id, usuarioId);
  }

  async listarFornecedores(usuarioId: number): Promise<any[]> {
    return await this.fornecedorRepository.listarFornecedoresPorUsuario(usuarioId);
  }

  async listarFornecedoresComFiltros(
    usuarioId: number, 
    filtros: FiltrosFornecedor, 
    paginacao: OpcoesPaginacao,
    ordenacao: OpcoesOrdenacao
  ): Promise<ResultadoPaginado> {
    return await this.fornecedorRepository.listarFornecedoresComFiltros(
      usuarioId, 
      filtros, 
      paginacao, 
      ordenacao
    );
  }

  async atualizarFornecedor(
    fornecedorId: number, 
    usuarioId: number, 
    fornecedorData: Partial<NovoFornecedorRequest>
  ): Promise<void> {
    // Verificar isolamento antes de qualquer operação
    const fornecedorExistente = await this.buscarFornecedor(fornecedorId, usuarioId);
    if (!fornecedorExistente) {
      throw new Error('Fornecedor não encontrado ou acesso não autorizado');
    }

    // Verificar documentos com isolamento
    if (fornecedorData.cpf && fornecedorData.tipo_fornecedor === 'PF') {
      const cpfExiste = await this.fornecedorRepository.verificarDocumentoExistente(
        'PF', 
        fornecedorData.cpf, 
        usuarioId
      );
      if (cpfExiste) {
        throw new Error('CPF já cadastrado para este usuário');
      }
    }

    await this.fornecedorRepository.atualizarFornecedor(fornecedorId, usuarioId, fornecedorData);
  }

  async mudarStatusFornecedor(fornecedorId: number, usuarioId: number, situacao: string): Promise<void> {
    const fornecedorExistente = await this.buscarFornecedor(fornecedorId, usuarioId);
    if (!fornecedorExistente) {
      throw new Error('Fornecedor não encontrado ou não pertence ao usuário');
    }

    await this.fornecedorRepository.mudarStatusFornecedor(fornecedorId, usuarioId, situacao);
  }

  async excluirFornecedor(fornecedorId: number, usuarioId: number, hardDelete: boolean = false): Promise<void> {
    const fornecedorExistente = await this.buscarFornecedor(fornecedorId, usuarioId);
    if (!fornecedorExistente) {
      throw new Error('Fornecedor não encontrado ou não pertence ao usuário');
    }

    if (hardDelete) {
      await this.fornecedorRepository.excluirFornecedorPermanentemente(fornecedorId, usuarioId);
    } else {
      await this.fornecedorRepository.mudarStatusFornecedor(fornecedorId, usuarioId, 'inativo');
    }
  }

  async buscarFornecedorPorDocumento(usuarioId: number, documento: string): Promise<FornecedorCompleto | null> {
    return await this.fornecedorRepository.buscarFornecedorPorDocumento(usuarioId, documento);
  }

  async obterEstatisticasFornecedores(usuarioId: number): Promise<EstatisticasFornecedores> {
    return await this.fornecedorRepository.obterEstatisticasFornecedores(usuarioId);
  }

  async exportarFornecedores(
    usuarioId: number,
    formato: string,
    filtros?: FiltrosFornecedor
  ): Promise<string | Buffer> {
    try {
      const fornecedores = await this.fornecedorRepository.listarFornecedoresParaExportacao(
        usuarioId,
        filtros
      );

      console.log(`Exportando ${fornecedores.length} fornecedores no formato ${formato}`);

      switch (formato.toLowerCase()) {
        case 'csv':
          return await this.exportarParaCSV(fornecedores);
        case 'xlsx':
          return await this.exportarParaExcel(fornecedores);
        case 'pdf':
          return await this.exportarParaPDF(fornecedores);
        default:
          throw new Error(`Formato de exportação não suportado: ${formato}`);
      }
    } catch (error: any) {
      console.error('Erro no exportarFornecedores:', error);
      throw new Error(`Erro ao exportar fornecedores: ${error.message}`);
    }
  }

  async validarDadosFornecedor(fornecedorData: NovoFornecedorRequest): Promise<string[]> {
    const errors: string[] = [];

    // Validações básicas
    if (!fornecedorData.nome || fornecedorData.nome.trim().length < 2) {
      errors.push('Nome é obrigatório e deve ter pelo menos 2 caracteres');
    }

    if (!fornecedorData.enderecos || fornecedorData.enderecos.length === 0) {
      errors.push('Pelo menos um endereço é obrigatório');
    }

    if (!fornecedorData.contatos || fornecedorData.contatos.length === 0) {
      errors.push('Pelo menos um contato é obrigatório');
    }

    // Validações específicas por tipo
    if (fornecedorData.tipo_fornecedor === 'PF') {
      if (!fornecedorData.cpf) errors.push('CPF é obrigatório para pessoa física');
      if (!fornecedorData.rg) errors.push('RG é obrigatório para pessoa física');
    } else if (fornecedorData.tipo_fornecedor === 'PJ') {
      if (!fornecedorData.cnpj) errors.push('CNPJ é obrigatório para pessoa jurídica');
      if (!fornecedorData.razao_social) errors.push('Razão social é obrigatória para pessoa jurídica');
      if (!fornecedorData.responsavel) errors.push('Responsável é obrigatório para pessoa jurídica');
    } else if (fornecedorData.tipo_fornecedor === 'estrangeiro') {
      if (!fornecedorData.documento) errors.push('Documento é obrigatório para estrangeiro');
    }

    return errors;
  }

  // Métodos para produtos/serviços
  async adicionarProdutoServico(fornecedorId: number, usuarioId: number, produtoData: any): Promise<number> {
    const fornecedorExistente = await this.buscarFornecedor(fornecedorId, usuarioId);
    if (!fornecedorExistente) {
      throw new Error('Fornecedor não encontrado ou não pertence ao usuário');
    }

    return await this.fornecedorRepository.adicionarProdutoServico(fornecedorId, produtoData);
  }

  async atualizarProdutoServico(produtoId: number, produtoData: any): Promise<void> {
    await this.fornecedorRepository.atualizarProdutoServico(produtoId, produtoData);
  }

  private async exportarParaCSV(fornecedores: any[]): Promise<string> {
    const headers = [
      'ID',
      'Nome',
      'Tipo Fornecedor',
      'Documento',
      'Razão Social',
      'Responsável',
      'Ramo Atividade',
      'Email',
      'Telefone Comercial',
      'Telefone Celular',
      'Situação',
      'Responsável Compras',
      'Prazo Entrega (dias)',
      'Condição Pagamento',
      'Total Produtos',
      'Observações',
      'Data Cadastro',
      'Data Atualização'
    ];

    const rows = fornecedores.map(fornecedor => [
      fornecedor.id,
      `"${fornecedor.nome || ''}"`,
      fornecedor.tipo_fornecedor,
      `"${fornecedor.documento || ''}"`,
      `"${fornecedor.razao_social || ''}"`,
      `"${fornecedor.responsavel || ''}"`,
      `"${fornecedor.ramo_atividade || ''}"`,
      `"${fornecedor.email || ''}"`,
      `"${fornecedor.telefone_comercial || ''}"`,
      `"${fornecedor.telefone_celular || ''}"`,
      fornecedor.situacao,
      `"${fornecedor.responsavel_compras || ''}"`,
      fornecedor.prazo_entrega || 0,
      `"${fornecedor.condicao_pagamento || ''}"`,
      fornecedor.total_produtos || 0,
      `"${fornecedor.observacoes || ''}"`,
      fornecedor.criado_em ? new Date(fornecedor.criado_em).toLocaleDateString('pt-BR') : '',
      fornecedor.atualizado_em ? new Date(fornecedor.atualizado_em).toLocaleDateString('pt-BR') : ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private async exportarParaExcel(fornecedores: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Fornecedores';
    workbook.created = new Date();
    
    const worksheet = workbook.addWorksheet('Fornecedores');
    
    // Definir cabeçalhos
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nome', key: 'nome', width: 30 },
      { header: 'Tipo', key: 'tipo_fornecedor', width: 15 },
      { header: 'Documento', key: 'documento', width: 20 },
      { header: 'Razão Social', key: 'razao_social', width: 30 },
      { header: 'Responsável', key: 'responsavel', width: 25 },
      { header: 'Ramo', key: 'ramo_atividade', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Tel. Comercial', key: 'telefone_comercial', width: 20 },
      { header: 'Tel. Celular', key: 'telefone_celular', width: 20 },
      { header: 'Situação', key: 'situacao', width: 15 },
      { header: 'Resp. Compras', key: 'responsavel_compras', width: 25 },
      { header: 'Prazo Entrega', key: 'prazo_entrega', width: 15 },
      { header: 'Cond. Pagamento', key: 'condicao_pagamento', width: 20 },
      { header: 'Produtos', key: 'total_produtos', width: 10 },
      { header: 'Observações', key: 'observacoes', width: 40 },
      { header: 'Data Cadastro', key: 'criado_em', width: 15 },
      { header: 'Data Atualização', key: 'atualizado_em', width: 15 }
    ];

    // Estilizar cabeçalhos
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0072C6' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Adicionar dados
    fornecedores.forEach(fornecedor => {
      worksheet.addRow({
        id: fornecedor.id,
        nome: fornecedor.nome || '',
        tipo_fornecedor: fornecedor.tipo_fornecedor,
        documento: fornecedor.documento || '',
        razao_social: fornecedor.razao_social || '',
        responsavel: fornecedor.responsavel || '',
        ramo_atividade: fornecedor.ramo_atividade || '',
        email: fornecedor.email || '',
        telefone_comercial: fornecedor.telefone_comercial || '',
        telefone_celular: fornecedor.telefone_celular || '',
        situacao: fornecedor.situacao,
        responsavel_compras: fornecedor.responsavel_compras || '',
        prazo_entrega: fornecedor.prazo_entrega || 0,
        condicao_pagamento: fornecedor.condicao_pagamento || '',
        total_produtos: fornecedor.total_produtos || 0,
        observacoes: fornecedor.observacoes || '',
        criado_em: fornecedor.criado_em ? new Date(fornecedor.criado_em).toLocaleDateString('pt-BR') : '',
        atualizado_em: fornecedor.atualizado_em ? new Date(fornecedor.atualizado_em).toLocaleDateString('pt-BR') : ''
      });
    });

    // Aplicar bordas
    worksheet.eachRow({ includeEmpty: false }, (row: any, rowNumber: any) => {
      row.eachCell((cell: any) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Auto-filtro
    worksheet.autoFilter = {
      from: 'A1',
      to: `R${fornecedores.length + 1}`
    };

    // Salvar em buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private async exportarParaPDF(fornecedores: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: 'Relatório de Fornecedores',
            Author: 'Sistema de Fornecedores',
            Subject: 'Exportação de Fornecedores'
          }
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Cabeçalho
        doc.fontSize(20)
          .fillColor('#0072C6')
          .text('RELATÓRIO DE FORNECEDORES', { align: 'center' });
        
        doc.moveDown();
        
        doc.fontSize(10)
          .fillColor('#666666')
          .text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, { align: 'center' });
        
        doc.moveDown(2);

        // Informações do relatório
        doc.fontSize(12)
          .fillColor('#333333')
          .text(`Total de Fornecedores: ${fornecedores.length}`, { align: 'left' });
        
        const ativos = fornecedores.filter(f => f.situacao === 'ativo').length;
        const inativos = fornecedores.filter(f => f.situacao === 'inativo').length;
        const totalProdutos = fornecedores.reduce((sum, f) => sum + (f.total_produtos || 0), 0);
        
        doc.text(`Ativos: ${ativos} | Inativos: ${inativos} | Total Produtos: ${totalProdutos}`, { align: 'left' });
        doc.moveDown(2);

        // Tabela
        const tableTop = doc.y;
        const itemWidth = 500;
        const columnWidth = itemWidth / 5;
        
        // Cabeçalho da tabela
        doc.fontSize(10)
          .fillColor('#FFFFFF')
          .rect(50, tableTop, itemWidth, 20)
          .fill('#0072C6');
        
        doc.text('ID', 55, tableTop + 5, { width: columnWidth, align: 'left' });
        doc.text('Nome', 55 + columnWidth, tableTop + 5, { width: columnWidth, align: 'left' });
        doc.text('Documento', 55 + columnWidth * 2, tableTop + 5, { width: columnWidth, align: 'left' });
        doc.text('Tipo', 55 + columnWidth * 3, tableTop + 5, { width: columnWidth, align: 'left' });
        doc.text('Produtos', 55 + columnWidth * 4, tableTop + 5, { width: columnWidth, align: 'left' });

        // Linhas da tabela
        let y = tableTop + 20;
        doc.fillColor('#000000');
        
        fornecedores.forEach((fornecedor, index) => {
          if (y > 700) {
            doc.addPage();
            y = 50;
          }
          
          if (index % 2 === 0) {
            doc.fillColor('#F0F8FF')
              .rect(50, y, itemWidth, 20)
              .fill();
          }
          
          doc.fillColor('#000000');
          
          doc.fontSize(9)
            .text(fornecedor.id.toString(), 55, y + 5, { width: columnWidth, align: 'left' });
          
          doc.text(fornecedor.nome || '', 55 + columnWidth, y + 5, { 
            width: columnWidth, 
            align: 'left',
            ellipsis: true 
          });
          
          doc.text(fornecedor.documento || '', 55 + columnWidth * 2, y + 5, { 
            width: columnWidth, 
            align: 'left',
            ellipsis: true 
          });
          
          doc.text(fornecedor.tipo_fornecedor, 55 + columnWidth * 3, y + 5, { 
            width: columnWidth, 
            align: 'left' 
          });
          
          doc.text((fornecedor.total_produtos || 0).toString(), 55 + columnWidth * 4, y + 5, { 
            width: columnWidth, 
            align: 'left' 
          });
          
          doc.strokeColor('#CCCCCC')
            .moveTo(50, y + 20)
            .lineTo(550, y + 20)
            .stroke();
          
          y += 20;
        });

        // Rodapé
        const pageCount = doc.bufferedPageRange().count;
        
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          
          doc.fontSize(8)
            .fillColor('#666666')
            .text(
              `Página ${i + 1} de ${pageCount}`,
              50,
              doc.page.height - 40,
              { align: 'center' }
            );
          
          doc.text(
            'Sistema de Fornecedores - Relatório Gerado Automaticamente',
            50,
            doc.page.height - 25,
            { align: 'center' }
          );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}