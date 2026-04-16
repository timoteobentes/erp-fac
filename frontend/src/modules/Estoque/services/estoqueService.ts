import api from "../../../api/api";

export interface ProdutoEstoque {
  id: number;
  nome: string;
  codigo_interno: string;
  codigo_barras: string;
  estoque_atual: string | number;
  movimenta_estoque: boolean;
}

export interface PayloadMovimentacao {
  produto_id: number;
  tipo: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  origem: string;
  observacao?: string;
}

export interface MovimentacaoHistorico {
  id: number;
  tipo: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  saldo_apos: number;
  origem: string;
  observacao?: string;
  criado_em: string;
  produto_nome: string;
  codigo_interno: string;
}

export const estoqueService = {
  // Aproveitamos a rota de produtos existente para listar o saldo atual
  listarProdutos: async (): Promise<ProdutoEstoque[]> => {
    const response = await api.get('/api/produtos');
    return response.data;
  },
  
  // Envia a movimentação para o backend
  movimentar: async (payload: PayloadMovimentacao): Promise<void> => {
    await api.post('/api/estoque/movimentar', payload);
  },

  // Exportar produtos de estoque (usa a rota de exportação de produtos)
  exportarEstoque: async (formato: 'csv' | 'xlsx' | 'pdf'): Promise<Blob> => {
    const response = await api.get('/api/produtos/exportar', { 
      params: { formato },
      responseType: 'blob' 
    });
    return response.data;
  },

  // Busca o histórico global de movimentações da empresa
  listarHistoricoGlobal: async (): Promise<MovimentacaoHistorico[]> => {
    const response = await api.get('/api/estoque/movimentacoes');
    return response.data?.data || response.data;
  },

  // Exportar movimentações globais
  exportarMovimentacoes: async (formato: 'csv' | 'xlsx' | 'pdf'): Promise<Blob> => {
    const response = await api.get('/api/estoque/movimentacoes/exportar', { 
      params: { formato },
      responseType: 'blob' 
    });
    
    return response.data;
  }
};
