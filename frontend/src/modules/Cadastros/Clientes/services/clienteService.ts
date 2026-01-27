/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../../../api/api";

export interface FiltrosCliente {
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

export interface PaginacaoCliente {
  pagina: number;
  limite: number;
  total?: number;
}

export interface ResultadoClientes {
  data: any[];
  paginacao: PaginacaoCliente;
}

export interface OpcoesExportacao {
  formato: 'csv' | 'xlsx' | 'pdf';
  filtros?: FiltrosCliente;
}

export const listarClientesService = async (
  pagina: number = 1,
  limite: number = 10,
  filtros?: FiltrosCliente,
  ordenacao?: { campo: string; ordem: 'ASC' | 'DESC' }
): Promise<ResultadoClientes> => {
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

    const response = await api.get("/api/clientes", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const buscarClientePorId = async (id: string) => {
  try {
    const response = await api.get(`/api/clientes/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const buscarClientePorDocumento = async (documento: string) => {
  try {
    const response = await api.get(`/api/clientes/documento/${documento}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const criarClienteService = async (clienteData: any) => {
  try {
    const response = await api.post("/api/clientes", clienteData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const atualizarClienteService = async (id: string, clienteData: any) => {
  try {
    const response = await api.put(`/api/clientes/${id}`, clienteData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const mudarStatusClienteService = async (id: string, situacao: string) => {
  try {
    const response = await api.patch(`/api/clientes/${id}/status`, { situacao });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const excluirClienteService = async (id: string, hardDelete: boolean = false) => {
  try {
    if (hardDelete) {
      const response = await api.delete(`/api/clientes/${id}`);
      return response.data;
    } else {
      return await mudarStatusClienteService(id, 'inativo');
    }
  } catch (error) {
    throw error;
  }
}

export const obterEstatisticasClientes = async () => {
  try {
    const response = await api.get("/api/clientes/estatisticas");
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const exportarClientesService = async (
  formato: string = 'csv',
  filtros?: FiltrosCliente
): Promise<Blob> => {
  try {
    const response = await api.get("/api/clientes/exportar", {
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