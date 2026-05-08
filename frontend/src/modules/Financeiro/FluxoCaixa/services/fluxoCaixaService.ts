import api from "../../../../api/api";

export interface FluxoCaixaFiltros {
  data_inicio?: string;
  data_fim?: string;
}

export interface FluxoCaixaMovimento {
  id: number;
  tipo: "RECEBIMENTO" | "PAGAMENTO";
  origem: "REALIZADO" | "PREVISTO";
  descricao: string;
  pessoa_nome: string | null;
  forma_pagamento: string | null;
  status: string;
  valor: number;
  data_movimento: string;
  data_vencimento: string;
  data_baixa: string | null;
  impacto: number;
}

export interface FluxoCaixaContaBancaria {
  id: number;
  nome: string;
  saldo_inicial: number;
  data_saldo: string;
  formas_pagamento_vinculadas: number;
}

export interface FluxoCaixaDemonstrativo {
  data: string;
  entradas_realizadas: number;
  saidas_realizadas: number;
  entradas_previstas: number;
  saidas_previstas: number;
  saldo_realizado: number;
  saldo_projetado: number;
}

export interface FluxoCaixaResponse {
  periodo: {
    dataInicio: string;
    dataFim: string;
  };
  saldo: {
    saldo_inicial_periodo: number;
    entradas_realizadas_periodo: number;
    saidas_realizadas_periodo: number;
    entradas_previstas_periodo: number;
    saidas_previstas_periodo: number;
    saldo_final_realizado: number;
    saldo_final_previsto: number;
    saldo_inicial_contas_ate_inicio: number;
    saldo_inicial_contas_ate_fim: number;
    contas_bancarias: FluxoCaixaContaBancaria[];
  };
  resumo: {
    a_receber_hoje: number;
    a_pagar_hoje: number;
    recebimentos: {
      realizado: number;
      pendente: number;
      atrasado: number;
      cancelado: number;
      previsto: number;
    };
    pagamentos: {
      realizado: number;
      pendente: number;
      atrasado: number;
      cancelado: number;
      previsto: number;
    };
    saldo_periodo_realizado: number;
    saldo_periodo_previsto: number;
  };
  diario: FluxoCaixaMovimento[];
  estatisticas: {
    total_movimentos_periodo: number;
    total_contas_bancarias: number;
    total_formas_recebimento_mapeadas: number;
    ticket_medio_recebimento: number;
    ticket_medio_pagamento: number;
    percentual_recebido_periodo: number;
    percentual_pago_periodo: number;
    formas_recebimento: Array<{
      forma_pagamento: string;
      quantidade: number;
      valor_total: number;
    }>;
    recebimentos: {
      quantidade_realizado: number;
      quantidade_pendente: number;
      quantidade_atrasado: number;
      quantidade_cancelado: number;
    };
    pagamentos: {
      quantidade_realizado: number;
      quantidade_pendente: number;
      quantidade_atrasado: number;
      quantidade_cancelado: number;
    };
  };
  demonstrativo: FluxoCaixaDemonstrativo[];
  observacoes: string[];
}

export const obterFluxoCaixaService = async (filtros?: FluxoCaixaFiltros) => {
  const response = await api.get("/api/financeiro/fluxo-caixa", { params: filtros });
  return response.data?.data || response.data;
};

export const exportarFluxoCaixaService = async (
  formato: "csv" | "xlsx" | "pdf",
  filtros?: FluxoCaixaFiltros
) => {
  const response = await api.get("/api/financeiro/fluxo-caixa/exportar", {
    params: { formato, ...filtros },
    responseType: "blob",
  });

  return response.data;
};
