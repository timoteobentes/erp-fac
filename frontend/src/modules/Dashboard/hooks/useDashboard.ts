import { useState, useEffect } from 'react';
import { obterResumoDashboardService } from '../services/dashboardService';
import { toast } from 'react-toastify';

export interface ResumoDashboard {
  a_receber_hoje: number;
  a_pagar_hoje: number;
  recebimentos_mes: {
    realizado: number;
    falta: number;
    previsto: number;
  };
  pagamentos_mes: {
    realizado: number;
    falta: number;
    previsto: number;
  };
  graficos_vendas: { data: string; valor: number }[];
  ultimas_vendas: any[];
}

export const useDashboard = () => {
  const [resumo, setResumo] = useState<ResumoDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchResumo = async () => {
    setLoading(true);
    try {
      const data = await obterResumoDashboardService();
      setResumo(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao carregar dados do Dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumo();
  }, []);

  return {
    resumo,
    loading,
    refreshDashboard: fetchResumo
  };
};
