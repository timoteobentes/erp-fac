import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  excluirPlanoContaService,
  listarPlanosContasService,
  type FiltrosPlanoConta,
} from "../services/planosContasService";

export interface PlanoConta {
  id: number;
  conta_mae: string;
  nome: string;
  criado_em?: string;
  atualizado_em?: string;
}

export const usePlanosContas = () => {
  const [planosContas, setPlanosContas] = useState<PlanoConta[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlanosContas = useCallback(async (filtros?: FiltrosPlanoConta) => {
    setIsLoading(true);
    try {
      const response = await listarPlanosContasService(filtros);
      const payload = response?.data && response?.success !== undefined ? response.data : response;

      let dataArray: PlanoConta[] = [];
      if (Array.isArray(payload)) {
        dataArray = payload;
      } else if (payload?.dados && Array.isArray(payload.dados)) {
        dataArray = payload.dados;
      } else if (payload?.data && Array.isArray(payload.data)) {
        dataArray = payload.data;
      }

      setPlanosContas(dataArray);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao carregar Planos de Contas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const excluirPlanoConta = async (id: number | string) => {
    try {
      await excluirPlanoContaService(id);
      toast.success("Plano de Conta excluido com sucesso");
      await fetchPlanosContas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao excluir Plano de Conta");
      throw error;
    }
  };

  return {
    planosContas,
    isLoading,
    fetchPlanosContas,
    excluirPlanoConta,
  };
};
