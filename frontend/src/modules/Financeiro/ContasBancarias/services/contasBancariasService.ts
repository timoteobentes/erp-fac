/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../../api/api";

export interface FiltrosContaBancaria {
  termo?: string;
}

export const listarContasBancariasService = async (filtros?: FiltrosContaBancaria) => {
  try {
    const params: any = { ...filtros };
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === "") delete params[key];
    });

    const response = await api.get("/api/financeiro/contas-bancarias", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const criarContaBancariaService = async (dados: { nome: string; saldo_inicial: number; data_saldo: string }) => {
  try {
    const response = await api.post("/api/financeiro/contas-bancarias", dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const buscarContaBancariaPorIdService = async (id: number | string) => {
  try {
    const response = await api.get(`/api/financeiro/contas-bancarias/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const atualizarContaBancariaService = async (id: number | string, dados: { nome: string; saldo_inicial: number; data_saldo: string }) => {
  try {
    const response = await api.put(`/api/financeiro/contas-bancarias/${id}`, dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const excluirContaBancariaService = async (id: number | string) => {
  try {
    const response = await api.delete(`/api/financeiro/contas-bancarias/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
