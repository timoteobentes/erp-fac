import { ContaReceberRepository, FiltrosContaReceber } from '../repositories/ContaReceberRepository';
import { ContaPagarRepository, FiltrosContaPagar } from '../repositories/ContaPagarRepository';
import { CentroCustoRepository, FiltrosCentroCusto } from '../repositories/CentroCustoRepository';
import { PlanoContaRepository, FiltrosPlanoConta } from '../repositories/PlanoContaRepository';
import { ContaBancariaRepository, FiltrosContaBancaria } from '../repositories/ContaBancariaRepository';
import { FormaPagamentoRepository, FiltrosFormaPagamento } from '../repositories/FormaPagamentoRepository';
import { ContaReceber } from '../models/ContaReceber';
import { ContaPagar } from '../models/ContaPagar';
import { CentroCusto } from '../models/CentroCusto';
import { PlanoConta } from '../models/PlanoConta';
import { ContaBancaria } from '../models/ContaBancaria';
import { FormaPagamento } from '../models/FormaPagamento';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export class FinanceiroService {
  private contaReceberRepository: ContaReceberRepository;
  private contaPagarRepository: ContaPagarRepository;
  private centroCustoRepository: CentroCustoRepository;
  private planoContaRepository: PlanoContaRepository;
  private contaBancariaRepository: ContaBancariaRepository;
  private formaPagamentoRepository: FormaPagamentoRepository;

  constructor() {
    this.contaReceberRepository = new ContaReceberRepository();
    this.contaPagarRepository = new ContaPagarRepository();
    this.centroCustoRepository = new CentroCustoRepository();
    this.planoContaRepository = new PlanoContaRepository();
    this.contaBancariaRepository = new ContaBancariaRepository();
    this.formaPagamentoRepository = new FormaPagamentoRepository();
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
    if (!conta) throw new Error('Conta a receber nÃ£o encontrada.');
    return conta;
  }

  async baixarContaReceber(id: number, usuarioId: number, dataRecebimento?: string): Promise<void> {
    const conta = await this.buscarContaReceber(id, usuarioId);

    if (conta.status === 'recebido') {
      throw new Error('Esta conta jÃ¡ estÃ¡ baixada (recebida).');
    }
    if (conta.status === 'cancelado') {
      throw new Error('NÃ£o Ã© possÃ­vel baixar uma conta cancelada.');
    }

    const dataFinal = dataRecebimento || new Date().toISOString().split('T')[0];
    await this.contaReceberRepository.atualizarStatus(id, usuarioId, 'recebido', dataFinal);
  }

  async excluirContaReceber(id: number, usuarioId: number): Promise<void> {
    const conta = await this.buscarContaReceber(id, usuarioId);

    if (conta.venda_id) {
      throw new Error('NÃ£o Ã© possÃ­vel excluir um recebimento originado automaticamente por uma venda do PDV. Para estornar este valor, vocÃª deve cancelar a Venda correspondente.');
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
    if (!conta) throw new Error('Conta a pagar nÃ£o encontrada.');
    return conta;
  }

  async baixarContaPagar(id: number, usuarioId: number, dataPagamento?: string): Promise<void> {
    const conta = await this.buscarContaPagar(id, usuarioId);

    if (conta.status === 'pago') {
      throw new Error('Esta conta jÃ¡ estÃ¡ baixada (paga).');
    }
    if (conta.status === 'cancelado') {
      throw new Error('NÃ£o Ã© possÃ­vel baixar uma conta cancelada.');
    }

    const dataFinal = dataPagamento || new Date().toISOString().split('T')[0];
    await this.contaPagarRepository.atualizarStatus(id, usuarioId, 'pago', dataFinal);
  }

  async excluirContaPagar(id: number, usuarioId: number): Promise<void> {
    await this.buscarContaPagar(id, usuarioId);
    await this.contaPagarRepository.excluir(id, usuarioId);
  }

  // =========================================================================
  // 3. CENTRO DE CUSTOS
  // =========================================================================

  async criarCentroCusto(dados: CentroCusto, usuarioId: number): Promise<number> {
    this.validarCentroCusto(dados);
    return await this.centroCustoRepository.criar(dados, usuarioId);
  }

  async listarCentroCustos(usuarioId: number, filtros: FiltrosCentroCusto, paginacao?: { limit: number, offset: number }) {
    return await this.centroCustoRepository.listar(usuarioId, filtros, paginacao);
  }

  async buscarCentroCusto(id: number, usuarioId: number) {
    const centroCusto = await this.centroCustoRepository.buscarPorId(id, usuarioId);
    if (!centroCusto) throw new Error('Centro de Custo nao encontrado.');
    return centroCusto;
  }

  async atualizarCentroCusto(id: number, usuarioId: number, dados: Partial<CentroCusto>) {
    this.validarCentroCusto(dados);
    await this.buscarCentroCusto(id, usuarioId);
    const centroCusto = await this.centroCustoRepository.atualizar(id, usuarioId, dados);
    if (!centroCusto) throw new Error('Centro de Custo nao encontrado.');
    return centroCusto;
  }

  async excluirCentroCusto(id: number, usuarioId: number): Promise<void> {
    await this.buscarCentroCusto(id, usuarioId);
    await this.centroCustoRepository.excluir(id, usuarioId);
  }

  // =========================================================================
  // 4. PLANOS DE CONTAS
  // =========================================================================

  async criarPlanoConta(dados: PlanoConta, usuarioId: number): Promise<number> {
    this.validarPlanoConta(dados);
    return await this.planoContaRepository.criar(dados, usuarioId);
  }

  async listarPlanosContas(usuarioId: number, filtros: FiltrosPlanoConta, paginacao?: { limit: number, offset: number }) {
    return await this.planoContaRepository.listar(usuarioId, filtros, paginacao);
  }

  async buscarPlanoConta(id: number, usuarioId: number) {
    const planoConta = await this.planoContaRepository.buscarPorId(id, usuarioId);
    if (!planoConta) throw new Error('Plano de Conta nao encontrado.');
    return planoConta;
  }

  async atualizarPlanoConta(id: number, usuarioId: number, dados: Partial<PlanoConta>) {
    this.validarPlanoConta(dados);
    await this.buscarPlanoConta(id, usuarioId);
    const planoConta = await this.planoContaRepository.atualizar(id, usuarioId, dados);
    if (!planoConta) throw new Error('Plano de Conta nao encontrado.');
    return planoConta;
  }

  async excluirPlanoConta(id: number, usuarioId: number): Promise<void> {
    await this.buscarPlanoConta(id, usuarioId);
    await this.planoContaRepository.excluir(id, usuarioId);
  }

  // =========================================================================
  // 5. CONTAS BANCARIAS
  // =========================================================================

  async criarContaBancaria(dados: ContaBancaria, usuarioId: number): Promise<number> {
    this.validarContaBancaria(dados);
    return await this.contaBancariaRepository.criar(dados, usuarioId);
  }

  async listarContasBancarias(usuarioId: number, filtros: FiltrosContaBancaria, paginacao?: { limit: number, offset: number }) {
    return await this.contaBancariaRepository.listar(usuarioId, filtros, paginacao);
  }

  async buscarContaBancaria(id: number, usuarioId: number) {
    const contaBancaria = await this.contaBancariaRepository.buscarPorId(id, usuarioId);
    if (!contaBancaria) throw new Error('Conta Bancaria nao encontrada.');
    return contaBancaria;
  }

  async atualizarContaBancaria(id: number, usuarioId: number, dados: Partial<ContaBancaria>) {
    this.validarContaBancaria(dados);
    await this.buscarContaBancaria(id, usuarioId);
    const contaBancaria = await this.contaBancariaRepository.atualizar(id, usuarioId, dados);
    if (!contaBancaria) throw new Error('Conta Bancaria nao encontrada.');
    return contaBancaria;
  }

  async excluirContaBancaria(id: number, usuarioId: number): Promise<void> {
    await this.buscarContaBancaria(id, usuarioId);
    await this.contaBancariaRepository.excluir(id, usuarioId);
  }

  // =========================================================================
  // 6. FORMAS DE PAGAMENTO
  // =========================================================================

  async criarFormaPagamento(dados: FormaPagamento, usuarioId: number): Promise<number> {
    await this.validarFormaPagamento(dados, usuarioId);
    return await this.formaPagamentoRepository.criar(dados, usuarioId);
  }

  async listarFormasPagamento(usuarioId: number, filtros: FiltrosFormaPagamento, paginacao?: { limit: number, offset: number }) {
    return await this.formaPagamentoRepository.listar(usuarioId, filtros, paginacao);
  }

  async buscarFormaPagamento(id: number, usuarioId: number) {
    const formaPagamento = await this.formaPagamentoRepository.buscarPorId(id, usuarioId);
    if (!formaPagamento) throw new Error('Forma de Pagamento nao encontrada.');
    return formaPagamento;
  }

  async atualizarFormaPagamento(id: number, usuarioId: number, dados: Partial<FormaPagamento>) {
    await this.validarFormaPagamento(dados, usuarioId);
    await this.buscarFormaPagamento(id, usuarioId);
    const formaPagamento = await this.formaPagamentoRepository.atualizar(id, usuarioId, dados);
    if (!formaPagamento) throw new Error('Forma de Pagamento nao encontrada.');
    return formaPagamento;
  }

  async excluirFormaPagamento(id: number, usuarioId: number): Promise<void> {
    await this.buscarFormaPagamento(id, usuarioId);
    await this.formaPagamentoRepository.excluir(id, usuarioId);
  }

  // =========================================================================
  // 7. EXPORTACOES (CSV, EXCEL, PDF)
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
          { header: 'DescriÃ§Ã£o', key: 'descricao', width: 40 },
          { header: 'Vencimento', key: 'vencimento', width: 15 },
          { header: 'Valor Total (R$)', key: 'valor', width: 15 },
          { header: 'SituaÃ§Ã£o', key: 'status', width: 15 }
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

          doc.fontSize(18).text(`RelatÃ³rio de Contas a ${tipo}`, { align: 'center' }).moveDown();

          const drawHeader = (posY: number) => {
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('ID', 30, posY);
            doc.text('DESCRIÃ‡ÃƒO', 80, posY);
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
        throw new Error('Formato invÃ¡lido');
    }
  }

  // =========================================================================
  // 8. METODOS PRIVADOS / VALIDACOES
  // =========================================================================
  private validarContaBasica(valorTotal: number, dataVencimento: string | Date) {
    if (!valorTotal || valorTotal <= 0) {
      throw new Error('O valor total da conta deve ser maior que zero.');
    }

    const dataVenc = new Date(dataVencimento);
    if (isNaN(dataVenc.getTime())) {
      throw new Error('Data de vencimento invÃ¡lida.');
    }
  }

  private validarCentroCusto(dados: Partial<CentroCusto>) {
    if (!dados.nome || !dados.nome.trim()) {
      throw new Error('Nome obrigatorio.');
    }

    if (!dados.status) {
      throw new Error('Status obrigatorio.');
    }

    if (!['ATIVO', 'INATIVO'].includes(dados.status)) {
      throw new Error('Status invalido.');
    }
  }

  private validarPlanoConta(dados: Partial<PlanoConta>) {
    const contaMaeValues = [
      'PAGAMENTO',
      'DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS',
      'DESPESAS_PRODUTOS_VENDIDOS',
      'DESPESAS_FINANCEIRAS',
      'INVESTIMENTOS',
      'OUTRAS_DESPESAS',
      'RECEBIMENTOS',
      'RECEITAS_VENDAS',
      'RECEITAS_FINANCEIRAS',
      'OUTRAS_RECEITAS'
    ];

    if (!dados.conta_mae) {
      throw new Error('Conta mae obrigatoria.');
    }

    if (!contaMaeValues.includes(dados.conta_mae)) {
      throw new Error('Conta mae invalida.');
    }

    if (!dados.nome || !dados.nome.trim()) {
      throw new Error('Nome obrigatorio.');
    }
  }

  private validarContaBancaria(dados: Partial<ContaBancaria>) {
    if (!dados.nome || !dados.nome.trim()) {
      throw new Error('Nome obrigatorio.');
    }

    if (dados.saldo_inicial === undefined || dados.saldo_inicial === null || Number.isNaN(Number(dados.saldo_inicial))) {
      throw new Error('Saldo inicial obrigatorio.');
    }

    if (!dados.data_saldo) {
      throw new Error('Data do saldo obrigatoria.');
    }

    const dataSaldo = new Date(dados.data_saldo);
    if (Number.isNaN(dataSaldo.getTime())) {
      throw new Error('Data do saldo invalida.');
    }
  }

  private async validarFormaPagamento(dados: Partial<FormaPagamento>, usuarioId: number) {
    const disponivelEmValues = [
      'CONTAS_A_PAGAR_E_RECEBER',
      'SOMENTE_CONTAS_A_PAGAR',
      'SOMENTE_CONTAS_A_RECEBER'
    ];

    const confirmacaoAutomaticaValues = [
      'NUNCA_CONFIRMAR_AUTOMATICO',
      'SEMPRE_CONFIRMAR_AUTOMATICO',
      'CONFIRMAR_SOMENTE_CONTAS_A_RECEBER',
      'CONFIRMAR_SOMENTE_CONTAS_A_PAGAR'
    ];

    const modalidadeValues = [
      'DINHEIRO',
      'CARTAO_CREDITO',
      'CARTAO_DEBITO',
      'CHEQUE',
      'CREDITO_LOJA',
      'VALE_ALIMENTACAO',
      'VALE_REFEICAO',
      'VALE_PRESENTE',
      'VALE_COMBUSTIVEL',
      'DEVOLUCAO_MERCADORIA',
      'DUPLICATA_MERCANTIL',
      'CARNE',
      'BOLETO_BANCARIO',
      'DEPOSITO_BANCARIO',
      'PAGAMENTO_INSTANTANEO_PIX',
      'TRANSFERENCIA_BANCARIA_CARTEIRA_DIGITAL',
      'PROGRAMA_FIDELIDADE_CASHBACK_CREDITO_VIRTUAL',
      'OUTROS'
    ];

    if (!dados.nome || !dados.nome.trim()) {
      throw new Error('Nome obrigatorio.');
    }

    if (!dados.conta_bancaria_id || Number.isNaN(Number(dados.conta_bancaria_id))) {
      throw new Error('Conta bancaria obrigatoria.');
    }

    const contaBancaria = await this.contaBancariaRepository.buscarPorId(Number(dados.conta_bancaria_id), usuarioId);
    if (!contaBancaria) {
      throw new Error('Conta bancaria informada nao encontrada.');
    }

    if (!dados.disponivel_em) {
      throw new Error('Disponivel em obrigatorio.');
    }

    if (!disponivelEmValues.includes(dados.disponivel_em)) {
      throw new Error('Disponivel em invalido.');
    }

    if (!dados.confirmacao_automatica) {
      throw new Error('Confirmacao automatica obrigatoria.');
    }

    if (!confirmacaoAutomaticaValues.includes(dados.confirmacao_automatica)) {
      throw new Error('Confirmacao automatica invalida.');
    }

    if (dados.numero_maximo_parcelas === undefined || !Number.isInteger(Number(dados.numero_maximo_parcelas)) || Number(dados.numero_maximo_parcelas) < 1) {
      throw new Error('Numero maximo de parcelas invalido.');
    }

    if (dados.intervalo_parcelas_dias === undefined || !Number.isInteger(Number(dados.intervalo_parcelas_dias)) || Number(dados.intervalo_parcelas_dias) < 0) {
      throw new Error('Intervalo de parcelas invalido.');
    }

    if (dados.primeira_parcela_dias === undefined || !Number.isInteger(Number(dados.primeira_parcela_dias)) || Number(dados.primeira_parcela_dias) < 0) {
      throw new Error('Primeira parcela invalida.');
    }

    if (dados.taxa_banco === undefined || dados.taxa_banco === null || Number.isNaN(Number(dados.taxa_banco)) || Number(dados.taxa_banco) < 0) {
      throw new Error('Taxa do banco invalida.');
    }

    if (dados.taxa_operadora === undefined || dados.taxa_operadora === null || Number.isNaN(Number(dados.taxa_operadora)) || Number(dados.taxa_operadora) < 0) {
      throw new Error('Taxa da operadora invalida.');
    }

    if (dados.juros_multa === undefined || dados.juros_multa === null || Number.isNaN(Number(dados.juros_multa)) || Number(dados.juros_multa) < 0) {
      throw new Error('Juros de multa invalido.');
    }

    if (dados.juros_mora === undefined || dados.juros_mora === null || Number.isNaN(Number(dados.juros_mora)) || Number(dados.juros_mora) < 0) {
      throw new Error('Juros de mora invalido.');
    }

    if (!dados.modalidade) {
      throw new Error('Modalidade obrigatoria.');
    }

    if (!modalidadeValues.includes(dados.modalidade)) {
      throw new Error('Modalidade invalida.');
    }
  }
}
