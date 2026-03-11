import { ContaReceberRepository, FiltrosContaReceber } from '../repositories/ContaReceberRepository';
import { ContaPagarRepository, FiltrosContaPagar } from '../repositories/ContaPagarRepository';
import { ContaReceber } from '../models/ContaReceber';
import { ContaPagar } from '../models/ContaPagar';

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

  async listarContasReceber(usuarioId: number, filtros: FiltrosContaReceber) {
    return await this.contaReceberRepository.listar(usuarioId, filtros);
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
    await this.buscarContaReceber(id, usuarioId); // Valida existência
    // TODO: Adicionar lógica para talvez não permitir excluir se estiver originada de uma venda fechada
    await this.contaReceberRepository.excluir(id, usuarioId);
  }


  // =========================================================================
  // 2. CONTAS A PAGAR
  // =========================================================================

  async criarContaPagar(dados: ContaPagar, usuarioId: number): Promise<number> {
    this.validarContaBasica(dados.valor_total, dados.data_vencimento);
    return await this.contaPagarRepository.criar(dados, usuarioId);
  }

  async listarContasPagar(usuarioId: number, filtros: FiltrosContaPagar) {
    return await this.contaPagarRepository.listar(usuarioId, filtros);
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
  // 3. MÉTODOS PRIVADOS / VALIDAÇÕES (Regras de Negócio)
  // =========================================================================
  private validarContaBasica(valorTotal: number, dataVencimento: string | Date) {
    if (!valorTotal || valorTotal <= 0) {
      throw new Error('O valor total da conta deve ser maior que zero.');
    }

    // Tentar instanciar a data, se falhar ou for NaN, é inválida
    const dataVenc = new Date(dataVencimento);
    if (isNaN(dataVenc.getTime())) {
      throw new Error('Data de vencimento inválida.');
    }
  }
}
