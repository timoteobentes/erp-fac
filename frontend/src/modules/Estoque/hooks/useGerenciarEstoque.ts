import { useState, useEffect, useCallback } from 'react';
import { estoqueService, type ProdutoEstoque, type PayloadMovimentacao } from '../services/estoqueService';
import { toast } from 'react-toastify';

export const useGerenciarEstoque = () => {
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarProdutos = useCallback(async () => {
    try {
      setLoading(true);
      const response: any = await estoqueService.listarProdutos();
      
      let dataArray: any[] = [];
      
      // 1. Remove o wrapper { success, data } se ele existir
      const payload = (response && response.data && !Array.isArray(response.data) && response.success !== undefined) 
        ? response.data 
        : response;

      // 2. Extrai o Array
      if (Array.isArray(payload)) {
        dataArray = payload;
      } else if (payload && typeof payload === 'object') {
        if (Array.isArray(payload.dados)) dataArray = payload.dados;
        else if (Array.isArray(payload.data)) dataArray = payload.data;
        else if (Array.isArray(payload.clientes)) dataArray = payload.clientes;
        else if (Array.isArray(payload.produtos)) dataArray = payload.produtos;
        else if (Array.isArray(payload.fornecedores)) dataArray = payload.fornecedores;
        else if (Array.isArray(payload.servicos)) dataArray = payload.servicos;
        else if (Array.isArray(payload.contas)) dataArray = payload.contas;
        else if (Array.isArray(payload.vendas)) dataArray = payload.vendas;
        else if (Array.isArray(payload.movimentacoes)) dataArray = payload.movimentacoes;
        else {
          const arrayEncontrado = Object.values(payload).find(val => Array.isArray(val));
          if (arrayEncontrado) dataArray = arrayEncontrado as any[];
        }
      }

      setProdutos(dataArray as ProdutoEstoque[]);
    } catch (error) {
      console.error('Erro ao carregar produtos do estoque', error);
      alert('Erro ao buscar a lista de produtos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  const registrarMovimentacao = async (payload: PayloadMovimentacao) => {
    try {
      await estoqueService.movimentar(payload);
      alert('Estoque atualizado com sucesso!');
      await carregarProdutos(); // Recarrega a grelha para mostrar o novo saldo
      return true;
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao movimentar estoque.');
      return false;
    }
  };

  const exportarEstoque = async (formato: 'csv' | 'xlsx' | 'pdf') => {
    setLoading(true);
    try {
      const blob = await estoqueService.exportarEstoque(formato);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_estoque_${new Date().getTime()}.${formato}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Download do ${formato.toUpperCase()} iniciado com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar estoque:', error);
      toast.error('Erro ao exportar o relatório.');
    } finally {
      setLoading(false);
    }
  };

  return { produtos, loading, registrarMovimentacao, carregarProdutos, exportarEstoque };
};
