import api from '../../../../api/api';

export interface ContaReceber {
  id: number;
  descricao: string;
  valor_total: string | number;
  data_vencimento: string;
  data_recebimento?: string;
  status: 'pendente' | 'recebido' | 'atrasado' | 'cancelado';
  forma_pagamento?: string;
  venda_id?: number;
}

export const contasReceberService = {
  listar: async (): Promise<ContaReceber[]> => {
    const response = await api.get('/api/financeiro/receber');
    return response.data;
  },
  baixar: async (id: number): Promise<void> => {
    await api.patch(`/api/financeiro/receber/${id}/baixa`);
  },
  excluir: async (id: number): Promise<void> => {
    await api.delete(`/api/financeiro/receber/${id}`);
  },
  buscar: async (id: number | string): Promise<ContaReceber> => {
    const response = await api.get(`/api/financeiro/receber/${id}`);
    return response.data.data || response.data;
  },
  atualizar: async (id: number | string, dados: any): Promise<void> => {
    await api.put(`/api/financeiro/receber/${id}`, dados);
  },
  exportar: async (formato: 'csv' | 'xlsx' | 'pdf', filtros?: any): Promise<Blob> => {
    const params: any = { formato, ...filtros };
    Object.keys(params).forEach(key => 
      (params[key] === undefined || params[key] === '') && delete params[key]
    );

    const response = await api.get('/api/financeiro/receber/exportar', { 
      params,
      responseType: 'blob' 
    });
    
    return response.data;
  }
};
