import api from '../../../../api/api';
import type { Servico, ServicoFormData } from '../schemas/servicoSchema';

export const getServicosService = async (): Promise<Servico[]> => {
  const { data } = await api.get('/api/servicos');
  return data;
};

export const getServicoPorIdService = async (id: number): Promise<Servico> => {
  const { data } = await api.get(`/api/servicos/${id}`);
  return data;
};

export const createServicoService = async (payload: ServicoFormData): Promise<Servico> => {
  const { data } = await api.post('/api/servicos', payload);
  return data;
};

export const updateServicoService = async (id: number, payload: Partial<ServicoFormData>): Promise<Servico> => {
  const { data } = await api.put(`/api/servicos/${id}`, payload);
  return data;
};

export const deleteServicoService = async (id: number): Promise<void> => {
  await api.delete(`/api/servicos/${id}`);
};
