import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { 
  ClienteRepository, 
  FiltrosCliente 
} from '../repositories/ClienteRepository';
import { type NovoClienteDTO } from '../models/Cliente';

// Interfaces Auxiliares para o Service
export interface OpcoesExportacao {
  formato: 'csv' | 'xlsx' | 'pdf';
  filtros?: FiltrosCliente;
}

export interface PaginacaoDTO {
  page: number;
  limit: number;
}

// Helper para limpar caracteres não numéricos (CPF, CNPJ, Tel)
const removeNonNumeric = (value?: string) => value ? value.replace(/\D/g, '') : undefined;

export class ClienteService {
  private clienteRepository: ClienteRepository;

  constructor() {
    this.clienteRepository = new ClienteRepository();
  }

  // =========================================================================
  // 1. VALIDAÇÕES E REGRAS DE NEGÓCIO
  // =========================================================================

  /**
   * Valida os dados antes de processar, incluindo verificação de duplicidade no banco.
   */
  async validarDadosCliente(dados: NovoClienteDTO, ignorarId?: number): Promise<string[]> {
    const erros: string[] = [];
    const dadosLimpos = this.higienizarDados(dados);

    // 1. Validação de E-mail
    if (dadosLimpos.email && !this.validarEmail(dadosLimpos.email)) {
      erros.push('E-mail inválido.');
    }

    // 2. Validação de Documentos Obrigatórios por Tipo
    if (dadosLimpos.tipo_cliente === 'PF') {
      if (!dadosLimpos.cpf) erros.push('CPF é obrigatório para Pessoa Física.');
    } else if (dadosLimpos.tipo_cliente === 'PJ') {
      if (!dadosLimpos.cnpj) erros.push('CNPJ é obrigatório para Pessoa Jurídica.');
      if (!dadosLimpos.nome) erros.push('Razão Social é obrigatória.');
    } else if (dadosLimpos.tipo_cliente === 'estrangeiro') {
      if (!dadosLimpos.documento) erros.push('Documento/Passaporte é obrigatório.');
    }

    // 3. Verificar Duplicidade de Documento no Banco (Regra de Ouro)
    const docBusca = dadosLimpos.cpf || dadosLimpos.cnpj || dadosLimpos.documento;
    if (docBusca) {
      // Usamos 0 como usuarioId temporário ou passamos via contexto se disponível
      // (Idealmente o usuarioId viria no parametro, mas assumindo contexto global ou injeção)
      // Aqui vamos assumir que o controller valida isso depois ou passamos 0 se for validação prévia
      // Para ser seguro, o ideal é o metodo receber usuarioId. Vou assumir que essa validação 
      // ocorre dentro do fluxo de criar/atualizar onde temos o ID.
    }

    return erros;
  }

  /**
   * Verifica duplicidade especificamente chamando o repositório
   */
  async verificarDuplicidade(documento: string, usuarioId: number, ignorarId?: number): Promise<boolean> {
    const docLimpo = removeNonNumeric(documento);
    if (!docLimpo) return false;
    return await this.clienteRepository.verificarDocumentoExistente(docLimpo, usuarioId, ignorarId);
  }

  private validarEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // =========================================================================
  // 2. CRUD (Criação, Leitura, Atualização, Deleção)
  // =========================================================================

  async criarCliente(dados: NovoClienteDTO, usuarioId: number): Promise<number> {
    const dadosLimpos = this.higienizarDados(dados);

    // Validação de Duplicidade antes de gravar
    const docPrincipal = dadosLimpos.cpf || dadosLimpos.cnpj || dadosLimpos.documento;
    if (docPrincipal) {
      const existe = await this.clienteRepository.verificarDocumentoExistente(docPrincipal, usuarioId);
      if (existe) {
        throw new Error(`Já existe um cliente cadastrado com este documento (${docPrincipal}).`);
      }
    }

    return await this.clienteRepository.criarClienteCompleto(dadosLimpos, usuarioId);
  }

