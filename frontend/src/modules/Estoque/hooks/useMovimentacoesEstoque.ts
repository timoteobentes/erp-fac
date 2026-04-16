import { useState, useEffect, useCallback } from 'react';
import { estoqueService, type MovimentacaoHistorico } from '../services/estoqueService';
import { toast } from 'react-toastify';

export const useMovimentacoesEstoque = () => {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoHistorico[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarMovimentacoes = useCallback(async () => {
    try {
      setLoading(true);
      const response: any = await estoqueService.listarHistoricoGlobal();
      
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

      setMovimentacoes(dataArray as MovimentacaoHistorico[]);
    } catch (error) {
      console.error('Erro ao carregar histórico de movimentações', error);
      alert('Erro ao buscar o histórico.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarMovimentacoes();
  }, [carregarMovimentacoes]);

  const exportarMovimentacoes = async (formato: 'csv' | 'xlsx' | 'pdf') => {
    setLoading(true);
    try {
      const blob = await estoqueService.exportarMovimentacoes(formato);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_movimentacoes_${new Date().getTime()}.${formato}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Download do ${formato.toUpperCase()} iniciado com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar movimentações:', error);
      toast.error('Erro ao exportar o relatório.');
    } finally {
      setLoading(false);
    }
  };

  return { movimentacoes, loading, carregarMovimentacoes, exportarMovimentacoes };
};
