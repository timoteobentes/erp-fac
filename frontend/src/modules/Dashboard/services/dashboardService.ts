import api from '../../../api/api';

export const obterResumoDashboardService = async () => {
  try {
    const response = await api.get('/api/dashboard/resumo');
    return response.data;
  } catch (error) {
    throw error;
  }
};
