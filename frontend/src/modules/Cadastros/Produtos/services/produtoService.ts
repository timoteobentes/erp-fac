/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../../api/api";


export interface FiltrosProduto {
  termo?: string; // Busca por nome, código ou EAN
  categoria_id?: number;
  marca_id?: number;
  situacao?: string; // 'ativo' | 'inativo'
  tipo_item?: string; // 'produto' | 'servico' | 'kit'
}

export interface PaginacaoProduto {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}

export interface ResultadoProdutos {
  data: any[]; // Lista de produtos
  meta: PaginacaoProduto; // Dados da paginação
}

export interface DadosAuxiliares {
  categorias: any[];
  marcas: any[];
  unidades: any[];
}

// --- Funções do Service ---

/**
 * Lista produtos com paginação e filtros
 */
export const listarProdutosService = async (
  pagina: number = 1,
  limite: number = 10,
  filtros?: FiltrosProduto
): Promise<ResultadoProdutos> => {
  try {
    const params: any = {
      page: pagina,
      limit: limite,
      ...filtros
    };

    // Remove chaves vazias/undefined para limpar a URL
    Object.keys(params).forEach(key => 
      (params[key] === undefined || params[key] === '') && delete params[key]
    );

    const response = await api.get("/api/produtos", { params });
    
    // O backend retorna { success: true, data: [...], meta: { ... } }
    return {
      data: response.data.data,
      meta: response.data.meta
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Busca dados auxiliares para preencher os selects do formulário (Categorias, Marcas, Unidades)
 */
export const obterDadosAuxiliaresService = async (): Promise<DadosAuxiliares> => {
  try {
    const response = await api.get("/api/produtos/auxiliares");
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lista produtos para composição (sem paginação, apenas dados básicos)
 */
export const listarProdutosComposicaoService = async (): Promise<any[]> => {
  try {
    // Busca todos os produtos ativos
    const response = await api.get("/api/produtos", { params: { situacao: 'ativo', limit: 99999 } });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lista fornecedores para o select
 */
export const listarFornecedoresService = async (): Promise<any[]> => {
  try {
    const response = await api.get("/api/clientes", { params: { tipo: 'fornecedor', limit: 99999 } });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Busca um produto específico pelo ID (Detalhes completos)
 */
export const buscarProdutoPorIdService = async (id: number | string) => {
  try {
    const response = await api.get(`/api/produtos/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Atualiza um produto existente
 */
export const atualizarProdutoService = async (id: number | string, dados: any) => {
  try {
    const response = await api.put(`/api/produtos/${id}`, dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Exclui um produto
 */
export const excluirProdutoService = async (id: number | string) => {
  try {
    const response = await api.delete(`/api/produtos/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Exporta produtos em CSV, Excel ou PDF
 */
export const exportarProdutosService = async (formato: 'csv' | 'xlsx' | 'pdf', filtros?: FiltrosProduto) => {
  try {
    const params: any = {
      formato,
      ...filtros
    };

    // Remove chaves vazias/undefined
    Object.keys(params).forEach(key => 
      (params[key] === undefined || params[key] === '') && delete params[key]
    );

    const response = await api.get('/api/produtos/exportar', { 
      params,
      responseType: 'blob' 
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};