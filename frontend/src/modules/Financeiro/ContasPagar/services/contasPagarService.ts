/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../../api/api";

export interface FiltrosContaPagar {
  status?: string;
  data_vencimento_inicio?: string;
  data_vencimento_fim?: string;
  fornecedor_id?: number;
  termo?: string;
}

export interface ContaPagarParcelaPayload {
  id?: number;
  numero_parcela: number;
  data_vencimento: string;
  valor: number;
  forma_pagamento_id: number;
  conta_bancaria_id?: number | null;
  pago?: boolean;
  observacao?: string | null;
}

export interface ContaPagarPayload {
  fornecedor_id?: number | null;
  descricao: string;
  valor_total: number;
  data_vencimento: string;
  data_pagamento?: string | null;
  status?: 'pendente' | 'pago' | 'cancelado' | 'atrasado';
  categoria_despesa?: string | null;
  observacao?: string | null;
  plano_conta_id?: number | null;
  centro_custo_id?: number | null;
  forma_pagamento_id?: number | null;
  conta_bancaria_id?: number | null;
  pagamento_quitado?: boolean;
  data_compensacao?: string | null;
  parcelamento_recorrencia_ativo?: boolean;
  tipo_parcela?: string | null;
  repeticao?: string | null;
  quantidade_parcelas?: number | null;
  data_primeira_parcela?: string | null;
  parcelas?: ContaPagarParcelaPayload[];
}

export const listarContasPagarService = async (filtros?: FiltrosContaPagar) => {
  try {
    const params: any = { ...filtros };
    Object.keys(params).forEach(key => 
      (params[key] === undefined || params[key] === '') && delete params[key]
    );

    const response = await api.get("/api/financeiro/pagar", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const criarContaPagarService = async (dados: ContaPagarPayload) => {
  try {
    const response = await api.post("/api/financeiro/pagar", dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const buscarContaPagarPorIdService = async (id: number | string) => {
  try {
    const response = await api.get(`/api/financeiro/pagar/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const baixarContaPagarService = async (id: number | string, data_pagamento?: string) => {
  try {
    const response = await api.patch(`/api/financeiro/pagar/${id}/baixa`, { data_pagamento });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const excluirContaPagarService = async (id: number | string) => {
  try {
    const response = await api.delete(`/api/financeiro/pagar/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const atualizarContaPagarService = async (id: number | string, dados: ContaPagarPayload) => {
  try {
    const response = await api.put(`/api/financeiro/pagar/${id}`, dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const exportarContasPagarService = async (formato: 'csv' | 'xlsx' | 'pdf', filtros?: FiltrosContaPagar) => {
  try {
    const params: any = {
      formato,
      ...filtros
    };

    Object.keys(params).forEach(key => 
      (params[key] === undefined || params[key] === '') && delete params[key]
    );

    const response = await api.get('/api/financeiro/pagar/exportar', { 
      params,
      responseType: 'blob' 
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};
