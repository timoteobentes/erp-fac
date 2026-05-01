/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../../api/api";

export interface FiltrosCentroCusto {
  status?: string;
  termo?: string;
}

export const listarCentroCustosService = async (filtros?: FiltrosCentroCusto) => {
  try {
    const params: any = { ...filtros };
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === "") delete params[key];
    });

    const response = await api.get("/api/financeiro/centro-custos", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const criarCentroCustoService = async (dados: { nome: string; status: string }) => {
  try {
    const response = await api.post("/api/financeiro/centro-custos", dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const buscarCentroCustoPorIdService = async (id: number | string) => {
  try {
    const response = await api.get(`/api/financeiro/centro-custos/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const atualizarCentroCustoService = async (id: number | string, dados: { nome: string; status: string }) => {
  try {
    const response = await api.put(`/api/financeiro/centro-custos/${id}`, dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const excluirCentroCustoService = async (id: number | string) => {
  try {
    const response = await api.delete(`/api/financeiro/centro-custos/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
