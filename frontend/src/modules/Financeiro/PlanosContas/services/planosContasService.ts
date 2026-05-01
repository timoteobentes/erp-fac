/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../../api/api";

export interface FiltrosPlanoConta {
  conta_mae?: string;
  termo?: string;
}

export const listarPlanosContasService = async (filtros?: FiltrosPlanoConta) => {
  try {
    const params: any = { ...filtros };
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === "") delete params[key];
    });

    const response = await api.get("/api/financeiro/planos-de-contas", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const criarPlanoContaService = async (dados: { conta_mae: string; nome: string }) => {
  try {
    const response = await api.post("/api/financeiro/planos-de-contas", dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const buscarPlanoContaPorIdService = async (id: number | string) => {
  try {
    const response = await api.get(`/api/financeiro/planos-de-contas/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const atualizarPlanoContaService = async (id: number | string, dados: { conta_mae: string; nome: string }) => {
  try {
    const response = await api.put(`/api/financeiro/planos-de-contas/${id}`, dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const excluirPlanoContaService = async (id: number | string) => {
  try {
    const response = await api.delete(`/api/financeiro/planos-de-contas/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
