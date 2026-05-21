/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../../api/api";

export interface Categoria {
  id: number;
  nome: string;
  ativa?: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export interface ResultadoCategorias {
  data: Categoria[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const listarCategoriasService = async (
  page = 1,
  limit = 10,
  filtros: { nome?: string } = {}
): Promise<ResultadoCategorias> => {
  const params: any = { page, limit, ...filtros };
  Object.keys(params).forEach((key) => (params[key] === undefined || params[key] === '') && delete params[key]);

  const response = await api.get('/api/categorias', { params });
  return { data: response.data.data, meta: response.data.meta };
};

export const listarTodasCategoriasService = async (): Promise<Categoria[]> => {
  const response = await api.get('/api/categorias', { params: { limit: 99999 } });
  return response.data.data || [];
};

export const buscarCategoriaService = async (id: string | number): Promise<Categoria> => {
  const response = await api.get(`/api/categorias/${id}`);
  return response.data.data;
};

export const criarCategoriaService = async (dados: { nome: string }) => {
  const response = await api.post('/api/categorias', dados);
  return response.data;
};

export const atualizarCategoriaService = async (id: string | number, dados: { nome: string }) => {
  const response = await api.put(`/api/categorias/${id}`, dados);
  return response.data;
};

export const excluirCategoriaService = async (id: string | number) => {
  const response = await api.delete(`/api/categorias/${id}`);
  return response.data;
};
