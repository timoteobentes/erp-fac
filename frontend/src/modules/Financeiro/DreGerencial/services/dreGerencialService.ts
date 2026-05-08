/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../../api/api";

export interface DreGerencialFiltros {
  data_inicial?: string;
  data_final?: string;
}

export interface DreGerencialMes {
  key: string;
  label: string;
}

export interface DreGerencialLinha {
  key: string;
  categoria: string;
  tipoLinha: string;
  total: number;
  children?: DreGerencialLinha[];
  [key: string]: any;
}

export interface DreGerencialResponse {
  periodo: {
    dataInicial: string;
    dataFinal: string;
  };
  meses: DreGerencialMes[];
  linhas: DreGerencialLinha[];
}

export const obterDreGerencialService = async (filtros?: DreGerencialFiltros) => {
  try {
    const params: any = { ...filtros };
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === "") delete params[key];
    });

    const response = await api.get("/api/financeiro/dre-gerencial", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const exportarDreGerencialService = async (
  formato: "csv" | "xlsx",
  filtros?: DreGerencialFiltros
) => {
  try {
    const response = await api.get("/api/financeiro/dre-gerencial/exportar", {
      params: { formato, ...filtros },
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
