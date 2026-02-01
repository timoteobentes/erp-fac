/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import {
  listarClientesService,
  buscarClientePorId,
  criarClienteService,
  atualizarClienteService,
  mudarStatusClienteService,
  excluirClienteService,
  obterEstatisticasClientes,
  exportarClientesService,
  buscarClientePorDocumento,
  type FiltrosCliente,
  type ResultadoClientes,
  type PaginacaoCliente
} from "../services/clienteService";
import { useNavigate } from "react-router";

export const useClientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<any[]>([]);
  const [cliente, setCliente] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [estatisticas, setEstatisticas] = useState<any>(null);
  const [paginacao, setPaginacao] = useState<PaginacaoCliente>({
    pagina: 1,
    limite: 10,
    total: 0
  });
  const [filtros, setFiltros] = useState<FiltrosCliente>({});
  const [ordenacao, setOrdenacao] = useState<{ campo: string; ordem: 'ASC' | 'DESC' }>({
    campo: 'criado_em',
    ordem: 'DESC'
  });

  const fetchClientes = useCallback(async (
    pagina: number = 1,
    limite: number = 10,
    novosFiltros?: FiltrosCliente,
    novaOrdenacao?: { campo: string; ordem: 'ASC' | 'DESC' }
  ) => {
    setIsLoading(true);
    try {
      const filtrosAtuais = novosFiltros || filtros;
      const ordenacaoAtual = novaOrdenacao || ordenacao;
      
      const resultado: ResultadoClientes = await listarClientesService(
        pagina,
        limite,
        filtrosAtuais,
        ordenacaoAtual
      );

      setClientes(resultado.data || []);
      setPaginacao(prev => ({
        ...prev,
        current: pagina,
        pageSize: limite,
        total: resultado.paginacao?.total || 0
      }));
      
      if (novosFiltros) {
        setFiltros(novosFiltros);
      }
      
      if (novaOrdenacao) {
        setOrdenacao(novaOrdenacao);
      }
      
      return resultado;
    } catch (error) {
      console.error("Error fetching clientes:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [filtros, ordenacao]);

  const fetchClienteId = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await buscarClientePorId(id);
      setCliente(response);
      return response;
    } catch (error) {
      console.error("Error fetching cliente:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const fetchClientePorDocumento = async (documento: string) => {
    setIsLoading(true);
    try {
      const response = await buscarClientePorDocumento(documento);
      return response;
    } catch (error) {
      console.error("Error fetching cliente por documento:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const criarCliente = async (clienteData: any) => {
    setIsLoading(true);
    try {
      const response = await criarClienteService(clienteData);
      await fetchClientes(paginacao.pagina, paginacao.limite);
      return response;
    } catch (error) {
      console.error("Error creating cliente:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const atualizarCliente = async (id: string, clienteData: any) => {
    setIsLoading(true);
    try {
      const response = await atualizarClienteService(id, clienteData);
      navigate("/cadastros/clientes");
      return response;
    } catch (error) {
      console.error("Error updating cliente:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const mudarStatusCliente = async (id: string, situacao: string) => {
    setIsLoading(true);
    try {
      const response = await mudarStatusClienteService(id, situacao);
      await fetchClientes(paginacao.pagina, paginacao.limite);
      return response;
    } catch (error) {
      console.error("Error changing cliente status:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const excluirCliente = async (id: string, hardDelete: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await excluirClienteService(id, hardDelete);
      await fetchClientes(paginacao.pagina, paginacao.limite);
      return response;
    } catch (error) {
      console.error("Error deleting cliente:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const fetchEstatisticas = async () => {
    setIsLoading(true);
    try {
      const response = await obterEstatisticasClientes();
      setEstatisticas(response);
      return response;
    } catch (error) {
      console.error("Error fetching estatísticas:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const exportarClientes = async (formato: string = 'csv', filtrosExport?: FiltrosCliente) => {
    setIsLoading(true);
    try {
      const filtrosParaExport = filtrosExport || filtros;
      const blob = await exportarClientesService(formato, filtrosParaExport);
      
      // Criar link para download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Definir nome do arquivo baseado no formato
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `clientes_${timestamp}.${formato.toLowerCase()}`;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return blob;
    } catch (error: any) {
      console.error("Error exporting clientes:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const handleTableChange = (newPagination: any, newFilters: any, newSorter: any) => {
    const { current, pageSize } = newPagination;
    
    // Converter filtros do Ant Design para nosso formato
    const filtrosConvertidos: FiltrosCliente = {};
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) {
        filtrosConvertidos[key as keyof FiltrosCliente] = newFilters[key][0];
      }
    });

    // Ordenação
    let novaOrdenacao = { ...ordenacao };
    if (newSorter.field && newSorter.order) {
      novaOrdenacao = {
        campo: newSorter.field,
        ordem: newSorter.order === 'ascend' ? 'ASC' : 'DESC'
      };
    }

    fetchClientes(current, pageSize, filtrosConvertidos, novaOrdenacao);
  }

  const aplicarFiltrosManuais = (novosFiltros: FiltrosCliente) => {
    fetchClientes(1, paginacao.limite, novosFiltros, ordenacao);
  }

  const limparFiltros = () => {
    const filtrosVazios: FiltrosCliente = {};
    setFiltros(filtrosVazios);
    fetchClientes(1, paginacao.limite, filtrosVazios, ordenacao);
  }

  const handleSearch = (searchTerm: string) => {
    const novosFiltros: FiltrosCliente = {
      ...filtros,
      nome: searchTerm || undefined
    };
    aplicarFiltrosManuais(novosFiltros);
  }

  return {
    cliente,
    clientes,
    estatisticas,
    isLoading,
    paginacao,
    filtros,
    ordenacao,
    fetchClientes,
    fetchClienteId,
    fetchClientePorDocumento,
    criarCliente,
    atualizarCliente,
    mudarStatusCliente,
    excluirCliente,
    fetchEstatisticas,
    exportarClientes,
    handleTableChange,
    aplicarFiltrosManuais,
    limparFiltros,
    handleSearch,
    setFiltros,
    setOrdenacao
  }
}