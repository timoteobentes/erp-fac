/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../../api/api";

export interface FiltrosCategoriaDre {
  grupo?: string;
  tipo?: string;
  ativo?: boolean;
  termo?: string;
}

export interface CategoriaDrePayload {
  grupo: string;
  nome: string;
  tipo: string;
  ativo: boolean;
}

export const listarCategoriasDreService = async (filtros?: FiltrosCategoriaDre) => {
  try {
    const params: any = { ...filtros };
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === "") delete params[key];
    });

    const response = await api.get("/api/financeiro/dre-gerencial/categorias", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const criarCategoriaDreService = async (dados: CategoriaDrePayload) => {
  try {
    const response = await api.post("/api/financeiro/dre-gerencial/categorias", dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const buscarCategoriaDrePorIdService = async (id: number | string) => {
  try {
    const response = await api.get(`/api/financeiro/dre-gerencial/categorias/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const atualizarCategoriaDreService = async (id: number | string, dados: CategoriaDrePayload) => {
  try {
    const response = await api.put(`/api/financeiro/dre-gerencial/categorias/${id}`, dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const excluirCategoriaDreService = async (id: number | string) => {
  try {
    const response = await api.delete(`/api/financeiro/dre-gerencial/categorias/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
