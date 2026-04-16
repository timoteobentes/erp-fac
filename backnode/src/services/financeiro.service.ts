import { ContaReceberRepository, FiltrosContaReceber } from '../repositories/ContaReceberRepository';
import { ContaPagarRepository, FiltrosContaPagar } from '../repositories/ContaPagarRepository';
import { ContaReceber } from '../models/ContaReceber';
import { ContaPagar } from '../models/ContaPagar';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export class FinanceiroService {
  private contaReceberRepository: ContaReceberRepository;
  private contaPagarRepository: ContaPagarRepository;

  constructor() {
    this.contaReceberRepository = new ContaReceberRepository();
    this.contaPagarRepository = new ContaPagarRepository();
  }

  // =========================================================================
  // 1. CONTAS A RECEBER
  // =========================================================================

  async criarContaReceber(dados: ContaReceber, usuarioId: number): Promise<number> {
    this.validarContaBasica(dados.valor_total, dados.data_vencimento);
    return await this.contaReceberRepository.criar(dados, usuarioId);
  }

  async listarContasReceber(usuarioId: number, filtros: FiltrosContaReceber, paginacao?: { limit: number, offset: number }) {
    return await this.contaReceberRepository.listar(usuarioId, filtros, paginacao);
  }

  async buscarContaReceber(id: number, usuarioId: number) {
    const conta = await this.contaReceberRepository.buscarPorId(id, usuarioId);
    if (!conta) throw new Error('Conta a receber não encontrada.');
    return conta;
  }

  async baixarContaReceber(id: number, usuarioId: number, dataRecebimento?: string): Promise<void> {
    const conta = await this.buscarContaReceber(id, usuarioId);
    
    if (conta.status === 'recebido') {
      throw new Error('Esta conta já está baixada (recebida).');
    }
    if (conta.status === 'cancelado') {
      throw new Error('Não é possível baixar uma conta cancelada.');
    }

    const dataFinal = dataRecebimento || new Date().toISOString().split('T')[0];
    await this.contaReceberRepository.atualizarStatus(id, usuarioId, 'recebido', dataFinal);
  }

  async excluirContaReceber(id: number, usuarioId: number): Promise<void> {
    const conta = await this.buscarContaReceber(id, usuarioId); // Valida existência
    
    // Trava de Segurança: Impede exclusão avulsa de recebimentos gerados pelo PDV
    if (conta.venda_id) {
      throw new Error('Não é possível excluir um recebimento originado automaticamente por uma venda do PDV. Para estornar este valor, você deve cancelar a Venda correspondente.');
    }

    await this.contaReceberRepository.excluir(id, usuarioId);
  }


  // =========================================================================
  // 2. CONTAS A PAGAR
  // =========================================================================

  async criarContaPagar(dados: ContaPagar, usuarioId: number): Promise<number> {
    this.validarContaBasica(dados.valor_total, dados.data_vencimento);
    return await this.contaPagarRepository.criar(dados, usuarioId);
  }

  async listarContasPagar(usuarioId: number, filtros: FiltrosContaPagar, paginacao?: { limit: number, offset: number }) {
    return await this.contaPagarRepository.listar(usuarioId, filtros, paginacao);
  }

  async buscarContaPagar(id: number, usuarioId: number) {
    const conta = await this.contaPagarRepository.buscarPorId(id, usuarioId);
    if (!conta) throw new Error('Conta a pagar não encontrada.');
    return conta;
  }

  async baixarContaPagar(id: number, usuarioId: number, dataPagamento?: string): Promise<void> {
    const conta = await this.buscarContaPagar(id, usuarioId);
    
    if (conta.status === 'pago') {
      throw new Error('Esta conta já está baixada (paga).');
    }
    if (conta.status === 'cancelado') {
      throw new Error('Não é possível baixar uma conta cancelada.');
    }

    const dataFinal = dataPagamento || new Date().toISOString().split('T')[0];
    await this.contaPagarRepository.atualizarStatus(id, usuarioId, 'pago', dataFinal);
  }

  async excluirContaPagar(id: number, usuarioId: number): Promise<void> {
    await this.buscarContaPagar(id, usuarioId); // Valida existência
    await this.contaPagarRepository.excluir(id, usuarioId);
  }


  // =========================================================================
  // 3. EXPORTAÇÕES (CSV, EXCEL, PDF)
  // =========================================================================
  async exportarContasReceber(usuarioId: number, opcoes: { formato: 'csv' | 'xlsx' | 'pdf', filtros?: FiltrosContaReceber }): Promise<Buffer | string> {
    const contasResult = await this.listarContasReceber(usuarioId, opcoes.filtros || {});
    return this.exportarFinanceiro(contasResult.dados || (contasResult as unknown as any[]), opcoes.formato, 'Receber');
  }

  async exportarContasPagar(usuarioId: number, opcoes: { formato: 'csv' | 'xlsx' | 'pdf', filtros?: FiltrosContaPagar }): Promise<Buffer | string> {
    const contasResult = await this.listarContasPagar(usuarioId, opcoes.filtros || {});
    return this.exportarFinanceiro(contasResult.dados || (contasResult as unknown as any[]), opcoes.formato, 'Pagar');
  }

  private async exportarFinanceiro(contas: any[], formato: string, tipo: 'Pagar' | 'Receber'): Promise<Buffer | string> {
    switch (formato) {
      case 'csv':
        const header = ['ID', 'DESCRICAO', 'VENCIMENTO', 'VALOR_TOTAL', 'STATUS'].join(';');
        const rows = contas.map(c => `${c.id};"${c.descricao}";${c.data_vencimento || '-'};${Number(c.valor_total || 0).toFixed(2)};${c.status}`);
        return [header, ...rows].join('\n');
      
      case 'xlsx':
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Contas a ${tipo}`);
        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Descrição', key: 'descricao', width: 40 },
          { header: 'Vencimento', key: 'vencimento', width: 15 },
          { header: 'Valor Total (R$)', key: 'valor', width: 15 },
          { header: 'Situação', key: 'status', width: 15 }
        ];
        contas.forEach(c => {
          worksheet.addRow({
            id: c.id,
            descricao: c.descricao,
            vencimento: c.data_vencimento ? new Date(c.data_vencimento).toLocaleDateString('pt-BR') : '-',
            valor: Number(c.valor_total || 0),
            status: c.status?.toUpperCase()
          });
        });
        worksheet.getRow(1).font = { bold: true };
        return await workbook.xlsx.writeBuffer() as unknown as Buffer;
      
      case 'pdf':
        return new Promise((resolve, reject) => {
          const doc = new PDFDocument({ margin: 30, size: 'A4' });
          const buffers: Buffer[] = [];
          doc.on('data', buffers.push.bind(buffers));
          doc.on('end', () => resolve(Buffer.concat(buffers)));
          doc.on('error', reject);

          doc.fontSize(18).text(`Relatório de Contas a ${tipo}`, { align: 'center' }).moveDown();

          const drawHeader = (posY: number) => {
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('ID', 30, posY);
            doc.text('DESCRIÇÃO', 80, posY);
            doc.text('VENCIMENTO', 300, posY);
            doc.text('VALOR', 400, posY);
            doc.text('STATUS', 500, posY);
            doc.moveTo(30, posY + 15).lineTo(565, posY + 15).stroke();
          };

          let y = 100;
          drawHeader(y);
          y += 25;
          doc.font('Helvetica').fontSize(9);

          contas.forEach(c => {
            if (y > 750) {
              doc.addPage();
              y = 50;
              drawHeader(y);
              y += 25;
              doc.font('Helvetica').fontSize(9);
            }
            doc.text(String(c.id), 30, y);
            doc.text((c.descricao || '').substring(0, 35), 80, y);
            doc.text(c.data_vencimento ? new Date(c.data_vencimento).toLocaleDateString('pt-BR') : '-', 300, y);
            doc.text(Number(c.valor_total || 0).toFixed(2), 400, y);
            const cor = c.status === 'pago' || c.status === 'recebido' ? 'green' : c.status === 'cancelado' ? 'red' : 'blue';
            doc.fillColor(cor).text((c.status || '').toUpperCase(), 500, y).fillColor('black');
            y += 20;
            doc.save().strokeColor('#eeeeee').lineWidth(0.5).moveTo(30, y - 5).lineTo(565, y - 5).stroke().restore();
          });

          doc.end();
        });
      
      default:
        throw new Error('Formato inválido');
    }
  }

  // =========================================================================
  // 4. MÉTODOS PRIVADOS / VALIDAÇÕES (Regras de Negócio)
  // =========================================================================
  private validarContaBasica(valorTotal: number, dataVencimento: string | Date) {
    if (!valorTotal || valorTotal <= 0) {
      throw new Error('O valor total da conta deve ser maior que zero.');
    }

    const dataVenc = new Date(dataVencimento);
    if (isNaN(dataVenc.getTime())) {
      throw new Error('Data de vencimento inválida.');
    }
  }
}
