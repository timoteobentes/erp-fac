import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  excluirCentroCustoService,
  listarCentroCustosService,
  type FiltrosCentroCusto,
} from "../services/centroCustosService";

export interface CentroCusto {
  id: number;
  nome: string;
  status: "ATIVO" | "INATIVO";
  criado_em?: string;
  atualizado_em?: string;
}

export const useCentroCustos = () => {
  const [centroCustos, setCentroCustos] = useState<CentroCusto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCentroCustos = useCallback(async (filtros?: FiltrosCentroCusto) => {
    setIsLoading(true);
    try {
      const response = await listarCentroCustosService(filtros);
      const payload = response?.data && response?.success !== undefined ? response.data : response;

      let dataArray: CentroCusto[] = [];
      if (Array.isArray(payload)) {
        dataArray = payload;
      } else if (payload?.dados && Array.isArray(payload.dados)) {
        dataArray = payload.dados;
      } else if (payload?.data && Array.isArray(payload.data)) {
        dataArray = payload.data;
      }

      setCentroCustos(dataArray);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao carregar centros de custos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const excluirCentroCusto = async (id: number | string) => {
    try {
      await excluirCentroCustoService(id);
      toast.success("Centro de Custo excluido com sucesso");
      await fetchCentroCustos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao excluir Centro de Custo");
      throw error;
    }
  };

  return {
    centroCustos,
    isLoading,
    fetchCentroCustos,
    excluirCentroCusto,
  };
};
