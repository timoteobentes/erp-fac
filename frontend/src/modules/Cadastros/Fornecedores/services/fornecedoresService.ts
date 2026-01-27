/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../../api/api";

export interface FiltrosFornecedores {
  tipo?: string;
  codigo?: string;
  nome?: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  estado?: string;
  vendedor?: string;
  situacao?: string;
  data_inicio?: string;
  data_fim?: string;
}

export interface PaginacaoFornecedores {
  pagina: number;
  limite: number;
  total?: number;
}

export interface ResultadoFornecedores {
  fornecedores: any[];
  paginacao: PaginacaoFornecedores;
}

export interface OpcoesExportacao {
  formato: 'csv' | 'xlsx' | 'pdf';
  filtros?: FiltrosFornecedores;
}

export const listarFornecedoresService = async (
  pagina: number = 1,
  limite: number = 10,
  filtros?: FiltrosFornecedores,
  ordenacao?: { campo: string; ordem: 'ASC' | 'DESC' }
): Promise<ResultadoFornecedores> => {
  try {
    const params: any = {
      pagina,
      limite,
      ...filtros
    };

    if (ordenacao) {
      params.ordenarPor = ordenacao.campo;
      params.ordem = ordenacao.ordem;
    }

    const response = await api.get("/api/fornecedores", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const buscarFornecedoresPorId = async (id: string) => {
  try {
    const response = await api.get(`/api/fornecedores/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const buscarFornecedoresPorDocumento = async (documento: string) => {
  try {
    const response = await api.get(`/api/fornecedores/documento/${documento}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const criarFornecedoresService = async (fornecedoresData: any) => {
  try {
    const response = await api.post("/api/fornecedores", fornecedoresData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const atualizarFornecedoresService = async (id: string, fornecedoresData: any) => {
  try {
    const response = await api.put(`/api/fornecedores/${id}`, fornecedoresData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const mudarStatusFornecedoresService = async (id: string, situacao: string) => {
  try {
    const response = await api.patch(`/api/fornecedores/${id}/status`, { situacao });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const excluirFornecedoresService = async (id: string, hardDelete: boolean = false) => {
  try {
    if (hardDelete) {
      const response = await api.delete(`/api/fornecedores/${id}`);
      return response.data;
    } else {
      return await mudarStatusFornecedoresService(id, 'inativo');
    }
  } catch (error) {
    throw error;
  }
}

export const obterEstatisticasFornecedoress = async () => {
  try {
    const response = await api.get("/api/fornecedores/estatisticas");
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const exportarFornecedoressService = async (
  formato: string = 'csv',
  filtros?: FiltrosFornecedores
): Promise<Blob> => {
  try {
    const response = await api.get("/api/fornecedores/exportar", {
      params: { formato, ...filtros },
      responseType: 'blob'
    });
    
    // Verificar se a resposta é válida
    if (!response.data || response.data.size === 0) {
      throw new Error('Resposta de exportação vazia');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Erro na exportação:', error);
    throw new Error(`Falha na exportação: ${error.message}`);
  }
}