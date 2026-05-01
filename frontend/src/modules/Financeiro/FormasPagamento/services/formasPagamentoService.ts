/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../../api/api";

export interface FiltrosFormaPagamento {
  termo?: string;
  modalidade?: string;
  disponivel_em?: string;
  conta_bancaria_id?: number;
}

export interface FormaPagamentoPayload {
  nome: string;
  conta_bancaria_id: number;
  disponivel_em: string;
  confirmacao_automatica: string;
  numero_maximo_parcelas: number;
  intervalo_parcelas_dias: number;
  primeira_parcela_dias: number;
  taxa_banco: number;
  taxa_operadora: number;
  juros_multa: number;
  juros_mora: number;
  modalidade: string;
}

export const listarFormasPagamentoService = async (filtros?: FiltrosFormaPagamento) => {
  try {
    const params: any = { ...filtros };
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === "") delete params[key];
    });

    const response = await api.get("/api/financeiro/formas-de-pagamento", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const criarFormaPagamentoService = async (dados: FormaPagamentoPayload) => {
  try {
    const response = await api.post("/api/financeiro/formas-de-pagamento", dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const buscarFormaPagamentoPorIdService = async (id: number | string) => {
  try {
    const response = await api.get(`/api/financeiro/formas-de-pagamento/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const atualizarFormaPagamentoService = async (id: number | string, dados: FormaPagamentoPayload) => {
  try {
    const response = await api.put(`/api/financeiro/formas-de-pagamento/${id}`, dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const excluirFormaPagamentoService = async (id: number | string) => {
  try {
    const response = await api.delete(`/api/financeiro/formas-de-pagamento/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
