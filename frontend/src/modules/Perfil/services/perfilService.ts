import api from '../../../api/api';

export const obterPerfilService = async () => {
  const res = await api.get('/api/perfil');
  return res.data;
};

export const atualizarPerfilService = async (payload: any) => {
  const res = await api.put('/api/perfil', payload);
  return res.data;
};
