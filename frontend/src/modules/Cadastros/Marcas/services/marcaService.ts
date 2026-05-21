/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../../api/api";

export interface Marca {
  id: number;
  nome: string;
  ativa?: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export interface ResultadoMarcas {
  data: Marca[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const listarMarcasService = async (
  page = 1,
  limit = 10,
  filtros: { nome?: string } = {}
): Promise<ResultadoMarcas> => {
  const params: any = { page, limit, ...filtros };
  Object.keys(params).forEach((key) => (params[key] === undefined || params[key] === '') && delete params[key]);

  const response = await api.get('/api/marcas', { params });
  return { data: response.data.data, meta: response.data.meta };
};

export const listarTodasMarcasService = async (): Promise<Marca[]> => {
  const response = await api.get('/api/marcas', { params: { limit: 99999 } });
  return response.data.data || [];
};

export const buscarMarcaService = async (id: string | number): Promise<Marca> => {
  const response = await api.get(`/api/marcas/${id}`);
  return response.data.data;
};

export const criarMarcaService = async (dados: { nome: string }) => {
  const response = await api.post('/api/marcas', dados);
  return response.data;
};

export const atualizarMarcaService = async (id: string | number, dados: { nome: string }) => {
  const response = await api.put(`/api/marcas/${id}`, dados);
  return response.data;
};

export const excluirMarcaService = async (id: string | number) => {
  const response = await api.delete(`/api/marcas/${id}`);
  return response.data;
};
