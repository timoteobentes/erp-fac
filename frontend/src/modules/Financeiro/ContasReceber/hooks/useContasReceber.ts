import { useState, useEffect, useCallback } from 'react';
import { contasReceberService, type ContaReceber } from '../services/contasReceberService';
import { toast } from 'react-toastify';

export const useContasReceber = () => {
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarContas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contasReceberService.listar();
      
      let dataArray: any[] = [];
      
      // 1. Remove o wrapper { success, data } se ele existir
      const payload = (response && (response as any).data && !Array.isArray((response as any).data) && (response as any).success !== undefined) 
        ? (response as any).data 
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
          const arrayEncontrado = Object.values(payload).find(val => Array.isArray(val as any));
          if (arrayEncontrado) dataArray = arrayEncontrado as any[];
        }
      }

      setContas(dataArray as ContaReceber[]);
    } catch (error) {
      console.error('Erro ao carregar contas a receber', error);
      alert('Erro ao buscar as contas a receber.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarContas();
  }, [carregarContas]);

  const baixarConta = async (id: number) => {
    try {
      await contasReceberService.baixar(id);
      alert('Conta baixada com sucesso!');
      carregarContas();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao baixar conta.');
    }
  };

  const excluirConta = async (id: number) => {
    try {
      await contasReceberService.excluir(id);
      carregarContas();
      toast.success('Conta excluída com sucesso!');
      carregarContas();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir conta. Verifique se ela não pertence a uma venda do PDV.');
    }
  };

  const exportarContas = async (formato: 'csv' | 'xlsx' | 'pdf', filtros?: any) => {
    setLoading(true);
    try {
      const blob = await contasReceberService.exportar(formato, filtros);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_contas_receber_${new Date().getTime()}.${formato}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Download do ${formato.toUpperCase()} iniciado com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar contas a receber:', error);
      toast.error('Erro ao exportar o relatório.');
    } finally {
      setLoading(false);
    }
  };

  return { contas, loading, baixarConta, excluirConta, carregarContas, exportarContas };
};
