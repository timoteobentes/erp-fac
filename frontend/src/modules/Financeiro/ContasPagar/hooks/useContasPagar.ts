import { useState, useCallback } from 'react';
import { 
  listarContasPagarService, 
  baixarContaPagarService, 
  excluirContaPagarService,
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
      const data = response.data || [];
      setContas(data);
      calcularResumo(data);
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

  return {
    contas,
    isLoading,
    resumo,
    fetchContas,
    darBaixa,
    excluirConta
  };
};
