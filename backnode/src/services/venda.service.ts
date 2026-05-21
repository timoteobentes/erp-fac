import { VendaRepository } from '../repositories/VendaRepository';
import { Venda, ItemVenda } from '../models/Venda';
import { NfceService } from './nfce.service';
import { EstoqueService } from './estoque.service';

type PagamentoFrenteCaixa = {
  tipo: string;
  valor: number;
  observacao?: string | null;
  vencimento?: string | null;
  forma_pagamento_id?: number | null;
};

export class VendaService {
  private vendaRepository: VendaRepository;
  private nfceService: NfceService;
  private estoqueService: EstoqueService;

  constructor() {
    this.vendaRepository = new VendaRepository();
    this.nfceService = new NfceService();
    this.estoqueService = new EstoqueService();
  }

  async realizarCheckout(usuario_id: number, vendaData: any) {
    if (!vendaData.itens || vendaData.itens.length === 0) {
      throw new Error('A venda precisa ter pelo menos um item.');
    }

    let valorLiquido = Number(vendaData.valor_total) || 0;
    const desconto = Number(vendaData.desconto_total) || 0;

    if (valorLiquido <= 0) {
      valorLiquido = vendaData.itens.reduce((acc: number, item: any) => acc + (Number(item.subtotal) || 0), 0);
      valorLiquido -= desconto;

      if (valorLiquido <= 0) {
        throw new Error('Valor da venda invalido.');
      }
    }

    const pagamentos = this.normalizarPagamentos(vendaData, valorLiquido);
    const totalRecebido = pagamentos.reduce((acc, pagamento) => acc + pagamento.valor, 0);
    const possuiPagamentoPrazo = pagamentos.some((pagamento) => this.isPagamentoPrazo(pagamento.tipo));
    const formaPagamentoResumo = pagamentos.map((pagamento) => pagamento.tipo).join(' + ');
    const statusFinanceiro = !possuiPagamentoPrazo && totalRecebido >= valorLiquido ? 'recebido' : 'pendente';
    const dataRecebimento = statusFinanceiro === 'recebido' ? new Date().toISOString().split('T')[0] : null;

    const novaVenda: Venda & { status_financeiro?: string; data_recebimento?: string | null } = {
      usuario_id,
      cliente_id: vendaData.cliente_id || null,
      valor_bruto: valorLiquido + desconto,
      desconto,
      valor_total: valorLiquido,
      forma_pagamento: formaPagamentoResumo,
      status: 'concluida',
      status_financeiro: statusFinanceiro,
      data_recebimento: dataRecebimento
    };

    const itensMap: ItemVenda[] = vendaData.itens.map((i: any) => ({
      produto_id: i.produto_id,
      quantidade: i.quantidade,
      valor_unitario: Number(i.valor_unitario),
      valor_total: Number(i.subtotal)
    }));

    const novaVendaSalva = await this.vendaRepository.processarVendaTransaction(novaVenda, itensMap, pagamentos);

    return {
      ...novaVendaSalva,
      pagamentos,
      valor_recebido: totalRecebido,
      troco: Math.max(0, Number((totalRecebido - valorLiquido).toFixed(2))),
      status_sefaz: novaVendaSalva.status_sefaz || 'pendente'
    };
  }

  async listarVendas(filtros?: any, paginacao?: { limit: number, offset: number }) {
    return await this.vendaRepository.listar(filtros, paginacao);
  }

  async emitirNfce(vendaId: number, usuarioId: number) {
    const venda = await this.vendaRepository.getVendaCompleta(vendaId);
    if (!venda || Number(venda.usuario_id) !== Number(usuarioId)) {
      throw new Error('Venda nao encontrada para o usuario.');
    }

    const resultado = await this.nfceService.emitir(vendaId, usuarioId);
    return {
      ...venda,
      ...resultado
    };
  }

  private normalizarPagamentos(vendaData: any, valorLiquido: number): PagamentoFrenteCaixa[] {
    const pagamentosInformados = Array.isArray(vendaData.pagamentos) ? vendaData.pagamentos : [];
    const pagamentosBase = pagamentosInformados.length > 0
      ? pagamentosInformados
      : [{
          tipo: vendaData.forma_pagamento,
          valor: vendaData.valor_recebido || valorLiquido,
          vencimento: vendaData.vencimento || null,
          forma_pagamento_id: vendaData.forma_pagamento_id || null
        }];

    const pagamentos: PagamentoFrenteCaixa[] = pagamentosBase
      .map((pagamento: any) => ({
        tipo: String(pagamento.tipo || pagamento.forma_pagamento || '').trim(),
        valor: Number(pagamento.valor || pagamento.valor_recebido || 0),
        observacao: pagamento.observacao || null,
        vencimento: pagamento.vencimento || null,
        forma_pagamento_id: pagamento.forma_pagamento_id ? Number(pagamento.forma_pagamento_id) : null
      }))
      .filter((pagamento: PagamentoFrenteCaixa) => pagamento.tipo && pagamento.valor > 0);

    if (pagamentos.length === 0) {
      throw new Error('Informe pelo menos uma forma de pagamento.');
    }

    const totalInformado = pagamentos.reduce((acc: number, pagamento: PagamentoFrenteCaixa) => acc + pagamento.valor, 0);
    if (totalInformado + 0.001 < valorLiquido) {
      throw new Error('O total informado nos pagamentos nao cobre o valor da venda.');
    }

    return pagamentos;
  }

  private isPagamentoPrazo(tipo: string) {
    const normalizado = tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalizado.includes('prazo') || normalizado.includes('boleto') || normalizado.includes('crediario');
  }
}
