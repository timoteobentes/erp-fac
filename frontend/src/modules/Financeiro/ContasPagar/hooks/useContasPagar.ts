import { useState, useCallback } from 'react';
import { 
  listarContasPagarService, 
  baixarContaPagarService, 
  excluirContaPagarService,
  exportarContasPagarService,
  type FiltrosContaPagar
} from '../services/contasPagarService';
import { toast } from 'react-toastify';

export const useContasPagar = () => {
  const [contas, setContas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resumo, setResumo] = useState({
    aVencer: 0,
    venceHoje: 0,
    vencidos: 0,
    pagos: 0,
    total: 0
  });

  const calcularResumo = (lista: any[]) => {
    let aVencer = 0, venceHoje = 0, vencidos = 0, pagos = 0, total = 0;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    lista.forEach(conta => {
      const valor = Number(conta.valor_total) || 0;
      const vencimento = new Date(conta.data_vencimento);
      vencimento.setHours(23, 59, 59, 999); // Final do dia de vencimento
      
      const vDiaInicio = new Date(conta.data_vencimento);
      vDiaInicio.setHours(0,0,0,0);

      total += valor;

      if (conta.status === 'pago') {
        pagos += valor;
      } else if (conta.status !== 'cancelado') {
        if (vDiaInicio.getTime() === hoje.getTime()) {
          venceHoje += valor;
          aVencer += valor; // Historicamente também soma no aVencer
        } else if (vencimento < hoje) {
          vencidos += valor;
        } else {
          aVencer += valor;
        }
      }
    });

    setResumo({ aVencer, venceHoje, vencidos, pagos, total });
  };

  const fetchContas = useCallback(async (filtros?: FiltrosContaPagar) => {
    setIsLoading(true);
    try {
      const response = await listarContasPagarService(filtros);
      
      let dataArray: any[] = [];
      
      // 1. Remove a casca do { success: true, data: ... } se ela existir
      const payload = (response && response.data && !Array.isArray(response.data) && response.success !== undefined) 
        ? response.data 
        : response;

      // 2. Extrai o Array de dentro do payload
      if (Array.isArray(payload)) {
        dataArray = payload;
      } else if (payload && typeof payload === 'object') {
        if (Array.isArray(payload.dados)) dataArray = payload.dados;
        else if (Array.isArray(payload.data)) dataArray = payload.data;
        else if (Array.isArray(payload.contas)) dataArray = payload.contas;
        else if (Array.isArray(payload.contas_pagar)) dataArray = payload.contas_pagar;
        else {
          const arrayEncontrado = Object.values(payload).find(val => Array.isArray(val));
          if (arrayEncontrado) dataArray = arrayEncontrado as any[];
        }
      }

      setContas(dataArray);
      calcularResumo(dataArray);
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao carregar contas a pagar');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const darBaixa = async (id: number | string, data_pagamento?: string) => {
    try {
      await baixarContaPagarService(id, data_pagamento);
      toast.success('Conta baixada com sucesso!');
      fetchContas(); // Recarrega
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao baixar conta.');
    }
  };

  const excluirConta = async (id: number | string) => {
    try {
      await excluirContaPagarService(id);
      toast.success('Conta excluída com sucesso!');
      fetchContas(); // Recarrega
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir conta.');
    }
  };

  const exportarContas = async (formato: 'csv' | 'xlsx' | 'pdf', filtros?: FiltrosContaPagar) => {
    setIsLoading(true);
    try {
      const blob = await exportarContasPagarService(formato, filtros);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_contas_pagar_${new Date().getTime()}.${formato}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Download do ${formato.toUpperCase()} iniciado com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar contas a pagar:', error);
      toast.error('Erro ao exportar o relatório.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    contas,
    isLoading,
    resumo,
    fetchContas,
    darBaixa,
    excluirConta,
    exportarContas
  };
};
