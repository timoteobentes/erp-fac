/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import {
  listarFornecedoresService,
  buscarFornecedoresPorId,
  criarFornecedoresService,
  atualizarFornecedoresService,
  mudarStatusFornecedoresService,
  excluirFornecedoresService,
  obterEstatisticasFornecedoress,
  exportarFornecedoressService,
  buscarFornecedoresPorDocumento,
  type FiltrosFornecedores,
  type ResultadoFornecedores,
  type PaginacaoFornecedores
} from "../services/fornecedoresService";

export const useFornecedores = () => {
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [fornecedor, setFornecedor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [estatisticas, setEstatisticas] = useState<any>(null);
  const [paginacao, setPaginacao] = useState<PaginacaoFornecedores>({
    pagina: 1,
    limite: 10,
    total: 0
  });
  const [filtros, setFiltros] = useState<FiltrosFornecedores>({});
  const [ordenacao, setOrdenacao] = useState<{ campo: string; ordem: 'ASC' | 'DESC' }>({
    campo: 'criado_em',
    ordem: 'DESC'
  });

  const fetchFornecedores = useCallback(async (
    pagina: number = 1,
    limite: number = 10,
    novosFiltros?: FiltrosFornecedores,
    novaOrdenacao?: { campo: string; ordem: 'ASC' | 'DESC' }
  ) => {
    setIsLoading(true);
    try {
      const filtrosAtuais = novosFiltros || filtros;
      const ordenacaoAtual = novaOrdenacao || ordenacao;
      
      const resultado: ResultadoFornecedores = await listarFornecedoresService(
        pagina,
        limite,
        filtrosAtuais,
        ordenacaoAtual
      );

      setFornecedores(resultado.fornecedores || []);
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
      console.error("Error fetching fornecedores:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [filtros, ordenacao]);

  const fetchFornecedorId = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await buscarFornecedoresPorId(id);
      setFornecedor(response);
      return response;
    } catch (error) {
      console.error("Error fetching fornecedor:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const fetchFornecedorPorDocumento = async (documento: string) => {
    setIsLoading(true);
    try {
      const response = await buscarFornecedoresPorDocumento(documento);
      return response;
    } catch (error) {
      console.error("Error fetching fornecedor por documento:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const criarFornecedor = async (fornecedorData: any) => {
    setIsLoading(true);
    try {
      const response = await criarFornecedoresService(fornecedorData);
      await fetchFornecedores(paginacao.pagina, paginacao.limite);
      return response;
    } catch (error) {
      console.error("Error creating fornecedor:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const atualizarFornecedor = async (id: string, fornecedorData: any) => {
    setIsLoading(true);
    try {
      const response = await atualizarFornecedoresService(id, fornecedorData);
      await fetchFornecedores(paginacao.pagina, paginacao.limite);
      return response;
    } catch (error) {
      console.error("Error updating fornecedor:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const mudarStatusFornecedor = async (id: string, situacao: string) => {
    setIsLoading(true);
    try {
      const response = await mudarStatusFornecedoresService(id, situacao);
      await fetchFornecedores(paginacao.pagina, paginacao.limite);
      return response;
    } catch (error) {
      console.error("Error changing fornecedor status:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const excluirFornecedor = async (id: string, hardDelete: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await excluirFornecedoresService(id, hardDelete);
      await fetchFornecedores(paginacao.pagina, paginacao.limite);
      return response;
    } catch (error) {
      console.error("Error deleting fornecedor:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const fetchEstatisticas = async () => {
    setIsLoading(true);
    try {
      const response = await obterEstatisticasFornecedoress();
      setEstatisticas(response);
      return response;
    } catch (error) {
      console.error("Error fetching estatísticas:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const exportarFornecedores = async (formato: string = 'csv', filtrosExport?: FiltrosFornecedores) => {
    setIsLoading(true);
    try {
      const filtrosParaExport = filtrosExport || filtros;
      const blob = await exportarFornecedoressService(formato, filtrosParaExport);
      
      // Criar link para download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Definir nome do arquivo baseado no formato
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `fornecedores_${timestamp}.${formato.toLowerCase()}`;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return blob;
    } catch (error: any) {
      console.error("Error exporting fornecedores:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const handleTableChange = (newPagination: any, newFilters: any, newSorter: any) => {
    const { current, pageSize } = newPagination;
    
    // Converter filtros do Ant Design para nosso formato
    const filtrosConvertidos: FiltrosFornecedores = {};
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) {
        filtrosConvertidos[key as keyof FiltrosFornecedores] = newFilters[key][0];
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

    fetchFornecedores(current, pageSize, filtrosConvertidos, novaOrdenacao);
  }

  const aplicarFiltrosManuais = (novosFiltros: FiltrosFornecedores) => {
    fetchFornecedores(1, paginacao.limite, novosFiltros, ordenacao);
  }

  const limparFiltros = () => {
    const filtrosVazios: FiltrosFornecedores = {};
    setFiltros(filtrosVazios);
    fetchFornecedores(1, paginacao.limite, filtrosVazios, ordenacao);
  }

  const handleSearch = (searchTerm: string) => {
    const novosFiltros: FiltrosFornecedores = {
      ...filtros,
      nome: searchTerm || undefined
    };
    aplicarFiltrosManuais(novosFiltros);
  }

  return {
    fornecedor,
    fornecedores,
    estatisticas,
    isLoading,
    paginacao,
    filtros,
    ordenacao,
    fetchFornecedores,
    fetchFornecedorId,
    fetchFornecedorPorDocumento,
    criarFornecedor,
    atualizarFornecedor,
    mudarStatusFornecedor,
    excluirFornecedor,
    fetchEstatisticas,
    exportarFornecedores,
    handleTableChange,
    aplicarFiltrosManuais,
    limparFiltros,
    handleSearch,
    setFiltros,
    setOrdenacao
  }
}