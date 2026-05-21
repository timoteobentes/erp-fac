import api from "../../../api/api";

export interface FiltrosNotificacoes {
  titulo?: string;
  lida?: string;
  data_inicio?: string;
  data_fim?: string;
}

export const listarNotificacoesService = async (
  pagina = 1,
  limite = 10,
  filtros: FiltrosNotificacoes = {}
) => {
  const response = await api.get('/api/notificacoes', {
    params: { pagina, limite, ...filtros }
  });
  return response.data;
};

export const resumoNotificacoesService = async (limite = 5) => {
  const response = await api.get('/api/notificacoes/resumo', { params: { limite } });
  return response.data;
};

export const marcarNotificacoesService = async (ids: number[], lida: boolean, todas = false) => {
  const response = await api.patch('/api/notificacoes/marcar', { ids, lida, todas });
  return response.data;
};

export const excluirNotificacoesService = async (ids: number[]) => {
  const response = await api.delete('/api/notificacoes', { data: { ids } });
  return response.data;
};

export const enviarNotificacoesEmailService = async (ids: number[]) => {
  const response = await api.post('/api/notificacoes/email', { ids });
  return response.data;
};
