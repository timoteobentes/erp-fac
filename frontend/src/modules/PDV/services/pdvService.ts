import api from '../../../api/api';

export const checkoutPDVService = async (vendaData: any) => {
  try {
    const response = await api.post('/api/pdv/checkout', vendaData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const buscarProdutoPDVService = async (termo: string) => {
  // O endpoint de produtos nativo aceita busca textual ou código de barras
  try {
    const response = await api.get('/api/produtos', { 
        params: { termo, limit: 10 } 
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