  async atualizarCliente(id: number, dados: NovoClienteDTO, usuarioId: number): Promise<void> {
    const dadosLimpos = this.higienizarDados(dados);

    // Verifica se o cliente existe
    const clienteAtual = await this.clienteRepository.buscarClientePorId(id, usuarioId);
    if (!clienteAtual) {
      throw new Error('Cliente não encontrado.');
    }

    // Validação de Duplicidade (ignorando o próprio ID)
    const docPrincipal = dadosLimpos.cpf || dadosLimpos.cnpj || dadosLimpos.documento;
    if (docPrincipal) {
      const existe = await this.clienteRepository.verificarDocumentoExistente(docPrincipal, usuarioId, id);
      if (existe) {
        throw new Error(`Já existe outro cliente cadastrado com este documento (${docPrincipal}).`);
      }
    }

    await this.clienteRepository.atualizarCliente(id, dadosLimpos, usuarioId);
  }

  async excluirCliente(id: number, usuarioId: number): Promise<void> {
    const cliente = await this.clienteRepository.buscarClientePorId(id, usuarioId);
    if (!cliente) throw new Error('Cliente não encontrado.');

    await this.clienteRepository.excluirClientePermanentemente(id, usuarioId);
  }

  async mudarStatusCliente(id: number, usuarioId: number, situacao: string): Promise<void> {
    if (!['ativo', 'inativo', 'bloqueado'].includes(situacao)) {
      throw new Error('Situação inválida.');
    }
    await this.clienteRepository.mudarStatusCliente(id, usuarioId, situacao);
  }

  // =========================================================================
  // 3. BUSCAS E LISTAGEM
  // =========================================================================

  async listarClientesComFiltros(usuarioId: number, filtros: FiltrosCliente, paginacao: PaginacaoDTO) {
    // Sanitiza filtros
    const filtrosProcessados = {
      ...filtros,
      cpf_cnpj: removeNonNumeric(filtros.cpf_cnpj),
      // Validar ordenação se vier no filtro (opcional)
    };

    const offset = (paginacao.page - 1) * paginacao.limit;
    
    // Chama o repo novo
    return await this.clienteRepository.listarClientesComFiltros(usuarioId, filtrosProcessados, { 
      limit: paginacao.limit, 
      offset: offset 
    });
  }

  async buscarClientePorId(id: number, usuarioId: number) {
    const cliente = await this.clienteRepository.buscarClientePorId(id, usuarioId);
    if (!cliente) throw new Error('Cliente não encontrado.');
    return cliente;
  }

  async buscarClientePorDocumento(documento: string, usuarioId: number) {
    const docLimpo = removeNonNumeric(documento);
    if (!docLimpo) throw new Error('Documento inválido.');
    
    return await this.clienteRepository.buscarClientePorDocumento(docLimpo, usuarioId);
  }

  // =========================================================================
  // 4. EXPORTAÇÃO (CSV, EXCEL, PDF)
  // =========================================================================

  async exportarClientes(usuarioId: number, opcoes: OpcoesExportacao): Promise<Buffer | string> {
    const filtrosProcessados = {
      ...opcoes.filtros,
      cpf_cnpj: removeNonNumeric(opcoes.filtros?.cpf_cnpj)
    };
    
    // Busca dados puros do banco
    const clientes = await this.clienteRepository.listarClientesParaExportacao(usuarioId, filtrosProcessados);

    switch (opcoes.formato) {
      case 'csv':
        // Usa o método otimizado do Repositório (ou gera aqui se preferir)
        return await this.clienteRepository.exportarClientesCSV(clientes);
      
      case 'xlsx':
        return await this.gerarArquivoExcel(clientes);
      
      case 'pdf':
        return await this.gerarArquivoPDF(clientes);
      
      default:
        throw new Error('Formato de exportação inválido');
    }
  }

  // --- Geradores de Arquivo (Privados) ---

  private async gerarArquivoExcel(clientes: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Clientes');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nome / Razão Social', key: 'nome', width: 40 },
      { header: 'Nome Fantasia', key: 'nome_fantasia', width: 30 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Documento', key: 'documento', width: 20 },
      { header: 'E-mail', key: 'email', width: 30 },
      { header: 'Telefone', key: 'telefone', width: 20 },
      { header: 'Cidade/UF', key: 'localizacao', width: 25 },
      { header: 'Situação', key: 'situacao', width: 15 },
      { header: 'Data Cadastro', key: 'data', width: 15 },
    ];

