import { useState, useEffect } from 'react';
import { obterResumoDashboardService } from '../services/dashboardService';
import { toast } from 'react-toastify';

export interface ResumoDashboard {
  vendas_hoje: number;
  contas_receber_pendente_mes: number;
  contas_pagar_pendente_mes: number;
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
