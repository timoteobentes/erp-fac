import api from '../../../../api/api';

export interface ContaReceber {
  id: number;
  descricao: string;
  valor_total: string | number;
  data_vencimento: string;
  data_recebimento?: string;
  data_compensacao?: string;
  data_competencia?: string;
  status: 'pendente' | 'recebido' | 'atrasado' | 'cancelado';
  forma_pagamento?: string;
  forma_pagamento_id?: number | null;
  forma_pagamento_nome_relacionada?: string;
  plano_conta_id?: number | null;
  plano_conta_nome?: string;
  centro_custo_id?: number | null;
  centro_custo_nome?: string;
  conta_bancaria_id?: number | null;
  conta_bancaria_nome?: string;
  recebimento_quitado?: boolean;
  entidade_tipo?: 'cliente' | 'fornecedor' | 'transportadora' | 'funcionario' | 'outros' | '';
  entidade_id?: number | null;
  entidade_nome?: string;
  informacoes_complementares?: string;
  anexos?: Array<{ nome: string; tamanho?: number; tipo?: string }>;
  venda_id?: number;
  cliente_id?: number | null;
  observacao?: string;
}

export const contasReceberService = {
  listar: async (): Promise<ContaReceber[]> => {
    const response = await api.get('/api/financeiro/receber');
    return response.data;
  },
  criar: async (dados: Partial<ContaReceber>): Promise<void> => {
    await api.post('/api/financeiro/receber', dados);
  },
  baixar: async (id: number, dados?: { valor_recebido?: number; data_recebimento?: string }): Promise<void> => {
    await api.patch(`/api/financeiro/receber/${id}/baixa`, dados || {});
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