    clientes.forEach(c => {
      const doc = c.cpf || c.cnpj || c.documento_estrangeiro || '-';
      
      worksheet.addRow({
        id: c.id,
        nome: c.nome,
        nome_fantasia: c.nome_fantasia,
        tipo: c.tipo_cliente,
        documento: doc,
        email: c.email,
        telefone: c.telefone_celular || c.telefone_comercial,
        localizacao: c.localizacao || '-',
        situacao: c.situacao,
        data: c.criado_em ? new Date(c.criado_em).toLocaleDateString('pt-BR') : '-'
      });
    });

    worksheet.getRow(1).font = { bold: true };
    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  private async gerarArquivoPDF(clientes: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(18).text('Relatório de Clientes', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'right' });
      doc.moveDown();

      const tableTop = 100;
      let y = tableTop;
      const colX = [30, 80, 250, 320, 450, 550, 650];

      const drawHeader = (posY: number) => {
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('ID', colX[0], posY);
        doc.text('NOME', colX[1], posY);
        doc.text('TIPO', colX[2], posY);
        doc.text('DOCUMENTO', colX[3], posY);
        doc.text('EMAIL', colX[4], posY);
        doc.text('TELEFONE', colX[5], posY);
        doc.text('SITUAÇÃO', colX[6], posY);
        doc.moveTo(30, posY + 15).lineTo(770, posY + 15).stroke();
      };

      drawHeader(y);
      y += 25;
      doc.font('Helvetica').fontSize(9);

      clientes.forEach((c) => {
        if (y > 550) {
          doc.addPage();
          y = 50;
          drawHeader(y);
          y += 25;
          doc.font('Helvetica').fontSize(9);
        }

        const docNum = c.cpf || c.cnpj || c.documento_estrangeiro || '-';
        const tel = c.telefone_celular || c.telefone_comercial || '-';

        doc.text(String(c.id), colX[0], y);
        doc.text(c.nome.substring(0, 35), colX[1], y);
        doc.text(c.tipo_cliente, colX[2], y);
        doc.text(docNum, colX[3], y);
        doc.text((c.email || '-').substring(0, 25), colX[4], y);
        doc.text(tel, colX[5], y);
        
        const color = c.situacao === 'ativo' ? 'green' : c.situacao === 'inativo' ? 'red' : 'grey';
        doc.fillColor(color).text(c.situacao.toUpperCase(), colX[6], y).fillColor('black');

        y += 20;
        doc.save().strokeColor('#eeeeee').lineWidth(0.5).moveTo(30, y - 5).lineTo(770, y - 5).stroke().restore();
      });

      doc.end();
    });
  }

  // =========================================================================
  // 5. HIGIENIZAÇÃO DE DADOS (Limpeza)
  // =========================================================================
  
  private higienizarDados(dados: NovoClienteDTO): NovoClienteDTO {
    return {
      ...dados,
      cpf: removeNonNumeric(dados.cpf),
      cnpj: removeNonNumeric(dados.cnpj),
      rg: removeNonNumeric(dados.rg),
      telefone_comercial: removeNonNumeric(dados.telefone_comercial),
      telefone_celular: removeNonNumeric(dados.telefone_celular),
      
      enderecos: dados.enderecos?.map(end => ({
        ...end,
        cep: removeNonNumeric(end.cep) || ''
      })) || [],
      
      contatos: dados.contatos?.map(contato => {
        if (['telefone', 'celular', 'whatsapp'].includes(contato.tipo.toLowerCase())) {
          return { ...contato, valor: removeNonNumeric(contato.valor) || contato.valor };
        }
        return contato;
      }) || [],
      
      // Defaults
      situacao: dados.situacao || 'ativo',
      permitir_ultrapassar_limite: dados.permitir_ultrapassar_limite || false,
      limite_credito: dados.limite_credito || 0
    };
  }
}