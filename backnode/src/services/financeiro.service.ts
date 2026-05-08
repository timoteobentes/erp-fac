import { ContaReceberRepository, FiltrosContaReceber } from '../repositories/ContaReceberRepository';
import { ContaPagarRepository, FiltrosContaPagar } from '../repositories/ContaPagarRepository';
import { CentroCustoRepository, FiltrosCentroCusto } from '../repositories/CentroCustoRepository';
import { PlanoContaRepository, FiltrosPlanoConta } from '../repositories/PlanoContaRepository';
import { ContaBancariaRepository, FiltrosContaBancaria } from '../repositories/ContaBancariaRepository';
import { FormaPagamentoRepository, FiltrosFormaPagamento } from '../repositories/FormaPagamentoRepository';
import { CategoriaDreRepository, FiltrosCategoriaDre } from '../repositories/CategoriaDreRepository';
import {
  FluxoCaixaRepository,
  FluxoCaixaContaBancariaResumo,
  FluxoCaixaFormaRecebimento,
  FluxoCaixaMovimentoRaw,
} from '../repositories/FluxoCaixaRepository';
import { ContaReceber } from '../models/ContaReceber';
import { ContaPagar } from '../models/ContaPagar';
import { CentroCusto } from '../models/CentroCusto';
import { PlanoConta } from '../models/PlanoConta';
import { ContaBancaria } from '../models/ContaBancaria';
import { FormaPagamento } from '../models/FormaPagamento';
import { CategoriaDre } from '../models/CategoriaDre';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export class FinanceiroService {
  private contaReceberRepository: ContaReceberRepository;
  private contaPagarRepository: ContaPagarRepository;
  private centroCustoRepository: CentroCustoRepository;
  private planoContaRepository: PlanoContaRepository;
  private contaBancariaRepository: ContaBancariaRepository;
  private formaPagamentoRepository: FormaPagamentoRepository;
  private categoriaDreRepository: CategoriaDreRepository;
  private fluxoCaixaRepository: FluxoCaixaRepository;

  constructor() {
    this.contaReceberRepository = new ContaReceberRepository();
    this.contaPagarRepository = new ContaPagarRepository();
    this.centroCustoRepository = new CentroCustoRepository();
    this.planoContaRepository = new PlanoContaRepository();
    this.contaBancariaRepository = new ContaBancariaRepository();
    this.formaPagamentoRepository = new FormaPagamentoRepository();
    this.categoriaDreRepository = new CategoriaDreRepository();
    this.fluxoCaixaRepository = new FluxoCaixaRepository();
  }

  // =========================================================================
  // 1. CONTAS A RECEBER
  // =========================================================================

  async criarContaReceber(dados: ContaReceber, usuarioId: number): Promise<number> {
    this.validarContaBasica(dados.valor_total, dados.data_vencimento);
    await this.validarRelacionamentosContaReceber(dados, usuarioId);
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

  async atualizarContaReceber(id: number, dados: Partial<ContaReceber>, usuarioId: number): Promise<ContaReceber> {
    const contaAtual = await this.buscarContaReceber(id, usuarioId);
    const payload: ContaReceber = { ...contaAtual, ...dados };

    this.validarContaBasica(Number(payload.valor_total), payload.data_vencimento);
    await this.validarRelacionamentosContaReceber(payload, usuarioId);

    const conta = await this.contaReceberRepository.atualizar(id, usuarioId, payload);
    if (!conta) throw new Error('Conta a receber não encontrada.');
    return conta;
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
  // 7. CATEGORIAS DRE
  // =========================================================================

  async criarCategoriaDre(dados: CategoriaDre, usuarioId: number): Promise<number> {
    this.validarCategoriaDre(dados);
    return await this.categoriaDreRepository.criar(dados, usuarioId);
  }

  async listarCategoriasDre(usuarioId: number, filtros: FiltrosCategoriaDre, paginacao?: { limit: number, offset: number }) {
    return await this.categoriaDreRepository.listar(usuarioId, filtros, paginacao);
  }

  async buscarCategoriaDre(id: number, usuarioId: number) {
    const categoria = await this.categoriaDreRepository.buscarPorId(id, usuarioId);
    if (!categoria) throw new Error('Categoria DRE nao encontrada.');
    return categoria;
  }

  async atualizarCategoriaDre(id: number, usuarioId: number, dados: Partial<CategoriaDre>) {
    this.validarCategoriaDre(dados);
    await this.buscarCategoriaDre(id, usuarioId);
    const categoria = await this.categoriaDreRepository.atualizar(id, usuarioId, dados);
    if (!categoria) throw new Error('Categoria DRE nao encontrada.');
    return categoria;
  }

  async excluirCategoriaDre(id: number, usuarioId: number): Promise<void> {
    await this.buscarCategoriaDre(id, usuarioId);
    await this.categoriaDreRepository.excluir(id, usuarioId);
  }

  // =========================================================================
  // 8. DRE GERENCIAL
  // =========================================================================

  async obterDreGerencial(usuarioId: number, filtros: { data_inicial?: string; data_final?: string }) {
    const periodo = this.resolverPeriodoDreGerencial(filtros.data_inicial, filtros.data_final);
    const categorias = await this.categoriaDreRepository.listarAtivas(usuarioId);
    const meses = this.listarMesesPeriodo(periodo.dataInicial, periodo.dataFinal);
    const linhas = this.montarLinhasDre(categorias, meses.map((mes) => mes.key));

    return {
      periodo,
      meses,
      linhas,
    };
  }

  async exportarDreGerencial(
    usuarioId: number,
    opcoes: { formato: 'csv' | 'xlsx'; data_inicial?: string; data_final?: string }
  ): Promise<Buffer | string> {
    const dre = await this.obterDreGerencial(usuarioId, {
      data_inicial: opcoes.data_inicial,
      data_final: opcoes.data_final,
    });

    const flattenRows = (rows: any[], level = 0): any[] =>
      rows.flatMap((row) => [
        { ...row, level },
        ...(row.children ? flattenRows(row.children, level + 1) : []),
      ]);

    const linhas = flattenRows(dre.linhas);

    if (opcoes.formato === 'csv') {
      const header = ['Categorias', ...dre.meses.map((mes) => mes.label), 'Total'].join(';');
      const rows = linhas.map((linha) => {
        const nome = `${' '.repeat(linha.level * 2)}${linha.categoria}`;
        return [
          `"${nome.replace(/"/g, '""')}"`,
          ...dre.meses.map((mes) => Number(linha[mes.key] || 0).toFixed(2)),
          Number(linha.total || 0).toFixed(2),
        ].join(';');
      });

      return [header, ...rows].join('\n');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('DRE Gerencial');
    worksheet.columns = [
      { header: 'Categorias', key: 'categoria', width: 42 },
      ...dre.meses.map((mes) => ({ header: mes.label, key: mes.key, width: 16 })),
      { header: 'Total', key: 'total', width: 16 },
    ];

    linhas.forEach((linha) => {
      worksheet.addRow({
        categoria: `${' '.repeat(linha.level * 2)}${linha.categoria}`,
        ...Object.fromEntries(dre.meses.map((mes) => [mes.key, Number(linha[mes.key] || 0)])),
        total: Number(linha.total || 0),
      });
    });

    worksheet.getRow(1).font = { bold: true };
    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  // =========================================================================
  // 9. FLUXO DE CAIXA
  // =========================================================================

  async obterFluxoCaixa(usuarioId: number, filtros: { data_inicio?: string; data_fim?: string }) {
    const periodo = this.resolverPeriodoFluxoCaixa(filtros.data_inicio, filtros.data_fim);
    const panorama = await this.fluxoCaixaRepository.obterPanorama(usuarioId, periodo.dataInicio, periodo.dataFim);

    const entradasPrevistasPeriodo = panorama.recebimentos.pendente_periodo + panorama.recebimentos.atrasado_periodo;
    const saidasPrevistasPeriodo = panorama.pagamentos.pendente_periodo + panorama.pagamentos.atrasado_periodo;

    const saldoInicialPeriodo =
      panorama.totaisContasBancarias.total_ate_inicio +
      panorama.recebimentos.antes_inicio -
      panorama.pagamentos.antes_inicio;

    const saldoFinalRealizado =
      saldoInicialPeriodo +
      panorama.recebimentos.realizado_periodo -
      panorama.pagamentos.realizado_periodo;

    const saldoFinalPrevisto =
      saldoFinalRealizado +
      entradasPrevistasPeriodo -
      saidasPrevistasPeriodo;

    const diario = panorama.movimentos.map((movimento) => ({
      ...movimento,
      impacto: movimento.tipo === 'RECEBIMENTO' ? movimento.valor : movimento.valor * -1,
    }));

    const demonstrativo = this.montarDemonstrativo(
      periodo.dataInicio,
      periodo.dataFim,
      saldoInicialPeriodo,
      diario
    );

    const totalRecebimentosPrevisto = panorama.recebimentos.realizado_periodo + entradasPrevistasPeriodo;
    const totalPagamentosPrevisto = panorama.pagamentos.realizado_periodo + saidasPrevistasPeriodo;

    const estatisticas = {
      total_movimentos_periodo: diario.length,
      total_contas_bancarias: panorama.contasBancarias.length,
      total_formas_recebimento_mapeadas: panorama.formasRecebimento.length,
      ticket_medio_recebimento: this.calcularTicketMedio(
        totalRecebimentosPrevisto,
        panorama.recebimentos.quantidade_realizado +
          panorama.recebimentos.quantidade_pendente +
          panorama.recebimentos.quantidade_atrasado
      ),
      ticket_medio_pagamento: this.calcularTicketMedio(
        totalPagamentosPrevisto,
        panorama.pagamentos.quantidade_realizado +
          panorama.pagamentos.quantidade_pendente +
          panorama.pagamentos.quantidade_atrasado
      ),
      percentual_recebido_periodo: this.calcularPercentual(
        panorama.recebimentos.realizado_periodo,
        totalRecebimentosPrevisto
      ),
      percentual_pago_periodo: this.calcularPercentual(
        panorama.pagamentos.realizado_periodo,
        totalPagamentosPrevisto
      ),
      formas_recebimento: panorama.formasRecebimento,
      recebimentos: {
        quantidade_realizado: panorama.recebimentos.quantidade_realizado,
        quantidade_pendente: panorama.recebimentos.quantidade_pendente,
        quantidade_atrasado: panorama.recebimentos.quantidade_atrasado,
        quantidade_cancelado: panorama.recebimentos.quantidade_cancelado,
      },
      pagamentos: {
        quantidade_realizado: panorama.pagamentos.quantidade_realizado,
        quantidade_pendente: panorama.pagamentos.quantidade_pendente,
        quantidade_atrasado: panorama.pagamentos.quantidade_atrasado,
        quantidade_cancelado: panorama.pagamentos.quantidade_cancelado,
      },
    };

    return {
      periodo,
      saldo: {
        saldo_inicial_periodo: saldoInicialPeriodo,
        entradas_realizadas_periodo: panorama.recebimentos.realizado_periodo,
        saidas_realizadas_periodo: panorama.pagamentos.realizado_periodo,
        entradas_previstas_periodo: entradasPrevistasPeriodo,
        saidas_previstas_periodo: saidasPrevistasPeriodo,
        saldo_final_realizado: saldoFinalRealizado,
        saldo_final_previsto: saldoFinalPrevisto,
        saldo_inicial_contas_ate_inicio: panorama.totaisContasBancarias.total_ate_inicio,
        saldo_inicial_contas_ate_fim: panorama.totaisContasBancarias.total_ate_fim,
        contas_bancarias: panorama.contasBancarias,
      },
      resumo: {
        a_receber_hoje: panorama.aReceberHoje,
        a_pagar_hoje: panorama.aPagarHoje,
        recebimentos: {
          realizado: panorama.recebimentos.realizado_periodo,
          pendente: panorama.recebimentos.pendente_periodo,
          atrasado: panorama.recebimentos.atrasado_periodo,
          cancelado: panorama.recebimentos.cancelado_periodo,
          previsto: totalRecebimentosPrevisto,
        },
        pagamentos: {
          realizado: panorama.pagamentos.realizado_periodo,
          pendente: panorama.pagamentos.pendente_periodo,
          atrasado: panorama.pagamentos.atrasado_periodo,
          cancelado: panorama.pagamentos.cancelado_periodo,
          previsto: totalPagamentosPrevisto,
        },
        saldo_periodo_realizado: panorama.recebimentos.realizado_periodo - panorama.pagamentos.realizado_periodo,
        saldo_periodo_previsto: totalRecebimentosPrevisto - totalPagamentosPrevisto,
      },
      diario,
      estatisticas,
      demonstrativo,
      observacoes: [
        'O fluxo de caixa esta consolidado por usuario e periodo.',
        'As contas bancarias entram com saldo inicial cadastrado.',
        'Os lancamentos financeiros ainda nao possuem vinculacao bancaria direta no schema atual; por isso o saldo por conta considera o saldo inicial e o fluxo consolidado do periodo.',
      ],
    };
  }

  async exportarFluxoCaixa(
    usuarioId: number,
    opcoes: { formato: 'csv' | 'xlsx' | 'pdf'; data_inicio?: string; data_fim?: string }
  ): Promise<Buffer | string> {
    const fluxo = await this.obterFluxoCaixa(usuarioId, {
      data_inicio: opcoes.data_inicio,
      data_fim: opcoes.data_fim,
    });

    switch (opcoes.formato) {
      case 'csv': {
        const header = [
          'DATA',
          'TIPO',
          'ORIGEM',
          'DESCRICAO',
          'PESSOA',
          'FORMA_PAGAMENTO',
          'STATUS',
          'VALOR',
          'IMPACTO',
        ].join(';');

        const rows = fluxo.diario.map((movimento) =>
          [
            movimento.data_movimento,
            movimento.tipo,
            movimento.origem,
            `"${(movimento.descricao || '').replace(/"/g, '""')}"`,
            `"${(movimento.pessoa_nome || '-').replace(/"/g, '""')}"`,
            `"${(movimento.forma_pagamento || '-').replace(/"/g, '""')}"`,
            movimento.status,
            Number(movimento.valor).toFixed(2),
            Number(movimento.impacto).toFixed(2),
          ].join(';')
        );

        return [header, ...rows].join('\n');
      }

      case 'xlsx': {
        const workbook = new ExcelJS.Workbook();

        const resumoSheet = workbook.addWorksheet('Resumo');
        resumoSheet.columns = [
          { header: 'Indicador', key: 'indicador', width: 40 },
          { header: 'Valor', key: 'valor', width: 20 },
        ];
        resumoSheet.addRows([
          { indicador: 'Periodo inicial', valor: fluxo.periodo.dataInicio },
          { indicador: 'Periodo final', valor: fluxo.periodo.dataFim },
          { indicador: 'Saldo inicial do periodo', valor: fluxo.saldo.saldo_inicial_periodo },
          { indicador: 'Entradas realizadas', valor: fluxo.saldo.entradas_realizadas_periodo },
          { indicador: 'Saidas realizadas', valor: fluxo.saldo.saidas_realizadas_periodo },
          { indicador: 'Entradas previstas', valor: fluxo.saldo.entradas_previstas_periodo },
          { indicador: 'Saidas previstas', valor: fluxo.saldo.saidas_previstas_periodo },
          { indicador: 'Saldo final realizado', valor: fluxo.saldo.saldo_final_realizado },
          { indicador: 'Saldo final previsto', valor: fluxo.saldo.saldo_final_previsto },
        ]);
        resumoSheet.getRow(1).font = { bold: true };

        const diarioSheet = workbook.addWorksheet('Diario');
        diarioSheet.columns = [
          { header: 'Data', key: 'data_movimento', width: 14 },
          { header: 'Tipo', key: 'tipo', width: 16 },
          { header: 'Origem', key: 'origem', width: 14 },
          { header: 'Descricao', key: 'descricao', width: 38 },
          { header: 'Pessoa', key: 'pessoa_nome', width: 28 },
          { header: 'Forma de pagamento', key: 'forma_pagamento', width: 28 },
          { header: 'Status', key: 'status', width: 16 },
          { header: 'Valor', key: 'valor', width: 14 },
          { header: 'Impacto', key: 'impacto', width: 14 },
        ];
        fluxo.diario.forEach((movimento) => diarioSheet.addRow(movimento));
        diarioSheet.getRow(1).font = { bold: true };

        const demonstrativoSheet = workbook.addWorksheet('Demonstrativo');
        demonstrativoSheet.columns = [
          { header: 'Data', key: 'data', width: 14 },
          { header: 'Entradas realizadas', key: 'entradas_realizadas', width: 20 },
          { header: 'Saidas realizadas', key: 'saidas_realizadas', width: 20 },
          { header: 'Entradas previstas', key: 'entradas_previstas', width: 20 },
          { header: 'Saidas previstas', key: 'saidas_previstas', width: 20 },
          { header: 'Saldo realizado', key: 'saldo_realizado', width: 18 },
          { header: 'Saldo projetado', key: 'saldo_projetado', width: 18 },
        ];
        fluxo.demonstrativo.forEach((item) => demonstrativoSheet.addRow(item));
        demonstrativoSheet.getRow(1).font = { bold: true };

        return await workbook.xlsx.writeBuffer() as unknown as Buffer;
      }

      case 'pdf':
        return new Promise((resolve, reject) => {
          const doc = new PDFDocument({ margin: 30, size: 'A4' });
          const buffers: Buffer[] = [];
          doc.on('data', buffers.push.bind(buffers));
          doc.on('end', () => resolve(Buffer.concat(buffers)));
          doc.on('error', reject);

          doc.fontSize(18).text('Fluxo de Caixa', { align: 'center' });
          doc.moveDown(0.4);
          doc.fontSize(10).text(`Periodo: ${fluxo.periodo.dataInicio} a ${fluxo.periodo.dataFim}`, { align: 'center' });
          doc.moveDown();

          doc.fontSize(12).font('Helvetica-Bold').text('Resumo do periodo');
          doc.moveDown(0.5);
          doc.font('Helvetica').fontSize(10);
          doc.text(`Saldo inicial: ${fluxo.saldo.saldo_inicial_periodo.toFixed(2)}`);
          doc.text(`Entradas realizadas: ${fluxo.saldo.entradas_realizadas_periodo.toFixed(2)}`);
          doc.text(`Saidas realizadas: ${fluxo.saldo.saidas_realizadas_periodo.toFixed(2)}`);
          doc.text(`Entradas previstas: ${fluxo.saldo.entradas_previstas_periodo.toFixed(2)}`);
          doc.text(`Saidas previstas: ${fluxo.saldo.saidas_previstas_periodo.toFixed(2)}`);
          doc.text(`Saldo final realizado: ${fluxo.saldo.saldo_final_realizado.toFixed(2)}`);
          doc.text(`Saldo final previsto: ${fluxo.saldo.saldo_final_previsto.toFixed(2)}`);
          doc.moveDown();

          doc.font('Helvetica-Bold').text('Demonstrativo diario');
          doc.moveDown(0.5);
          doc.font('Helvetica').fontSize(9);

          fluxo.demonstrativo.slice(0, 28).forEach((linha) => {
            doc.text(
              `${linha.data} | ER ${linha.entradas_realizadas.toFixed(2)} | SR ${linha.saidas_realizadas.toFixed(2)} | EP ${linha.entradas_previstas.toFixed(2)} | SP ${linha.saidas_previstas.toFixed(2)} | Saldo Proj ${linha.saldo_projetado.toFixed(2)}`
            );
          });

          doc.end();
        });

      default:
        throw new Error('Formato invalido');
    }
  }

  // =========================================================================
  // 8. EXPORTACOES (CSV, EXCEL, PDF)
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
  // 9. METODOS PRIVADOS / VALIDACOES
  // =========================================================================
  private resolverPeriodoDreGerencial(dataInicial?: string, dataFinal?: string) {
    const hoje = new Date();
    const inicioPadrao = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
    const fimPadrao = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const inicio = dataInicial ? new Date(dataInicial) : inicioPadrao;
    const fim = dataFinal ? new Date(dataFinal) : fimPadrao;

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
      throw new Error('Periodo da DRE Gerencial invalido.');
    }

    if (inicio > fim) {
      throw new Error('A data inicial da DRE nao pode ser maior que a data final.');
    }

    return {
      dataInicial: this.formatarDataISO(inicio),
      dataFinal: this.formatarDataISO(fim),
    };
  }

  private listarMesesPeriodo(dataInicial: string, dataFinal: string) {
    const meses: Array<{ key: string; label: string }> = [];
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const cursor = new Date(`${dataInicial}T00:00:00`);
    const limite = new Date(`${dataFinal}T00:00:00`);

    cursor.setDate(1);
    limite.setDate(1);

    while (cursor <= limite) {
      const ano = cursor.getFullYear();
      const mes = cursor.getMonth();
      meses.push({
        key: `${mesesNomes[mes].toLowerCase()}${ano}`,
        label: `${mesesNomes[mes]}/${ano}`,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return meses;
  }

  private montarLinhasDre(categorias: CategoriaDre[], mesKeys: string[]) {
    const baseMeses = Object.fromEntries(mesKeys.map((key) => [key, 0]));
    const labelsGrupo = this.getLabelsGrupoCategoriaDre();

    const gruposFixos = [
      { key: 'receita-bruta', grupo: 'RECEITA_BRUTA', categoria: labelsGrupo.RECEITA_BRUTA, tipoLinha: 'receita' },
      { key: 'deducoes', grupo: 'DEDUCOES', categoria: labelsGrupo.DEDUCOES, tipoLinha: 'despesa' },
      { key: 'receita-liquida', grupo: null, categoria: 'Receita liquida', tipoLinha: 'totalizador' },
      { key: 'custos-operacionais', grupo: 'CUSTOS_OPERACIONAIS', categoria: labelsGrupo.CUSTOS_OPERACIONAIS, tipoLinha: 'despesa' },
      { key: 'despesas-operacionais', grupo: 'DESPESAS_OPERACIONAIS', categoria: labelsGrupo.DESPESAS_OPERACIONAIS, tipoLinha: 'despesa' },
      { key: 'outras-receitas', grupo: 'OUTRAS_RECEITAS', categoria: labelsGrupo.OUTRAS_RECEITAS, tipoLinha: 'receita' },
      { key: 'receitas-financeiras', grupo: 'RECEITAS_FINANCEIRAS', categoria: labelsGrupo.RECEITAS_FINANCEIRAS, tipoLinha: 'receita' },
      { key: 'despesas-financeiras', grupo: 'DESPESAS_FINANCEIRAS', categoria: labelsGrupo.DESPESAS_FINANCEIRAS, tipoLinha: 'despesa' },
      { key: 'outras-despesas', grupo: 'OUTRAS_DESPESAS', categoria: labelsGrupo.OUTRAS_DESPESAS, tipoLinha: 'despesa' },
      { key: 'resultado-liquido', grupo: null, categoria: 'Resultado liquido', tipoLinha: 'totalizador' },
    ];

    const linhas = gruposFixos.map((grupoFixo) => {
      if (!grupoFixo.grupo) {
        return {
          key: grupoFixo.key,
          categoria: grupoFixo.categoria,
          tipoLinha: grupoFixo.tipoLinha,
          ...baseMeses,
          total: 0,
        };
      }

      const children = categorias
        .filter((categoria) => categoria.grupo === grupoFixo.grupo)
        .map((categoria) => ({
          key: `categoria-dre-${categoria.id}`,
          categoria: categoria.nome,
          tipoLinha: 'linha-filha',
          categoriaId: categoria.id,
          grupo: categoria.grupo,
          tipo: categoria.tipo,
          ativo: categoria.ativo,
          ...baseMeses,
          total: 0,
        }));

      return {
        key: grupoFixo.key,
        categoria: grupoFixo.categoria,
        tipoLinha: grupoFixo.tipoLinha,
        grupo: grupoFixo.grupo,
        ...baseMeses,
        total: 0,
        children,
      };
    });

    const categoriasSemGrupo = categorias.filter((categoria) => categoria.grupo === 'NENHUM');
    if (categoriasSemGrupo.length > 0) {
      linhas.push({
        key: 'nao-classificado',
        categoria: 'Nao classificado',
        tipoLinha: 'neutro',
        grupo: 'NENHUM',
        ...baseMeses,
        total: 0,
        children: categoriasSemGrupo.map((categoria) => ({
          key: `categoria-dre-${categoria.id}`,
          categoria: categoria.nome,
          tipoLinha: 'linha-filha',
          categoriaId: categoria.id,
          grupo: categoria.grupo,
          tipo: categoria.tipo,
          ativo: categoria.ativo,
          ...baseMeses,
          total: 0,
        })),
      });
    }

    return linhas;
  }

  private getLabelsGrupoCategoriaDre() {
    return {
      NENHUM: 'Nenhum',
      CUSTOS_OPERACIONAIS: '(-) Custos operacionais',
      DEDUCOES: '(-) Deducoes',
      DESPESAS_FINANCEIRAS: '(-) Despesas financeiras',
      DESPESAS_OPERACIONAIS: '(-) Despesas operacionais',
      OUTRAS_DESPESAS: '(-) Outras despesas',
      OUTRAS_RECEITAS: '(+) Outras receitas',
      RECEITA_BRUTA: '(+) Receita bruta',
      RECEITAS_FINANCEIRAS: '(+) Receitas financeiras',
    };
  }

  private validarCategoriaDre(dados: Partial<CategoriaDre>) {
    const gruposValidos = Object.keys(this.getLabelsGrupoCategoriaDre());
    const tiposValidos = ['DESPESA', 'RECEITA', 'TOTALIZADOR'];

    if (!dados.grupo) {
      throw new Error('Grupo obrigatorio.');
    }

    if (!gruposValidos.includes(dados.grupo)) {
      throw new Error('Grupo invalido.');
    }

    if (!dados.nome || !dados.nome.trim()) {
      throw new Error('Nome obrigatorio.');
    }

    if (!dados.tipo) {
      throw new Error('Tipo obrigatorio.');
    }

    if (!tiposValidos.includes(dados.tipo)) {
      throw new Error('Tipo invalido.');
    }

    if (dados.ativo === undefined || dados.ativo === null) {
      throw new Error('Ativo obrigatorio.');
    }
  }

  private resolverPeriodoFluxoCaixa(dataInicio?: string, dataFim?: string) {
    const hoje = new Date();
    const inicioPadrao = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimPadrao = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const inicio = dataInicio ? new Date(dataInicio) : inicioPadrao;
    const fim = dataFim ? new Date(dataFim) : fimPadrao;

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
      throw new Error('Periodo do fluxo de caixa invalido.');
    }

    if (inicio > fim) {
      throw new Error('A data inicial nao pode ser maior que a data final.');
    }

    return {
      dataInicio: this.formatarDataISO(inicio),
      dataFim: this.formatarDataISO(fim),
    };
  }

  private formatarDataISO(data: Date) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  private montarDemonstrativo(
    dataInicio: string,
    dataFim: string,
    saldoInicialPeriodo: number,
    movimentos: Array<FluxoCaixaMovimentoRaw & { impacto: number }>
  ) {
    const movimentosPorData = new Map<
      string,
      {
        entradas_realizadas: number;
        saidas_realizadas: number;
        entradas_previstas: number;
        saidas_previstas: number;
      }
    >();

    movimentos.forEach((movimento) => {
      const item = movimentosPorData.get(movimento.data_movimento) || {
        entradas_realizadas: 0,
        saidas_realizadas: 0,
        entradas_previstas: 0,
        saidas_previstas: 0,
      };

      if (movimento.tipo === 'RECEBIMENTO') {
        if (movimento.origem === 'REALIZADO') item.entradas_realizadas += movimento.valor;
        else item.entradas_previstas += movimento.valor;
      } else if (movimento.origem === 'REALIZADO') {
        item.saidas_realizadas += movimento.valor;
      } else {
        item.saidas_previstas += movimento.valor;
      }

      movimentosPorData.set(movimento.data_movimento, item);
    });

    const linhas: Array<{
      data: string;
      entradas_realizadas: number;
      saidas_realizadas: number;
      entradas_previstas: number;
      saidas_previstas: number;
      saldo_realizado: number;
      saldo_projetado: number;
    }> = [];

    let saldoRealizado = saldoInicialPeriodo;
    let saldoProjetado = saldoInicialPeriodo;

    for (const data of this.listarDatasPeriodo(dataInicio, dataFim)) {
      const dia = movimentosPorData.get(data) || {
        entradas_realizadas: 0,
        saidas_realizadas: 0,
        entradas_previstas: 0,
        saidas_previstas: 0,
      };

      saldoRealizado += dia.entradas_realizadas - dia.saidas_realizadas;
      saldoProjetado +=
        dia.entradas_realizadas +
        dia.entradas_previstas -
        dia.saidas_realizadas -
        dia.saidas_previstas;

      linhas.push({
        data,
        entradas_realizadas: dia.entradas_realizadas,
        saidas_realizadas: dia.saidas_realizadas,
        entradas_previstas: dia.entradas_previstas,
        saidas_previstas: dia.saidas_previstas,
        saldo_realizado: saldoRealizado,
        saldo_projetado: saldoProjetado,
      });
    }

    return linhas;
  }

  private listarDatasPeriodo(dataInicio: string, dataFim: string) {
    const datas: string[] = [];
    const cursor = new Date(`${dataInicio}T00:00:00`);
    const limite = new Date(`${dataFim}T00:00:00`);

    while (cursor <= limite) {
      datas.push(this.formatarDataISO(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return datas;
  }

  private calcularPercentual(parte: number, total: number) {
    if (!total || total <= 0) return 0;
    return Number(((parte / total) * 100).toFixed(2));
  }

  private calcularTicketMedio(valorTotal: number, quantidade: number) {
    if (!quantidade || quantidade <= 0) return 0;
    return Number((valorTotal / quantidade).toFixed(2));
  }

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

  private async validarRelacionamentosContaReceber(dados: Partial<ContaReceber>, usuarioId: number) {
    if (!dados.descricao || !dados.descricao.trim()) {
      throw new Error('Descrição do recebimento é obrigatória.');
    }

    if (dados.plano_conta_id) {
      const planoConta = await this.planoContaRepository.buscarPorId(Number(dados.plano_conta_id), usuarioId);
      if (!planoConta) {
        throw new Error('Plano de contas informado não foi encontrado.');
      }
    }

    if (dados.centro_custo_id) {
      const centroCusto = await this.centroCustoRepository.buscarPorId(Number(dados.centro_custo_id), usuarioId);
      if (!centroCusto) {
        throw new Error('Centro de custo informado não foi encontrado.');
      }
    }

    if (dados.forma_pagamento_id) {
      const formaPagamento = await this.formaPagamentoRepository.buscarPorId(Number(dados.forma_pagamento_id), usuarioId);
      if (!formaPagamento) {
        throw new Error('Forma de pagamento informada não foi encontrada.');
      }
      dados.forma_pagamento = formaPagamento.nome;
    }

    if (dados.conta_bancaria_id) {
      const contaBancaria = await this.contaBancariaRepository.buscarPorId(Number(dados.conta_bancaria_id), usuarioId);
      if (!contaBancaria) {
        throw new Error('Conta bancária informada não foi encontrada.');
      }
    }

    if (dados.entidade_tipo && !['cliente', 'fornecedor', 'transportadora', 'funcionario', 'outros'].includes(dados.entidade_tipo)) {
      throw new Error('Entidade informada é inválida.');
    }

    if ((dados.entidade_tipo === 'cliente' || dados.entidade_tipo === 'fornecedor') && !dados.entidade_id) {
      throw new Error('Selecione o registro da entidade informada.');
    }

    if (dados.entidade_tipo === 'cliente') {
      dados.cliente_id = Number(dados.entidade_id);
    } else if (dados.entidade_tipo !== undefined) {
      dados.cliente_id = null;
    }

    if ((dados.recebimento_quitado || dados.status === 'recebido') && !dados.data_compensacao && !dados.data_recebimento) {
      const hoje = new Date().toISOString().split('T')[0];
      dados.data_compensacao = hoje;
      dados.data_recebimento = hoje;
    }

    if (dados.recebimento_quitado) {
      dados.status = 'recebido';
    } else if (dados.recebimento_quitado === false && dados.status === 'recebido') {
      dados.status = 'pendente';
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
