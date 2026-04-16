import { VendaRepository } from '../repositories/VendaRepository';
import { Venda, ItemVenda } from '../models/Venda';
import { NfceService } from './nfce.service';
import { EstoqueService } from './estoque.service';

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
    // Validar payload básico
    if (!vendaData.itens || vendaData.itens.length === 0) {
      throw new Error("A venda precisa ter pelo menos um item.");
    }
    
    if (!vendaData.forma_pagamento) {
        throw new Error("Forma de pagamento é obrigatória.");
    }

    let valorLiquido = Number(vendaData.valor_total) || 0;
    const desconto = Number(vendaData.desconto_total) || 0;
    
    if (valorLiquido <= 0) {
        // Recalcular com base nos itens por segurança
        valorLiquido = vendaData.itens.reduce((acc: number, item: any) => acc + (Number(item.subtotal) || 0), 0);
        valorLiquido -= desconto;
        
        if (valorLiquido <= 0) {
             throw new Error("Valor da venda inválido.");
        }
    }

    // Regra de Negócio: Liquidez do Pagamento
    const formaPagamentoStr = vendaData.forma_pagamento.toLowerCase();
    const isPagamentoImediato = ['dinheiro', 'pix'].includes(formaPagamentoStr);
    
    const statusFinanceiro = isPagamentoImediato ? 'recebido' : 'pendente';
    const dataRecebimento = isPagamentoImediato ? new Date().toISOString().split('T')[0] : null;

    const novaVenda: Venda & { status_financeiro?: string; data_recebimento?: string | null } = {
      usuario_id,
      cliente_id: vendaData.cliente_id || null,
      valor_bruto: valorLiquido + desconto,
      desconto: desconto,
      valor_total: valorLiquido,
      forma_pagamento: vendaData.forma_pagamento,
      status: 'concluida',
      status_financeiro: statusFinanceiro, // Passando para o Repositório
      data_recebimento: dataRecebimento    // Passando para o Repositório
    };

    const itensMap: ItemVenda[] = vendaData.itens.map((i: any) => ({
      produto_id: i.produto_id,
      quantidade: i.quantidade,
      valor_unitario: Number(i.valor_unitario),
      valor_total: Number(i.subtotal)
    }));

    // Aciona a transação que salva a venda, os itens, baixa estoque e lança no contas a receber
    const novaVendaSalva = await this.vendaRepository.processarVendaTransaction(novaVenda, itensMap);
    
    // O Estoque e as Movimentações já foram processados na transação principal ACID acima.

    // Motor Sefaz: Tenta emitir NFC-e
    try {
        const nfceResult = await this.nfceService.emitir(novaVendaSalva.id!, usuario_id);
        
        // Atualiza a venda com os dados retornados da Sefaz
        await this.vendaRepository.atualizarDadosSefaz(novaVendaSalva.id!, nfceResult);

        // Retorna a venda original enriquecida com o resultado Sefaz
        return {
            ...novaVendaSalva,
            ...nfceResult
        };
    } catch (error: any) {
        console.error("Erro ao emitir NFC-e:", error.message);
        
        // Em caso de falha na emissão Sefaz, a venda interna ainda existe como contingência off-line.
        await this.vendaRepository.atualizarDadosSefaz(novaVendaSalva.id!, {
             status_sefaz: 'rejeitado',
             chave_acesso: null,
             numero_nfe: null,
             protocolo: null,
             xml_autorizado: null
        });

        return {
             ...novaVendaSalva,
             status_sefaz: 'rejeitado',
             erro_sefaz: error.message
        };
    }
  }

  async listarVendas(filtros?: any, paginacao?: { limit: number, offset: number }) {
    return await this.vendaRepository.listar(filtros, paginacao);
  }
}
